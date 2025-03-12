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
import { Loader2, Send, AlertCircle, Code, Screenshot, UserRound, Link2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  comment: string;
  createdAt: string;
  author: string;
  isInternal: boolean;
};

interface IssueDetailDialogProps {
  issue: Issue;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const commentSchema = z.object({
  comment: z.string().min(1, { message: "Comment cannot be empty" }),
  isInternal: z.boolean().default(true),
});

type CommentFormValues = z.infer<typeof commentSchema>;

export function IssueDetailDialog({ issue, open, onOpenChange }: IssueDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['/api/issues', issue.id, 'comments'],
    queryFn: () => apiRequest(`/api/issues/${issue.id}/comments`),
    enabled: open,
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
          ...data,
          issueId: issue.id,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/issues', issue.id, 'comments'] });
      form.reset();
      toast({ title: "Comment added" });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{issue.title}</DialogTitle>
          <div className="flex gap-2 mt-2">
            {getStatusBadge(issue.status)}
            {getPriorityBadge(issue.priority)}
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">Issue Details</TabsTrigger>
            <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
            <TabsTrigger value="console">Console Log</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{issue.description}</p>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Link2 className="h-4 w-4 mr-2" />
                    URL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm break-all">{issue.url}</p>
                </CardContent>
              </Card>
              
              {issue.email && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <UserRound className="h-4 w-4 mr-2" />
                      Contact Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{issue.email}</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">User Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-mono break-all">{issue.userAgent}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Timing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Submitted</p>
                  <p className="text-sm text-muted-foreground" title={formatDate(issue.submittedAt).full}>
                    {formatDate(issue.submittedAt).relative}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground" title={formatDate(issue.updatedAt).full}>
                    {formatDate(issue.updatedAt).relative}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="screenshot">
            {issue.screenshot ? (
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={issue.screenshot} 
                  alt="Issue screenshot" 
                  className="w-full h-auto object-contain" 
                />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Screenshot className="h-5 w-5 mr-2" />
                    No Screenshot Available
                  </CardTitle>
                  <CardDescription>
                    The user did not provide a screenshot with this issue report.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="console">
            {issue.consoleLog ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Code className="h-4 w-4 mr-2" />
                    Console Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                    {issue.consoleLog.split("\\n").join("\n")}
                  </pre>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    No Console Logs Available
                  </CardTitle>
                  <CardDescription>
                    No console logs were captured with this issue report.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Comments</h3>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto p-1">
            {isLoadingComments ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : comments && comments.length > 0 ? (
              comments.map((comment: IssueComment) => (
                <Card key={comment.id} className={comment.isInternal ? "border-blue-200" : ""}>
                  <CardHeader className="pb-2 pt-3 px-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <p className="text-sm font-medium">{comment.author || "Admin"}</p>
                        {comment.isInternal && (
                          <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Internal
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground" title={formatDate(comment.createdAt).full}>
                        {formatDate(comment.createdAt).relative}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-3">
                    <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <AlertCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No comments yet</p>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Add Comment</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add a comment about this issue..." 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
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
                          className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                      </FormControl>
                      <label className="text-sm font-medium leading-none cursor-pointer">
                        Internal comment (only visible to administrators)
                      </label>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={addCommentMutation.isPending}
                    className="flex items-center"
                  >
                    {addCommentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}