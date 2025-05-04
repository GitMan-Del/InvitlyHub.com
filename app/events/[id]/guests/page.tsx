import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import GuestListClient from "./guest-list-client"

export const dynamic = "force-dynamic"

export default async function GuestListPage({ params }: { params: { id: string } }) {
  const { id } = params
  const supabase = createClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin")
  }

  // Get the event
  const { data: event } = await supabase.from("events").select("*, profiles(*)").eq("id", id).single()

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

  // Check if user is the event owner
  if (event.user_id !== session.user.id) {
    redirect(`/events/${id}`)
  }

  // Get all invitations for this event
  const { data: guests } = await supabase
    .from("invitations")
    .select("*, profiles(*)")
    .eq("event_id", id)
    .order("created_at", { ascending: false })

  return <GuestListClient event={event} guests={guests || []} />
}
