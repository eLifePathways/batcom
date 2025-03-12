/**
 * Utility for capturing and tracking JavaScript errors
 */

const ERROR_STORAGE_KEY = 'consoleErrorLogs';
const MAX_STORED_LOGS = 20;

/**
 * Initialize error tracking for the application
 */
export function initErrorTracking() {
  // Store the original console error function
  const originalConsoleError = console.error;
  
  // Override console.error to capture errors
  console.error = function(...args) {
    // Call the original console.error
    originalConsoleError.apply(console, args);
    
    try {
      // Format the error messages
      const errorMessage = args.map(arg => {
        if (arg instanceof Error) {
          return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
        } else if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        } else {
          return String(arg);
        }
      }).join(' ');
      
      // Store the error in localStorage with timestamp
      storeErrorLog(`[${new Date().toISOString()}] Console Error: ${errorMessage}`);
    } catch (e) {
      // If there's an error in our error handling, log it but don't break anything
      originalConsoleError.call(console, 'Error capturing console.error:', e);
    }
  };
  
  // Capture uncaught errors
  window.onerror = function(message, source, lineno, colno, error) {
    const errorInfo = `[${new Date().toISOString()}] Uncaught Error: ${message}\nSource: ${source}\nLine: ${lineno}, Column: ${colno}\nStack: ${error?.stack || 'No stack available'}`;
    storeErrorLog(errorInfo);
    return false; // Allow default error handling to continue
  };
  
  // Capture unhandled promise rejections
  window.addEventListener("unhandledrejection", function(event) {
    const reason = event.reason;
    let errorInfo = `[${new Date().toISOString()}] Unhandled Promise Rejection: `;
    
    if (reason instanceof Error) {
      errorInfo += `${reason.name}: ${reason.message}\n${reason.stack || ''}`;
    } else if (typeof reason === 'object') {
      errorInfo += JSON.stringify(reason, null, 2);
    } else {
      errorInfo += String(reason);
    }
    
    storeErrorLog(errorInfo);
  });
  
  console.log("Error tracking initialized");
}

/**
 * Store error logs in localStorage
 */
function storeErrorLog(errorLog: string) {
  try {
    // Get existing logs
    const existingLogs = getStoredErrorLogs();
    
    // Add new log at the beginning (most recent first)
    existingLogs.unshift(errorLog);
    
    // Limit the number of stored logs to prevent localStorage from getting too large
    const trimmedLogs = existingLogs.slice(0, MAX_STORED_LOGS);
    
    // Store back to localStorage
    localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(trimmedLogs));
  } catch (e) {
    // If localStorage is not available, we can't do much
    console.error("Failed to store error log:", e);
  }
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