import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import EventsClient from "./events-client"

export default async function EventsPage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // If not authenticated, redirect to sign in page
    redirect("/auth/signin")
  }

  // Get all events for this user
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", session.user.id)
    .order("event_date", { ascending: true })

  // Get base URL for QR code
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

  return <EventsClient events={events || []} baseUrl={baseUrl} />
}
