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
import {
  Loader2,
  Plus,
  Pencil,
  Trash,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
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
import { Publication, Settings, VirusCategory } from '@shared/schema'
import {
  EVIDENCE_QUALITY_INFECTION,
  EVIDENCE_QUALITY_SPILLOVER,
  EvidenceInfection,
  INFECTION_KEYS_TUPLE,
  Region,
  regions,
  SPILLOVER_KEYS_TUPLE,
} from '@shared/constants'
import { isKotahiSettingsFormData } from '@shared/utils'
import { MultiSelect } from '../../components/ui/multi-select'

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  authors: z.string().min(3, 'Authors must be at least 3 characters'),
  year: z.coerce.number().min(1900).max(new Date().getFullYear()),
  abstract: z.string().min(10, 'Abstract must be at least 10 characters'),
  evidenceInfection: z.enum(INFECTION_KEYS_TUPLE),
  evidenceSpillover: z.enum(SPILLOVER_KEYS_TUPLE),
  virusCategoryIds: z
    .array(z.coerce.number().min(1))
    .min(1, 'Please select at least one virus category'),
  regions: z
    .array(z.string().min(2))
    .min(1, 'Please select at least one region'),
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

  const endpoint =
    settings && isKotahiSettingsFormData(settings.formData)
      ? settings.formData.endpoint
      : null

  const addForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      authors: '',
      year: new Date().getFullYear(),
      abstract: '',
      evidenceInfection: 'infectionModerate',
      evidenceSpillover: 'spilloverModerate',
      virusCategoryIds: [],
      regions: [],
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
      evidenceInfection: 'infectionModerate',
      evidenceSpillover: 'spilloverModerate',
      virusCategoryIds: [],
      regions: [],
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

  const refreshPublications = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/kotahi/sync', { method: 'POST' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/publications'] })
      toast({
        title: 'Publications refreshed',
        description: 'The publications have been refreshed successfully.',
      })
    },
    onError: error => {
      console.error('Error refreshing publications:', error)
      toast({
        title: 'Error',
        description: 'Failed to refresh publications',
        variant: 'destructive',
      })
    },
    onSettled: () => {
      setIsFetchingPublications(false)
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
      evidenceInfection: publication.evidenceInfection,
      evidenceSpillover: publication.evidenceSpillover,
      virusCategoryIds: publication.virusCategoryIds,
      regions: publication.regions,
      publicationDate: publication.publicationDate,
      link: publication.link || '',
    })
    setIsEditDialogOpen(true)
  }

  const getCategoryName = (id: number) => {
    const category = categories?.find((cat: VirusCategory) => cat.id === id)
    return category ? category.name : 'Unknown'
  }

  const handleRefreshPublications = async () => {
    setIsFetchingPublications(true)

    refreshPublications.mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Publications</h1>

        <div className="space-x-2">
          <Button
            variant="outline"
            //   size="sm"
            onClick={handleRefreshPublications}
            disabled={isFetchingPublications || !endpoint}
          >
            {isFetchingPublications ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Publications...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Publications
              </>
            )}
          </Button>
          <Button
            disabled={isFetchingPublications}
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Publication
          </Button>
        </div>
      </div>

      {isLoadingPublications ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div>
          <>
            {!isSettingsQueryLoading && !endpoint && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>
                    Please configure your GraphQL endpoint in the{' '}
                    <span className="font-semibold">GraphQL API</span> tab
                    first.
                  </p>
                </div>
              </div>
            )}
          </>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Authors</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Evidence Quality</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publications &&
                  publications.map((publication: Publication) => (
                    <TableRow key={publication.id}>
                      <TableCell className="font-medium">
                        {publication.title}
                      </TableCell>
                      <TableCell>{publication.authors}</TableCell>
                      <TableCell>{publication.year}</TableCell>
                      <TableCell>
                        {publication.virusCategoryIds
                          .map(v => getCategoryName(v))
                          .join(', ')}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            publication.evidenceInfection === 'infectionHigh'
                              ? 'bg-green-100 text-green-800'
                              : publication.evidenceInfection ===
                                'infectionModerate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : publication.evidenceInfection === 'infectionLow'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {
                            EVIDENCE_QUALITY_INFECTION[
                              publication.evidenceInfection as EvidenceInfection
                            ]
                          }
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
                  name="virusCategoryIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MultiSelect
                          title="Virus Categories"
                          items={categories ?? []}
                          selected={field.value}
                          onChange={vals =>
                            field.onChange(
                              vals.map(v =>
                                typeof v === 'string' ? parseInt(v, 10) : v,
                              ),
                            )
                          }
                          valueField="id"
                          labelField="name"
                          placeholder="Select virus categories"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="evidenceInfection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evidence Quality: Infection</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select infection quality" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(EVIDENCE_QUALITY_INFECTION).map(
                              ([value, label]) => (
                                <SelectItem value={value}>{label}</SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="evidenceSpillover"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evidence Quality: Spillover</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select spillover quality" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(EVIDENCE_QUALITY_SPILLOVER).map(
                              ([value, label]) => (
                                <SelectItem value={value}>{label}</SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="regions"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MultiSelect
                          title="Geographic Regions"
                          items={regions}
                          selected={field.value}
                          onChange={vals => field.onChange(vals as Region[])}
                          valueField="key"
                          labelField="value"
                          placeholder="Select geographic regions"
                        />
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
                    <FormItem className="col-span-2">
                      <FormLabel>Link (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="abstract"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Abstract</FormLabel>
                      <FormControl>
                        <Textarea rows={5} className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createPublication.isPending}>
                  {createPublication.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Publication'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Publication Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                  name="virusCategoryIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MultiSelect
                          title="Virus Categories"
                          items={categories ?? []}
                          selected={field.value}
                          onChange={vals =>
                            field.onChange(
                              vals.map(v =>
                                typeof v === 'string' ? parseInt(v, 10) : v,
                              ),
                            )
                          }
                          valueField="id"
                          labelField="name"
                          placeholder="Select virus categories"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="evidenceInfection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evidence Quality: Infection</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select infection quality" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(EVIDENCE_QUALITY_INFECTION).map(
                              ([value, label]) => (
                                <SelectItem value={value}>{label}</SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="evidenceSpillover"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evidence Quality: Spillover</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select spillover quality" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(EVIDENCE_QUALITY_SPILLOVER).map(
                              ([value, label]) => (
                                <SelectItem value={value}>{label}</SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="regions"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MultiSelect
                          title="Geographic Regions"
                          items={regions}
                          selected={field.value}
                          onChange={vals => field.onChange(vals as Region[])}
                          valueField="key"
                          labelField="value"
                          placeholder="Select geographic regions"
                        />
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
                    <FormItem className="col-span-2">
                      <FormLabel>Link (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="abstract"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Abstract</FormLabel>
                      <FormControl>
                        <Textarea rows={5} className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
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
  )
}
