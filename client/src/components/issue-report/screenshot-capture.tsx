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

  // Completely new approach for screenshot capture
  const captureScreen = async () => {
    setIsCapturing(true);
    
    try {
      // Add a class to the body to hide elements we don't want in the screenshot
      document.body.classList.add('screenshot-in-progress');
      
      // Hide the dialog directly
      let dialogElement = document.querySelector('[role="dialog"]');
      if (dialogElement) {
        (dialogElement as HTMLElement).style.display = 'none';
      }
      
      // Wait for UI updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create a simple canvas with the current viewport size
      const viewportWidth = Math.min(1280, window.innerWidth);
      const viewportHeight = Math.min(800, window.innerHeight);
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = viewportWidth;
      canvas.height = viewportHeight;
      
      // Get the 2D context
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Draw a white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, viewportWidth, viewportHeight);
      
      // Draw text info (fallback in case rendering fails)
      ctx.fillStyle = '#000000';
      ctx.font = '14px Arial';
      ctx.fillText(`Captured: ${window.location.href}`, 10, 20);
      ctx.fillText(`Time: ${new Date().toLocaleString()}`, 10, 40);
      
      try {
        // Simple approach - just draw what's visible in the viewport
        const simplifiedOptions = {
          width: viewportWidth,
          height: viewportHeight,
          x: window.scrollX,
          y: window.scrollY,
          allowTaint: true,
          useCORS: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          scale: 1,
          ignoreElements: (element: Element) => {
            return element.tagName === 'DIALOG' || 
                   element.hasAttribute('role') && element.getAttribute('role') === 'dialog';
          }
        };
        
        // Capture the content
        const contentCanvas = await html2canvas(document.documentElement, simplifiedOptions);
        
        // Draw the captured content onto our canvas
        ctx.drawImage(contentCanvas, 0, 0);
      } catch (renderError) {
        console.error('Rendering error:', renderError);
        // If html2canvas fails, at least we have the fallback text
        ctx.fillStyle = '#FF0000';
        ctx.fillText('Failed to render page content. Basic info provided instead.', 10, 70);
      }
      
      // Add a border to the image
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, viewportWidth, viewportHeight);
      
      // Get the image as data URL (PNG for better quality)
      const dataUrl = canvas.toDataURL('image/png');
      setScreenshot(dataUrl);
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    } finally {
      // Clean up
      document.body.classList.remove('screenshot-in-progress');
      
      // Restore any hidden elements
      let dialogElement = document.querySelector('[role="dialog"]');
      if (dialogElement) {
        (dialogElement as HTMLElement).style.display = '';
      }
      
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
            <div className="max-h-[240px] overflow-auto relative bg-white border-b">
              <img 
                src={screenshot} 
                alt="Page screenshot" 
                className="w-full h-auto object-contain"
                style={{ imageRendering: 'auto' }}
              />
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