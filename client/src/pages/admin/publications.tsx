import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminNav from "@/components/admin/admin-nav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";

type VirusCategory = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
};

type Publication = {
  id: number;
  title: string;
  authors: string;
  year: number;
  abstract: string;
  evidenceQuality: "high" | "medium" | "low";
  evidenceType: "infection" | "spillover";
  virusCategoryId: number;
  region: string;
  publicationDate: string;
  link?: string;
};

export default function PublicationsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Get URL query parameters
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const action = searchParams.get('action');
  
  // State to control dialog visibility
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(action === "new");
  
  // Get path parameters
  const params = useParams();
  
  // Form data state
  const [formData, setFormData] = useState<Partial<Publication>>({
    title: "",
    authors: "",
    year: new Date().getFullYear(),
    abstract: "",
    evidenceQuality: "medium",
    evidenceType: "infection",
    virusCategoryId: 0,
    region: "",
    publicationDate: new Date().toISOString().split('T')[0],
    link: ""
  });
  
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  
  // Get publications query
  const { data: publications, isLoading } = useQuery<Publication[]>({
    queryKey: ['/api/publications'],
  });
  
  // Get virus categories for select dropdown
  const { data: virusCategories } = useQuery<VirusCategory[]>({
    queryKey: ['/api/virus-categories'],
  });
  
  // Reset form data
  const resetFormData = () => {
    setFormData({
      title: "",
      authors: "",
      year: new Date().getFullYear(),
      abstract: "",
      evidenceQuality: "medium",
      evidenceType: "infection",
      virusCategoryId: 0,
      region: "",
      publicationDate: new Date().toISOString().split('T')[0],
      link: ""
    });
  };
  
  // Form change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" || name === "virusCategoryId" ? parseInt(value) : value
    }));
  };
  
  // Select change handler
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "virusCategoryId" ? parseInt(value) : value
    }));
  };
  
  // Load publication data for edit form
  const loadPublicationData = (publication: Publication) => {
    setSelectedPublication(publication);
    setFormData({
      title: publication.title,
      authors: publication.authors,
      year: publication.year,
      abstract: publication.abstract,
      evidenceQuality: publication.evidenceQuality,
      evidenceType: publication.evidenceType,
      virusCategoryId: publication.virusCategoryId,
      region: publication.region,
      publicationDate: publication.publicationDate,
      link: publication.link || ""
    });
  };
  
  // Add publication mutation
  const addPublication = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/publications'] });
      toast({
        title: "Success",
        description: "Publication added successfully",
      });
      resetFormData();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add publication",
        variant: "destructive",
      });
      console.error("Error adding publication:", error);
    },
  });
  
  // Update publication mutation
  const updatePublication = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/publications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/publications'] });
      toast({
        title: "Success",
        description: "Publication updated successfully",
      });
      setSelectedPublication(null);
      resetFormData();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update publication",
        variant: "destructive",
      });
      console.error("Error updating publication:", error);
    },
  });
  
  // Delete publication mutation
  const deletePublication = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/publications/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/publications'] });
      toast({
        title: "Success",
        description: "Publication deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete publication",
        variant: "destructive",
      });
      console.error("Error deleting publication:", error);
    },
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.authors || !formData.year || !formData.abstract || !formData.region) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.virusCategoryId) {
      toast({
        title: "Validation Error",
        description: "Please select a virus category",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare data for submission
    const data = {
      title: formData.title,
      authors: formData.authors,
      year: formData.year,
      abstract: formData.abstract,
      evidenceQuality: formData.evidenceQuality,
      evidenceType: formData.evidenceType,
      virusCategoryId: formData.virusCategoryId,
      region: formData.region,
      publicationDate: formData.publicationDate,
      link: formData.link
    };
    
    // Update or add
    if (selectedPublication) {
      updatePublication.mutate({ id: selectedPublication.id, data });
    } else {
      addPublication.mutate(data);
    }
  };
  
  // Get virus category name by ID
  const getVirusCategoryName = (id: number) => {
    const category = virusCategories?.find(c => c.id === id);
    return category ? category.name : "Unknown";
  };
  
  // Get quality badge color
  const getQualityBadgeColor = (quality: string) => {
    switch (quality) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <>
      <AdminNav />
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
          <h1 className="text-3xl font-bold">Publications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage research publications and articles.
          </p>
        </div>
        
        {/* Add Publication Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Publication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Publication</DialogTitle>
              <DialogDescription>
                Add details about a research publication related to bat viruses.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title}
                  onChange={handleChange}
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
                    value={formData.authors}
                    onChange={handleChange}
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
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="2023"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="evidenceQuality">Evidence Quality *</Label>
                  <Select 
                    value={formData.evidenceQuality} 
                    onValueChange={(value) => handleSelectChange("evidenceQuality", value)}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="evidenceType">Evidence Type *</Label>
                  <Select 
                    value={formData.evidenceType} 
                    onValueChange={(value) => handleSelectChange("evidenceType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infection">Infection</SelectItem>
                      <SelectItem value="spillover">Spillover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="virusCategoryId">Virus Category *</Label>
                  <Select 
                    value={formData.virusCategoryId?.toString()} 
                    onValueChange={(value) => handleSelectChange("virusCategoryId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select virus category" />
                    </SelectTrigger>
                    <SelectContent>
                      {virusCategories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Input 
                    id="region" 
                    name="region" 
                    value={formData.region}
                    onChange={handleChange}
                    placeholder="Asia, Africa, Global, etc."
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="publicationDate">Publication Date *</Label>
                  <Input 
                    id="publicationDate" 
                    name="publicationDate" 
                    type="date"
                    value={formData.publicationDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link">Link</Label>
                  <Input 
                    id="link" 
                    name="link" 
                    value={formData.link}
                    onChange={handleChange}
                    placeholder="https://doi.org/..."
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="abstract">Abstract *</Label>
                <Textarea 
                  id="abstract" 
                  name="abstract" 
                  value={formData.abstract}
                  onChange={handleChange}
                  placeholder="Publication abstract"
                  rows={5}
                  required
                />
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="submit" disabled={addPublication.isPending || updatePublication.isPending}>
                    {addPublication.isPending || updatePublication.isPending ? "Saving..." : "Save Publication"}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Publications Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Authors</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Virus Category</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                </TableRow>
              ))
            )}
            
            {!isLoading && publications?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No publications found. Add your first publication to get started.
                </TableCell>
              </TableRow>
            )}
            
            {!isLoading && [...(publications || [])].sort((a, b) => a.id - b.id).map((publication) => (
              <TableRow key={publication.id}>
                <TableCell className="font-medium max-w-[300px] truncate">
                  {publication.title}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{publication.authors}</TableCell>
                <TableCell>{publication.year}</TableCell>
                <TableCell>{getVirusCategoryName(publication.virusCategoryId)}</TableCell>
                <TableCell>
                  <Badge className={getQualityBadgeColor(publication.evidenceQuality)}>
                    {publication.evidenceQuality}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* External Link */}
                    {publication.link && (
                      <a 
                        href={publication.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    
                    {/* Edit Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => loadPublicationData(publication)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Edit Publication</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-title">Title *</Label>
                            <Input 
                              id="edit-title" 
                              name="title" 
                              value={formData.title}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-authors">Authors *</Label>
                              <Input 
                                id="edit-authors" 
                                name="authors" 
                                value={formData.authors}
                                onChange={handleChange}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-year">Year *</Label>
                              <Input 
                                id="edit-year" 
                                name="year" 
                                type="number"
                                value={formData.year}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-evidenceQuality">Evidence Quality *</Label>
                              <Select 
                                value={formData.evidenceQuality} 
                                onValueChange={(value) => handleSelectChange("evidenceQuality", value)}
                              >
                                <SelectTrigger>
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
                              <Label htmlFor="edit-evidenceType">Evidence Type *</Label>
                              <Select 
                                value={formData.evidenceType} 
                                onValueChange={(value) => handleSelectChange("evidenceType", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="infection">Infection</SelectItem>
                                  <SelectItem value="spillover">Spillover</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-virusCategoryId">Virus Category *</Label>
                              <Select 
                                value={formData.virusCategoryId?.toString()} 
                                onValueChange={(value) => handleSelectChange("virusCategoryId", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select virus category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {virusCategories?.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-region">Region *</Label>
                              <Input 
                                id="edit-region" 
                                name="region" 
                                value={formData.region}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-publicationDate">Publication Date *</Label>
                              <Input 
                                id="edit-publicationDate" 
                                name="publicationDate" 
                                type="date"
                                value={formData.publicationDate}
                                onChange={handleChange}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-link">Link</Label>
                              <Input 
                                id="edit-link" 
                                name="link" 
                                value={formData.link}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="edit-abstract">Abstract *</Label>
                            <Textarea 
                              id="edit-abstract" 
                              name="abstract" 
                              value={formData.abstract}
                              onChange={handleChange}
                              rows={5}
                              required
                            />
                          </div>
                          
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="submit" disabled={updatePublication.isPending}>
                                {updatePublication.isPending ? "Saving..." : "Save Changes"}
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    
                    {/* Delete Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Publication</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <p>Are you sure you want to delete:</p>
                          <p className="font-semibold mt-2">{publication.title}</p>
                          <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button 
                              variant="destructive" 
                              onClick={() => deletePublication.mutate(publication.id)}
                              disabled={deletePublication.isPending}
                            >
                              {deletePublication.isPending ? "Deleting..." : "Delete"}
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
    </>
  );
}