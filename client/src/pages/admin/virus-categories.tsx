import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Plus, Edit, Trash2, Image } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

type VirusCategory = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
};

export default function VirusCategoriesAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get URL query parameters and location control
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const action = searchParams.get('action');
  
  // Form data state
  const [formData, setFormData] = useState<Partial<VirusCategory>>({
    name: "",
    description: "",
    imageUrl: ""
  });
  
  const [selectedCategory, setSelectedCategory] = useState<VirusCategory | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(action === 'new');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: ""
    });
  };
  
  // Load category data for editing
  const loadCategoryData = (category: VirusCategory) => {
    setFormData({
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl
    });
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Fetch virus categories
  const { data: categories, isLoading } = useQuery<VirusCategory[]>({
    queryKey: ['/api/virus-categories'],
  });
  
  // Create virus category mutation
  const createVirusCategory = useMutation({
    mutationFn: async (categoryData: Partial<VirusCategory>) => {
      return apiRequest('/api/virus-categories', {
        method: 'POST',
        body: JSON.stringify(categoryData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Virus category created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/virus-categories'] });
      setAddDialogOpen(false);
      resetFormData();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create virus category.",
        variant: "destructive",
      });
    }
  });
  
  // Update virus category mutation
  const updateVirusCategory = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<VirusCategory> }) => {
      return apiRequest(`/api/virus-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Virus category updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/virus-categories'] });
      setEditDialogOpen(false);
      setSelectedCategory(null);
      resetFormData();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update virus category.",
        variant: "destructive",
      });
    }
  });
  
  // Delete virus category mutation
  const deleteVirusCategory = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/virus-categories/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Virus category deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/virus-categories'] });
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete virus category.",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission for creating a new category
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    createVirusCategory.mutate(formData);
  };
  
  // Handle form submission for updating a category
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !formData.name || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    updateVirusCategory.mutate({
      id: selectedCategory.id,
      data: formData
    });
  };
  
  // Handle category deletion
  const handleDelete = () => {
    if (selectedCategory) {
      deleteVirusCategory.mutate(selectedCategory.id);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Virus Categories</h1>
        <Button onClick={() => {
          resetFormData();
          setAddDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      
      {/* Add Category Dialog */}
      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) {
            // Reset form data when dialog is closed
            resetFormData();
            // Also clear the URL if it has the 'new' action
            if (action === 'new') {
              setLocation('/admin/virus-categories');
            }
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Virus Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>
              
              <ImageUpload
                currentImageUrl={formData.imageUrl}
                onImageUploaded={(imageUrl) => {
                  setFormData(prev => ({ ...prev, imageUrl }));
                }}
                label="Category Image"
                description="Upload an image for this virus category (PNG, JPG up to 5MB)"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createVirusCategory.isPending}>
                {createVirusCategory.isPending ? "Creating..." : "Create Category"}
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
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : categories && categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.imageUrl ? (
                        <div className="relative h-12 w-12 rounded overflow-hidden">
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-12 w-12 bg-gray-100 rounded">
                          <Image className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate">{category.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Edit Dialog */}
                        <Dialog
                          open={editDialogOpen && selectedCategory?.id === category.id}
                          onOpenChange={(open) => {
                            setEditDialogOpen(open);
                            if (open) {
                              setSelectedCategory(category);
                              loadCategoryData(category);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Virus Category</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleEditSubmit}>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Category Name *</Label>
                                  <Input 
                                    id="edit-name" 
                                    name="name" 
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit-description">Description *</Label>
                                  <Textarea 
                                    id="edit-description" 
                                    name="description" 
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    required
                                  />
                                </div>
                                
                                <ImageUpload
                                  currentImageUrl={formData.imageUrl}
                                  onImageUploaded={(imageUrl) => {
                                    setFormData(prev => ({ ...prev, imageUrl }));
                                  }}
                                  label="Category Image"
                                  description="Upload an image for this virus category (PNG, JPG up to 5MB)"
                                />
                                
                                <DialogFooter>
                                  <Button type="submit" disabled={updateVirusCategory.isPending}>
                                    {updateVirusCategory.isPending ? "Saving..." : "Save Changes"}
                                  </Button>
                                </DialogFooter>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                        
                        {/* Delete Dialog */}
                        <Dialog
                          open={deleteDialogOpen && selectedCategory?.id === category.id}
                          onOpenChange={(open) => {
                            setDeleteDialogOpen(open);
                            if (open) {
                              setSelectedCategory(category);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Virus Category</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <p>Are you sure you want to delete <span className="font-semibold">{category.name}</span>?</p>
                              <p className="text-sm text-gray-500 mt-2">This will also delete any associated publications and background papers.</p>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setDeleteDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleteVirusCategory.isPending}
                              >
                                {deleteVirusCategory.isPending ? "Deleting..." : "Delete"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No virus categories found. Click "Add Category" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}