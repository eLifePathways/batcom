import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation } from 'wouter'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Users,
  BookOpen,
  FileText,
  Bug,
  Plus,
  Edit,
  ExternalLink,
  Trash2,
  Image,
} from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import { apiRequest } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

export default function AdminDashboard() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [, setLocation] = useLocation()

  // Dialog states
  const [addTeamMemberDialogOpen, setAddTeamMemberDialogOpen] = useState(false)
  const [addPublicationDialogOpen, setAddPublicationDialogOpen] =
    useState(false)
  const [addBackgroundPaperDialogOpen, setAddBackgroundPaperDialogOpen] =
    useState(false)

  // Team member form state
  const [teamMemberFormData, setTeamMemberFormData] = useState({
    name: '',
    title: '',
    institution: '',
    description: '',
    imageUrl: '',
    email: '',
    website: '',
    socialMedia: '',
  })

  // Publication form state
  const [publicationFormData, setPublicationFormData] = useState({
    title: '',
    authors: '',
    year: new Date().getFullYear(),
    abstract: '',
    evidenceQuality: 'medium',
    evidenceType: 'infection',
    virusCategoryId: 0,
    region: '',
    publicationDate: '',
    link: '',
  })

  // Background paper form state
  const [backgroundPaperFormData, setBackgroundPaperFormData] = useState({
    title: '',
    virusCategoryId: 0,
    link: '',
    imageUrl: '',
    description: '',
  })

  // Form change handlers
  const handleTeamMemberFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setTeamMemberFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePublicationFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setPublicationFormData(prev => ({
      ...prev,
      [name]:
        name === 'year' || name === 'virusCategoryId' ? parseInt(value) : value,
    }))
  }

  const handleBackgroundPaperFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setBackgroundPaperFormData(prev => ({
      ...prev,
      [name]: name === 'virusCategoryId' ? parseInt(value) : value,
    }))
  }

  // Fetch data for dashboard statistics
  const { data: teamMembers = [] } = useQuery<any[]>({
    queryKey: ['/api/team-members'],
  })

  console.log('dash teams', teamMembers)

  const { data: publications = [] } = useQuery<any[]>({
    queryKey: ['/api/publications'],
  })

  const { data: backgroundPapers = [] } = useQuery<any[]>({
    queryKey: ['/api/background-papers'],
  })

  const { data: virusCategories = [] } = useQuery<any[]>({
    queryKey: ['/api/virus-categories'],
  })

  // Add team member mutation
  const addTeamMember = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] })
      toast({
        title: 'Success',
        description: 'Team member added successfully',
      })
      setAddTeamMemberDialogOpen(false)
      setTeamMemberFormData({
        name: '',
        title: '',
        institution: '',
        description: '',
        imageUrl: '',
        email: '',
        website: '',
        socialMedia: '',
      })
    },
    onError: error => {
      toast({
        title: 'Error',
        description: 'Failed to add team member',
        variant: 'destructive',
      })
      console.error('Error adding team member:', error)
    },
  })

  // Handle team member form submit
  const handleTeamMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !teamMemberFormData.name ||
      !teamMemberFormData.title ||
      !teamMemberFormData.institution
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    addTeamMember.mutate(teamMemberFormData)
  }

  // Add publication mutation
  const addPublication = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/publications'] })
      toast({
        title: 'Success',
        description: 'Publication added successfully',
      })
      setAddPublicationDialogOpen(false)
      setPublicationFormData({
        title: '',
        authors: '',
        year: new Date().getFullYear(),
        abstract: '',
        evidenceQuality: 'medium',
        evidenceType: 'infection',
        virusCategoryId: 0,
        region: '',
        publicationDate: '',
        link: '',
      })
    },
    onError: error => {
      toast({
        title: 'Error',
        description: 'Failed to add publication',
        variant: 'destructive',
      })
      console.error('Error adding publication:', error)
    },
  })

  // Handle publication form submit
  const handlePublicationSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !publicationFormData.title ||
      !publicationFormData.authors ||
      !publicationFormData.year
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    addPublication.mutate(publicationFormData)
  }

  // Add background paper mutation
  const addBackgroundPaper = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/background-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/background-papers'] })
      toast({
        title: 'Success',
        description: 'Background paper added successfully',
      })
      setAddBackgroundPaperDialogOpen(false)
      setBackgroundPaperFormData({
        title: '',
        virusCategoryId: 0,
        link: '',
        imageUrl: '',
        description: '',
      })
    },
    onError: error => {
      toast({
        title: 'Error',
        description: 'Failed to add background paper',
        variant: 'destructive',
      })
      console.error('Error adding background paper:', error)
    },
  })

  // Handle background paper form submit
  const handleBackgroundPaperSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !backgroundPaperFormData.title ||
      !backgroundPaperFormData.virusCategoryId
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    addBackgroundPaper.mutate(backgroundPaperFormData)
  }

  // Prepare data for publications by year chart - using real database values
  const publicationsByYear =
    publications && Array.isArray(publications)
      ? Object.entries(
          publications.reduce((acc: Record<string, number>, pub: any) => {
            // Ensure we're working with numeric year values
            const year =
              typeof pub.year === 'number'
                ? pub.year.toString()
                : String(pub.year)
            acc[year] = (acc[year] || 0) + 1
            return acc
          }, {} as Record<string, number>),
        )
          .map(([year, count]) => ({
            year: year, // Keep year as string for display
            count: count, // Actual count from database
          }))
          .sort((a, b) => parseInt(a.year) - parseInt(b.year))
      : []

  // Log the actual data we're using for the chart
  console.log('Publication chart data (from database):', publicationsByYear)

  // Stats cards data
  const statsCards = [
    {
      title: 'Team Members',
      value: teamMembers?.length || 0,
      description: 'Researchers and staff members',
      icon: <Users className="h-6 w-6" />,
      href: '/admin/team',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
    {
      title: 'Virus Categories',
      value: virusCategories?.length || 0,
      description: 'Categorized virus families',
      icon: <Bug className="h-6 w-6" />,
      href: '/admin/virus-categories',
      color:
        'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    },
    {
      title: 'Publications',
      value: publications?.length || 0,
      description: 'Research publications',
      icon: <BookOpen className="h-6 w-6" />,
      href: '/admin/publications',
      color:
        'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    },
    {
      title: 'Background Papers',
      value: backgroundPapers?.length || 0,
      description: 'Educational resources',
      icon: <FileText className="h-6 w-6" />,
      href: '/admin/background-papers',
      color:
        'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage and monitor your content in one place.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map(card => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <div className={`p-2 rounded-full ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Publications Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Publication Year of Papers Reviewed</CardTitle>
          <CardDescription>
            Number of publications by year of publication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={publicationsByYear}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  tickFormatter={value => value}
                  tick={{ fontSize: 11 }}
                  interval={2} // Show every 2nd year label to avoid crowding
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, 'auto']}
                  tickFormatter={value => value}
                />
                <Tooltip
                  formatter={value => [`${value} Publications`, 'Count']}
                  labelFormatter={value => `Year: ${value}`}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--primary)"
                  name="Publications"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Add Team Member Dialog */}
            <div
              className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
              onClick={() => setAddTeamMemberDialogOpen(true)}
            >
              <div className="p-2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 mr-3">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Add Team Member</p>
                <p className="text-sm text-gray-500">
                  Create a new researcher profile
                </p>
              </div>
            </div>

            {/* Add Publication Dialog */}
            <div
              className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
              onClick={() => setAddPublicationDialogOpen(true)}
            >
              <div className="p-2 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 mr-3">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Add Publication</p>
                <p className="text-sm text-gray-500">
                  Create a new research publication
                </p>
              </div>
            </div>

            {/* Add Background Paper Dialog */}
            <div
              className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
              onClick={() => setAddBackgroundPaperDialogOpen(true)}
            >
              <div className="p-2 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 mr-3">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Add Background Paper</p>
                <p className="text-sm text-gray-500">
                  Create a new educational resource
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Member Dialog */}
      <Dialog
        open={addTeamMemberDialogOpen}
        onOpenChange={setAddTeamMemberDialogOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add details about a team member or researcher.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTeamMemberSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={teamMemberFormData.name}
                  onChange={handleTeamMemberFormChange}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={teamMemberFormData.title}
                  onChange={handleTeamMemberFormChange}
                  placeholder="Position or title"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution">Institution *</Label>
              <Input
                id="institution"
                name="institution"
                value={teamMemberFormData.institution}
                onChange={handleTeamMemberFormChange}
                placeholder="University or organization"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Bio</Label>
              <Textarea
                id="description"
                name="description"
                value={teamMemberFormData.description}
                onChange={handleTeamMemberFormChange}
                placeholder="Brief biography"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Profile Image</Label>
              <ImageUpload
                currentImageUrl={teamMemberFormData.imageUrl}
                onImageUploaded={url => {
                  setTeamMemberFormData(prev => ({ ...prev, imageUrl: url }))
                }}
                label="Upload a profile image"
                description="Recommended size: 400x400px"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={teamMemberFormData.email}
                  onChange={handleTeamMemberFormChange}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={teamMemberFormData.website}
                  onChange={handleTeamMemberFormChange}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="socialMedia">Social Media</Label>
                <Input
                  id="socialMedia"
                  name="socialMedia"
                  value={teamMemberFormData.socialMedia}
                  onChange={handleTeamMemberFormChange}
                  placeholder="https://twitter.com/handle"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={addTeamMember.isPending}>
                {addTeamMember.isPending ? 'Saving...' : 'Save Team Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Publication Dialog */}
      <Dialog
        open={addPublicationDialogOpen}
        onOpenChange={setAddPublicationDialogOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Publication</DialogTitle>
            <DialogDescription>
              Add details about a research publication related to bat viruses.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePublicationSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={publicationFormData.title}
                onChange={handlePublicationFormChange}
                placeholder="Publication title"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="authors">Authors *</Label>
                <Input
                  id="authors"
                  name="authors"
                  value={publicationFormData.authors}
                  onChange={handlePublicationFormChange}
                  placeholder="Smith J, et al."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={publicationFormData.year}
                  onChange={handlePublicationFormChange}
                  placeholder={new Date().getFullYear().toString()}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract</Label>
              <Textarea
                id="abstract"
                name="abstract"
                value={publicationFormData.abstract}
                onChange={handlePublicationFormChange}
                placeholder="Brief summary of the publication"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="evidenceQuality">Evidence Quality</Label>
                <Select
                  name="evidenceQuality"
                  value={publicationFormData.evidenceQuality}
                  onValueChange={value =>
                    setPublicationFormData(prev => ({
                      ...prev,
                      evidenceQuality: value,
                    }))
                  }
                >
                  <SelectTrigger id="evidenceQuality">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="evidenceType">Evidence Type</Label>
                <Select
                  name="evidenceType"
                  value={publicationFormData.evidenceType}
                  onValueChange={value =>
                    setPublicationFormData(prev => ({
                      ...prev,
                      evidenceType: value,
                    }))
                  }
                >
                  <SelectTrigger id="evidenceType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infection">Infection</SelectItem>
                    <SelectItem value="spillover">Spillover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="virusCategoryId">Virus Category</Label>
                <Select
                  name="virusCategoryId"
                  value={publicationFormData.virusCategoryId.toString()}
                  onValueChange={value =>
                    setPublicationFormData(prev => ({
                      ...prev,
                      virusCategoryId: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger id="virusCategoryId">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {virusCategories.map((category: any) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  name="region"
                  value={publicationFormData.region}
                  onChange={handlePublicationFormChange}
                  placeholder="Geographic region"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicationDate">Publication Date</Label>
                <Input
                  id="publicationDate"
                  name="publicationDate"
                  type="date"
                  value={publicationFormData.publicationDate}
                  onChange={handlePublicationFormChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                name="link"
                value={publicationFormData.link}
                onChange={handlePublicationFormChange}
                placeholder="URL to publication"
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={addPublication.isPending}>
                {addPublication.isPending ? 'Saving...' : 'Save Publication'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Background Paper Dialog */}
      <Dialog
        open={addBackgroundPaperDialogOpen}
        onOpenChange={setAddBackgroundPaperDialogOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Background Paper</DialogTitle>
            <DialogDescription>
              Add details about an educational resource or background paper.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleBackgroundPaperSubmit}
            className="space-y-4 mt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={backgroundPaperFormData.title}
                onChange={handleBackgroundPaperFormChange}
                placeholder="Paper title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="virusCategoryId">Virus Category *</Label>
              <Select
                name="virusCategoryId"
                value={backgroundPaperFormData.virusCategoryId.toString()}
                onValueChange={value =>
                  setBackgroundPaperFormData(prev => ({
                    ...prev,
                    virusCategoryId: parseInt(value),
                  }))
                }
              >
                <SelectTrigger id="virusCategoryId">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {virusCategories.map((category: any) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                name="link"
                value={backgroundPaperFormData.link}
                onChange={handleBackgroundPaperFormChange}
                placeholder="URL to resource"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Featured Image</Label>
              <ImageUpload
                currentImageUrl={backgroundPaperFormData.imageUrl}
                onImageUploaded={url =>
                  setBackgroundPaperFormData(prev => ({
                    ...prev,
                    imageUrl: url,
                  }))
                }
                label="Upload an image"
                description="Recommended size: 800x500px"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={backgroundPaperFormData.description}
                onChange={handleBackgroundPaperFormChange}
                placeholder="Brief description of this resource"
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={addBackgroundPaper.isPending}>
                {addBackgroundPaper.isPending ? 'Saving...' : 'Save Paper'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
