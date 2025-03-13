import { QueryClient, QueryFunction, QueryKey } from "@tanstack/react-query";

// Configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_CACHE_SIZE = 200; // Maximum number of items to cache
const MAX_BATCH_SIZE = 50; // Number of items to clean up when cache is full

/**
 * LRUCache implementation with TTL support for better memory management
 * Uses O(1) operations for most common actions
 */
class LRUCache<T> {
  // Internal data structures
  private cache = new Map<string, { data: T; timestamp: number; size: number }>();
  private keysByAge = new Set<string>(); // To track insertion order
  private totalSize = 0;
  private maxSize: number;
  private ttl: number;
  
  constructor(maxSize = MAX_CACHE_SIZE, ttl = CACHE_TTL) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  
  /**
   * Get an item from cache with TTL checking
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    // Check if item has expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.delete(key);
      return undefined;
    }
    
    // Update LRU order by removing and re-adding
    this.keysByAge.delete(key);
    this.keysByAge.add(key);
    
    return item.data;
  }
  
  /**
   * Set an item in cache with size estimation
   */
  set(key: string, data: T): void {
    // Estimate item size
    let itemSize = 1; // Base size
    
    // More accurate size estimation for common types
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        itemSize = data.length;
      } else {
        itemSize = Object.keys(data).length;
      }
    } else if (typeof data === 'string') {
      itemSize = Math.ceil(data.length / 100); // Rough byte estimation
    }
    
    // Remove existing entry if present
    if (this.cache.has(key)) {
      const oldItem = this.cache.get(key)!;
      this.totalSize -= oldItem.size;
      this.keysByAge.delete(key);
    }
    
    // Check if we need to evict items
    if (this.cache.size >= this.maxSize) {
      this.evictOldest(MAX_BATCH_SIZE);
    }
    
    // Add new item
    this.cache.set(key, { 
      data, 
      timestamp: Date.now(),
      size: itemSize
    });
    this.keysByAge.add(key);
    this.totalSize += itemSize;
  }
  
  /**
   * Delete an item from cache
   */
  delete(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    this.totalSize -= item.size;
    this.keysByAge.delete(key);
    return this.cache.delete(key);
  }
  
  /**
   * Clear all items from cache
   */
  clear(): void {
    this.cache.clear();
    this.keysByAge.clear();
    this.totalSize = 0;
  }
  
  /**
   * Get all keys in the cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Remove expired items from cache
   */
  cleanExpired(): number {
    const now = Date.now();
    let removed = 0;
    
    // Convert keys to an array to avoid iterator issues
    const keys = Array.from(this.cache.keys());
    
    for (const key of keys) {
      const item = this.cache.get(key);
      if (item && now - item.timestamp > this.ttl) {
        this.delete(key);
        removed++;
      }
    }
    
    return removed;
  }
  
  /**
   * Evict oldest items from cache
   */
  private evictOldest(count: number): void {
    let evicted = 0;
    // Convert to array to avoid iterator issues
    const keys = Array.from(this.keysByAge);
    
    for (let i = 0; i < Math.min(count, keys.length); i++) {
      this.delete(keys[i]);
      evicted++;
    }
  }
  
  /**
   * Get cache statistics
   */
  stats(): { size: number; totalSize: number; oldestTimestamp: number | null } {
    let oldestTimestamp: number | null = null;
    
    // Safely get the oldest timestamp
    if (this.keysByAge.size > 0) {
      const keys = Array.from(this.keysByAge);
      if (keys.length > 0) {
        const oldestKey = keys[0];
        const item = this.cache.get(oldestKey);
        oldestTimestamp = item ? item.timestamp : null;
      }
    }
    
    return {
      size: this.cache.size,
      totalSize: this.totalSize,
      oldestTimestamp
    };
  }
}

// Initialize LRU cache for API responses
const apiCache = new LRUCache<any>();

// Schedule periodic cleanup during idle times
if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
  const scheduleCleanup = () => {
    window.requestIdleCallback(() => {
      apiCache.cleanExpired();
      setTimeout(scheduleCleanup, 60000); // Schedule again in 1 minute
    }, { timeout: 1000 });
  };
  
  // Start cleanup cycle
  setTimeout(scheduleCleanup, 30000); // First cleanup after 30 seconds
}

