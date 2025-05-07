import { createClient, createAdminClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/database.types"

export type Tables = Database["public"]["Tables"]
export type Profile = Tables["profiles"]["Row"]
export type Event = Tables["events"]["Row"]
export type Invitation = Tables["invitations"]["Row"]
export type ActivityLog = Tables["activity_logs"]["Row"]

// Server-side functions
export async function getProfile(userId: string) {
  try {
    const supabase = createClient()
    const adminClient = createAdminClient()

    // First, try to get the existing profile with the admin client
    // This bypasses RLS and ensures we can see if the profile exists
    const { data: adminData, error: adminError } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (adminError) {
      console.error("Error fetching profile with admin client:", adminError)
    } else if (adminData) {
      // Profile exists, return it
      console.log("Profile found with admin client")
      return adminData as Profile
    }

    // If admin client didn't find the profile, try with regular client
    const { data: regularData, error: regularError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (regularError) {
      console.error("Error fetching profile with regular client:", regularError)
    } else if (regularData) {
      // Profile exists, return it
      console.log("Profile found with regular client")
      return regularData as Profile
    }

    // If we get here, the profile doesn't exist in the database
    // Try to create a new profile, but first double-check it doesn't exist
    try {
      // Get user session to access user metadata
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      // One more check with admin client to make absolutely sure the profile doesn't exist
      const { data: finalCheck } = await adminClient.from("profiles").select("id").eq("id", userId).maybeSingle()

      if (finalCheck) {
        console.log("Profile found in final check, returning it")
        // Profile exists after all, fetch the full profile
        const { data: existingProfile } = await adminClient.from("profiles").select("*").eq("id", userId).single()

        return existingProfile as Profile
      }

      console.log("Creating new profile for user:", userId)

      // Create the profile with admin client
      const { data: newProfile, error: insertError } = await adminClient
        .from("profiles")
        .insert({
          id: userId,
          full_name: user?.user_metadata?.full_name || "User",
          avatar_url: user?.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        // If the error is a duplicate key error, the profile was created by another request
        if (insertError.code === "23505") {
          // PostgreSQL duplicate key error code
          console.log("Profile was created by another request, fetching it")
          const { data: existingProfile } = await adminClient.from("profiles").select("*").eq("id", userId).single()

          return existingProfile as Profile
        }

        console.error("Error creating profile:", insertError)
        return createFallbackProfile(userId)
      }

      return newProfile as Profile
    } catch (createError) {
      console.error("Exception creating profile:", createError)
      return createFallbackProfile(userId)
    }
  } catch (error) {
    console.error("Unexpected error in getProfile:", error)
    return createFallbackProfile(userId)
  }
}

// Create a fallback profile when database operations fail
function createFallbackProfile(userId: string): Profile {
  console.log("Creating fallback profile for user:", userId)
  return {
    id: userId,
    full_name: "User",
    avatar_url: null,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  } as Profile
}

export async function getUserEvents(userId: string) {
  try {
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

    if (upcomingError) {
      console.error("Error fetching upcoming events:", upcomingError)
    }

    if (pastError) {
      console.error("Error fetching past events:", pastError)
    }

    return {
      upcoming: (upcomingEvents as Event[]) || [],
      past: (pastEvents as Event[]) || [],
      total: (upcomingEvents?.length || 0) + (pastEvents?.length || 0),
    }
  } catch (error) {
    console.error("Unexpected error in getUserEvents:", error)
    return { upcoming: [], past: [], total: 0 }
  }
}

export async function getEventResponseStats(userId: string) {
  try {
    const supabase = createClient()

    // Get all events for this user
    const { data: events, error: eventsError } = await supabase.from("events").select("id").eq("user_id", userId)

    if (eventsError) {
      console.error("Error fetching events:", eventsError)
      return { yes: 0, no: 0, pending: 0, total: 0 }
    }

    if (!events?.length) {
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
  } catch (error) {
    console.error("Unexpected error in getEventResponseStats:", error)
    return { yes: 0, no: 0, pending: 0, total: 0 }
  }
}

export async function getRecentActivity(userId: string, limit = 4) {
  try {
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
  } catch (error) {
    console.error("Unexpected error in getRecentActivity:", error)
    return []
  }
}
