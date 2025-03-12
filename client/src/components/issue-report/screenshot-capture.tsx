import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Trash, ZoomIn } from "lucide-react";
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
      // Store window scroll position
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      
      // Temporarily hide the report dialog to prevent it from showing in the screenshot
      let dialogElement = document.querySelector('[role="dialog"]');
      let originalStyles: string | null = null;
      
      if (dialogElement) {
        // Save original styles
        originalStyles = dialogElement.getAttribute('style');
        
        // Hide dialog without changing its DOM position - use opacity instead of visibility
        // This prevents the dialog from closing when taking a screenshot
        dialogElement.setAttribute('data-screenshot-temp', 'true');
        dialogElement.setAttribute('style', 'opacity: 0; pointer-events: none;');
      }
      
      // Wait a small delay for the UI to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Capture the screen
      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        logging: false,
        scale: window.devicePixelRatio,
      });
      
      // Restore scroll position if needed
      window.scrollTo(scrollX, scrollY);
      
      // Restore dialog visibility
      if (dialogElement) {
        dialogElement.removeAttribute('data-screenshot-temp');
        
        if (originalStyles) {
          dialogElement.setAttribute('style', originalStyles);
        } else {
          dialogElement.removeAttribute('style');
        }
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
            <div className="max-h-[180px] overflow-hidden relative">
              <img 
                src={screenshot} 
                alt="Page screenshot" 
                className="w-full h-auto object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100/70 pointer-events-none"></div>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 border-t">
              <a 
                href={screenshot}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary flex items-center hover:underline"
              >
                <ZoomIn className="h-3 w-3 mr-1" />
                View full image
              </a>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 px-2 py-0"
                onClick={clearScreenshot}
              >
                <Trash className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              type="button" 
              onClick={captureScreen}
              disabled={isCapturing}
              size="sm"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isCapturing ? 'animate-spin' : ''}`} />
              {isCapturing ? 'Capturing...' : 'Re-capture'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 p-4 border rounded-md bg-gray-50">
          <Camera className="h-6 w-6 text-gray-400" />
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">
              Include a screenshot with your report
            </p>
            <Button 
              type="button" 
              onClick={captureScreen}
              disabled={isCapturing}
              size="sm"
              className="min-w-[100px]"
            >
              {isCapturing ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Capturing...
                </>
              ) : (
                <>
                  <Camera className="h-3 w-3 mr-1" />
                  Capture Screen
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}