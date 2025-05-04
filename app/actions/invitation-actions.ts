"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { generateShortCode } from "@/lib/utils/invitation-utils"

export async function respondToInvitation(invitationId: string, response: "yes" | "no" | "maybe", formData?: FormData) {
  try {
    const supabase = createClient()

    // Get the current session to verify the user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to respond to invitations",
      }
    }

    // Get the invitation to verify it exists
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select("*, events(*)")
      .eq("id", invitationId)
      .single()

    if (invitationError || !invitation) {
      return {
        success: false,
        error: "Invitation not found",
      }
    }

    // Update the invitation status
    const { error: updateError } = await supabase
      .from("invitations")
      .update({
        status: response,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invitationId)

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      }
    }

    // Log the activity
    await supabase.from("activity_logs").insert({
      user_id: session.user.id,
      event_id: invitation.event_id,
      action: `responded_${response}`,
      details: { invitation_id: invitationId },
    })

    // Revalidate the paths
    revalidatePath(`/invitations/${invitationId}`)
    revalidatePath(`/invites/${invitation.short_code || invitationId}`)
    revalidatePath(`/events/${invitation.event_id}`)
    revalidatePath("/dashboard")

    return {
      success: true,
      message: `You have ${response === "yes" ? "accepted" : response === "no" ? "declined" : "tentatively accepted"} the invitation.`,
      eventId: invitation.event_id,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred while responding to the invitation",
    }
  }
}

export async function createInvitation(eventId: string, email: string, name?: string) {
  try {
    const supabase = createClient()

    // Get the current session to verify the user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        success: false,
        error: "You must be logged in to create invitations",
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
        error: "Event not found or you don't have permission to invite to this event",
      }
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from("invitations")
      .select("id")
      .eq("event_id", eventId)
      .eq("email", email)
      .maybeSingle()

    if (existingInvitation) {
      return {
        success: false,
        error: "This email has already been invited to this event",
      }
    }

    // Generate a short code for the invitation
    const shortCode = generateShortCode()

    // Create the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .insert({
        event_id: eventId,
        email,
        name,
        status: "pending",
        short_code: shortCode,
      })
      .select()
      .single()

    if (invitationError) {
      return {
        success: false,
        error: invitationError.message,
      }
    }

    // Log the activity
    await supabase.from("activity_logs").insert({
      user_id: session.user.id,
      event_id: eventId,
      action: "created_invitation",
      details: { invitation_id: invitation.id, email },
    })

    // Revalidate the paths
    revalidatePath(`/events/${eventId}`)
    revalidatePath("/dashboard")

    return {
      success: true,
      message: `Invitation sent to ${email}`,
      invitationId: invitation.id,
      shortCode: shortCode,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred while creating the invitation",
    }
  }
}

// Add this new function to resend an invitation
export async function resendInvitation(invitationId: string) {
  const supabase = createClient()

  // Get the invitation details
  const { data: invitation, error: invitationError } = await supabase
    .from("invitations")
    .select("*, events(*)")
    .eq("id", invitationId)
    .single()

  if (invitationError || !invitation) {
    console.error("Error fetching invitation:", invitationError)
    throw new Error("Failed to fetch invitation")
  }

  // Update the invitation with a new timestamp
  const { error: updateError } = await supabase
    .from("invitations")
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq("id", invitationId)

  if (updateError) {
    console.error("Error updating invitation:", updateError)
    throw new Error("Failed to update invitation")
  }

  // Log the activity
  const { error: logError } = await supabase.from("activity_logs").insert({
    user_id: invitation.events.user_id,
    event_id: invitation.event_id,
    action: "resend_invitation",
    details: `Resent invitation to ${invitation.email}`,
  })

  if (logError) {
    console.error("Error logging activity:", logError)
    // Non-critical error, continue
  }

  // In a real application, you would send an email here
  // For now, we'll just return success

  revalidatePath(`/events/${invitation.event_id}/guests`)
  return { success: true }
}
