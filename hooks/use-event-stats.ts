"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

type EventStats = {
  attendees: number
  responses: number
  yesCount: number
  noCount: number
  pendingCount: number
  responseRate: number
}

export function useEventStats(eventId: string) {
  const [stats, setStats] = useState<EventStats>({
    attendees: 0,
    responses: 0,
    yesCount: 0,
    noCount: 0,
    pendingCount: 0,
    responseRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!eventId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const supabase = createClient()

        // Get invitations for this event
        const { data: invitations, error: invitationsError } = await supabase
          .from("invitations")
          .select("status")
          .eq("event_id", eventId)

        if (invitationsError) {
          throw new Error(`Error fetching invitations: ${invitationsError.message}`)
        }

        // Calculate stats
        const total = invitations?.length || 0
        const yesCount = invitations?.filter((inv) => inv.status === "yes").length || 0
        const noCount = invitations?.filter((inv) => inv.status === "no").length || 0
        const pendingCount = invitations?.filter((inv) => inv.status === "pending").length || 0
        const responseRate = total > 0 ? Math.round(((yesCount + noCount) / total) * 100) : 0

        setStats({
          attendees: yesCount,
          responses: yesCount + noCount,
          yesCount,
          noCount,
          pendingCount,
          responseRate,
        })
        setError(null)
      } catch (err) {
        console.error("Error fetching event stats:", err)
        setError(err instanceof Error ? err : new Error(String(err)))

        // Set fallback stats
        setStats({
          attendees: 0,
          responses: 0,
          yesCount: 0,
          noCount: 0,
          pendingCount: 0,
          responseRate: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [eventId])

  return { stats, isLoading, error }
}
