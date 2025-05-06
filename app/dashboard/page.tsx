import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "./dashboard-client"
import { Suspense } from "react"
import DashboardSkeleton from "./dashboard-skeleton"

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

    // Fetch user profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      // Continue with null profile instead of failing completely
    }

    // Get events data
    const now = new Date().toISOString()

    // Get upcoming events
    const { data: upcomingEvents, error: upcomingError } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", session.user.id)
      .gte("event_date", now)
      .order("event_date", { ascending: true })

    if (upcomingError) {
      console.error("Error fetching upcoming events:", upcomingError)
    }

    // Get past events
    const { data: pastEvents, error: pastError } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", session.user.id)
      .lt("event_date", now)
      .order("event_date", { ascending: false })

    if (pastError) {
      console.error("Error fetching past events:", pastError)
    }

    // Get all events for this user
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id")
      .eq("user_id", session.user.id)

    if (eventsError) {
      console.error("Error fetching event IDs:", eventsError)
    }

    const eventIds = events?.map((event) => event.id) || []

    // Get invitation stats - handle empty eventIds array
    let invitations = []
    let invitationsError = null

    if (eventIds.length > 0) {
      const result = await supabase.from("invitations").select("status").in("event_id", eventIds)
      invitations = result.data || []
      invitationsError = result.error
    }

    if (invitationsError) {
      console.error("Error fetching invitations:", invitationsError)
    }

    const total = invitations?.length || 0
    const yes = invitations?.filter((inv) => inv.status === "yes").length || 0
    const no = invitations?.filter((inv) => inv.status === "no").length || 0
    const pending = invitations?.filter((inv) => inv.status === "pending").length || 0

    // Calculate percentages
    const yesPercent = total > 0 ? Math.round((yes / total) * 100) : 0
    const noPercent = total > 0 ? Math.round((no / total) * 100) : 0

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from("activity_logs")
      .select(`
        *,
        events(title)
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(4)

    if (activityError) {
      console.error("Error fetching activity logs:", activityError)
    }

    // Get analytics data (mock data for now)
    const analyticsData = {
      views: 1245,
      responses: total,
      engagement: total > 0 ? Math.round((yes / total) * 100) : 0,
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

    const eventsData = {
      upcoming: upcomingEvents || [],
      past: pastEvents || [],
      total: (upcomingEvents?.length || 0) + (pastEvents?.length || 0),
    }

    const responseStats = {
      yes: yesPercent,
      no: noPercent,
      pending,
      total,
    }

    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClient
          user={session.user}
          profile={profile || null}
          events={eventsData}
          responseStats={responseStats}
          analyticsData={analyticsData}
          recentActivity={recentActivity || []}
        />
      </Suspense>
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    // Instead of redirecting on error, show a more helpful error message
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Dashboard Error</h2>
          <p className="text-white/70 mb-6">
            We encountered an error while loading your dashboard. This might be due to a temporary server issue or
            database connection problem.
          </p>
          <div className="flex gap-4">
            <a href="/dashboard" className="bg-[#9855FF] text-white font-medium py-2 px-4 rounded-lg">
              Try again
            </a>
            <a href="/" className="bg-white/10 text-white font-medium py-2 px-4 rounded-lg">
              Go home
            </a>
          </div>
        </div>
      </div>
    )
  }
}
