import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BugIcon } from "lucide-react";
import { IssueReportDialog } from "./issue-report-dialog";

export const BugReportButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-md bg-background hover:bg-accent p-3 h-auto w-auto"
        onClick={() => setDialogOpen(true)}
        title="Report an issue"
      >
        <BugIcon className="h-5 w-5" />
        <span className="sr-only">Report an issue</span>
      </Button>
      
      <IssueReportDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};