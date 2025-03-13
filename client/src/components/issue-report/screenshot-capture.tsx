import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Trash, ZoomIn } from "lucide-react";
import html2canvas from "html2canvas";

interface ScreenshotCaptureProps {
  onCapture: (dataUrl: string | null) => void;
}

// Create a tiny pixel thumbnail for preview while full screenshot is loading
const createThumbnail = (width: number = 20, height: number = 15): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Sample colors from visible viewport
  const bgColor = getComputedStyle(document.body).backgroundColor || '#ffffff';
  const textColor = getComputedStyle(document.body).color || '#000000';
  
  // Draw a super simple representation
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Add a few placeholder blocks to represent content
  ctx.fillStyle = textColor;
  ctx.globalAlpha = 0.2;
  ctx.fillRect(0, 0, width, 3);  // header
  ctx.fillRect(0, 5, width * 0.7, 1);  // text line
  ctx.fillRect(0, 7, width * 0.8, 1);  // text line
  ctx.fillRect(0, 9, width * 0.5, 4);  // image/box
  
  return canvas.toDataURL('image/png', 0.5);
};

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
    
    // Show loading thumbnail immediately for better UX
    const thumbnailPreview = createThumbnail();
    setScreenshot(thumbnailPreview);
    
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
          
          // Optimized html2canvas options
          const captureOptions = {
            width: viewportWidth,
            height: viewportHeight,
            x: window.scrollX,
            y: window.scrollY,
            allowTaint: true,
            useCORS: false, // Avoid CORS for better performance
            backgroundColor: getComputedStyle(document.body).backgroundColor || '#FFFFFF',
            logging: false,
            scale: 1.0, // Already scaled by our custom logic
            removeContainer: true,
            foreignObjectRendering: false,
            imageTimeout: 1500, // Reduced timeout for better performance
            ignoreElements: (element: Element) => {
              // Quick element filtering
              const nodeName = element.nodeName.toUpperCase();
              
              // Skip non-visual elements
              if (nodeName === 'SCRIPT' || 
                  nodeName === 'STYLE' || 
                  nodeName === 'META' || 
                  nodeName === 'LINK' ||
                  nodeName === 'NOSCRIPT') {
                return true;
              }
              
              // Check for hidden elements or offscreen elements
              if (element instanceof HTMLElement) {
                // Skip already hidden elements
                if (element.style.display === 'none' || 
                    element.style.visibility === 'hidden' ||
                    element.style.opacity === '0') {
                  return true;
                }
                
                // Skip elements with certain class names
                const className = element.className;
                if (className && typeof className === 'string' && 
                    (className.includes('hidden') || 
                     className.includes('issue-report') || 
                     className.includes('toast'))) {
                  return true;
                }
              }
              
              return false;
            }
          };
          
          // Execute the capture with our optimized settings
          const contentCanvas = await html2canvas(document.body, captureOptions);
          
          // Use jpeg for better compression with reasonable quality
          const dataUrl = contentCanvas.toDataURL('image/jpeg', 0.7);
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