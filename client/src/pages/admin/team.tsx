import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation } from 'wouter'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'
import {
  Edit,
  Plus,
  Trash2,
  User,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Pencil,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  HeroSectionSettings,
  InsertHeroSettings,
  TeamMember,
} from '@shared/schema'
import { ImageUpload } from '@/components/ui/image-upload'
import HeroSection from '@/components/sections/hero-section'

export default function TeamMembersAdmin() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [location, setLocation] = useLocation()

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    institution: '',
    description: '',
    email: '',
    website: '',
    socialMedia: '',
    imageUrl: '',
  })

  const [heroSectionFormData, setHeroSectionFormData] = useState({
    name: 'team',
    title: '',
    description: '',
  })

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isReorderMode, setIsReorderMode] = useState(false)

  const [isEditingHeroSection, setEditingHeroSection] = useState(false)

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      title: '',
      institution: '',
      description: '',
      email: '',
      website: '',
      socialMedia: '',
      imageUrl: '',
    })
  }

  // Load team member data for editing
  const loadTeamMemberData = (member: TeamMember) => {
    setFormData({
      name: member.name,
      title: member.title,
      institution: member.institution,
      description: member.description,
      email: member.email || '',
      website: member.website || '',
      socialMedia: member.socialMedia || '',
      imageUrl: member.imageUrl || '',
    })
  }

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleHeroSectionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setHeroSectionFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  // Fetch team members
  const { data: teamMembers, isLoading: teamMembersLoading } = useQuery<
    TeamMember[]
  >({
    queryKey: ['/api/team-members'],
  })

  const { data: heroSectionData, isLoading: heroSectionLoading } =
    useQuery<HeroSectionSettings>({ queryKey: ['/api/hero-section/team'] })

  // Create team member mutation
  const createTeamMember = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/team-members', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Team member added successfully!',
      })
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] })
      setAddDialogOpen(false)
      resetFormData()
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add team member.',
        variant: 'destructive',
      })
    },
  })

  // Update team member mutation
  const updateTeamMember = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/team-members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Team member updated successfully!',
      })
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] })
      setEditDialogOpen(false)
      setSelectedMember(null)
      resetFormData()
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update team member.',
        variant: 'destructive',
      })
    },
  })

  // Delete team member mutation
  const deleteTeamMember = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/team-members/${id}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Team member deleted successfully!',
      })
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] })
      setDeleteDialogOpen(false)
      setSelectedMember(null)
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete team member.',
        variant: 'destructive',
      })
    },
  })

  // Reorder team members mutation
  const reorderTeamMembers = useMutation({
    mutationFn: async (memberIds: number[]) => {
      return apiRequest('/api/team-members/reorder', {
        method: 'POST',
        body: JSON.stringify({ memberIds }),
      })
    },
    onSuccess: data => {
      toast({
        title: 'Success',
        description: 'Team member order updated successfully!',
      })

      // Force a hard refresh to guarantee the latest data
      window.location.reload()
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reorder team members.',
        variant: 'destructive',
      })
    },
  })

  // Update team member mutation
  const updateHeroSection = useMutation({
    mutationFn: async (updatedSection: Partial<HeroSectionSettings>) => {
      return apiRequest(`/api/hero-section/${heroSectionData!.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedSection),
      })
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Page header updated successfully!',
      })
      queryClient.invalidateQueries({ queryKey: ['/api/hero-section/team'] })
      setEditingHeroSection(false)
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update page description.',
        variant: 'destructive',
      })
    },
  })

  // State for managing the ordered list during reordering
  const [orderedMembers, setOrderedMembers] = useState<TeamMember[]>([])

  // Initialize ordered members when team members are loaded
  useEffect(() => {
    if (teamMembers) {
      // Sort team members by sortOrder before setting
      const sortedMembers = [...teamMembers].sort((a, b) => {
        // If sortOrder exists on both, use it
        const aSortOrder =
          a.sortOrder !== undefined && a.sortOrder !== null ? a.sortOrder : 0
        const bSortOrder =
          b.sortOrder !== undefined && b.sortOrder !== null ? b.sortOrder : 0
        return aSortOrder - bSortOrder
      })
      console.log(
        'Setting ordered members sorted by sortOrder:',
        sortedMembers.map(m => ({
          id: m.id,
          name: m.name,
          sortOrder: m.sortOrder,
        })),
      )
      setOrderedMembers(sortedMembers)
    }
  }, [teamMembers])

  useEffect(() => {
    if (heroSectionData) {
      setHeroSectionFormData(heroSectionData)
    }
  }, [heroSectionData])

  // Move a team member up in the order
  const moveUp = (index: number) => {
    if (index === 0) return // Already at the top

    const newOrderedMembers = [...orderedMembers]
    const temp = newOrderedMembers[index]
    newOrderedMembers[index] = newOrderedMembers[index - 1]
    newOrderedMembers[index - 1] = temp

    setOrderedMembers(newOrderedMembers)
  }

  // Move a team member down in the order
  const moveDown = (index: number) => {
    if (index === orderedMembers.length - 1) return // Already at the bottom

    const newOrderedMembers = [...orderedMembers]
    const temp = newOrderedMembers[index]
    newOrderedMembers[index] = newOrderedMembers[index + 1]
    newOrderedMembers[index + 1] = temp

    setOrderedMembers(newOrderedMembers)
  }

  // Save the reordered list
  const saveReordering = () => {
    const memberIds = orderedMembers.map(member => member.id)
    console.log('Sending memberIds to reorder:', memberIds)
    reorderTeamMembers.mutate(memberIds)
  }

  // Handle form submission for creating a new team member
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.name ||
      !formData.title ||
      !formData.institution ||
      !formData.description
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    createTeamMember.mutate(formData)
  }

  const handleEditHeroDescription = (e: React.FormEvent) => {
    e.preventDefault()

    if (!heroSectionFormData.title || !heroSectionFormData.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })

      return
    }

    updateHeroSection.mutate(heroSectionFormData)
  }

  // Handle form submission for updating a team member
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !selectedMember ||
      !formData.name ||
      !formData.title ||
      !formData.institution ||
      !formData.description
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    updateTeamMember.mutate({
      id: selectedMember.id,
      data: formData,
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="container pb-4">
        {heroSectionLoading ? (
          <div className="pt-12 pb-6">
            <Skeleton className="h-9 md:h-10 w-64 mb-4" />
            <Skeleton className="h-6 w-full max-w-3xl mb-4" />
          </div>
        ) : (
          <HeroSection
            description={heroSectionFormData.description}
            title={heroSectionFormData.title}
          />
        )}
        <Button onClick={() => setEditingHeroSection(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Page Header
        </Button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <div className="flex gap-2">
          {isReorderMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  // Reset to original order sorted by sortOrder
                  if (teamMembers) {
                    const sortedMembers = [...teamMembers].sort((a, b) => {
                      const aSortOrder =
                        a.sortOrder !== undefined && a.sortOrder !== null
                          ? a.sortOrder
                          : 0
                      const bSortOrder =
                        b.sortOrder !== undefined && b.sortOrder !== null
                          ? b.sortOrder
                          : 0
                      return aSortOrder - bSortOrder
                    })
                    setOrderedMembers(sortedMembers)
                  }
                  setIsReorderMode(false)
                }}
                disabled={reorderTeamMembers.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={saveReordering}
                disabled={reorderTeamMembers.isPending}
              >
                {reorderTeamMembers.isPending ? 'Saving...' : 'Save Order'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsReorderMode(true)}>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Reorder Members
              </Button>
              <Button
                onClick={() => {
                  resetFormData()
                  setAddDialogOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit Hero Section Dialog */}
      <Dialog
        open={isEditingHeroSection}
        onOpenChange={open => {
          setEditingHeroSection(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Page Header</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditHeroDescription}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={heroSectionFormData.title}
                  onChange={handleHeroSectionChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  name="description"
                  value={heroSectionFormData.description}
                  onChange={handleHeroSectionChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateHeroSection.isPending}>
                {updateHeroSection.isPending
                  ? 'Updating...'
                  : 'Update Page Header'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Team Member Dialog */}
      <Dialog
        open={addDialogOpen}
        onOpenChange={open => {
          setAddDialogOpen(open)
          if (!open) {
            resetFormData()
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title/Position *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution/Organization *</Label>
                <Input
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Bio/Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialMedia">Social Media</Label>
                <Input
                  id="socialMedia"
                  name="socialMedia"
                  value={formData.socialMedia}
                  onChange={handleChange}
                  placeholder="Twitter or LinkedIn URL"
                />
              </div>

              <ImageUpload
                currentImageUrl={formData.imageUrl}
                onImageUploaded={imageUrl => {
                  setFormData(prev => ({ ...prev, imageUrl }))
                }}
                label="Profile Image"
                description="Upload a profile image (PNG, JPG up to 10MB)"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createTeamMember.isPending}>
                {createTeamMember.isPending
                  ? 'Creating...'
                  : 'Create Team Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembersLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : isReorderMode && orderedMembers.length > 0 ? (
                // Reorder mode view
                orderedMembers.map((member, index) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      {member.imageUrl ? (
                        <div className="relative h-12 w-12 rounded-full overflow-hidden">
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-12 w-12 bg-gray-100 rounded-full">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.title}</TableCell>
                    <TableCell>{member.institution}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => moveDown(index)}
                          disabled={index === orderedMembers.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : teamMembers && teamMembers.length > 0 ? (
                // Regular view mode - sort by sortOrder here too
                [...teamMembers]
                  .sort((a, b) => {
                    const aSortOrder =
                      a.sortOrder !== undefined && a.sortOrder !== null
                        ? a.sortOrder
                        : 0
                    const bSortOrder =
                      b.sortOrder !== undefined && b.sortOrder !== null
                        ? b.sortOrder
                        : 0
                    return aSortOrder - bSortOrder
                  })
                  .map(member => (
                    <TableRow key={member.id}>
                      <TableCell>
                        {member.imageUrl ? (
                          <div className="relative h-12 w-12 rounded-full overflow-hidden">
                            <img
                              src={member.imageUrl}
                              alt={member.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-12 w-12 bg-gray-100 rounded-full">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {member.name}
                      </TableCell>
                      <TableCell>{member.title}</TableCell>
                      <TableCell>{member.institution}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* Edit Dialog */}
                          <Dialog
                            open={
                              editDialogOpen && selectedMember?.id === member.id
                            }
                            onOpenChange={open => {
                              setEditDialogOpen(open)
                              if (open) {
                                setSelectedMember(member)
                                loadTeamMemberData(member)
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Team Member</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleEditSubmit}>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-name">Name *</Label>
                                    <Input
                                      id="edit-name"
                                      name="name"
                                      value={formData.name}
                                      onChange={handleChange}
                                      required
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-title">
                                      Title/Position *
                                    </Label>
                                    <Input
                                      id="edit-title"
                                      name="title"
                                      value={formData.title}
                                      onChange={handleChange}
                                      required
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-institution">
                                      Institution/Organization *
                                    </Label>
                                    <Input
                                      id="edit-institution"
                                      name="institution"
                                      value={formData.institution}
                                      onChange={handleChange}
                                      required
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-description">
                                      Bio/Description *
                                    </Label>
                                    <Textarea
                                      id="edit-description"
                                      name="description"
                                      value={formData.description}
                                      onChange={handleChange}
                                      rows={4}
                                      required
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-email">
                                      Email Address
                                    </Label>
                                    <Input
                                      id="edit-email"
                                      name="email"
                                      type="email"
                                      value={formData.email}
                                      onChange={handleChange}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-website">
                                      Website URL
                                    </Label>
                                    <Input
                                      id="edit-website"
                                      name="website"
                                      value={formData.website}
                                      onChange={handleChange}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-socialMedia">
                                      Social Media
                                    </Label>
                                    <Input
                                      id="edit-socialMedia"
                                      name="socialMedia"
                                      value={formData.socialMedia}
                                      onChange={handleChange}
                                      placeholder="Twitter or LinkedIn URL"
                                    />
                                  </div>

                                  <ImageUpload
                                    currentImageUrl={formData.imageUrl}
                                    onImageUploaded={imageUrl => {
                                      setFormData(prev => ({
                                        ...prev,
                                        imageUrl,
                                      }))
                                    }}
                                    label="Profile Image"
                                    description="Upload a profile image (PNG, JPG up to 10MB)"
                                  />
                                </div>
                                <DialogFooter>
                                  <Button
                                    type="submit"
                                    disabled={updateTeamMember.isPending}
                                  >
                                    {updateTeamMember.isPending
                                      ? 'Saving...'
                                      : 'Save Changes'}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>

                          {/* Delete Dialog */}
                          <Dialog
                            open={
                              deleteDialogOpen &&
                              selectedMember?.id === member.id
                            }
                            onOpenChange={open => {
                              setDeleteDialogOpen(open)
                              if (open) {
                                setSelectedMember(member)
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Team Member</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <p>
                                  Are you sure you want to delete{' '}
                                  <span className="font-semibold">
                                    {member.name}
                                  </span>
                                  ?
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                  This action cannot be undone.
                                </p>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      deleteTeamMember.mutate(member.id)
                                    }
                                    disabled={deleteTeamMember.isPending}
                                  >
                                    {deleteTeamMember.isPending
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
                  ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    No team members found. Click "Add Team Member" to create
                    one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
