import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "./dashboard-client"

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

  // Fetch user profile data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle()

  // Get events data
  const now = new Date().toISOString()

  // Get upcoming events
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", session.user.id)
    .gte("event_date", now)
    .order("event_date", { ascending: true })

  // Get past events
  const { data: pastEvents } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", session.user.id)
    .lt("event_date", now)
    .order("event_date", { ascending: false })

  // Get all events for this user
  const { data: events } = await supabase.from("events").select("id").eq("user_id", session.user.id)

  const eventIds = events?.map((event) => event.id) || []

  // Get invitation stats
  const { data: invitations } = await supabase
    .from("invitations")
    .select("status")
    .in("event_id", eventIds.length > 0 ? eventIds : ["no-events"])

  const total = invitations?.length || 0
  const yes = invitations?.filter((inv) => inv.status === "yes").length || 0
  const no = invitations?.filter((inv) => inv.status === "no").length || 0
  const pending = invitations?.filter((inv) => inv.status === "pending").length || 0

  // Calculate percentages
  const yesPercent = total > 0 ? Math.round((yes / total) * 100) : 0
  const noPercent = total > 0 ? Math.round((no / total) * 100) : 0

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from("activity_logs")
    .select(`
      *,
      events(title)
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(4)

  // Get analytics data (mock data for now)
  const analyticsData = {
    views: 1245,
    responses: total,
    engagement: total > 0 ? Math.round((yes / total) * 100) : 0,
    growth: 23,
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
    <DashboardClient
      user={session.user}
      profile={profile || null}
      events={eventsData}
      responseStats={responseStats}
      analyticsData={analyticsData}
      recentActivity={recentActivity || []}
    />
  )
}
