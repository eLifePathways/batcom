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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, User, UserPlus, Key } from "lucide-react";

type User = {
  id: number;
  username: string;
  password: string;
};

export default function UsersAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get URL query parameters and location control
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const action = searchParams.get('action');
  
  // Form data state
  const [formData, setFormData] = useState<Partial<User>>({
    username: "",
    password: ""
  });
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(action === 'new');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Reset form data
  const resetFormData = () => {
    setFormData({
      username: "",
      password: ""
    });
  };

  // Function to handle dialog state with URL updates
  const handleDialogState = (dialogType: string, isOpen: boolean) => {
    switch(dialogType) {
      case 'add':
        setAddDialogOpen(isOpen);
        if (isOpen) {
          setLocation('/admin/users?action=new', { replace: true });
        } else {
          setLocation('/admin/users', { replace: true });
        }
        break;
      case 'edit':
        setEditDialogOpen(isOpen);
        break;
      case 'delete':
        setDeleteDialogOpen(isOpen);
        break;
    }
  };
  
  // Watch for URL changes to sync dialog state
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const action = searchParams.get('action');
    
    if (action === 'new') {
      setAddDialogOpen(true);
      resetFormData();
      setSelectedUser(null);
    }
  }, [location]);
  
  // Get users query
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Form change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Load user data for edit form
  const loadUserData = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      // Don't display the actual password
      password: ""
    });
  };
  
  // Add user mutation
  const addUser = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Success",
        description: "User added successfully",
      });
      resetFormData();
      handleDialogState('add', false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      });
      console.error("Error adding user:", error);
    },
  });
  
  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setSelectedUser(null);
      resetFormData();
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
      console.error("Error updating user:", error);
    },
  });
  
  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/users/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
      console.error("Error deleting user:", error);
    },
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username) {
      toast({
        title: "Validation Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }
    
    // For new users, password is required
    if (!selectedUser && !formData.password) {
      toast({
        title: "Validation Error",
        description: "Password is required for new users",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare data for submission
    const data: any = {
      username: formData.username
    };
    
    // Only include password if it's provided (for updates) or required (for new users)
    if (formData.password) {
      data.password = formData.password;
    }
    
    // Update or add
    if (selectedUser) {
      updateUser.mutate({ id: selectedUser.id, data });
    } else {
      addUser.mutate(data);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage user accounts for admin access.
            </p>
          </div>
          
          {/* Add User Dialog */}
          <Dialog 
            open={addDialogOpen} 
            onOpenChange={(open) => {
              handleDialogState('add', open);
              // Reset form data and selected user when opening the Add dialog
              if (open) {
                resetFormData();
                setSelectedUser(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input 
                    id="username" 
                    name="username" 
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                  />
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={addUser.isPending}>
                    {addUser.isPending ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Users Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              )}
              
              {!isLoading && users?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    No users found. Add your first user to get started.
                  </TableCell>
                </TableRow>
              )}
              
              {!isLoading && [...(users || [])].sort((a, b) => a.id - b.id).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Edit Dialog */}
                      <Dialog 
                        open={editDialogOpen && selectedUser?.id === user.id}
                        onOpenChange={(open) => {
                          setEditDialogOpen(open);
                          if (open) {
                            loadUserData(user);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-username">Username *</Label>
                              <Input 
                                id="edit-username" 
                                name="username" 
                                value={formData.username}
                                onChange={handleChange}
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-password">
                                Password {selectedUser ? "(leave empty to keep current)" : "*"}
                              </Label>
                              <Input 
                                id="edit-password" 
                                name="password" 
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={selectedUser ? "Enter new password (optional)" : "Enter password"}
                                required={!selectedUser}
                              />
                            </div>
                            
                            <DialogFooter>
                              <Button type="submit" disabled={updateUser.isPending}>
                                {updateUser.isPending ? "Saving..." : "Save Changes"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                      
                      {/* Delete Dialog */}
                      <Dialog
                        open={deleteDialogOpen && selectedUser?.id === user.id}
                        onOpenChange={(open) => {
                          setDeleteDialogOpen(open);
                          if (open) {
                            setSelectedUser(user);
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
                            <DialogTitle>Delete User</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <p>Are you sure you want to delete user <span className="font-semibold">{user.username}</span>?</p>
                            <p className="text-sm text-gray-500 mt-2">This will permanently remove this user's account and access.</p>
                            <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="destructive" 
                              onClick={() => {
                                if (selectedUser) {
                                  try {
                                    deleteUser.mutate(selectedUser.id);
                                  } catch (error) {
                                    console.error("Error deleting user:", error);
                                  }
                                }
                              }}
                              disabled={deleteUser.isPending}
                            >
                              {deleteUser.isPending ? "Deleting..." : "Delete"}
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