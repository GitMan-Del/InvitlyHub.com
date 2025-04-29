"use client"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardContent from "@/components/dashboard/dashboard-content"
import { getProfile, getUserEvents, getEventResponseStats, getRecentActivity } from "@/lib/supabase/server-utils"

export default async function DashboardPage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // If not authenticated, redirect to sign in page
    redirect("/auth/signin")
  }

  try {
    // Fetch user profile data
    const profile = await getProfile(session.user.id)

    // Get events data
    const eventsData = await getUserEvents(session.user.id)

    // Get response statistics
    const responseStats = await getEventResponseStats(session.user.id)

    // Get recent activity
    const recentActivity = await getRecentActivity(session.user.id)

    // Get analytics data (mock data for now, could be calculated from real data in the future)
    const analyticsData = {
      views: 1245,
      responses: responseStats.total,
      engagement: responseStats.total > 0 ? Math.round((responseStats.yes / responseStats.total) * 100) : 0,
      growth: 23,
    }

    return (
      <DashboardContent
        user={session.user}
        profile={profile}
        events={eventsData}
        responseStats={responseStats}
        analyticsData={analyticsData}
        recentActivity={recentActivity}
      />
    )
  } catch (error) {
    console.error("Error loading dashboard:", error)

    // Return a simple error state
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-white/70 mb-6">
            We encountered an error while loading your dashboard. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#9855FF] text-white font-medium py-2 px-4 rounded-lg"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }
}
