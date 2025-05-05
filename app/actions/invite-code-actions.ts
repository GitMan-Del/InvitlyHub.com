"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { generateInviteCode } from "@/lib/utils/invite-code-utils"

/**
 * Generates a new invite code for an event
 */
export async function generateEventInviteCode(eventId: string) {
  try {
    const supabase = createClient()

    // Get the current session to verify the user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to generate an invite code",
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
        error: "Event not found or you don't have permission to modify this event",
      }
    }

    // Generate a unique invite code
    const inviteCode = generateInviteCode()

    // Update the event with the new invite code
    const { error: updateError } = await supabase.from("events").update({ unique_code: inviteCode }).eq("id", eventId)

    if (updateError) {
      return {
        success: false,
        error: "Failed to update event with invite code",
      }
    }

    // Log the activity
    await supabase.from("activity_logs").insert({
      user_id: session.user.id,
      event_id: eventId,
      action: "generated_invite_code",
      details: { invite_code: inviteCode },
    })

    // Revalidate paths
    revalidatePath(`/events/${eventId}`)
    revalidatePath("/events")

    return {
      success: true,
      inviteCode,
      message: "Invite code generated successfully",
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred while generating the invite code",
    }
  }
}

/**
 * Joins an event using an invite code
 */
export async function joinEventWithInviteCode(inviteCode: string) {
  try {
    const supabase = createClient()

    // Get the current session to verify the user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to join an event",
      }
    }

    // Find the event with this invite code
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("unique_code", inviteCode)
      .single()

    if (eventError || !event) {
      return {
        success: false,
        error: "Invalid invite code. The event may not exist or the code is incorrect.",
      }
    }

    // Check if the user is the event owner
    if (event.user_id === session.user.id) {
      return {
        success: false,
        error: "You are the owner of this event and cannot join it as a guest.",
      }
    }

    // Check if the user is already invited to this event
    const { data: existingInvitation, error: invitationError } = await supabase
      .from("invitations")
      .select("*")
      .eq("event_id", event.id)
      .eq("email", session.user.email)
      .maybeSingle()

    if (existingInvitation) {
      // User is already invited, update their status to "yes"
      const { error: updateError } = await supabase
        .from("invitations")
        .update({ status: "yes", updated_at: new Date().toISOString() })
        .eq("id", existingInvitation.id)

      if (updateError) {
        return {
          success: false,
          error: "Failed to update your invitation status",
        }
      }

      // Log the activity
      await supabase.from("activity_logs").insert({
        user_id: session.user.id,
        event_id: event.id,
        action: "joined_with_invite_code",
        details: { invite_code: inviteCode, status: "updated_existing" },
      })

      // Revalidate paths
      revalidatePath(`/events/${event.id}`)
      revalidatePath("/events")

      return {
        success: true,
        event,
        message: "You have successfully joined the event!",
        status: "updated",
      }
    }

    // Create a new invitation for the user
    const { error: createError } = await supabase.from("invitations").insert({
      event_id: event.id,
      email: session.user.email,
      name: session.user.user_metadata?.full_name || null,
      status: "yes",
    })

    if (createError) {
      return {
        success: false,
        error: "Failed to add you to the event",
      }
    }

    // Log the activity
    await supabase.from("activity_logs").insert({
      user_id: session.user.id,
      event_id: event.id,
      action: "joined_with_invite_code",
      details: { invite_code: inviteCode, status: "new_invitation" },
    })

    // Revalidate paths
    revalidatePath(`/events/${event.id}`)
    revalidatePath("/events")

    return {
      success: true,
      event,
      message: "You have successfully joined the event!",
      status: "created",
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred while joining the event",
    }
  }
}
