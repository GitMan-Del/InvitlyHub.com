import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import EventDetailsClient from "./event-details-client"

export default async function EventPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Get event details
  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      profiles(full_name, avatar_url)
    `)
    .eq("id", params.id)
    .single()

  if (error || !event) {
    console.error("Event not found:", error)
    notFound()
  }

  // Get attendees count
  const { count } = await supabase
    .from("invitations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", params.id)

  // Get response stats
  const { data: responseStats } = await supabase.from("invitations").select("status").eq("event_id", params.id)

  const attendees = count || 0
  const responses = responseStats || []

  const yes = responses.filter((r) => r.status === "yes").length
  const no = responses.filter((r) => r.status === "no").length
  const maybe = responses.filter((r) => r.status === "maybe").length
  const pending = responses.filter((r) => r.status === "pending").length

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isOwner = session?.user.id === event.user_id

  // Get base URL for QR code
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

  return (
    <EventDetailsClient
      event={event}
      attendees={attendees}
      responseStats={{ yes, no, maybe, pending, total: responses.length }}
      isOwner={isOwner}
      baseUrl={baseUrl}
    />
  )
}
