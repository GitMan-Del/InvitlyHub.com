"use client"

import { useEffect } from "react"
import EventDetails from "./event-details"

interface EventDetailsClientProps {
  event: any
  attendees: number
  responseStats: {
    yes: number
    no: number
    maybe: number
    pending: number
    total: number
  }
  isOwner: boolean
  baseUrl: string
}

export default function EventDetailsClient({
  event,
  attendees,
  responseStats,
  isOwner,
  baseUrl,
}: EventDetailsClientProps) {
  // Add error boundary handling
  useEffect(() => {
    if (!event || !event.id) {
      console.error("Event data is missing or incomplete")
    }
  }, [event])

  // If event is somehow undefined, show a fallback UI
  if (!event) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <a
            href="/dashboard"
            className="bg-[#9855FF] hover:bg-[#8144E5] text-white px-4 py-2 rounded-md transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <EventDetails
      event={event}
      attendees={attendees}
      responseStats={responseStats}
      isOwner={isOwner}
      baseUrl={baseUrl}
    />
  )
}
