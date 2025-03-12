import { useState } from "react";
import { Camera, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";

interface ScreenshotCaptureProps {
  onCapture: (dataUrl: string | null) => void;
}

export function ScreenshotCapture({ onCapture }: ScreenshotCaptureProps) {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = async () => {
    setIsCapturing(true);
    
    try {
      // Wait for a short delay to allow the UI to update (hiding the capture button)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        scale: 0.5, // Reduce resolution to keep file size manageable
      });
      
      const dataUrl = canvas.toDataURL("image/png");
      setScreenshot(dataUrl);
      onCapture(dataUrl);
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    } finally {
      setIsCapturing(false);
    }
  };
  
  const clearScreenshot = () => {
    setScreenshot(null);
    onCapture(null);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Screenshot</p>
      
      {screenshot ? (
        <div className="relative">
          <img 
            src={screenshot} 
            alt="Screenshot" 
            className="max-h-[200px] w-full object-contain border rounded-md bg-gray-50" 
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={clearScreenshot}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={captureScreenshot}
          disabled={isCapturing}
          className="w-full flex items-center justify-center gap-2 h-[100px] border-dashed"
        >
          {isCapturing ? (
            <span>Capturing...</span>
          ) : (
            <>
              <Camera className="h-5 w-5 mr-1" />
              Capture Screenshot
            </>
          )}
        </Button>
      )}
      
      <p className="text-xs text-gray-500">
        {screenshot 
          ? "Screenshot attached. Click the X to remove it." 
          : "Click to capture the current page (the capture button will be hidden in the screenshot)."}
      </p>
    </div>
  );
}