"use client"

import { useEffect, useState } from "react"
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
  userInvitation?: any
}

export default function EventDetailsClient({
  event,
  attendees,
  responseStats,
  isOwner,
  baseUrl,
  userInvitation,
}: EventDetailsClientProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Add error boundary handling
  useEffect(() => {
    if (!event || !event.id) {
      console.error("Event data is missing or incomplete")
      setHasError(true)
      return
    }

    setIsLoaded(true)
  }, [event])

  // If event is somehow undefined or there's an error, show a fallback UI
  if (hasError || !event) {
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

  // Show loading state until component is fully loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-64 bg-gray-800 rounded animate-pulse mb-4"></div>
          <div className="h-4 w-full bg-gray-800 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse mb-6"></div>
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
      userInvitation={userInvitation}
    />
  )
}
