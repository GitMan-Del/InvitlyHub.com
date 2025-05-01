"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { getCachedData, setCachedData } from "@/lib/utils/cache-utils"

export type EventStats = {
  attendees: number
  responses: number
}

export function useEventStats(eventId: string, options = { cacheTime: 5 * 60 * 1000 }) {
  const [stats, setStats] = useState<EventStats>({ attendees: 0, responses: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefetching, setIsRefetching] = useState(false)
  const [error, setError] = useState<any>(null)

  const cacheKey = `event-stats:${eventId}`
  const { cacheTime } = options

  const fetchEventStats = async (skipCache = false) => {
    try {
      // Check cache first if not skipping
      if (!skipCache) {
        const cachedData = getCachedData<EventStats>(cacheKey, cacheTime)
        if (cachedData) {
          setStats(cachedData)
          setIsLoading(false)
          return
        }
      }

      // If we're refetching, set the refetching state
      if (!isLoading) {
        setIsRefetching(true)
      }

      const supabase = createClient()

      // Get attendees count
      const { count: attendeesCount, error: attendeesError } = await supabase
        .from("invitations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)

      // Get responses count
      const { data: responsesData, error: responsesError } = await supabase
        .from("invitations")
        .select("status")
        .eq("event_id", eventId)
        .not("status", "eq", "pending")

      if (attendeesError || responsesError) {
        throw attendeesError || responsesError
      }

      const newStats = {
        attendees: attendeesCount || 0,
        responses: responsesData?.length || 0,
      }

      setStats(newStats)
      setCachedData(cacheKey, newStats, cacheTime)
    } catch (error) {
      console.error("Error fetching event stats:", error)
      setError(error)
    } finally {
      setIsLoading(false)
      setIsRefetching(false)
    }
  }

  const refetch = () => fetchEventStats(true)

  useEffect(() => {
    fetchEventStats()
  }, [eventId])

  return { stats, isLoading, isRefetching, error, refetch }
}