/**
 * Helper for handling response errors with optimized performance
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Only parse text if needed (error case)
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Ultra-optimized API request function with LRU caching support
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Generate cache key based on URL and method
  const method = options.method || 'GET';
  const cacheKey = `${method}:${url}`;
  
  // Add headers for all requests if Content-Type not already set
  if (!(options.body instanceof FormData)) { // Don't set for FormData
    const currentHeaders = options.headers as Record<string, string> || {};
    if (!currentHeaders['Content-Type']) {
      options.headers = {
        ...currentHeaders,
        'Content-Type': 'application/json',
      };
    }
  }

  // Only log in development mode to reduce console clutter in production
  if (process.env.NODE_ENV !== 'production' && method !== 'GET') {
    let bodyLog = '';
    if (options.body) {
      if (options.body instanceof FormData) {
        bodyLog = '[FormData]';
      } else if (typeof options.body === 'string') {
        try {
          bodyLog = JSON.parse(options.body);
        } catch {
          bodyLog = '[String Data]';
        }
      }
    }
    console.log(`API Request: ${method} ${url}`, bodyLog);
  }
  
  // For GET requests, check the cache first
  if (method === 'GET') {
    const cachedData = apiCache.get(cacheKey);
    if (cachedData !== undefined) {
      return cachedData as T;
    }
  }
  
  // Make the actual request
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // If status is 204 No Content, return empty object
  if (res.status === 204) {
    return {} as T;
  }
  
  // Parse response
  const data = await res.json() as T;
  
  // Cache successful GET responses
  if (method === 'GET' && res.ok) {
    apiCache.set(cacheKey, data);
  }
  
  return data;
}

/**
 * Optimized query function with intelligent caching
 */
type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }: { queryKey: QueryKey }) => {
    // Efficiently build URL from query key
    const baseUrl = queryKey[0] as string;
    let url = baseUrl;
    
    // Optimize path parameter handling
    if (queryKey.length > 1) {
      const pathParams = queryKey.slice(1)
        .filter(param => param !== undefined && param !== null)
        .map(param => encodeURIComponent(String(param)))
        .map(param => `/${param}`)
        .join('');
      url += pathParams;
    }
    
    // For debugging in development only
    if (process.env.NODE_ENV !== 'production') {
      console.log('Fetching URL:', url);
    }
    
    // Check LRU cache first for better performance
    const cacheKey = `GET:${url}`;
    const cachedData = apiCache.get(cacheKey);
    if (cachedData !== undefined) {
      return cachedData;
    }
    
    // Make the request if not cached or expired
    const res = await fetch(url, {
      credentials: "include",
    });

    // Handle unauthorized according to behavior
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    
    // Parse and cache the response
    const data = await res.json();
    apiCache.set(cacheKey, data);
    
    return data;
  };

/**
 * Utility to invalidate cache entries by URL pattern
 */
export function invalidateApiCache(urlPattern: string | RegExp) {
  // Convert string pattern to regex for consistent handling
  const pattern = typeof urlPattern === 'string' 
    ? new RegExp(urlPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    : urlPattern;
  
  // Find and remove matching cache entries
  const keys = apiCache.keys();
  for (const key of keys) {
    if (pattern.test(key)) {
      apiCache.delete(key);
    }
  }
}

/**
 * Clear entire API cache
 */
export function clearApiCache() {
  apiCache.clear();
}

/**
 * Configure the query client with ultra-optimized settings
 * - Intelligent LRU caching with size limits and TTL
 * - Automatic background cache cleanup during idle periods
 * - Optimized memory management through selective caching
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: CACHE_TTL, // Match our cache TTL
      retry: false,
      gcTime: 10 * 60 * 1000, // 10 minutes (uses gcTime instead of cacheTime in v5)
      refetchOnMount: false, // Minimize refetches on component mount
    },
    mutations: {
      retry: false,
      // Add optimistic updates by default for better UX
      onMutate: () => {
        // Return context for potential rollback
        return { timestamp: Date.now() };
      },
      onSuccess: (_data, _variables, _context) => {
        // No automatic invalidation - we handle this manually
      },
      gcTime: 5 * 60 * 1000 // 5 minutes in v5
    },
  },
});
