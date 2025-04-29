"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, ChevronDown, ChevronUp } from "lucide-react"
import QRCodeDisplay from "./qr-code"
import type { Event } from "@/lib/supabase/db-utils"

interface EventCardProps {
  event: Event
  baseUrl: string
}

export default function EventCard({ event, baseUrl }: EventCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  // Generate QR code value (URL to event)
  const qrCodeValue = `${baseUrl}/events/${event.id}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden"
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
            <div className="flex items-center text-white/70 text-sm mb-1">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(event.event_date)}</span>
            </div>
            <div className="flex items-center text-white/70 text-sm mb-1">
              <Clock className="h-4 w-4 mr-2" />
              <span>{formatTime(event.event_date)}</span>
            </div>
            {event.location && (
              <div className="flex items-center text-white/70 text-sm">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end">
            <div className="bg-white/10 rounded-lg px-3 py-1 text-sm text-white mb-2">
              Code: <span className="font-mono font-bold">{event.unique_code}</span>
            </div>
            <Link href={`/events/${event.id}`} className="text-[#9855FF] text-sm hover:underline">
              View Details
            </Link>
          </div>
        </div>

        {event.description && (
          <div className="mt-3">
            <p className="text-white/70 text-sm line-clamp-2">{event.description}</p>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center w-full mt-4 text-white/70 hover:text-white text-sm"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide QR Code
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show QR Code
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="p-5 bg-black/30 border-t border-white/10">
          <QRCodeDisplay value={qrCodeValue} eventTitle={event.title} size={180} />
        </div>
      )}
    </motion.div>
  )
}
