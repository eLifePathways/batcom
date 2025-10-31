import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Pencil, Trash, RefreshCw } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import AdminLayout from '@/components/layout/admin-layout'
import { Publication, Settings, VirusCategory } from '@shared/schema'

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  authors: z.string().min(3, 'Authors must be at least 3 characters'),
  year: z.coerce.number().min(1900).max(new Date().getFullYear()),
  abstract: z.string().min(10, 'Abstract must be at least 10 characters'),
  evidenceQuality: z.enum(['high', 'medium', 'low']),
  evidenceType: z.enum(['infection', 'spillover']),
  virusCategoryId: z.coerce.number().min(1, 'Please select a virus category'),
  region: z.string().min(2, 'Region must be at least 2 characters'),
  publicationDate: z.string(),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

export default function PublicationsAdmin() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null)
  const [isFetchingPublications, setIsFetchingPublications] = useState(false)

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: publications, isLoading: isLoadingPublications } = useQuery<
    Array<Publication>
  >({
    queryKey: ['/api/publications'],
  })

  const { data: categories, isLoading: isLoadingCategories } = useQuery<
    Array<VirusCategory>
  >({
    queryKey: ['/api/virus-categories'],
  })

  const { data: settings, isLoading: isSettingsQueryLoading } =
    useQuery<Settings>({ queryKey: ['/api/settings/kotahi'] })

  const addForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      authors: '',
      year: new Date().getFullYear(),
      abstract: '',
      evidenceQuality: 'medium',
      evidenceType: 'spillover',
      virusCategoryId: 0,
      region: '',
      publicationDate: new Date().toISOString().split('T')[0],
      link: '',
    },
  })

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      authors: '',
      year: new Date().getFullYear(),
      abstract: '',
      evidenceQuality: 'medium',
      evidenceType: 'spillover',
      virusCategoryId: 0,
      region: '',
      publicationDate: new Date().toISOString().split('T')[0],
      link: '',
    },
  })

  const createPublication = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return apiRequest('/api/publications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/publications'] })
      setIsAddDialogOpen(false)
      addForm.reset()
      toast({
        title: 'Publication created',
        description: 'The publication has been added successfully.',
      })
    },
    onError: error => {
      console.error('Error creating publication:', error)
      toast({
        title: 'Error',
        description: 'Failed to create publication. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const updatePublication = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: z.infer<typeof formSchema>
    }) => {
      return apiRequest(`/api/publications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/publications'] })
      setIsEditDialogOpen(false)
      setSelectedPublication(null)
      toast({
        title: 'Publication updated',
        description: 'The publication has been updated successfully.',
      })
    },
    onError: error => {
      console.error('Error updating publication:', error)
      toast({
        title: 'Error',
        description: 'Failed to update publication. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const deletePublication = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/publications/${id}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/publications'] })
      setIsDeleteDialogOpen(false)
      setSelectedPublication(null)
      toast({
        title: 'Publication deleted',
        description: 'The publication has been deleted successfully.',
      })
    },
    onError: error => {
      console.error('Error deleting publication:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete publication. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const onAddSubmit = (data: z.infer<typeof formSchema>) => {
    createPublication.mutate(data)
  }

  const onEditSubmit = (data: z.infer<typeof formSchema>) => {
    if (selectedPublication) {
      updatePublication.mutate({ id: selectedPublication.id, data })
    }
  }

  const loadPublicationData = (publication: Publication) => {
    setSelectedPublication(publication)
    editForm.reset({
      title: publication.title,
      authors: publication.authors,
      year: publication.year,
      abstract: publication.abstract,
      evidenceQuality: publication.evidenceQuality,
      evidenceType: publication.evidenceType,
      virusCategoryId: publication.virusCategoryId,
      region: publication.region,
      publicationDate: publication.publicationDate,
      link: publication.link || '',
    })
    setIsEditDialogOpen(true)
  }

  const getCategoryName = (id: number) => {
    const category = categories?.find((cat: VirusCategory) => cat.id === id)
    return category ? category.name : 'Unknown'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Publications</h1>
        </div>

        {isLoadingPublications ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Authors</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Evidence Quality</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publications?.map((publication: Publication) => (
                  <TableRow key={publication.id}>
                    <TableCell className="font-medium">
                      {publication.title}
                    </TableCell>
                    <TableCell>{publication.authors}</TableCell>
                    <TableCell>{publication.year}</TableCell>
                    <TableCell>
                      {getCategoryName(publication.virusCategoryId)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          publication.evidenceQuality === 'high'
                            ? 'bg-green-100 text-green-800'
                            : publication.evidenceQuality === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {publication.evidenceQuality.charAt(0).toUpperCase() +
                          publication.evidenceQuality.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadPublicationData(publication)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Dialog
                          open={
                            isDeleteDialogOpen &&
                            selectedPublication?.id === publication.id
                          }
                          onOpenChange={open =>
                            !open && setSelectedPublication(null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => {
                                setSelectedPublication(publication)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Publication</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete "
                                {publication.title}"? This action cannot be
                                undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    deletePublication.mutate(publication.id)
                                  }
                                  disabled={deletePublication.isPending}
                                >
                                  {deletePublication.isPending
                                    ? 'Deleting...'
                                    : 'Delete'}
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add Publication Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Publication</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new publication to the database.
              </DialogDescription>
            </DialogHeader>

            <Form {...addForm}>
              <form
                onSubmit={addForm.handleSubmit(onAddSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="authors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Authors</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1900}
                            max={new Date().getFullYear()}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="virusCategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Virus Category</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value.toString()}
                            onValueChange={value =>
                              field.onChange(parseInt(value, 10))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories?.map((category: VirusCategory) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id.toString()}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="evidenceQuality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evidence Quality</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="evidenceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evidence Type</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="infection">
                                Infection
                              </SelectItem>
                              <SelectItem value="spillover">
                                Spillover
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="publicationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publication Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={addForm.control}
                  name="abstract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abstract</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPublication.isPending}>
                    {createPublication.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Publication'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Publication Dialog */}
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={open => {
            setIsEditDialogOpen(open)
            if (!open) setSelectedPublication(null)
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Publication</DialogTitle>
              <DialogDescription>
                Update the details of this publication.
              </DialogDescription>
            </DialogHeader>

            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(onEditSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="authors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Authors</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1900}
                            max={new Date().getFullYear()}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="virusCategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Virus Category</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value.toString()}
                            onValueChange={value =>
                              field.onChange(parseInt(value, 10))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories?.map((category: VirusCategory) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id.toString()}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="evidenceQuality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evidence Quality</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="evidenceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evidence Type</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="infection">
                                Infection
                              </SelectItem>
                              <SelectItem value="spillover">
                                Spillover
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="publicationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publication Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="abstract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abstract</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updatePublication.isPending}>
                    {updatePublication.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Publication'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
