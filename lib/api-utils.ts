/**
 * Utility functions for API optimization
 */

// Cache responses with a TTL (time to live)
const API_CACHE = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1 minute in milliseconds

/**
 * Get cached data or fetch new data
 */
export async function getCachedData<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  const cached = API_CACHE.get(key)
  const now = Date.now()

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  // Cache miss or expired, fetch new data
  const data = await fetchFn()
  API_CACHE.set(key, { data, timestamp: now })
  return data
}

/**
 * Clear cache for a specific key or all cache if no key provided
 */
export function clearCache(key?: string): void {
  if (key) {
    API_CACHE.delete(key)
  } else {
    API_CACHE.clear()
  }
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>): void => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Throttle function for frequent events
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

