import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "./dashboard-client"
import { Suspense } from "react"
import DashboardSkeleton from "./dashboard-skeleton"
import { getUserEvents, getProfile, getEventResponseStats, getRecentActivity } from "@/lib/supabase/server-utils"

export default async function DashboardPage() {
  const supabase = createClient()

  try {
    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      // If not authenticated, redirect to sign in page
      redirect("/auth/signin")
    }

    // Get user profile - this will now always return at least a fallback profile
    const profile = await getProfile(session.user.id)

    // Get events data
    const eventsData = await getUserEvents(session.user.id)

    // Get response stats
    const responseStats = await getEventResponseStats(session.user.id)

    // Get recent activity
    const recentActivity = await getRecentActivity(session.user.id)

    // Get analytics data (mock data for now)
    const analyticsData = {
      views: 1245,
      responses: responseStats.total,
      engagement: responseStats.total > 0 ? Math.round((responseStats.yes / 100) * responseStats.total) : 0,
      growth: 23,
      changeRates: {
        views: "+12%",
        responses: "+8%",
        engagement: "+5%",
        growth: "+15%",
      },
      changeTypes: {
        views: "positive" as const,
        responses: "positive" as const,
        engagement: "positive" as const,
        growth: "positive" as const,
      },
    }

    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClient
          user={session.user}
          profile={profile}
          events={eventsData}
          responseStats={responseStats}
          analyticsData={analyticsData}
          recentActivity={recentActivity}
        />
      </Suspense>
    )
  } catch (error) {
    console.error("Dashboard error:", error)

    // Check if it's an auth error
    if (
      error.message?.includes("refresh_token") ||
      error.message?.includes("not authenticated") ||
      error.status === 400
    ) {
      redirect("/auth/signin?error=Your session has expired. Please sign in again.")
    }

    // For other errors, throw to the error boundary
    throw error
  }
}
