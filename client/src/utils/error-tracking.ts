/**
 * Optimized utility for capturing and tracking JavaScript errors
 */

const ERROR_STORAGE_KEY = 'consoleErrorLogs';
const MAX_STORED_LOGS = 20; 
const THROTTLE_TIME = 1000; // Limit storage frequency to reduce performance impact

// Throttling variables
let lastErrorTime = 0;
let errorQueue: string[] = [];
let throttleTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Initialize error tracking for the application with performance optimizations
 */
export function initErrorTracking() {
  // Initialize in an async manner to not block page load
  setTimeout(() => {
    setupErrorHandlers();
    console.log("Error tracking initialized");
  }, 100);
}

// Setup error handlers in a separate function to improve code organization
function setupErrorHandlers() {
  // Store the original console error function
  const originalConsoleError = console.error;
  
  // Override console.error to capture errors with throttling
  console.error = function(...args) {
    // Call the original console.error
    originalConsoleError.apply(console, args);
    
    try {
      // Format the error message more efficiently
      let errorMessage = '';
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg instanceof Error) {
          errorMessage += `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
        } else if (typeof arg === 'object') {
          try {
            errorMessage += JSON.stringify(arg);
          } catch {
            errorMessage += '[Object]';
          }
        } else {
          errorMessage += String(arg);
        }
        
        if (i < args.length - 1) {
          errorMessage += ' ';
        }
      }
      
      // Add error to queue with timestamp
      const timestamp = new Date().toISOString();
      queueErrorLog(`[${timestamp}] Console Error: ${errorMessage}`);
    } catch (e) {
      // If there's an error in our error handling, log it but don't break anything
      originalConsoleError.call(console, 'Error capturing console.error:', e);
    }
  };
  
  // Capture uncaught errors, optimized for performance
  window.onerror = function(message, source, lineno, colno, error) {
    // Create a more compact error info string
    const timestamp = new Date().toISOString();
    const errorSource = source ? `\nSource: ${source.split('?')[0]}` : '';
    const location = `\nLocation: ${lineno}:${colno}`;
    const stack = error?.stack ? `\nStack: ${error.stack.split('\n').slice(0, 3).join('\n')}` : '';
    
    queueErrorLog(`[${timestamp}] Uncaught: ${message}${errorSource}${location}${stack}`);
    return false; // Allow default error handling to continue
  };
  
  // Capture unhandled promise rejections with optimized handling
  window.addEventListener("unhandledrejection", function(event) {
    const reason = event.reason;
    const timestamp = new Date().toISOString();
    let errorInfo = `[${timestamp}] Unhandled Promise: `;
    
    if (reason instanceof Error) {
      errorInfo += `${reason.name}: ${reason.message}`;
      if (reason.stack) {
        errorInfo += `\n${reason.stack.split('\n').slice(0, 3).join('\n')}`;
      }
    } else if (reason === null || reason === undefined) {
      errorInfo += 'No reason provided';
    } else if (typeof reason === 'object') {
      try {
        errorInfo += JSON.stringify(reason);
      } catch {
        errorInfo += '[Object]';
      }
    } else {
      errorInfo += String(reason);
    }
    
    queueErrorLog(errorInfo);
  });
}

/**
 * Add error to the throttled queue
 */
function queueErrorLog(errorLog: string) {
  const now = Date.now();
  
  // Add to queue
  errorQueue.push(errorLog);
  
  // If we're throttling, just queue the error
  if (now - lastErrorTime < THROTTLE_TIME) {
    // If we don't have a timer yet, set one up
    if (!throttleTimer) {
      throttleTimer = setTimeout(flushErrorQueue, THROTTLE_TIME);
    }
    return;
  }
  
  // Not throttling, process immediately
  flushErrorQueue();
}

/**
 * Process queued errors
 */
function flushErrorQueue() {
  // Clear any existing timer
  if (throttleTimer) {
    clearTimeout(throttleTimer);
    throttleTimer = null;
  }
  
  // Update last error time
  lastErrorTime = Date.now();
  
  // If queue is empty, nothing to do
  if (errorQueue.length === 0) return;
  
  // Process all queued errors at once to reduce localStorage operations
  try {
    const existingLogs = getStoredErrorLogs();
    
    // Add all queued errors
    for (const errorLog of errorQueue) {
      existingLogs.unshift(errorLog);
    }
    
    // Limit the number of stored logs
    const trimmedLogs = existingLogs.slice(0, MAX_STORED_LOGS);
    
    // Store in a single operation
    localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(trimmedLogs));
    
    // Clear the queue
    errorQueue = [];
  } catch (e) {
    // If localStorage is not available, we can't do much
    console.error("Failed to store error logs:", e);
  }
}

/**
 * Store a single error log in localStorage (legacy support)
 */
function storeErrorLog(errorLog: string) {
  // Use the queuing system for better performance
  queueErrorLog(errorLog);
}

/**
 * Get all stored error logs
 */
export function getStoredErrorLogs(): string[] {
  try {
    const storedLogs = localStorage.getItem(ERROR_STORAGE_KEY);
    return storedLogs ? JSON.parse(storedLogs) : [];
  } catch (e) {
    console.error("Failed to retrieve error logs:", e);
    return [];
  }
}

/**
 * Clear stored error logs
 */
export function clearStoredErrorLogs() {
  try {
    localStorage.removeItem(ERROR_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear error logs:", e);
  }
}

/**
 * Get formatted error logs as a string
 */
export function getFormattedErrorLogs(): string {
  const logs = getStoredErrorLogs();
  if (logs.length === 0) {
    return "No error logs found";
  }
  
  // Add browser and platform info
  let systemInfo = "\n--- Browser Information ---\n";
  systemInfo += `User Agent: ${navigator.userAgent}\n`;
  systemInfo += `Platform: ${navigator.platform}\n`;
  systemInfo += `Cookies Enabled: ${navigator.cookieEnabled}\n`;
  systemInfo += `Language: ${navigator.language}\n`;
  
  // Add page info
  systemInfo += "\n--- Page Information ---\n";
  systemInfo += `URL: ${window.location.href}\n`;
  systemInfo += `Referrer: ${document.referrer}\n`;
  systemInfo += `Screen: ${window.screen.width}x${window.screen.height}\n`;
  systemInfo += `Window: ${window.innerWidth}x${window.innerHeight}\n`;
  
  return logs.join("\n\n") + systemInfo;
}