import Link from "next/link"
import { format } from "date-fns"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import EnhancedQRCode from "@/components/events/enhanced-qr-code"

interface EventDetailsProps {
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

export default function EventDetails({ event, attendees, responseStats, isOwner, baseUrl }: EventDetailsProps) {
  // Format the event date
  const eventDate = event.event_date ? new Date(event.event_date) : new Date()
  const formattedDate = format(eventDate, "EEEE, MMMM d, yyyy")
  const formattedTime = format(eventDate, "h:mm a")

  // Create the invitation URL
  const inviteUrl = `${baseUrl}/invites/${event.invite_code}`

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/events"
            className="text-[#9855FF] hover:text-[#8144E5] flex items-center gap-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Events
          </Link>
        </div>

        {/* Event Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
          <p className="text-gray-400 text-lg">{event.description}</p>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Date & Time */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="text-[#9855FF]" size={20} />
                Date & Time
              </h2>
              <div className="ml-7">
                <p className="text-lg">{formattedDate}</p>
                <p className="text-gray-400 flex items-center gap-2 mt-2">
                  <Clock size={16} />
                  {formattedTime}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="text-[#9855FF]" size={20} />
                Location
              </h2>
              <div className="ml-7">
                <p className="text-lg">{event.location || "No location specified"}</p>
                {event.location_details && <p className="text-gray-400 mt-2">{event.location_details}</p>}
              </div>
            </div>

            {/* Attendees */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="text-[#9855FF]" size={20} />
                Attendees ({attendees})
              </h2>
              <div className="ml-7">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>
                      Going: {responseStats.yes} (
                      {responseStats.total > 0 ? Math.round((responseStats.yes / responseStats.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>
                      Not Going: {responseStats.no} (
                      {responseStats.total > 0 ? Math.round((responseStats.no / responseStats.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>
                      Maybe: {responseStats.maybe} (
                      {responseStats.total > 0 ? Math.round((responseStats.maybe / responseStats.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span>
                      Pending: {responseStats.pending} (
                      {responseStats.total > 0 ? Math.round((responseStats.pending / responseStats.total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code */}
          <div>
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Invitation QR Code</h2>
              <div className="bg-white p-4 rounded-lg flex justify-center">
                <EnhancedQRCode value={inviteUrl} size={200} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400 mb-2">Share this QR code with your guests</p>
                <div className="flex justify-center">
                  <a
                    href={inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9855FF] hover:text-[#8144E5] text-sm underline"
                  >
                    View Invitation Page
                  </a>
                </div>
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="mt-6 bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Event Management</h2>
                <div className="space-y-3">
                  <Link
                    href={`/events/${event.id}/edit`}
                    className="w-full bg-[#9855FF] hover:bg-[#8144E5] text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                    Edit Event
                  </Link>
                  <Link
                    href={`/events/${event.id}/invitations`}
                    className="w-full border border-[#9855FF] text-[#9855FF] hover:bg-[#9855FF] hover:bg-opacity-10 py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    Manage Invitations
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
