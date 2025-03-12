import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit, Plus, Trash2, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamMember } from "@shared/schema";
import AdminNav from "@/components/admin/admin-nav";

export default function TeamMembersAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch team members
  const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members'],
  });
  
  // State for selected team member (for edit modal)
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  
  // State for dialog open/close
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editMemberId, setEditMemberId] = useState<number | null>(null);
  
  // Form state for new/edit team member
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    institution: "",
    description: "",
    imageUrl: "",
    email: "",
    website: "",
    socialMedia: ""
  });
  
  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: "",
      title: "",
      institution: "",
      description: "",
      imageUrl: "",
      email: "",
      website: "",
      socialMedia: ""
    });
  };
  
  // Load team member data into form
  const loadTeamMemberData = (member: TeamMember) => {
    setFormData({
      name: member.name,
      title: member.title,
      institution: member.institution,
      description: member.description,
      imageUrl: member.imageUrl || "",
      email: member.email || "",
      website: member.website || "",
      socialMedia: member.socialMedia || ""
    });
    setSelectedTeamMember(member);
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Add team member mutation
  const addTeamMember = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      toast({
        title: "Success",
        description: "Team member added successfully",
      });
      resetFormData();
      setAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      });
      console.error("Error adding team member:", error);
    },
  });
  
  // Update team member mutation
  const updateTeamMember = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/team-members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      toast({
        title: "Success",
        description: "Team member updated successfully",
      });
      setSelectedTeamMember(null);
      resetFormData();
      setEditMemberId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update team member",
        variant: "destructive",
      });
      console.error("Error updating team member:", error);
    },
  });
  
  // Delete team member mutation
  const deleteTeamMember = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest<any>(`/api/team-members/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      toast({
        title: "Success",
        description: "Team member deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive",
      });
      console.error("Error deleting team member:", error);
    },
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.title || !formData.institution || !formData.description) {
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
      title: formData.title,
      institution: formData.institution,
      description: formData.description,
      imageUrl: formData.imageUrl || "https://via.placeholder.com/150",
      email: formData.email || "",
      website: formData.website || "",
      socialMedia: formData.socialMedia || ""
    };
    
    // Update or add
    if (selectedTeamMember) {
      updateTeamMember.mutate({ id: selectedTeamMember.id, data });
    } else {
      addTeamMember.mutate(data);
    }
  };
  
  return (
    <div>
      <AdminNav />
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Team Members</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage research team profiles and information.
            </p>
          </div>
          
          {/* Add Member Dialog */}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center gap-2"
                onClick={() => {
                  resetFormData();
                  setSelectedTeamMember(null);
                  setAddDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Team Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
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
                      placeholder="Professor of Virology"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution *</Label>
                    <Input 
                      id="institution" 
                      name="institution" 
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="Johns Hopkins University"
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description/Bio *</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief biography and research interests"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      name="website" 
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialMedia">Social Media</Label>
                    <Input 
                      id="socialMedia" 
                      name="socialMedia" 
                      value={formData.socialMedia}
                      onChange={handleChange}
                      placeholder="Twitter, LinkedIn URL"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="submit" disabled={addTeamMember.isPending || updateTeamMember.isPending}>
                      {addTeamMember.isPending || updateTeamMember.isPending ? "Saving..." : "Save Member"}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Team Members Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              )}
              
              {!isLoading && teamMembers?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No team members found. Add your first team member to get started.
                  </TableCell>
                </TableRow>
              )}
              
              {!isLoading && [...(teamMembers || [])].sort((a, b) => a.id - b.id).map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    {member.imageUrl ? (
                      <img 
                        src={member.imageUrl} 
                        alt={member.name} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.title}</TableCell>
                  <TableCell>{member.institution}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Edit Dialog */}
                      <Dialog 
                        open={editMemberId === member.id} 
                        onOpenChange={(open) => open ? setEditMemberId(member.id) : setEditMemberId(null)}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => {
                              loadTeamMemberData(member);
                              setEditMemberId(member.id);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Team Member</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <Label htmlFor="edit-title">Title/Position *</Label>
                                <Input 
                                  id="edit-title" 
                                  name="title" 
                                  value={formData.title}
                                  onChange={handleChange}
                                  required
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-institution">Institution *</Label>
                                <Input 
                                  id="edit-institution" 
                                  name="institution" 
                                  value={formData.institution}
                                  onChange={handleChange}
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
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="edit-description">Description/Bio *</Label>
                              <Textarea 
                                id="edit-description" 
                                name="description" 
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                required
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input 
                                  id="edit-email" 
                                  name="email" 
                                  type="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-website">Website</Label>
                                <Input 
                                  id="edit-website" 
                                  name="website" 
                                  value={formData.website}
                                  onChange={handleChange}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-socialMedia">Social Media</Label>
                                <Input 
                                  id="edit-socialMedia" 
                                  name="socialMedia" 
                                  value={formData.socialMedia}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="submit" disabled={updateTeamMember.isPending}>
                                  {updateTeamMember.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                      
                      {/* Delete Dialog */}
                      <Dialog>
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
                            <p>Are you sure you want to delete <span className="font-semibold">{member.name}</span>?</p>
                            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button 
                                variant="destructive" 
                                onClick={() => deleteTeamMember.mutate(member.id)}
                                disabled={deleteTeamMember.isPending}
                              >
                                {deleteTeamMember.isPending ? "Deleting..." : "Delete"}
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
    </div>
  );
}