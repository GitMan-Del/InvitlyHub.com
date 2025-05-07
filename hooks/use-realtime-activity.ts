"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { handleSpecificAuthError } from "@/lib/utils/error-handler"
import type { ActivityLog } from "@/lib/supabase/types"

export function useRealtimeActivity(userId: string, limit = 10) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)

        const { data, error: activitiesError } = await supabase
          .from("activity_logs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(limit)

        if (activitiesError) throw activitiesError

        setActivities(data || [])
      } catch (err) {
        console.error("Error fetching activities:", err)
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
    fetchActivities()

    // Set up realtime subscription
    const channel = supabase
      .channel("activity-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_logs",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refetch activities when changes occur
          fetchActivities()
        },
      )
      .subscribe((status, err) => {
        if (status !== "SUBSCRIBED" || err) {
          console.error("Activity subscription error:", err)
          setError(err instanceof Error ? err : new Error("Failed to subscribe to activities"))
        }
      })

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId, limit])

  return { activities, isLoading, error }
}
