"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { clearCacheItem } from "@/lib/utils/cache-utils"

/**
 * Delete an event and all associated data
 */
export async function deleteEvent(eventId: string) {
  try {
    const supabase = createClient()

    // Get the current session to verify the user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to delete events",
      }
    }

    // Verify the event exists and belongs to the user
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("user_id", session.user.id)
      .single()

    if (eventError || !event) {
      return {
        success: false,
        error: "Event not found or you don't have permission to delete this event",
      }
    }

    // Delete all invitations associated with this event
    const { error: invitationsError } = await supabase.from("invitations").delete().eq("event_id", eventId)

    if (invitationsError) {
      return {
        success: false,
        error: "Failed to delete invitations: " + invitationsError.message,
      }
    }

    // Delete all activity logs associated with this event
    const { error: activityLogsError } = await supabase.from("activity_logs").delete().eq("event_id", eventId)

    if (activityLogsError) {
      return {
        success: false,
        error: "Failed to delete activity logs: " + activityLogsError.message,
      }
    }

    // Finally, delete the event itself
    const { error: deleteError } = await supabase.from("events").delete().eq("id", eventId)

    if (deleteError) {
      return {
        success: false,
        error: "Failed to delete event: " + deleteError.message,
      }
    }

    // Log the deletion activity
    await supabase.from("activity_logs").insert({
      user_id: session.user.id,
      action: "deleted_event",
      details: { event_title: event.title },
    })

    // Clear cache for this event
    clearCacheItem(`event-stats:${eventId}`)

    // Clear analytics cache since it will be affected by this deletion
    clearCacheItem(`analytics:${session.user.id}`)

    // Revalidate paths
    revalidatePath("/dashboard")
    revalidatePath("/events")

    return {
      success: true,
      message: "Event deleted successfully",
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred while deleting the event",
    }
  }
}

/**
 * Delete multiple events at once
 */
export async function deleteMultipleEvents(eventIds: string[]) {
  try {
    const supabase = createClient()

    // Get the current session to verify the user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to delete events",
      }
    }

    // Verify all events exist and belong to the user
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, title")
      .in("id", eventIds)
      .eq("user_id", session.user.id)

    if (eventsError) {
      return {
        success: false,
        error: "Failed to verify events: " + eventsError.message,
      }
    }

    // Check if all requested events were found
    const foundEventIds = events?.map((event) => event.id) || []
    if (foundEventIds.length !== eventIds.length) {
      return {
        success: false,
        error: "Some events were not found or you don't have permission to delete them",
      }
    }

    // Delete all invitations associated with these events
    const { error: invitationsError } = await supabase.from("invitations").delete().in("event_id", eventIds)

    if (invitationsError) {
      return {
        success: false,
        error: "Failed to delete invitations: " + invitationsError.message,
      }
    }

    // Delete all activity logs associated with these events
    const { error: activityLogsError } = await supabase.from("activity_logs").delete().in("event_id", eventIds)

    if (activityLogsError) {
      return {
        success: false,
        error: "Failed to delete activity logs: " + activityLogsError.message,
      }
    }

    // Finally, delete the events themselves
    const { error: deleteError } = await supabase.from("events").delete().in("id", eventIds)

    if (deleteError) {
      return {
        success: false,
        error: "Failed to delete events: " + deleteError.message,
      }
    }

    // Log the deletion activity
    await supabase.from("activity_logs").insert({
      user_id: session.user.id,
      action: "deleted_multiple_events",
      details: { count: eventIds.length },
    })

    // Clear cache for these events
    eventIds.forEach((id) => clearCacheItem(`event-stats:${id}`))

    // Clear analytics cache
    clearCacheItem(`analytics:${session.user.id}`)

    // Revalidate paths
    revalidatePath("/dashboard")
    revalidatePath("/events")

    return {
      success: true,
      message: `${eventIds.length} events deleted successfully`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred while deleting events",
    }
  }
}
