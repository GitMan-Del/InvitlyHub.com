import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Function to generate a random alphanumeric code
function generateRandomCode(length = 8) {
  // Use characters that are less likely to be confused with each other
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "You must be signed in to generate an invite code" }, { status: 401 })
    }

    const userId = session.user.id
    const { eventId } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    // Check if the user owns this event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("user_id", userId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: "You don't have permission to generate an invite code for this event" },
        { status: 403 },
      )
    }

    // Check if the event already has an invite code
    if (event.unique_code) {
      return NextResponse.json(
        {
          inviteCode: event.unique_code,
          message: "This event already has an invite code",
        },
        { status: 200 },
      )
    }

    // Generate a unique invite code
    let inviteCode
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      inviteCode = generateRandomCode()
      attempts++

      // Check if this code already exists
      const { data, error } = await supabase.from("events").select("id").eq("unique_code", inviteCode)

      if (!error && (!data || data.length === 0)) {
        isUnique = true
      }
    }

    if (!isUnique) {
      return NextResponse.json({ error: "Failed to generate a unique invite code. Please try again." }, { status: 500 })
    }

    // Update the event with the new invite code
    const { error: updateError } = await supabase.from("events").update({ unique_code: inviteCode }).eq("id", eventId)

    if (updateError) {
      console.error("Error updating event with invite code:", updateError)
      return NextResponse.json({ error: "Failed to save the invite code. Please try again." }, { status: 500 })
    }

    // Log the activity
    await supabase.from("activity_logs").insert({
      user_id: userId,
      event_id: eventId,
      action: "generated_invite_code",
      details: `Generated invite code: ${inviteCode}`,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ inviteCode })
  } catch (error) {
    console.error("Error in generate-invite-code API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
