"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRealtimeSubscription } from "./use-realtime-subscription"
import type { Event } from "@/lib/supabase/types"

export function useRealtimeEvents(userId: string) {
  const [events, setEvents] = useState<{
    upcoming: Event[]
    past: Event[]
    total: number
  }>({
    upcoming: [],
    past: [],
    total: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Function to fetch events data
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const now = new Date().toISOString()

      // Run parallel queries for better performance
      const [upcomingResult, pastResult] = await Promise.all([
        // Get upcoming events
        supabase
          .from("events")
          .select("*")
          .eq("user_id", userId)
          .gte("event_date", now)
          .order("event_date", { ascending: true }),

        // Get past events
        supabase
          .from("events")
          .select("*")
          .eq("user_id", userId)
          .lt("event_date", now)
          .order("event_date", { ascending: false }),
      ])

      if (upcomingResult.error) throw upcomingResult.error
      if (pastResult.error) throw pastResult.error

      const upcomingEvents = upcomingResult.data || []
      const pastEvents = pastResult.data || []

      setEvents({
        upcoming: upcomingEvents,
        past: pastEvents,
        total: upcomingEvents.length + pastEvents.length,
      })
      setError(null)
    } catch (err) {
      console.error("Error in useRealtimeEvents:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Initial data fetch
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Set up real-time subscription
  useRealtimeSubscription({ table: "events", filter: "user_id", filterValue: userId }, () => fetchEvents())

  return { events, isLoading, error, refetch: fetchEvents }
}
