import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Trash } from "lucide-react";
import html2canvas from "html2canvas";

interface ScreenshotCaptureProps {
  onCapture: (dataUrl: string | null) => void;
}

export function ScreenshotCapture({ onCapture }: ScreenshotCaptureProps) {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Send screenshot to parent when it changes
  useEffect(() => {
    onCapture(screenshot);
  }, [screenshot, onCapture]);

  const captureScreen = async () => {
    setIsCapturing(true);
    
    try {
      // Temporarily hide the report dialog to prevent it from showing in the screenshot
      const dialogElement = document.querySelector('[role="dialog"]');
      
      if (dialogElement) {
        dialogElement.setAttribute('data-screenshot-temp', 'hidden');
        dialogElement.setAttribute('style', 'visibility: hidden;');
      }
      
      // Wait a small delay for the UI to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture the screen
      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        logging: false,
        scale: window.devicePixelRatio,
      });
      
      // Restore dialog visibility
      if (dialogElement) {
        dialogElement.removeAttribute('data-screenshot-temp');
        dialogElement.removeAttribute('style');
      }
      
      // Convert to dataURL and save
      const dataUrl = canvas.toDataURL('image/png');
      setScreenshot(dataUrl);
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const clearScreenshot = () => {
    setScreenshot(null);
  };

  return (
    <div className="space-y-4">
      {screenshot ? (
        <div className="space-y-3">
          <div className="relative border rounded-md overflow-hidden bg-gray-50">
            <img 
              src={screenshot} 
              alt="Page screenshot" 
              className="w-full h-auto object-contain"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-90"
              onClick={clearScreenshot}
            >
              <Trash className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              type="button" 
              onClick={captureScreen}
              disabled={isCapturing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isCapturing ? 'animate-spin' : ''}`} />
              {isCapturing ? 'Capturing...' : 'Re-capture'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 p-6 border rounded-md bg-gray-50">
          <Camera className="h-8 w-8 text-gray-400" />
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Take a screenshot of the current page
            </p>
            <Button 
              type="button" 
              onClick={captureScreen}
              disabled={isCapturing}
              className="min-w-[120px]"
            >
              {isCapturing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Capturing...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}