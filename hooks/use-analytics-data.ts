"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { getCachedData, setCachedData } from "@/lib/utils/cache-utils"

export type AnalyticsData = {
  views: number
  responses: number
  engagement: number
  growth: number
  changeRates: {
    views: string
    responses: string
    engagement: string
    growth: string
  }
  changeTypes: {
    views: "positive" | "negative"
    responses: "positive" | "negative"
    engagement: "positive" | "negative"
    growth: "positive" | "negative"
  }
}

export function useAnalyticsData(userId: string, options = { cacheTime: 15 * 60 * 1000 }) {
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
  const [error, setError] = useState<any>(null)

  const cacheKey = `analytics:${userId}`
  const { cacheTime } = options

  const fetchAnalyticsData = async (skipCache = false) => {
    try {
      // Check cache first if not skipping
      if (!skipCache) {
        const cachedData = getCachedData<AnalyticsData>(cacheKey, cacheTime)
        if (cachedData) {
          setAnalyticsData(cachedData)
          setIsLoading(false)
          return
        }
      }

      // If we're refetching, set the refetching state
      if (!isLoading) {
        setIsRefetching(true)
      }

      const supabase = createClient()

      // Get current month's data
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

      // Get previous month's data for comparison
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

      // Get view counts from activity logs (assuming "viewed_event" action)
      const { data: currentViews } = await supabase
        .from("activity_logs")
        .select("id")
        .eq("action", "viewed_event")
        .gte("created_at", currentMonthStart)
        .lte("created_at", currentMonthEnd)

      const { data: prevViews } = await supabase
        .from("activity_logs")
        .select("id")
        .eq("action", "viewed_event")
        .gte("created_at", prevMonthStart)
        .lte("created_at", prevMonthEnd)

      // Get response counts
      const { data: currentResponses } = await supabase
        .from("invitations")
        .select("id")
        .not("status", "eq", "pending")
        .gte("updated_at", currentMonthStart)
        .lte("updated_at", currentMonthEnd)

      const { data: prevResponses } = await supabase
        .from("invitations")
        .select("id")
        .not("status", "eq", "pending")
        .gte("updated_at", prevMonthStart)
        .lte("updated_at", prevMonthEnd)

      // Get total invitations for engagement calculation
      const { data: currentInvitations } = await supabase
        .from("invitations")
        .select("id")
        .gte("created_at", currentMonthStart)
        .lte("created_at", currentMonthEnd)

      const { data: prevInvitations } = await supabase
        .from("invitations")
        .select("id")
        .gte("created_at", prevMonthStart)
        .lte("created_at", prevMonthEnd)

      // Calculate current values
      const viewsCount = currentViews?.length || 0
      const responsesCount = currentResponses?.length || 0
      const invitationsCount = currentInvitations?.length || 0

      // Calculate previous values
      const prevViewsCount = prevViews?.length || 0
      const prevResponsesCount = prevResponses?.length || 0
      const prevInvitationsCount = prevInvitations?.length || 0

      // Calculate engagement rates
      const engagementRate = invitationsCount > 0 ? Math.round((responsesCount / invitationsCount) * 100) : 0
      const prevEngagementRate =
        prevInvitationsCount > 0 ? Math.round((prevResponsesCount / prevInvitationsCount) * 100) : 0

      // Calculate growth (new events this month)
      const { data: currentEvents } = await supabase
        .from("events")
        .select("id")
        .gte("created_at", currentMonthStart)
        .lte("created_at", currentMonthEnd)

      const { data: prevEvents } = await supabase
        .from("events")
        .select("id")
        .gte("created_at", prevMonthStart)
        .lte("created_at", prevMonthEnd)

      const eventsCount = currentEvents?.length || 0
      const prevEventsCount = prevEvents?.length || 0

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

      // Format change rates and determine change types
      const formatChange = (change: number) => {
        const sign = change >= 0 ? "+" : ""
        return `${sign}${change.toFixed(1)}%`
      }

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
      setCachedData(cacheKey, newAnalyticsData, cacheTime)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      setError(error)
    } finally {
      setIsLoading(false)
      setIsRefetching(false)
    }
  }

  const refetch = () => fetchAnalyticsData(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [userId])

  return { analyticsData, isLoading, isRefetching, error, refetch }
}
