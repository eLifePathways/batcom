import { useState } from "react";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IssueReportDialog } from "./issue-report-dialog";

export const BugReportButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="default"
        size="icon"
        className="fixed right-4 bottom-4 rounded-full shadow-lg z-50 bg-red-600 hover:bg-red-700"
        onClick={() => setIsOpen(true)}
        title="Report a bug"
      >
        <Bug className="h-5 w-5" />
      </Button>
      
      <IssueReportDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};