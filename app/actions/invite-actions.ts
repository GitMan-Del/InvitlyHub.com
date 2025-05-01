"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function respondToInvite(inviteCode: string, response: "yes" | "no" | "maybe") {
  try {
    const supabase = createClient()

    // Get the current session to verify the user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        success: false,
        error: "Authentication required",
        requiresAuth: true,
      }
    }

    // Get the invitation to verify it exists
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select("*, events(*)")
      .eq("id", inviteCode)
      .single()

    // If not found by ID, try short code
    let foundInvitation = invitation
    if (invitationError || !invitation) {
      const { data: invitationByShortCode, error: shortCodeError } = await supabase
        .from("invitations")
        .select("*, events(*)")
        .eq("short_code", inviteCode)
        .single()

      if (shortCodeError || !invitationByShortCode) {
        return {
          success: false,
          error: "Invalid invitation code",
        }
      }

      foundInvitation = invitationByShortCode
    }

    // Check if the user's email matches the invitation email
    if (session.user.email.toLowerCase() !== foundInvitation.email.toLowerCase()) {
      return {
        success: false,
        error: "This invitation was sent to a different email address",
        wrongEmail: true,
        invitationEmail: foundInvitation.email,
      }
    }

    // Update the invitation status
    const { error: updateError } = await supabase
      .from("invitations")
      .update({
        status: response,
        updated_at: new Date().toISOString(),
      })
      .eq("id", foundInvitation.id)

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      }
    }

    // Log the activity
    await supabase.from("activity_logs").insert({
      user_id: session.user.id,
      event_id: foundInvitation.event_id,
      action: `responded_${response}`,
      details: { invitation_id: foundInvitation.id },
    })

    // Revalidate the paths
    revalidatePath(`/invites/${inviteCode}`)
    revalidatePath(`/events/${foundInvitation.event_id}`)
    revalidatePath("/dashboard")

    return {
      success: true,
      message: `You have ${response === "yes" ? "accepted" : response === "no" ? "declined" : "tentatively accepted"} the invitation.`,
      eventId: foundInvitation.event_id,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred while responding to the invitation",
    }
  }
}
