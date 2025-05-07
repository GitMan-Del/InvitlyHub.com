"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { handleSpecificAuthError } from "@/lib/utils/error-handler"
import type { Event } from "@/lib/supabase/types"

export function useRealtimeEvents(userId: string) {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)

        // Get current date in ISO format
        const now = new Date().toISOString()

        // Fetch upcoming events
        const { data: upcoming, error: upcomingError } = await supabase
          .from("events")
          .select("*")
          .or(`owner_id.eq.${userId},invitations.user_id.eq.${userId}`)
          .gte("date", now)
          .order("date", { ascending: true })

        if (upcomingError) throw upcomingError

        // Fetch past events
        const { data: past, error: pastError } = await supabase
          .from("events")
          .select("*")
          .or(`owner_id.eq.${userId},invitations.user_id.eq.${userId}`)
          .lt("date", now)
          .order("date", { ascending: false })

        if (pastError) throw pastError

        setUpcomingEvents(upcoming || [])
        setPastEvents(past || [])
      } catch (err) {
        console.error("Error fetching events:", err)
        setError(err instanceof Error ? err : new Error(String(err)))

        // Check if it's an auth error
        if (err.message?.includes("refresh_token") || err.status === 400) {
          handleSpecificAuthError(err)
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchEvents()

    // Set up realtime subscription
    const channel = supabase
      .channel("events-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        () => {
          // Refetch events when changes occur
          fetchEvents()
        },
      )
      .subscribe((status, err) => {
        if (status !== "SUBSCRIBED" || err) {
          console.error("Events subscription error:", err)
          setError(err instanceof Error ? err : new Error("Failed to subscribe to events"))
        }
      })

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  return { upcomingEvents, pastEvents, isLoading, error }
}
