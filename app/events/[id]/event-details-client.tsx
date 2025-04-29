"use client"

import EventDetails from "./event-details"
import type { Event } from "@/lib/supabase/types"

interface EventDetailsClientProps {
  event: Event & { profiles?: { full_name: string | null; avatar_url: string | null } }
  attendees: number
  responseStats: {
    yes: number
    no: number
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
