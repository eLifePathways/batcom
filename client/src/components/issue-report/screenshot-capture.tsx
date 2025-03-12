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
      
      // IMPROVED APPROACH: Use more compatible settings for html2canvas
      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        logging: false,
        scale: window.devicePixelRatio > 1 ? 1 : window.devicePixelRatio, // Better for different displays
        backgroundColor: '#ffffff', // Use explicit white background
        foreignObjectRendering: false,
        imageTimeout: 0,
        removeContainer: true, // Clean up temporary elements
        onclone: (documentClone) => {
          // Fix potential styling issues in the cloned document
          const styleSheets = Array.from(document.styleSheets);
          styleSheets.forEach(styleSheet => {
            try {
              const rules = Array.from(styleSheet.cssRules || []);
              const styleElement = documentClone.createElement('style');
              styleElement.type = 'text/css';
              rules.forEach(rule => {
                styleElement.appendChild(documentClone.createTextNode(rule.cssText));
              });
              documentClone.head.appendChild(styleElement);
            } catch (e) {
              console.warn('Could not access rules from stylesheet', e);
            }
          });
        },
        ignoreElements: (element) => {
          // Ignore dialog elements in the screenshot
          return element.hasAttribute('data-screenshot-temp');
        }
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
      
      // Use a smaller maximum size to reduce file size
      const MAX_WIDTH = 1280;
      const MAX_HEIGHT = 960;
      
      let width = canvas.width;
      let height = canvas.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > MAX_WIDTH) {
        const ratio = MAX_WIDTH / width;
        width = MAX_WIDTH;
        height = Math.round(height * ratio);
      }
      
      if (height > MAX_HEIGHT) {
        const ratio = MAX_HEIGHT / height;
        height = MAX_HEIGHT;
        width = Math.round(width * ratio);
      }
      
      // Create a new canvas for the resized image
      const resizedCanvas = document.createElement('canvas');
      resizedCanvas.width = width;
      resizedCanvas.height = height;
      
      // Get context and draw with vibrant colors
      const ctx = resizedCanvas.getContext('2d');
      if (ctx) {
        // Make sure we're drawing at high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Fill with white background first
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // Draw the captured image on top
        ctx.drawImage(canvas, 0, 0, width, height);
        
        // Add a subtle border to ensure visibility
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, width, height);
      }
      
      // Convert to PNG for better quality
      const dataUrl = resizedCanvas.toDataURL('image/png');
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