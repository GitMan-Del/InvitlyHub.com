"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, MapPin, Users, ArrowLeft, Share, Download } from "lucide-react"
import QRCodeDisplay from "@/components/events/qr-code"
import { useToast } from "@/components/ui/use-toast"

interface EventDetailsProps {
  event: any
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

export default function EventDetails({ event, attendees, responseStats, isOwner, baseUrl }: EventDetailsProps) {
  const { toast } = useToast()
  const [showQR, setShowQR] = useState(false)

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

  // Share event
  const shareEvent = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: `Join me at ${event.title}! Use code: ${event.unique_code}`,
          url: qrCodeValue,
        })
      } else {
        await navigator.clipboard.writeText(
          `Join me at ${event.title}! Use code: ${event.unique_code} or visit ${qrCodeValue}`,
        )
        toast({
          title: "Link Copied",
          description: "Event details have been copied to clipboard.",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-[#0A0A0A] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center text-white/70 hover:text-white">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={shareEvent}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md transition-colors"
            >
              <Share className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-1 bg-[#9855FF] hover:bg-[#8144E5] text-white px-3 py-1.5 rounded-md transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">QR Code</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="md:col-span-2">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h1 className="text-3xl font-bold text-white mb-4">{event.title}</h1>

              <div className="flex flex-wrap gap-y-3 gap-x-6 mb-6">
                <div className="flex items-center text-white/70">
                  <Calendar className="h-5 w-5 mr-2 text-[#9855FF]" />
                  <span>{formatDate(event.event_date)}</span>
                </div>

                <div className="flex items-center text-white/70">
                  <Clock className="h-5 w-5 mr-2 text-[#9855FF]" />
                  <span>{formatTime(event.event_date)}</span>
                </div>

                {event.location && (
                  <div className="flex items-center text-white/70">
                    <MapPin className="h-5 w-5 mr-2 text-[#9855FF]" />
                    <span>{event.location}</span>
                  </div>
                )}

                <div className="flex items-center text-white/70">
                  <Users className="h-5 w-5 mr-2 text-[#9855FF]" />
                  <span>
                    {attendees} {attendees === 1 ? "attendee" : "attendees"}
                  </span>
                </div>
              </div>

              {event.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">About this event</h3>
                  <p className="text-white/70 whitespace-pre-line">{event.description}</p>
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className="text-sm text-white/70">Hosted by:</div>
                <div className="flex items-center gap-2">
                  {event.profiles?.avatar_url ? (
                    <Image
                      src={event.profiles.avatar_url || "/placeholder.svg"}
                      alt={event.profiles.full_name || "Event Host"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9855FF] to-[#622A9A] flex items-center justify-center text-white font-medium">
                      {(event.profiles?.full_name || "H").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium">{event.profiles?.full_name || "Host"}</span>
                </div>
              </div>

              {isOwner && (
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Event Code</h3>
                  <p className="text-white/70 mb-2">Share this code with your guests:</p>
                  <div className="bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-center text-xl font-bold tracking-wider">
                    {event.unique_code}
                  </div>
                </div>
              )}

              {isOwner && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Response Stats</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-black/30 border border-white/10 rounded-lg p-3">
                      <div className="text-green-500 font-bold text-xl">{responseStats.yes}</div>
                      <div className="text-white/70 text-sm">Yes</div>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-lg p-3">
                      <div className="text-red-500 font-bold text-xl">{responseStats.no}</div>
                      <div className="text-white/70 text-sm">No</div>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-lg p-3">
                      <div className="text-yellow-500 font-bold text-xl">{responseStats.pending}</div>
                      <div className="text-white/70 text-sm">Pending</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="md:col-span-1">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Event QR Code</h3>
              <QRCodeDisplay value={qrCodeValue} eventTitle={event.title} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
