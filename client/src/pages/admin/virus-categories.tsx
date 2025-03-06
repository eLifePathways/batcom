import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Image } from "lucide-react";
import AdminNav from "@/components/admin/admin-nav";

type VirusCategory = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
};

export default function VirusCategoriesAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form data state
  const [formData, setFormData] = useState<Partial<VirusCategory>>({
    name: "",
    description: "",
    imageUrl: ""
  });
  
  const [selectedCategory, setSelectedCategory] = useState<VirusCategory | null>(null);
  
  // Get virus categories query
  const { data: virusCategories, isLoading } = useQuery<VirusCategory[]>({
    queryKey: ['/api/virus-categories'],
  });
  
  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: ""
    });
  };
  
  // Form change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Load virus category data for edit form
  const loadCategoryData = (category: VirusCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl || ""
    });
  };
  
  // Add virus category mutation
  const addVirusCategory = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/virus-categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/virus-categories'] });
      toast({
        title: "Success",
        description: "Virus category added successfully",
      });
      resetFormData();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add virus category",
        variant: "destructive",
      });
      console.error("Error adding virus category:", error);
    },
  });
  
  // Update virus category mutation
  const updateVirusCategory = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PUT', `/api/virus-categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/virus-categories'] });
      toast({
        title: "Success",
        description: "Virus category updated successfully",
      });
      setSelectedCategory(null);
      resetFormData();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update virus category",
        variant: "destructive",
      });
      console.error("Error updating virus category:", error);
    },
  });
  
  // Delete virus category mutation
  const deleteVirusCategory = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/virus-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/virus-categories'] });
      toast({
        title: "Success",
        description: "Virus category deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete virus category",
        variant: "destructive",
      });
      console.error("Error deleting virus category:", error);
    },
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare data for submission
    const data = {
      name: formData.name,
      description: formData.description,
      imageUrl: formData.imageUrl || "https://via.placeholder.com/150"
    };
    
    // Update or add
    if (selectedCategory) {
      updateVirusCategory.mutate({ id: selectedCategory.id, data });
    } else {
      addVirusCategory.mutate(data);
    }
  };
  
  return (
    <div>
      <AdminNav />
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Virus Categories</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage virus categories and taxonomic groups.
            </p>
          </div>
          
          {/* Add Virus Category Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Virus Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Coronaviridae"
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
                    placeholder="Brief description of this virus category"
                    rows={4}
                    required
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
                
                <DialogFooter>
                  <Button type="submit" disabled={addVirusCategory.isPending || updateVirusCategory.isPending}>
                    {addVirusCategory.isPending || updateVirusCategory.isPending ? "Saving..." : "Save Category"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Virus Categories Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[300px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              )}
              
              {!isLoading && virusCategories?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No virus categories found. Add your first category to get started.
                  </TableCell>
                </TableRow>
              )}
              
              {!isLoading && virusCategories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.imageUrl ? (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Image className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-[400px] truncate">{category.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Edit Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => loadCategoryData(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Virus Category</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-imageUrl">Image URL</Label>
                              <Input 
                                id="edit-imageUrl" 
                                name="imageUrl" 
                                value={formData.imageUrl}
                                onChange={handleChange}
                              />
                            </div>
                            
                            <DialogFooter>
                              <Button type="submit" disabled={updateVirusCategory.isPending}>
                                {updateVirusCategory.isPending ? "Saving..." : "Save Changes"}
                              </Button>
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
                            <DialogTitle>Delete Virus Category</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <p>Are you sure you want to delete <span className="font-semibold">{category.name}</span>?</p>
                            <p className="text-sm text-gray-500 mt-2">This will also delete any associated publications and background papers.</p>
                            <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="destructive" 
                              onClick={() => deleteVirusCategory.mutate(category.id)}
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}