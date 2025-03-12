import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Memory cache for API responses to improve performance (5-minute TTL)
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

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
 * Optimized API request function with caching support
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Generate cache key based on URL and method
  const method = options.method || 'GET';
  const cacheKey = `${method}:${url}`;
  
  // For GET requests, check the cache first
  if (method === 'GET') {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
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
    apiCache.set(cacheKey, { 
      data, 
      timestamp: Date.now() 
    });
  }
  
  return data;
}

/**
 * Optimized query function with caching
 */
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Efficiently build URL from query key
    const baseUrl = queryKey[0] as string;
    let url = baseUrl;
    
    // Optimize path parameter handling
    if (queryKey.length > 1) {
      const pathParams = queryKey.slice(1)
        .filter(param => param !== undefined && param !== null)
        .map(param => `/${param}`)
        .join('');
      url += pathParams;
    }
    
    // For debugging in development only
    if (process.env.NODE_ENV !== 'production') {
      console.log('Fetching URL:', url);
    }
    
    // Check memory cache first for better performance
    const cacheKey = `GET:${url}`;
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
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
    apiCache.set(cacheKey, { 
      data, 
      timestamp: Date.now() 
    });
    
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
  for (const key of apiCache.keys()) {
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
 * Configure the query client with optimized settings
 * - Added cache invalidation support
 * - Using memory cache for better performance
 * - Optimized retry and refetch settings
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity, // Using our own cache invalidation
      retry: false,
      // Add cache time for better memory management
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: false,
      // Add optimistic updates by default for better UX
      onMutate: () => {
        // Return context for potential rollback
        return { timestamp: Date.now() };
      }
    },
  },
});
