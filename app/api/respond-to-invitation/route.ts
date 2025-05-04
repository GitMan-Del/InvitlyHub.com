import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { invitationId, response } = await request.json()

    // Validate response type
    if (!["yes", "no", "maybe"].includes(response)) {
      return NextResponse.json({ success: false, error: "Invalid response type" }, { status: 400 })
    }

    const supabase = createClient()

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          requiresAuth: true,
        },
        { status: 401 },
      )
    }

    // Get the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select("*, events(*)")
      .eq("id", invitationId)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json({ success: false, error: "Invitation not found" }, { status: 404 })
    }

    // Check if the user's email matches the invitation email
    if (session.user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          error: "This invitation was sent to a different email address",
          wrongEmail: true,
          invitationEmail: invitation.email,
        },
        { status: 403 },
      )
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
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    // Log the activity
    await supabase.from("activity_logs").insert({
      user_id: session.user.id,
      event_id: invitation.event_id,
      action: `responded_${response}`,
      details: { invitation_id: invitationId },
    })

    return NextResponse.json({
      success: true,
      message: `You have ${response === "yes" ? "accepted" : response === "no" ? "declined" : "tentatively accepted"} the invitation.`,
      eventId: invitation.event_id,
    })
  } catch (error: any) {
    console.error("Error responding to invitation:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An error occurred while processing your response",
      },
      { status: 500 },
    )
  }
}
