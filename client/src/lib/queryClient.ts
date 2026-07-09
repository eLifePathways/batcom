import { QueryClient, QueryFunction, QueryKey } from '@tanstack/react-query'
import { getToken } from './utils'

// How long React Query treats fetched data as fresh before refetching.
const STALE_TIME = 5 * 60 * 1000 // 5 minutes

/**
 * Helper for handling response errors with optimized performance
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Only parse text if needed (error case)
    const err = await res.json().catch(() => ({}))
    console.log('err?', err)
    throw Object.assign(
      new Error(err.error || `${res.status}: ${res.statusText}`),
      {
        status: res.status,
        data: err,
      },
    )
  }
}

/**
 * Perform an API request. Mutations go through this to keep auth headers and
 * error handling consistent. React Query owns response caching, so this
 * function deliberately does not cache — invalidating a query is enough to
 * refetch fresh data.
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const method = options.method || 'GET'

  // Add headers for all requests if Content-Type not already set
  if (!(options.body instanceof FormData)) {
    // Don't set for FormData
    const currentHeaders = (options.headers as Record<string, string>) || {}
    if (!currentHeaders['Content-Type']) {
      options.headers = {
        ...currentHeaders,
        'Content-Type': 'application/json',
      }
    }

    const token = getToken()
    options.headers = {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : '',
    }
  }

  // Only log in development mode to reduce console clutter in production
  if (process.env.NODE_ENV !== 'production' && method !== 'GET') {
    let bodyLog = ''
    if (options.body) {
      if (options.body instanceof FormData) {
        bodyLog = '[FormData]'
      } else if (typeof options.body === 'string') {
        try {
          bodyLog = JSON.parse(options.body)
        } catch {
          bodyLog = '[String Data]'
        }
      }
    }
    console.log(`API Request: ${method} ${url}`, bodyLog)
  }

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
  })

  await throwIfResNotOk(res)

  // If status is 204 No Content, return empty object
  if (res.status === 204) {
    return {} as T
  }

  return (await res.json()) as T
}

type UnauthorizedBehavior = 'returnNull' | 'throw'

/**
 * Default query function: builds the request URL from the query key and
 * fetches it. React Query is the single source of truth for caching.
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }: { queryKey: QueryKey }) => {
    // Efficiently build URL from query key
    const baseUrl = queryKey[0] as string
    let url = baseUrl

    // Optimize path parameter handling
    if (queryKey.length > 1) {
      const pathParams = queryKey
        .slice(1)
        .filter(param => param !== undefined && param !== null)
        .map(param => encodeURIComponent(String(param)))
        .map(param => `/${param}`)
        .join('')
      url += pathParams
    }

    // For debugging in development only
    if (process.env.NODE_ENV !== 'production') {
      console.log('Fetching URL:', url)
    }

    const token = getToken()

    const res = await fetch(url, {
      credentials: 'include',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })

    // Handle unauthorized according to behavior
    if (unauthorizedBehavior === 'returnNull' && res.status === 401) {
      return null
    }

    await throwIfResNotOk(res)

    return await res.json()
  }

/**
 * Configure the query client. React Query is the sole cache: reads are cached
 * per query key, and mutations refresh data by invalidating the relevant keys
 * in their onSuccess handlers.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: 'throw' }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: STALE_TIME,
      retry: false,
      gcTime: 10 * 60 * 1000, // 10 minutes (uses gcTime instead of cacheTime in v5)
      refetchOnMount: false, // Minimize refetches on component mount
    },
    mutations: {
      retry: false,
      gcTime: 5 * 60 * 1000, // 5 minutes in v5
    },
  },
})
