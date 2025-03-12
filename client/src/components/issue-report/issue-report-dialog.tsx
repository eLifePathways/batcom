import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, SendHorizontal, BugIcon } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScreenshotCapture } from "./screenshot-capture";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface IssueReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IssueReportDialog({ open, onOpenChange }: IssueReportDialogProps) {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [consoleLog, setConsoleLog] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      email: "",
    },
  });
  
  // When dialog opens, capture console logs
  useEffect(() => {
    if (open) {
      // Try to get console logs from browser storage (if they've been saved)
      try {
        const logs = localStorage.getItem("consoleErrorLogs");
        if (logs) {
          setConsoleLog(logs);
        }
      } catch (e) {
        // Ignore any errors
      }
    }
  }, [open]);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setScreenshot(null);
      setConsoleLog(null);
    }
  }, [open, form]);
  
  const submitMutation = useMutation({
    mutationFn: async (data: FormValues & { screenshot?: string, consoleLog?: string }) => {
      return apiRequest('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          email: data.email || undefined,
          url: window.location.href,
          screenshot: data.screenshot,
          consoleLog: data.consoleLog,
          userAgent: navigator.userAgent,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Issue reported",
        description: "Thank you for your feedback. Our team will review your report.",
      });
      form.reset();
      setScreenshot(null);
      setConsoleLog(null);
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error submitting issue:", error);
      toast({
        title: "Failed to report issue",
        description: "There was a problem submitting your report. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    submitMutation.mutate({
      ...data,
      screenshot: screenshot || undefined,
      consoleLog: consoleLog || undefined,
    });
  };
  
  const handleScreenshotCapture = (dataUrl: string | null) => {
    setScreenshot(dataUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <BugIcon className="h-5 w-5 mr-2" />
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            Help us improve by reporting any issues you encounter.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Brief description of the issue" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please describe what happened, what you expected, and steps to reproduce..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="Your email if you'd like to be contacted" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Screenshot</h3>
              <ScreenshotCapture onCapture={handleScreenshotCapture} />
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={submitMutation.isPending}
                className="w-full sm:w-auto"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <SendHorizontal className="mr-2 h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}