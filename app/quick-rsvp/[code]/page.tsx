import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import QuickRsvpClient from "./quick-rsvp-client"

export const dynamic = "force-dynamic"

export default async function QuickRsvpPage({ params }: { params: { code: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, redirect to sign in
  if (!session) {
    // Store the invitation code in a cookie so we can redirect back after sign in
    cookies().set("invitation_code", params.code, {
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      httpOnly: true,
      sameSite: "lax",
    })

    return redirect(`/auth/signin?redirect=/quick-rsvp/${params.code}`)
  }

  // Get the event details
  const { data: event } = await supabase
    .from("events")
    .select("*, profiles(*)")
    .or(`id.eq.${params.code},short_code.eq.${params.code}`)
    .single()

  if (!event) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
          <p className="text-gray-400">The event you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  // Get the user's invitation if it exists
  const { data: invitation } = await supabase
    .from("invitations")
    .select("*")
    .eq("event_id", event.id)
    .eq("user_id", session.user.id)
    .single()

  // If no invitation exists, create one
  let userInvitation = invitation
  if (!invitation) {
    const { data: newInvitation, error } = await supabase
      .from("invitations")
      .insert({
        event_id: event.id,
        user_id: session.user.id,
        status: "pending",
        email: session.user.email,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating invitation:", error)
    } else {
      userInvitation = newInvitation
    }
  }

  return <QuickRsvpClient event={event} invitation={userInvitation} />
}
