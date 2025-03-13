/**
 * Ultra-optimized utility for capturing and tracking JavaScript errors
 * with minimal performance impact on the main thread
 */

// Configuration
const ERROR_STORAGE_KEY = 'batcom_error_logs';
const MAX_STORED_LOGS = 25;  // Increased capacity but with better memory management
const THROTTLE_TIME = 2000;  // Increased throttle time to further reduce performance impact
const MAX_ERROR_LENGTH = 2000; // Limit very long error messages
const ERROR_BATCH_SIZE = 5;   // Process errors in small batches

// Memory-optimized state
let lastErrorTime = 0;
let errorQueue: string[] = [];
let throttleTimer: number | null = null;
let isProcessing = false;
let isInitialized = false;

// Pre-create timestamp formatter for better performance
const getTimestamp = () => new Date().toISOString();

// Memory-optimized error handling
const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  const halfLength = Math.floor(maxLength / 2);
  return str.substring(0, halfLength) + 
         '... [truncated] ...' + 
         str.substring(str.length - halfLength);
};

/**
 * Initialize error tracking for the application with ultra optimizations
 * to prevent any impact on application performance
 */
export function initErrorTracking() {
  // Only initialize once
  if (isInitialized) return;
  
  // Use the most delayed initialization possible with requestIdleCallback
  const initWithIdleCallback = () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(
        () => {
          setupErrorHandlers();
          console.log("Error tracking initialized");
          isInitialized = true;
        },
        { timeout: 3000 } // Very generous timeout
      );
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        setupErrorHandlers();
        console.log("Error tracking initialized");
        isInitialized = true;
      }, 800); // Significant delay to prioritize app initialization
    }
  };
  
  // Further delay initialization based on page load state
  if (document.readyState === 'complete') {
    // If page is already loaded, wait a bit then initialize
    setTimeout(initWithIdleCallback, 200);
  } else {
    // Otherwise wait for page to load completely
    window.addEventListener('load', () => setTimeout(initWithIdleCallback, 300));
  }
}

// Setup error handlers with optimizations for reduced memory usage
function setupErrorHandlers() {
  // Store original console methods
  const originalConsoleError = console.error;
  
  // Optimize console.error override
  console.error = function(...args) {
    // Call original first for developer experience
    originalConsoleError.apply(console, args);
    
    // Use lightweight try/catch to prevent any errors in our handling
    try {
      // Skip tracking for certain common errors that aren't actionable
      const firstArg = args[0];
      if (
        (typeof firstArg === 'string' && (
          firstArg.includes('network request failed') ||
          firstArg.includes('AbortError') ||
          firstArg.includes('Load failed')
        )) ||
        args.length === 0
      ) {
        return;
      }
      
      // Format efficiently
      let errorMessage = '';
      // Only process first 3 arguments to limit processing
      const argLimit = Math.min(args.length, 3);
      
      for (let i = 0; i < argLimit; i++) {
        const arg = args[i];
        if (arg instanceof Error) {
          errorMessage += `${arg.name}: ${arg.message}`;
          // Only include first 2 lines of stack trace
          if (arg.stack) {
            const stackLines = arg.stack.split('\n').slice(0, 2);
            errorMessage += `\n${stackLines.join('\n')}`;
          }
        } else if (typeof arg === 'object' && arg !== null) {
          try {
            // Limit object serialization depth
            const simpleObj = simplifyObject(arg);
            errorMessage += JSON.stringify(simpleObj);
          } catch {
            errorMessage += '[Complex Object]';
          }
        } else {
          errorMessage += String(arg);
        }
        
        if (i < argLimit - 1) {
          errorMessage += ' ';
        }
      }
      
      // Add to queue with minimal metadata
      queueErrorLog(`[${getTimestamp()}] Error: ${truncateString(errorMessage, MAX_ERROR_LENGTH)}`);
    } catch (e) {
      // Fail silently to never disrupt user experience
    }
  };
  
  // Optimize global error handling
  window.onerror = function(message, source, lineno, colno, error) {
    try {
      // Only track if it's a real error and not a network issue
      if (typeof message === 'string' && 
          (message.includes('Script error') || 
           message.includes('network request failed'))) {
        return false;
      }
      
      // Create minimal error info
      const errorSource = source ? source.split('/').pop() : 'unknown';
      const location = `${errorSource}:${lineno}`;
      const errorMsg = typeof message === 'string' ? message.split('\n')[0] : String(message);
      
      queueErrorLog(`[${getTimestamp()}] Uncaught: ${truncateString(errorMsg, MAX_ERROR_LENGTH)} at ${location}`);
    } catch (e) {
      // Fail silently
    }
    return false;
  };
  
  // Optimize unhandled promise rejection handling
  window.addEventListener("unhandledrejection", function(event) {
    try {
      const reason = event.reason;
      let errorInfo = `Unhandled Promise: `;
      
      if (reason instanceof Error) {
        errorInfo += `${reason.name}: ${reason.message}`;
      } else if (reason === null || reason === undefined) {
        errorInfo += 'No reason provided';
      } else if (typeof reason === 'object') {
        try {
          const simpleObj = simplifyObject(reason);
          errorInfo += JSON.stringify(simpleObj);
        } catch {
          errorInfo += '[Complex Object]';
        }
      } else {
        errorInfo += String(reason);
      }
      
      queueErrorLog(`[${getTimestamp()}] ${truncateString(errorInfo, MAX_ERROR_LENGTH)}`);
    } catch (e) {
      // Fail silently
    }
  });
}

