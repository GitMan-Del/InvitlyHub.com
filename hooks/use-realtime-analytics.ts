"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRealtimeSubscription } from "./use-realtime-subscription"
import { getCachedData, setCachedData } from "@/lib/utils/cache-utils"

export type AnalyticsData = {
  views: number
  responses: number
  engagement: number
  growth: number
  changeRates?: {
    views: string
    responses: string
    engagement: string
    growth: string
  }
  changeTypes?: {
    views: "positive" | "negative"
    responses: "positive" | "negative"
    engagement: "positive" | "negative"
    growth: "positive" | "negative"
  }
}

export function useRealtimeAnalytics(userId: string) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    views: 0,
    responses: 0,
    engagement: 0,
    growth: 0,
    changeRates: {
      views: "+0.0%",
      responses: "+0.0%",
      engagement: "+0.0%",
      growth: "+0.0%",
    },
    changeTypes: {
      views: "positive",
      responses: "positive",
      engagement: "positive",
      growth: "positive",
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefetching, setIsRefetching] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Function to fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setIsRefetching(true)
      const supabase = createClient()

      // Get current month's data
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

      // Get previous month's data for comparison
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

      // Run parallel queries for better performance
      const [
        currentViewsResult,
        prevViewsResult,
        currentResponsesResult,
        prevResponsesResult,
        currentInvitationsResult,
        prevInvitationsResult,
        currentEventsResult,
        prevEventsResult,
      ] = await Promise.all([
        // Current views
        supabase
          .from("activity_logs")
          .select("id")
          .eq("action", "viewed_event")
          .gte("created_at", currentMonthStart)
          .lte("created_at", currentMonthEnd),

        // Previous views
        supabase
          .from("activity_logs")
          .select("id")
          .eq("action", "viewed_event")
          .gte("created_at", prevMonthStart)
          .lte("created_at", prevMonthEnd),

        // Current responses
        supabase
          .from("invitations")
          .select("id")
          .not("status", "eq", "pending")
          .gte("updated_at", currentMonthStart)
          .lte("updated_at", currentMonthEnd),

        // Previous responses
        supabase
          .from("invitations")
          .select("id")
          .not("status", "eq", "pending")
          .gte("updated_at", prevMonthStart)
          .lte("updated_at", prevMonthEnd),

        // Current invitations
        supabase
          .from("invitations")
          .select("id")
          .gte("created_at", currentMonthStart)
          .lte("created_at", currentMonthEnd),

        // Previous invitations
        supabase
          .from("invitations")
          .select("id")
          .gte("created_at", prevMonthStart)
          .lte("created_at", prevMonthEnd),

        // Current events
        supabase
          .from("events")
          .select("id")
          .eq("user_id", userId)
          .gte("created_at", currentMonthStart)
          .lte("created_at", currentMonthEnd),

        // Previous events
        supabase
          .from("events")
          .select("id")
          .eq("user_id", userId)
          .gte("created_at", prevMonthStart)
          .lte("created_at", prevMonthEnd),
      ])

      // Handle any errors
      const errors = [
        currentViewsResult.error,
        prevViewsResult.error,
        currentResponsesResult.error,
        prevResponsesResult.error,
        currentInvitationsResult.error,
        prevInvitationsResult.error,
        currentEventsResult.error,
        prevEventsResult.error,
      ].filter(Boolean)

      if (errors.length > 0) {
        console.error("Errors fetching analytics data:", errors)
        throw new Error("Failed to fetch some analytics data")
      }

      // Calculate metrics
      const viewsCount = currentViewsResult.data?.length || 0
      const prevViewsCount = prevViewsResult.data?.length || 0
      const responsesCount = currentResponsesResult.data?.length || 0
      const prevResponsesCount = prevResponsesResult.data?.length || 0
      const invitationsCount = currentInvitationsResult.data?.length || 0
      const prevInvitationsCount = prevInvitationsResult.data?.length || 0
      const eventsCount = currentEventsResult.data?.length || 0
      const prevEventsCount = prevEventsResult.data?.length || 0

      // Calculate engagement rates
      const engagementRate = invitationsCount > 0 ? Math.round((responsesCount / invitationsCount) * 100) : 0
      const prevEngagementRate =
        prevInvitationsCount > 0 ? Math.round((prevResponsesCount / prevInvitationsCount) * 100) : 0

      // Calculate growth percentage
      const growthRate =
        prevEventsCount > 0
          ? Math.round(((eventsCount - prevEventsCount) / prevEventsCount) * 100)
          : eventsCount > 0
            ? 100
            : 0

      // Calculate change rates
      const viewsChange =
        prevViewsCount > 0 ? ((viewsCount - prevViewsCount) / prevViewsCount) * 100 : viewsCount > 0 ? 100 : 0

      const responsesChange =
        prevResponsesCount > 0
          ? ((responsesCount - prevResponsesCount) / prevResponsesCount) * 100
          : responsesCount > 0
            ? 100
            : 0

      const engagementChange = prevEngagementRate > 0 ? engagementRate - prevEngagementRate : engagementRate

      // Format change rates
      const formatChange = (change: number) => {
        const sign = change >= 0 ? "+" : ""
        return `${sign}${change.toFixed(1)}%`
      }

      // Create analytics data object
      const newAnalyticsData: AnalyticsData = {
        views: viewsCount,
        responses: responsesCount,
        engagement: engagementRate,
        growth: growthRate,
        changeRates: {
          views: formatChange(viewsChange),
          responses: formatChange(responsesChange),
          engagement: formatChange(engagementChange),
          growth: formatChange(growthRate),
        },
        changeTypes: {
          views: viewsChange >= 0 ? "positive" : "negative",
          responses: responsesChange >= 0 ? "positive" : "negative",
          engagement: engagementChange >= 0 ? "positive" : "negative",
          growth: growthRate >= 0 ? "positive" : "negative",
        },
      }

      setAnalyticsData(newAnalyticsData)
      setCachedData(`analytics:${userId}`, newAnalyticsData, 5 * 60 * 1000) // Cache for 5 minutes
      setError(null)
    } catch (err) {
      console.error("Error in useRealtimeAnalytics:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
      setIsRefetching(false)
    }
  }, [userId])

  // Initial data fetch
  useEffect(() => {
    // Try to get from cache first
    const cachedData = getCachedData<AnalyticsData>(`analytics:${userId}`, 5 * 60 * 1000)
    if (cachedData) {
      setAnalyticsData(cachedData)
      setIsLoading(false)
      // Still fetch fresh data in the background
      fetchAnalyticsData()
    } else {
      fetchAnalyticsData()
    }
  }, [userId, fetchAnalyticsData])

  // Set up real-time subscriptions for relevant tables
  useRealtimeSubscription({ table: "activity_logs", filter: "user_id", filterValue: userId }, () =>
    fetchAnalyticsData(),
  )

  useRealtimeSubscription({ table: "invitations" }, () => fetchAnalyticsData())

  useRealtimeSubscription({ table: "events", filter: "user_id", filterValue: userId }, () => fetchAnalyticsData())

  return { analyticsData, isLoading, isRefetching, error, refetch: fetchAnalyticsData }
}
