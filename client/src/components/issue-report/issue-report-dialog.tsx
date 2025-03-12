import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ScreenshotCapture } from "./screenshot-capture";

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional().or(z.literal("")),
  url: z.string(),
  screenshot: z.string().optional(),
  consoleLog: z.string().optional(),
  userAgent: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface IssueReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IssueReportDialog({ open, onOpenChange }: IssueReportDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [consoleLogData, setConsoleLogData] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      email: "",
      url: window.location.href,
      screenshot: "",
      consoleLog: "",
      userAgent: navigator.userAgent,
    },
  });

  // Update screenshot data in form when it changes
  useEffect(() => {
    if (screenshotData) {
      form.setValue("screenshot", screenshotData);
    }
  }, [screenshotData, form]);

  // Capture console logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const logs: string[] = [];

    const captureLog = (...args: any[]) => {
      logs.push(`[LOG] ${args.map(arg => JSON.stringify(arg)).join(' ')}`);
      originalConsoleLog(...args);
    };

    const captureError = (...args: any[]) => {
      logs.push(`[ERROR] ${args.map(arg => JSON.stringify(arg)).join(' ')}`);
      originalConsoleError(...args);
    };

    const captureWarn = (...args: any[]) => {
      logs.push(`[WARN] ${args.map(arg => JSON.stringify(arg)).join(' ')}`);
      originalConsoleWarn(...args);
    };

    console.log = captureLog;
    console.error = captureError;
    console.warn = captureWarn;

    // Update console logs in form when dialog is opened
    if (open) {
      const logData = logs.slice(-100).join("\\n"); // Keep last 100 logs
      setConsoleLogData(logData);
      form.setValue("consoleLog", logData);
    }

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, [open, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      setIsSuccess(true);
      toast({
        title: "Bug report submitted",
        description: "Thank you for your feedback! We'll look into this issue.",
      });
      
      // Reset form and close dialog after a short delay
      setTimeout(() => {
        form.reset();
        setIsSuccess(false);
        setScreenshotData(null);
        setConsoleLogData(null);
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting bug report:", error);
      toast({
        title: "Error",
        description: "Failed to submit bug report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>
            Help us improve by reporting any bugs or issues you encounter.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of the issue" {...field} />
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
                  <FormLabel>Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please describe what happened and what you expected to happen" 
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
                      placeholder="Your email if you'd like us to follow up" 
                      type="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <ScreenshotCapture onCapture={setScreenshotData} />
            
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || isSuccess}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isSuccess}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Submitted
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}