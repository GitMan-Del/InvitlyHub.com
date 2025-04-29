import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/database.types"

export type Tables = Database["public"]["Tables"]
export type Profile = Tables["profiles"]["Row"]
export type Event = Tables["events"]["Row"]
export type Invitation = Tables["invitations"]["Row"]
export type ActivityLog = Tables["activity_logs"]["Row"]

// Server-side functions
export async function getProfile(userId: string) {
  const supabase = createClient()

  // First, try to get the existing profile
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle() // Use maybeSingle instead of single to handle no rows case

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  // If profile doesn't exist, create a new one
  if (!data) {
    // Get user session to access user metadata
    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user

    // Create a new profile
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name: user?.user_metadata?.full_name || null,
        avatar_url: user?.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating profile:", insertError)
      return null
    }

    return newProfile as Profile
  }

  return data as Profile
}

export async function getUserEvents(userId: string) {
  const supabase = createClient()
  const now = new Date().toISOString()

  // Get upcoming events
  const { data: upcomingEvents, error: upcomingError } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .gte("event_date", now)
    .order("event_date", { ascending: true })

  // Get past events
  const { data: pastEvents, error: pastError } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .lt("event_date", now)
    .order("event_date", { ascending: false })

  if (upcomingError || pastError) {
    console.error("Error fetching events:", upcomingError || pastError)
    return { upcoming: [], past: [], total: 0 }
  }

  return {
    upcoming: (upcomingEvents as Event[]) || [],
    past: (pastEvents as Event[]) || [],
    total: (upcomingEvents?.length || 0) + (pastEvents?.length || 0),
  }
}

export async function getEventResponseStats(userId: string) {
  const supabase = createClient()

  // Get all events for this user
  const { data: events, error: eventsError } = await supabase.from("events").select("id").eq("user_id", userId)

  if (eventsError || !events?.length) {
    return { yes: 0, no: 0, pending: 0, total: 0 }
  }

  const eventIds = events.map((event) => event.id)

  // Get invitation stats
  const { data: invitations, error: invitationsError } = await supabase
    .from("invitations")
    .select("status")
    .in("event_id", eventIds)

  if (invitationsError) {
    console.error("Error fetching invitations:", invitationsError)
    return { yes: 0, no: 0, pending: 0, total: 0 }
  }

  const total = invitations.length
  const yes = invitations.filter((inv) => inv.status === "yes").length
  const no = invitations.filter((inv) => inv.status === "no").length
  const pending = invitations.filter((inv) => inv.status === "pending").length

  // Calculate percentages
  const yesPercent = total > 0 ? Math.round((yes / total) * 100) : 0
  const noPercent = total > 0 ? Math.round((no / total) * 100) : 0

  return {
    yes: yesPercent,
    no: noPercent,
    pending,
    total,
  }
}

export async function getRecentActivity(userId: string, limit = 4) {
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

  if (error) {
    console.error("Error fetching activity logs:", error)
    return []
  }

  return data || []
}
