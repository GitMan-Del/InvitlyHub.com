"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRealtimeSubscription } from "./use-realtime-subscription"

type ResponseStats = {
  yes: number
  no: number
  pending: number
  total: number
}

export function useRealtimeResponseStats(userId: string) {
  const [stats, setStats] = useState<ResponseStats>({
    yes: 0,
    no: 0,
    pending: 0,
    total: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Function to fetch response stats
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()

      // Get all events for this user
      const { data: events, error: eventsError } = await supabase.from("events").select("id").eq("user_id", userId)

      if (eventsError) throw eventsError

      if (!events?.length) {
        setStats({ yes: 0, no: 0, pending: 0, total: 0 })
        return
      }

      const eventIds = events.map((event) => event.id)

      // Get invitation stats
      const { data: invitations, error: invitationsError } = await supabase
        .from("invitations")
        .select("status")
        .in("event_id", eventIds)

      if (invitationsError) throw invitationsError

      const total = invitations.length
      const yes = invitations.filter((inv) => inv.status === "yes").length
      const no = invitations.filter((inv) => inv.status === "no").length
      const pending = invitations.filter((inv) => inv.status === "pending").length

      // Calculate percentages
      const yesPercent = total > 0 ? Math.round((yes / total) * 100) : 0
      const noPercent = total > 0 ? Math.round((no / total) * 100) : 0

      setStats({
        yes: yesPercent,
        no: noPercent,
        pending,
        total,
      })
      setError(null)
    } catch (err) {
      console.error("Error in useRealtimeResponseStats:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Initial data fetch
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Set up real-time subscriptions
  useRealtimeSubscription({ table: "events", filter: "user_id", filterValue: userId }, () => fetchStats())

  useRealtimeSubscription({ table: "invitations" }, () => fetchStats())

  return { stats, isLoading, error, refetch: fetchStats }
}
