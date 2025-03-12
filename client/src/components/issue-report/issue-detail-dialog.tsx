import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Send, AlertCircle, Code, Image as ImageIcon, UserRound, 
  Link2, ChevronDown, ChevronUp, CheckCircle2, Clock, AlertTriangle, 
  XCircle, Flag
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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

type IssueComment = {
  id: number;
  issueId: number;
  content?: string;
  comment?: string; // For backward compatibility
  createdAt: string;
  author?: string;
  isInternal?: boolean;
  userId?: number | null;
};

interface IssueDetailDialogProps {
  issue: Issue;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommentAdded?: () => void;
}

const commentSchema = z.object({
  comment: z.string().min(1, { message: "Comment cannot be empty" }),
  isInternal: z.boolean().default(true),
});

type CommentFormValues = z.infer<typeof commentSchema>;

export function IssueDetailDialog({ issue, open, onOpenChange, onCommentAdded }: IssueDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [localIssue, setLocalIssue] = useState<Issue>(issue);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Update local issue when the prop changes
  useEffect(() => {
    setLocalIssue(issue);
  }, [issue]);
  
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['/api/issues', issue.id, 'comments'],
    queryFn: () => apiRequest(`/api/issues/${issue.id}/comments`),
    enabled: open,
  });
  
  // Mutation for updating issue status and priority
  const updateIssueMutation = useMutation({
    mutationFn: async (data: Partial<Issue>) => {
      return apiRequest(`/api/issues/${issue.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/issues'] });
      setLocalIssue(prev => ({ ...prev, ...data }));
      toast({ title: "Issue updated successfully" });
    },
    onError: (error) => {
      console.error("Error updating issue:", error);
      toast({ 
        title: "Failed to update issue", 
        variant: "destructive" 
      });
    }
  });
  
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      comment: "",
      isInternal: true,
    },
  });
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);
  
  const addCommentMutation = useMutation({
    mutationFn: async (data: CommentFormValues) => {
      return apiRequest(`/api/issues/${issue.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: data.comment,
          content: data.comment, // Support both field names for compatibility
          isInternal: data.isInternal,
          author: "Admin", // Add author explicitly
          issueId: issue.id,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/issues', issue.id, 'comments'] });
      form.reset();
      toast({ title: "Comment added" });
      
      // Notify parent component about the new comment
      if (onCommentAdded) {
        onCommentAdded();
      }
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
      toast({ 
        title: "Failed to add comment", 
        variant: "destructive" 
      });
    }
  });
  
  const onSubmit = (data: CommentFormValues) => {
    addCommentMutation.mutate(data);
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        relative: formatDistanceToNow(date, { addSuffix: true }),
        full: format(date, "MMM d, yyyy h:mm a"),
      };
    } catch (error) {
      return {
        relative: "Invalid date",
        full: "Invalid date",
      };
    }
  };
  
  const getPriorityBadge = (priority: Issue['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High Priority</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low Priority</Badge>;
      default:
        return <Badge variant="outline">Unknown Priority</Badge>;
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
        return <Badge variant="outline">Unknown Status</Badge>;
    }
  };

  // Initialize comments as expanded by default
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  
  // When comments load, set all to expanded by default
  useEffect(() => {
    if (comments && comments.length > 0) {
      const initialExpanded = comments.reduce((acc: Record<number, boolean>, comment: IssueComment) => {
        acc[comment.id] = true; // Default to expanded
        return acc;
      }, {} as Record<number, boolean>);
      
      setExpandedComments(initialExpanded);
    }
  }, [comments]);

  // Toggle comment expansion
  const toggleComment = (commentId: number) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[1200px] h-[95vh] max-h-[95vh] flex flex-col p-4">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{issue.title}</DialogTitle>
            <div className="flex gap-2 items-center">
              {/* Status Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer">
                    {getStatusBadge(localIssue.status)}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => updateIssueMutation.mutate({ status: 'open' })}
                    className="flex items-center"
                  >
                    <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                    <span>Open</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updateIssueMutation.mutate({ status: 'in_progress' })}
                    className="flex items-center"
                  >
                    <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                    <span>In Progress</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updateIssueMutation.mutate({ status: 'resolved' })}
                    className="flex items-center"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                    <span>Resolved</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updateIssueMutation.mutate({ status: 'closed' })}
                    className="flex items-center"
                  >
                    <XCircle className="h-4 w-4 mr-2 text-gray-600" />
                    <span>Closed</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Priority Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer">
                    {getPriorityBadge(localIssue.priority)}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem 
                    onClick={() => updateIssueMutation.mutate({ priority: 'high' })}
                    className="flex items-center"
                  >
                    <Flag className="h-4 w-4 mr-2 text-red-600" />
                    <span>High Priority</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updateIssueMutation.mutate({ priority: 'medium' })}
                    className="flex items-center"
                  >
                    <Flag className="h-4 w-4 mr-2 text-orange-600" />
                    <span>Medium Priority</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => updateIssueMutation.mutate({ priority: 'low' })}
                    className="flex items-center"
                  >
                    <Flag className="h-4 w-4 mr-2 text-green-600" />
                    <span>Low Priority</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Loading indicator */}
              {updateIssueMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin text-primary ml-1" />
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-2 -mr-2">
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="mb-3">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="details">Issue Details</TabsTrigger>
              <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
              <TabsTrigger value="console">Console Log</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-2 mt-3">
              {/* Compact details grid */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="col-span-2">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm">Description</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-3">
                    <p className="whitespace-pre-wrap text-sm">{issue.description}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm flex items-center">
                      <Link2 className="h-3 w-3 mr-1" />
                      URL
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-3">
                    <p className="text-xs break-all">{issue.url}</p>
                  </CardContent>
                </Card>
                
                {issue.email ? (
                  <Card>
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm flex items-center">
                        <UserRound className="h-3 w-3 mr-1" />
                        Contact Email
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-3">
                      <p className="text-xs">{issue.email}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm">Timing</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-3 flex justify-between">
                      <div>
                        <p className="text-xs font-medium">Submitted</p>
                        <p className="text-xs text-muted-foreground" title={formatDate(issue.submittedAt).full}>
                          {formatDate(issue.submittedAt).relative}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium">Updated</p>
                        <p className="text-xs text-muted-foreground" title={formatDate(issue.updatedAt).full}>
                          {formatDate(issue.updatedAt).relative}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Card className="col-span-2">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm">User Agent</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-3">
                    <p className="text-xs font-mono break-all">{issue.userAgent}</p>
                  </CardContent>
                </Card>
                
                {issue.email && (
                  <Card className="col-span-2">
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm">Timing</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-3 flex justify-between">
                      <div>
                        <p className="text-xs font-medium">Submitted</p>
                        <p className="text-xs text-muted-foreground" title={formatDate(issue.submittedAt).full}>
                          {formatDate(issue.submittedAt).relative}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium">Updated</p>
                        <p className="text-xs text-muted-foreground" title={formatDate(issue.updatedAt).full}>
                          {formatDate(issue.updatedAt).relative}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="screenshot" className="mt-3">
              {issue.screenshot ? (
                <Card>
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm flex items-center">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Screenshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-1 pb-3 px-3">
                    <div className="relative h-[300px] mb-3 border rounded overflow-hidden">
                      <img 
                        src={issue.screenshot} 
                        alt="Screenshot" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <Button variant="outline" asChild size="sm" className="w-full">
                      <a href={issue.screenshot} target="_blank" rel="noopener noreferrer">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        View Full Size in New Tab
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm flex items-center">
                      <ImageIcon className="h-4 w-4 mr-1" />
                      No Screenshot Available
                    </CardTitle>
                    <CardDescription className="text-xs">
                      The user did not provide a screenshot with this issue report.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="console" className="mt-3">
              {issue.consoleLog ? (
                <Card>
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm flex items-center">
                      <Code className="h-3 w-3 mr-1" />
                      Console Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-xs max-h-[400px] whitespace-pre-wrap">
                      {issue.consoleLog.split("\\n").join("\n")}
                    </pre>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm flex items-center">
                      <Code className="h-4 w-4 mr-1" />
                      No Console Logs Available
                    </CardTitle>
                    <CardDescription className="text-xs">
                      No console logs were captured with this issue report.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>
          </Tabs>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-medium">Comments</h3>
              <div className="text-xs text-muted-foreground">
                {comments?.length || 0} comment{comments?.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="space-y-2">
              {isLoadingComments ? (
                <div className="flex justify-center p-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment: IssueComment) => (
                  <Collapsible
                    key={comment.id}
                    open={expandedComments[comment.id]}
                    onOpenChange={() => toggleComment(comment.id)}
                    className={comment.isInternal ? "border rounded border-blue-200" : "border rounded"}
                  >
                    <CollapsibleTrigger asChild>
                      <div 
                        role="button" 
                        className="flex justify-between items-center p-2 hover:bg-gray-50 cursor-pointer rounded-t"
                      >
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-medium">{comment.author || "Admin"}</p>
                          {comment.isInternal && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1 h-4 bg-blue-50 text-blue-700 border-blue-200">
                              Internal
                            </Badge>
                          )}
                          <p className="text-[10px] text-muted-foreground" title={formatDate(comment.createdAt).full}>
                            {formatDate(comment.createdAt).relative}
                          </p>
                        </div>
                        {expandedComments[comment.id] ? (
                          <ChevronUp className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-2 pb-2">
                        <p className="text-xs whitespace-pre-wrap">
                          {comment.content || comment.comment}
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))
              ) : (
                <div className="bg-gray-50 rounded p-2 text-center">
                  <AlertCircle className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">No comments yet</p>
                </div>
              )}
            </div>
            
            <div className="mt-3">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Add Comment</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add a comment about this issue..." 
                            className="min-h-[60px] text-sm"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between items-center">
                    <FormField
                      control={form.control}
                      name="isInternal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-3 w-3 text-primary rounded border-gray-300 focus:ring-primary"
                            />
                          </FormControl>
                          <label className="text-xs font-medium leading-none cursor-pointer">
                            Internal only
                          </label>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={addCommentMutation.isPending}
                      className="flex items-center"
                    >
                      {addCommentMutation.isPending ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-1 h-3 w-3" />
                          Post Comment
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}