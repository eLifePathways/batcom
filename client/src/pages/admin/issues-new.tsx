import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, Eye, XCircle, Check, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { IssueDetailDialog } from "@/components/issue-report/issue-detail-dialog";

type Issue = {
  id: number;
  title: string;
  description: string;
  email?: string;
  url: string;
  screenshot?: string;
  consoleLog?: string;
  userAgent: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  submittedAt: string;
  updatedAt: string;
};

export default function IssuesAdmin() {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [issueCommentsMap, setIssueCommentsMap] = useState<Record<number, { lastCommentDate: string | null, hasUnreadComments: boolean }>>({});
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: issues, isLoading } = useQuery({
    queryKey: ['/api/issues'],
    select: (data: Issue[]) => data.sort((a, b) => {
      // Sort by priority first (high > medium > low)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder];
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder];
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same priority, sort by most recent
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    })
  });
  
  // Fetch comments for each issue to check for unread comments
  useEffect(() => {
    if (!issues) return;
    
    const fetchCommentsForIssues = async () => {
      const commentPromises = issues.map(async (issue) => {
        try {
          const comments = await apiRequest(`/api/issues/${issue.id}/comments`);
          if (!comments || comments.length === 0) {
            return [issue.id, { lastCommentDate: null, hasUnreadComments: false }];
          }
          
          // Sort comments by date (newest first)
          const sortedComments = [...comments].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          const lastCommentDate = sortedComments[0]?.createdAt;
          
          // Check if the last comment is newer than the last time the issue was updated
          // This would indicate an unread comment
          const hasUnreadComments = lastCommentDate && 
            new Date(lastCommentDate).getTime() > new Date(issue.updatedAt).getTime();
            
          return [issue.id, { lastCommentDate, hasUnreadComments }];
        } catch (error) {
          console.error(`Error fetching comments for issue ${issue.id}:`, error);
          return [issue.id, { lastCommentDate: null, hasUnreadComments: false }];
        }
      });
      
      const commentsResults = await Promise.all(commentPromises);
      const commentsMap = Object.fromEntries(commentsResults);
      setIssueCommentsMap(commentsMap);
    };
    
    fetchCommentsForIssues();
  }, [issues]);
  
  const updateIssueMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Issue> }) => {
      return apiRequest(`/api/issues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/issues'] });
      toast({ title: "Issue updated" });
    },
    onError: (error) => {
      console.error("Error updating issue:", error);
      toast({ 
        title: "Failed to update issue", 
        variant: "destructive" 
      });
    }
  });
  
  const deleteIssueMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/issues/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/issues'] });
      setIsDeleteDialogOpen(false);
      toast({ title: "Issue deleted" });
    },
    onError: (error) => {
      console.error("Error deleting issue:", error);
      toast({ 
        title: "Failed to delete issue", 
        variant: "destructive" 
      });
    }
  });
  
  const handleStatusChange = (id: number, status: Issue['status']) => {
    updateIssueMutation.mutate({ id, data: { status } });
  };
  
  const handlePriorityChange = (id: number, priority: Issue['priority']) => {
    updateIssueMutation.mutate({ id, data: { priority } });
  };
  
  const handleDeleteClick = (issue: Issue) => {
    setSelectedIssueId(issue.id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleViewDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDetailDialogOpen(true);
    
    // Mark comments as read by updating the issue's updatedAt field
    if (issueCommentsMap[issue.id]?.hasUnreadComments) {
      updateIssueMutation.mutate({ 
        id: issue.id, 
        data: { 
          updatedAt: new Date().toISOString() 
        } 
      });
      
      // Also update the local state
      setIssueCommentsMap(prev => ({
        ...prev,
        [issue.id]: {
          ...prev[issue.id],
          hasUnreadComments: false
        }
      }));
    }
  };
  
  const getStatusBadge = (status: Issue['status']) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Open</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Closed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: Issue['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Issue Reports</h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : issues && issues.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.map((issue) => (
                <TableRow key={issue.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewDetails(issue)}>
                  <TableCell className="font-medium truncate max-w-[280px]">
                    <div className="flex items-center">
                      {issueCommentsMap[issue.id]?.hasUnreadComments && (
                        <span className="mr-2 h-2 w-2 rounded-full bg-blue-500 animate-pulse" 
                              title="New comments"></span>
                      )}
                      {issue.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(issue.status)}
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(issue.priority)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(issue.submittedAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(issue.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(issue)}>
                            <Eye className="h-4 w-4 mr-2" />
                            <div className="flex items-center">
                              View Details
                              {issueCommentsMap[issue.id]?.hasUnreadComments && (
                                <span className="ml-2 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                              )}
                            </div>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'open')}>
                            <AlertTriangle className="h-4 w-4 mr-2 text-blue-600" />
                            Mark as Open
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'in_progress')}>
                            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                            Mark as In Progress
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'resolved')}>
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Mark as Resolved
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'closed')}>
                            <XCircle className="h-4 w-4 mr-2 text-gray-600" />
                            Mark as Closed
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handlePriorityChange(issue.id, 'low')}>
                            Set Low Priority
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handlePriorityChange(issue.id, 'medium')}>
                            Set Medium Priority
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handlePriorityChange(issue.id, 'high')}>
                            Set High Priority
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(issue)}
                            className="text-red-600"
                          >
                            Delete Issue
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No issues reported</h3>
          <p className="text-muted-foreground">
            When users report issues, they will appear here.
          </p>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the issue and all its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedIssueId && deleteIssueMutation.mutate(selectedIssueId)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteIssueMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Issue Detail Dialog */}
      {selectedIssue && (
        <IssueDetailDialog
          issue={selectedIssue}
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          onCommentAdded={() => {
            // Refresh the comment status for this issue
            const fetchComments = async () => {
              try {
                const comments = await apiRequest(`/api/issues/${selectedIssue.id}/comments`);
                if (comments && comments.length > 0) {
                  // Sort comments by date (newest first)
                  const sortedComments = [...comments].sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  );
                  
                  const lastCommentDate = sortedComments[0]?.createdAt;
                  
                  // Update the comments map
                  setIssueCommentsMap(prev => ({
                    ...prev,
                    [selectedIssue.id]: {
                      lastCommentDate,
                      hasUnreadComments: true
                    }
                  }));
                }
              } catch (error) {
                console.error(`Error fetching comments for issue ${selectedIssue.id}:`, error);
              }
            };
            
            fetchComments();
          }}
        />
      )}
    </div>
  );
}