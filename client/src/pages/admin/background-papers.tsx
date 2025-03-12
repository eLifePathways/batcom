import { useState } from "react";
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
import { Plus, Edit, Trash2, ExternalLink, FileText } from "lucide-react";

type VirusCategory = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
};

type BackgroundPaper = {
  id: number;
  title: string;
  virusCategoryId: number;
  link?: string;
  imageUrl?: string;
  description?: string;
};

export default function BackgroundPapersAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form data state
  const [formData, setFormData] = useState<Partial<BackgroundPaper>>({
    title: "",
    virusCategoryId: 0,
    link: "",
    imageUrl: "",
    description: ""
  });
  
  const [selectedPaper, setSelectedPaper] = useState<BackgroundPaper | null>(null);
  
  // Get background papers query
  const { data: backgroundPapers, isLoading } = useQuery<BackgroundPaper[]>({
    queryKey: ['/api/background-papers'],
  });
  
  // Get virus categories for select dropdown
  const { data: virusCategories } = useQuery<VirusCategory[]>({
    queryKey: ['/api/virus-categories'],
  });
  
  // Reset form data
  const resetFormData = () => {
    setFormData({
      title: "",
      virusCategoryId: 0,
      link: "",
      imageUrl: "",
      description: ""
    });
  };
  
  // Form change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "virusCategoryId" ? parseInt(value) : value
    }));
  };
  
  // Select change handler
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "virusCategoryId" ? parseInt(value) : value
    }));
  };
  
  // Load background paper data for edit form
  const loadPaperData = (paper: BackgroundPaper) => {
    setSelectedPaper(paper);
    setFormData({
      title: paper.title,
      virusCategoryId: paper.virusCategoryId,
      link: paper.link || "",
      imageUrl: paper.imageUrl || "",
      description: paper.description || ""
    });
  };
  
  // Add background paper mutation
  const addBackgroundPaper = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/background-papers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/background-papers'] });
      toast({
        title: "Success",
        description: "Background paper added successfully",
      });
      resetFormData();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add background paper",
        variant: "destructive",
      });
      console.error("Error adding background paper:", error);
    },
  });
  
  // Update background paper mutation
  const updateBackgroundPaper = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PUT', `/api/background-papers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/background-papers'] });
      toast({
        title: "Success",
        description: "Background paper updated successfully",
      });
      setSelectedPaper(null);
      resetFormData();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update background paper",
        variant: "destructive",
      });
      console.error("Error updating background paper:", error);
    },
  });
  
  // Delete background paper mutation
  const deleteBackgroundPaper = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/background-papers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/background-papers'] });
      toast({
        title: "Success",
        description: "Background paper deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete background paper",
        variant: "destructive",
      });
      console.error("Error deleting background paper:", error);
    },
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title) {
      toast({
        title: "Validation Error",
        description: "Please enter a title",
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
      virusCategoryId: formData.virusCategoryId,
      link: formData.link || "",
      imageUrl: formData.imageUrl || "",
      description: formData.description || ""
    };
    
    // Update or add
    if (selectedPaper) {
      updateBackgroundPaper.mutate({ id: selectedPaper.id, data });
    } else {
      addBackgroundPaper.mutate(data);
    }
  };
  
  // Get virus category name by ID
  const getVirusCategoryName = (id: number) => {
    const category = virusCategories?.find(c => c.id === id);
    return category ? category.name : "Unknown";
  };
  
  return (
    <>
      <AdminNav />
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Background Papers</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage educational resources and background materials.
            </p>
          </div>
          
          {/* Add Background Paper Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Paper
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Background Paper</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Paper title"
                    required
                  />
                </div>
                
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="link">Resource Link</Label>
                    <Input 
                      id="link" 
                      name="link" 
                      value={formData.link}
                      onChange={handleChange}
                      placeholder="https://example.com/paper.pdf"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input 
                      id="imageUrl" 
                      name="imageUrl" 
                      value={formData.imageUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of this background paper"
                    rows={4}
                  />
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="submit" disabled={addBackgroundPaper.isPending || updateBackgroundPaper.isPending}>
                      {addBackgroundPaper.isPending || updateBackgroundPaper.isPending ? "Saving..." : "Save Paper"}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Background Papers Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Virus Category</TableHead>
                <TableHead>Link</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              )}
              
              {!isLoading && backgroundPapers?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No background papers found. Add your first paper to get started.
                  </TableCell>
                </TableRow>
              )}
              
              {!isLoading && backgroundPapers?.map((paper) => (
                <TableRow key={paper.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="max-w-[300px] truncate">{paper.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getVirusCategoryName(paper.virusCategoryId)}</TableCell>
                  <TableCell>
                    {paper.link ? (
                      <a 
                        href={paper.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 truncate max-w-[250px]"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate">{paper.link}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No link provided</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Edit Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => loadPaperData(paper)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Background Paper</DialogTitle>
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-link">Resource Link</Label>
                                <Input 
                                  id="edit-link" 
                                  name="link" 
                                  value={formData.link}
                                  onChange={handleChange}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-imageUrl">Image URL</Label>
                                <Input 
                                  id="edit-imageUrl" 
                                  name="imageUrl" 
                                  value={formData.imageUrl}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea 
                                id="edit-description" 
                                name="description" 
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                              />
                            </div>
                            
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="submit" disabled={updateBackgroundPaper.isPending}>
                                  {updateBackgroundPaper.isPending ? "Saving..." : "Save Changes"}
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
                            <DialogTitle>Delete Background Paper</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <p>Are you sure you want to delete <span className="font-semibold">{paper.title}</span>?</p>
                            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button 
                                variant="destructive" 
                                onClick={() => deleteBackgroundPaper.mutate(paper.id)}
                                disabled={deleteBackgroundPaper.isPending}
                              >
                                {deleteBackgroundPaper.isPending ? "Deleting..." : "Delete"}
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