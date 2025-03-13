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

  // Highly optimized screenshot capture with lazy loading
  const captureScreen = async () => {
    setIsCapturing(true);
    
    try {
      // Add a class to the body to hide elements we don't want in the screenshot
      document.body.classList.add('screenshot-in-progress');
      
      // Find the elements to hide once and cache them
      const dialogElements = document.querySelectorAll('[role="dialog"]');
      const issueDialogs = document.querySelectorAll('.issue-report-dialog');
      
      // Hide all dialog elements
      dialogElements.forEach(el => {
        if (el instanceof HTMLElement) el.style.display = 'none';
      });
      
      issueDialogs.forEach(el => {
        if (el instanceof HTMLElement) el.style.display = 'none';
      });
      
      // Skip timeout to improve performance - we can hide elements synchronously
      
      // Downscale viewport dimensions for faster capture
      // Use more aggressive size limits to improve performance
      const MAX_WIDTH = 1280;
      const MAX_HEIGHT = 800;
      const scale = window.devicePixelRatio > 1 ? 0.5 : 0.75; // Use lower scale on high-DPI displays
      const viewportWidth = Math.min(MAX_WIDTH, Math.round(window.innerWidth * scale));
      const viewportHeight = Math.min(MAX_HEIGHT, Math.round(window.innerHeight * scale));
      
      try {
        // Optimized html2canvas options for maximum performance
        const optimizedOptions = {
          width: viewportWidth,
          height: viewportHeight,
          x: window.scrollX,
          y: window.scrollY,
          allowTaint: true,
          useCORS: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          scale: 1.0, // Already scaled by our custom logic
          removeContainer: true, // Clean up temporary elements
          foreignObjectRendering: false, // Faster rendering option
          imageTimeout: 2000, // Limit image processing time
          ignoreElements: (element: Element) => {
            // Fast element checking
            if (element.nodeName === 'SCRIPT' || element.nodeName === 'STYLE') return true;
            
            // Check for dialog elements with simple attributes
            const tagName = element.tagName;
            const className = element.className && typeof element.className === 'string' ? element.className : '';
            const role = element.getAttribute && element.getAttribute('role');
            
            return tagName === 'DIALOG' || 
                  role === 'dialog' || 
                  className.includes('issue-report') ||
                  element.id === 'toast-container' ||
                  element.id === 'context-menu';
          }
        };
        
        // Capture the content
        const contentCanvas = await html2canvas(document.body, optimizedOptions);
        
        // Get the image as data URL with reduced quality (0.8) to save memory
        const dataUrl = contentCanvas.toDataURL('image/jpeg', 0.8);
        setScreenshot(dataUrl);
      } catch (renderError) {
        console.error('Rendering error:', renderError);
        
        // Create a lightweight fallback canvas if html2canvas fails
        const canvas = document.createElement('canvas');
        canvas.width = viewportWidth;
        canvas.height = viewportHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw a simple fallback with minimal info
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, viewportWidth, viewportHeight);
          
          ctx.fillStyle = '#000000';
          ctx.font = '14px Arial';
          ctx.fillText(`URL: ${window.location.pathname}`, 10, 20);
          ctx.fillText(`Time: ${new Date().toLocaleTimeString()}`, 10, 40);
          ctx.fillStyle = '#FF0000';
          ctx.fillText('Screenshot failed - sending basic info only', 10, 70);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setScreenshot(dataUrl);
        }
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    } finally {
      // Clean up - ensure we always remove the class even if there's an error
      document.body.classList.remove('screenshot-in-progress');
      
      // Restore all hidden elements
      const dialogElements = document.querySelectorAll('[role="dialog"]');
      const issueDialogs = document.querySelectorAll('.issue-report-dialog');
      
      dialogElements.forEach(el => {
        if (el instanceof HTMLElement) el.style.display = '';
      });
      
      issueDialogs.forEach(el => {
        if (el instanceof HTMLElement) el.style.display = '';
      });
      
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
          <div className="relative border rounded-md overflow-hidden">
            <div className="max-h-[350px] overflow-auto relative">
              <img 
                src={screenshot} 
                alt="Page screenshot" 
                className="w-full h-auto object-contain"
                style={{ imageRendering: 'auto' }}
              />
            </div>
            <div className="flex justify-between items-center p-2 border-t">
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