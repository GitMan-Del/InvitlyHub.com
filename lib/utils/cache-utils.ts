type CacheItem<T> = {
  data: T
  timestamp: number
  expiry: number // Time in milliseconds when this cache item expires
}

/**
 * Get an item from cache
 * @param key Cache key
 * @param maxAge Maximum age of cache in milliseconds (default: 5 minutes)
 * @returns The cached data or null if not found or expired
 */
export function getCachedData<T>(key: string, maxAge: number = 5 * 60 * 1000): T | null {
  try {
    const item = localStorage.getItem(`cache:${key}`)
    if (!item) return null

    const cachedItem: CacheItem<T> = JSON.parse(item)
    const now = Date.now()

    // Check if the cache has expired
    if (now - cachedItem.timestamp > maxAge || now > cachedItem.expiry) {
      localStorage.removeItem(`cache:${key}`)
      return null
    }

    return cachedItem.data
  } catch (error) {
    console.error("Error retrieving from cache:", error)
    return null
  }
}

/**
 * Set an item in cache
 * @param key Cache key
 * @param data Data to cache
 * @param maxAge Maximum age of cache in milliseconds (default: 5 minutes)
 */
export function setCachedData<T>(key: string, data: T, maxAge: number = 5 * 60 * 1000): void {
  try {
    const timestamp = Date.now()
    const expiry = timestamp + maxAge

    const cacheItem: CacheItem<T> = {
      data,
      timestamp,
      expiry,
    }

    localStorage.setItem(`cache:${key}`, JSON.stringify(cacheItem))
  } catch (error) {
    console.error("Error setting cache:", error)
  }
}

/**
 * Clear a specific cache item
 * @param key Cache key
 */
export function clearCacheItem(key: string): void {
  localStorage.removeItem(`cache:${key}`)
}

/**
 * Clear all cache items
 */
export function clearAllCache(): void {
  Object.keys(localStorage)
    .filter((key) => key.startsWith("cache:"))
    .forEach((key) => localStorage.removeItem(key))
}

/**
 * Create a cache key based on parameters
 * @param baseKey Base key name
 * @param params Parameters to include in the key
 * @returns A unique cache key
 */
export function createCacheKey(baseKey: string, params: Record<string, any> = {}): string {
  const paramString = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
    .join("|")

  return `${baseKey}${paramString ? `|${paramString}` : ""}`
}
