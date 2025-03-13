import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Trash, ZoomIn } from "lucide-react";
import html2canvas from "html2canvas";

interface ScreenshotCaptureProps {
  onCapture: (dataUrl: string | null) => void;
}

export function ScreenshotCapture({ onCapture }: ScreenshotCaptureProps) {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Use a more efficient approach to notify parent of screenshot changes
  useEffect(() => {
    // Only send actual screenshots, not loading placeholders
    if (!isCapturing || !screenshot) {
      onCapture(screenshot);
    }
  }, [screenshot, onCapture, isCapturing]);

  // Memoized screenshot capture function to prevent unnecessary re-renders
  const captureScreen = useCallback(async () => {
    // Set capturing state
    setIsCapturing(true);
    
    // Don't set any placeholder/thumbnail - just show loading state
    
    // Use requestIdleCallback for non-critical preparation work when browser is idle
    // With fallback to setTimeout for browsers that don't support it
    const scheduleIdleTask = (window.requestIdleCallback || ((cb) => setTimeout(cb, 1)));
    
    scheduleIdleTask(async () => {
      try {
        // Add a class to the body to hide elements we don't want in the screenshot
        document.body.classList.add('screenshot-in-progress');
        
        // Use a Set to track hidden elements for more efficient restoration
        const hiddenElements = new Set<HTMLElement>();
        
        // Define elements to hide and use more specific selectors for better performance
        const selectors = [
          '[role="dialog"]',
          '.issue-report-dialog',
          '#toast-container',
          '#context-menu',
          '.tooltip',
          '.toast-root'
        ];
        
        // Hide elements in a single pass
        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            if (el instanceof HTMLElement && el.style.display !== 'none') {
              hiddenElements.add(el);
              el.style.display = 'none';
            }
          });
        });
        
        // Optimize capture dimensions based on device capabilities
        // Further reduce size on mobile and high-DPI displays
        const isMobile = window.innerWidth < 768;
        const MAX_WIDTH = isMobile ? 960 : 1200;
        const MAX_HEIGHT = isMobile ? 600 : 720;
        
        // Calculate optimal scale factor
        const pixelRatio = window.devicePixelRatio || 1;
        const scale = pixelRatio > 2 ? 0.4 : (pixelRatio > 1 ? 0.5 : 0.6);
        
        const viewportWidth = Math.min(MAX_WIDTH, Math.round(window.innerWidth * scale));
        const viewportHeight = Math.min(MAX_HEIGHT, Math.round(window.innerHeight * scale));
        
        try {
          // Use a limited capture area focused on the viewport for better performance
          const visibleHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
          const visibleWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
          
          // Simple html2canvas options that will work reliably
          const captureOptions = {
            allowTaint: true,
            useCORS: true,
            logging: false,
            ignoreElements: (element: Element) => {
              // Skip dialog elements to avoid capturing the bug report form itself
              if (element.nodeName === 'DIALOG' || 
                  element.getAttribute('role') === 'dialog' ||
                  element.id === 'toast-container') {
                return true;
              }
              
              // Skip the issue report dialog itself
              if (element.className && 
                 typeof element.className === 'string' && 
                 element.className.includes('issue-report')) {
                return true;
              }
              
              return false;
            }
          };
          
          // Capture just the main content, not the entire page
          // This avoids capturing the bug report dialog itself
          const mainElement = document.querySelector('main') || document.body;
          const contentCanvas = await html2canvas(mainElement, captureOptions);
          
          // Use png for better quality
          const dataUrl = contentCanvas.toDataURL('image/png');
          setScreenshot(dataUrl);
        } catch (renderError) {
          console.error('Screenshot rendering error:', renderError);
          
          // Create a simple fallback
          const canvas = document.createElement('canvas');
          canvas.width = viewportWidth;
          canvas.height = viewportHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Draw a simple fallback with essential info
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, viewportWidth, viewportHeight);
            
            ctx.fillStyle = '#000000';
            ctx.font = '14px system-ui, sans-serif';
            ctx.fillText(`URL: ${window.location.pathname}`, 10, 20);
            ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 10, 40);
            ctx.fillText(`Time: ${new Date().toLocaleTimeString()}`, 10, 60);
            ctx.fillStyle = '#FF0000';
            ctx.fillText('Screenshot capture failed - sending basic info only', 10, 90);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            setScreenshot(dataUrl);
          }
        }
      } catch (error) {
        console.error('Error in screenshot process:', error);
        setScreenshot(null);
      } finally {
        // Cleanup - restore hidden elements
        document.body.classList.remove('screenshot-in-progress');
        
        // Use requestAnimationFrame to restore hidden elements on next paint
        requestAnimationFrame(() => {
          try {
            // Restore all hidden elements
            document.querySelectorAll('[style*="display: none"]').forEach(el => {
              if (el instanceof HTMLElement) {
                const computedStyle = getComputedStyle(el);
                // Only restore elements we've hidden, not ones that should be hidden
                if (computedStyle.display === 'none' && el.getAttribute('data-original-display') !== 'none') {
                  el.style.display = '';
                }
              }
            });
            
            // Final cleanup
            setIsCapturing(false);
          } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
            setIsCapturing(false);
          }
        });
      }
    });
  }, [onCapture]);

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