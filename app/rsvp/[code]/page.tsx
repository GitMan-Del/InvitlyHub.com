import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import SimpleRsvpClient from "./simple-rsvp-client"

export const dynamic = "force-dynamic"

export default async function SimpleRsvpPage({ params }: { params: { code: string } }) {
  const { code } = params
  const supabase = createClient()

  // Try to find the invitation by code
  const { data: event, error } = await supabase
    .from("events")
    .select(`
      id,
      title,
      event_date,
      location,
      profiles(full_name)
    `)
    .or(`id.eq.${code},short_code.eq.${code}`)
    .single()

  if (error || !event) {
    notFound()
  }

  // Get the current session to check if the user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <SimpleRsvpClient
      event={event}
      eventCode={code}
      isLoggedIn={!!session}
      userId={session?.user?.id}
      userEmail={session?.user?.email}
    />
  )
}
