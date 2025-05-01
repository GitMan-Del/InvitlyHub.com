"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { getCachedData, setCachedData } from "@/lib/utils/cache-utils"

type QueryOptions = {
  cacheTime?: number // Time in milliseconds to cache the data
  skipCache?: boolean // Skip cache and force fetch
  onSuccess?: (data: any) => void // Callback when data is successfully fetched
  onError?: (error: any) => void // Callback when an error occurs
}

/**
 * Custom hook for fetching data from Supabase with caching
 */
export function useCachedQuery<T = any>(
  queryFn: (supabase: ReturnType<typeof createClient>) => Promise<{ data: T | null; error: any }>,
  queryKey: string | string[],
  options: QueryOptions = {},
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefetching, setIsRefetching] = useState<boolean>(false)

  const cacheKey = Array.isArray(queryKey) ? queryKey.join(":") : queryKey
  const { cacheTime = 5 * 60 * 1000, skipCache = false, onSuccess, onError } = options

  const fetchData = async (skipCache = false) => {
    try {
      // Check cache first if not skipping
      if (!skipCache) {
        const cachedData = getCachedData<T>(cacheKey, cacheTime)
        if (cachedData) {
          setData(cachedData)
          setIsLoading(false)
          if (onSuccess) onSuccess(cachedData)
          return
        }
      }

      // If we're refetching, set the refetching state
      if (!isLoading) {
        setIsRefetching(true)
      }

      // Fetch fresh data
      const supabase = createClient()
      const { data: freshData, error } = await queryFn(supabase)

      if (error) {
        setError(error)
        if (onError) onError(error)
      } else {
        setData(freshData as T)
        if (freshData) {
          setCachedData(cacheKey, freshData, cacheTime)
        }
        if (onSuccess) onSuccess(freshData)
      }
    } catch (err) {
      setError(err)
      if (onError) onError(err)
    } finally {
      setIsLoading(false)
      setIsRefetching(false)
    }
  }

  // Function to manually refetch data
  const refetch = () => fetchData(true)

  useEffect(() => {
    fetchData(skipCache)
  }, [cacheKey, skipCache])

  return { data, error, isLoading, isRefetching, refetch }
}
