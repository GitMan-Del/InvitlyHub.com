import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import InvitationResponseClient from "./invitation-response-client"

export default async function InvitationResponsePage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { event?: string }
}) {
  const supabase = createClient()

  // Get the invitation details
  const { data: invitation, error } = await supabase
    .from("invitations")
    .select(`
      *,
      events(
        *,
        profiles(full_name, avatar_url)
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !invitation) {
    notFound()
  }

  // Check if the event ID in the URL matches the invitation's event ID
  if (searchParams.event && searchParams.event !== invitation.event_id) {
    redirect(`/invitations/${params.id}?event=${invitation.event_id}`)
  }

  // Get the current session to check if the user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get base URL for QR code
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

  return (
    <InvitationResponseClient
      invitation={invitation}
      event={invitation.events}
      isLoggedIn={!!session}
      userEmail={session?.user?.email || null}
      baseUrl={baseUrl}
    />
  )
}
