"use client"

import EventsPage from "./events-page"
import type { Event } from "@/lib/supabase/types"

interface EventsClientProps {
  events: Event[]
  baseUrl: string
}

export default function EventsClient({ events, baseUrl }: EventsClientProps) {
  return <EventsPage events={events} baseUrl={baseUrl} />
}