// Helper to simplify objects for logging
function simplifyObject(obj: any, depth = 1, maxDepth = 2): any {
  if (depth > maxDepth) return '[Object]';
  
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle common cases efficiently
  if (obj instanceof Error) {
    return { name: obj.name, message: obj.message };
  }
  
  if (Array.isArray(obj)) {
    if (depth === maxDepth) return `[Array(${obj.length})]`;
    return obj.slice(0, 3).map(item => simplifyObject(item, depth + 1, maxDepth));
  }
  
  // For regular objects, limit properties
  const simpleObj: Record<string, any> = {};
  let propCount = 0;
  for (const key in obj) {
    if (propCount >= 5) {
      simpleObj['...'] = `[${Object.keys(obj).length - 5} more properties]`;
      break;
    }
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      simpleObj[key] = simplifyObject(obj[key], depth + 1, maxDepth);
      propCount++;
    }
  }
  
  return simpleObj;
}

/**
 * Add error to the throttled queue with ultra-optimized processing
 */
function queueErrorLog(errorLog: string) {
  // Add to queue with limit check to prevent memory issues
  if (errorQueue.length < 100) {
    errorQueue.push(errorLog);
  }
  
  // Process with heavy throttling for performance
  const now = Date.now();
  if (now - lastErrorTime < THROTTLE_TIME) {
    // If already throttling, just let it queue up
    if (!throttleTimer) {
      throttleTimer = window.setTimeout(processErrorsWithIdleCallback, THROTTLE_TIME);
    }
    return;
  }
  
  // Not currently throttling, process with idle callback
  processErrorsWithIdleCallback();
}

/**
 * Use idle callback for processing to minimize main thread impact
 */
function processErrorsWithIdleCallback() {
  // If already processing, don't schedule again
  if (isProcessing) return;
  
  // Clear any existing scheduled processing
  if (throttleTimer) {
    clearTimeout(throttleTimer);
    throttleTimer = null;
  }
  
  // Update timing state
  lastErrorTime = Date.now();
  
  // If queue is empty, nothing to do
  if (errorQueue.length === 0) return;
  
  // Mark as processing
  isProcessing = true;
  
  // Use requestIdleCallback if available
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(
      () => {
        flushErrorQueue();
        isProcessing = false;
      },
      { timeout: 1000 }
    );
  } else {
    // Fallback to setTimeout
    setTimeout(() => {
      flushErrorQueue();
      isProcessing = false;
    }, 100);
  }
}

/**
 * Process queued errors with batch processing for efficiency
 */
function flushErrorQueue() {
  // If queue is empty, nothing to do
  if (errorQueue.length === 0) return;
  
  try {
    // Get current logs once to minimize localStorage reads
    const existingLogs = getStoredErrorLogs();
    
    // Only process a small batch at a time
    const batchToProcess = errorQueue.splice(0, ERROR_BATCH_SIZE);
    
    // Add current batch to existing logs
    const updatedLogs = [...batchToProcess, ...existingLogs].slice(0, MAX_STORED_LOGS);
    
    // Store in a single operation
    localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(updatedLogs));
    
    // If there are more errors to process, schedule another batch
    if (errorQueue.length > 0) {
      throttleTimer = window.setTimeout(processErrorsWithIdleCallback, 200);
    }
  } catch (e) {
    // If localStorage fails, clear queue to prevent retry spam
    errorQueue = [];
  }
}

/**
 * Get all stored error logs
 */
export function getStoredErrorLogs(): string[] {
  try {
    const storedLogs = localStorage.getItem(ERROR_STORAGE_KEY);
    return storedLogs ? JSON.parse(storedLogs) : [];
  } catch {
    return [];
  }
}

/**
 * Clear stored error logs
 */
export function clearStoredErrorLogs() {
  try {
    localStorage.removeItem(ERROR_STORAGE_KEY);
    errorQueue = []; // Also clear any pending errors
  } catch {
    // Fail silently
  }
}

/**
 * Get formatted error logs as a string with environment context
 */
export function getFormattedErrorLogs(): string {
  const logs = getStoredErrorLogs();
  if (logs.length === 0) {
    return "No error logs found";
  }
  
  // Build system information efficiently
  const systemInfo = [
    "\n--- Browser Information ---",
    `User Agent: ${navigator.userAgent}`,
    `Platform: ${navigator.platform || 'Unknown'}`,
    `Language: ${navigator.language}`,
    "\n--- Page Information ---",
    `URL: ${window.location.href}`,
    `Time: ${new Date().toISOString()}`,
    `Screen: ${window.screen.width}x${window.screen.height}`,
  ].join("\n");
  
  return logs.join("\n\n") + systemInfo;
}