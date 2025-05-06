"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRealtimeSubscription } from "./use-realtime-subscription"
import type { ActivityLog } from "@/lib/supabase/types"

export function useRealtimeActivity(userId: string, limit = 5) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Function to fetch activity data
  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          *,
          events(title)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error

      setActivities(data || [])
      setError(null)
    } catch (err) {
      console.error("Error in useRealtimeActivity:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [userId, limit])

  // Initial data fetch
  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Set up real-time subscription
  useRealtimeSubscription({ table: "activity_logs", filter: "user_id", filterValue: userId }, () => fetchActivities())

  return { activities, isLoading, error, refetch: fetchActivities }
}
