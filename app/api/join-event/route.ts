import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "You must be signed in to join an event" }, { status: 401 })
    }

    const userId = session.user.id
    const { inviteCode } = await request.json()

    if (!inviteCode) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 })
    }

    // Find the event with this invite code
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("unique_code", inviteCode)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: "Invalid invite code. Please check and try again." }, { status: 404 })
    }

    // Check if the user is the event owner
    if (event.user_id === userId) {
      return NextResponse.json({ error: "You cannot join your own event as a guest" }, { status: 400 })
    }

    // Check if the user is already invited to this event
    const { data: existingInvitation, error: invitationError } = await supabase
      .from("invitations")
      .select("*")
      .eq("event_id", event.id)
      .eq("email", session.user.email)
      .maybeSingle()

    if (existingInvitation) {
      return NextResponse.json(
        {
          message: "You're already invited to this event",
          eventId: event.id,
        },
        { status: 200 },
      )
    }

    // Create a new invitation for this user
    const { data: invitation, error: createError } = await supabase
      .from("invitations")
      .insert({
        event_id: event.id,
        email: session.user.email,
        name: session.user.user_metadata?.full_name || session.user.email,
        status: "yes", // Auto-accept the invitation
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating invitation:", createError)
      return NextResponse.json({ error: "Failed to join the event. Please try again." }, { status: 500 })
    }

    // Log the activity
    await supabase.from("activity_logs").insert({
      user_id: userId,
      event_id: event.id,
      action: "joined_event",
      details: `Joined event via invite code`,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      message: "You've successfully joined the event!",
      eventId: event.id,
    })
  } catch (error) {
    console.error("Error in join-event API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
