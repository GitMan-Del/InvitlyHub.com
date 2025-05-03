import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import EventDetailsClient from "./event-details-client"

// Loading component for Suspense
function EventPageLoading() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="h-8 w-64 bg-gray-800 rounded animate-pulse mb-4"></div>
        <div className="h-4 w-full bg-gray-800 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-800 rounded animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-8 w-full bg-gray-800 rounded animate-pulse"></div>
            <div className="h-24 w-full bg-gray-800 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Error component
function EventNotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
        <p className="mb-6 text-gray-400">
          The event you're looking for doesn't exist or has been removed. It might have been deleted or you may have
          mistyped the URL.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/dashboard"
            className="bg-[#9855FF] hover:bg-[#8144E5] text-white px-6 py-3 rounded-md transition-colors inline-block"
          >
            Go to Dashboard
          </a>
          <a
            href="/events"
            className="border border-[#9855FF] text-[#9855FF] hover:bg-[#9855FF] hover:bg-opacity-10 px-6 py-3 rounded-md transition-colors inline-block"
          >
            View All Events
          </a>
        </div>
      </div>
    </div>
  )
}

export default async function EventPage({ params }: { params: { id: string } }) {
  if (!params.id) {
    console.error("Event ID is missing from params")
    return <EventNotFound />
  }

  try {
    const supabase = createClient()

    // Get event details - without trying to join with profiles
    const { data: event, error } = await supabase.from("events").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching event:", error.message)
      return <EventNotFound />
    }

    if (!event) {
      console.error("Event not found with ID:", params.id)
      return <EventNotFound />
    }

    // Separately fetch the profile data for the event creator
    // Remove .single() to handle the case where no profile exists
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", event.user_id)

    if (profileError) {
      console.error("Error fetching profile:", profileError.message)
      // Continue without profile data
    }

    // Get the first profile if it exists, otherwise use default values
    const profile = profiles && profiles.length > 0 ? profiles[0] : { full_name: null, avatar_url: null }

    // Get attendees count
    const { count, error: countError } = await supabase
      .from("invitations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", params.id)

    if (countError) {
      console.error("Error fetching attendees count:", countError.message)
    }

    // Get response stats
    const { data: responseStats, error: statsError } = await supabase
      .from("invitations")
      .select("status")
      .eq("event_id", params.id)

    if (statsError) {
      console.error("Error fetching response stats:", statsError.message)
    }

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
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    // Combine event and profile data
    const eventWithProfile = {
      ...event,
      profiles: profile,
    }

    return (
      <Suspense fallback={<EventPageLoading />}>
        <EventDetailsClient
          event={eventWithProfile}
          attendees={attendees}
          responseStats={{ yes, no, maybe, pending, total: responses.length }}
          isOwner={isOwner}
          baseUrl={baseUrl}
        />
      </Suspense>
    )
  } catch (error) {
    console.error("Unexpected error in event page:", error)
    return <EventNotFound />
  }
}
