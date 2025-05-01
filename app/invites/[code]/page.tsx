import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import InviteResponsePage from "./invite-response-page"

export default async function InvitePage({ params }: { params: { code: string } }) {
  const supabase = createClient()
  const { code } = params

  // Check if the invitation code is valid
  let { data: invitation, error } = await supabase
    .from("invitations")
    .select(`
      *,
      events(
        *,
        profiles(full_name, avatar_url)
      )
    `)
    .eq("id", code)
    .single()

  // If invitation not found, try looking up by a short code
  if (error || !invitation) {
    // Try to find the invitation by a short code if it exists
    const { data: invitationByShortCode, error: shortCodeError } = await supabase
      .from("invitations")
      .select(`
        *,
        events(
          *,
          profiles(full_name, avatar_url)
        )
      `)
      .eq("short_code", code)
      .single()

    if (shortCodeError || !invitationByShortCode) {
      notFound()
    }

    if (invitationByShortCode) {
      invitation = invitationByShortCode
    }
  }

  // Get the current session to check if the user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the logged-in user matches the invitation email
  const isInvitedUser = session?.user?.email?.toLowerCase() === invitation.email.toLowerCase()

  // Get base URL for sharing
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

  return (
    <InviteResponsePage
      invitation={invitation}
      event={invitation.events}
      isLoggedIn={!!session}
      userEmail={session?.user?.email || null}
      isInvitedUser={isInvitedUser}
      baseUrl={baseUrl}
    />
  )
}
