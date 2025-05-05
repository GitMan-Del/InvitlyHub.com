"use client"

import { format } from "date-fns"
import { Calendar, Clock, MapPin, Share2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { respondToInvitation } from "@/app/actions/invitation-actions"
import InviteCodeShare from "@/components/events/invite-code-share"

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
  userInvitation?: any
}

export default function EventDetails({
  event,
  attendees,
  responseStats,
  isOwner,
  baseUrl,
  userInvitation,
}: EventDetailsProps) {
  // Format the event date
  const eventDate = new Date(event.event_date)
  const formattedDate = format(eventDate, "EEEE, MMMM d, yyyy")
  const formattedTime = format(eventDate, "h:mm a")

  // Generate invitation URL for sharing
  const invitationUrl = `${baseUrl}/invites/${event.short_code || event.id}`

  // Function to copy invitation link
  const copyInvitationLink = () => {
    navigator.clipboard.writeText(invitationUrl)
    alert("Invitation link copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{event.title}</h1>
          <p className="text-gray-400">Created by {event.profiles?.full_name || "Anonymous"}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event details - 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 mr-3 text-[#9855FF] mt-0.5" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-gray-400">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="w-5 h-5 mr-3 text-[#9855FF] mt-0.5" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-gray-400">{formattedTime}</p>
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-3 text-[#9855FF] mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-400">{event.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start">
                  <Users className="w-5 h-5 mr-3 text-[#9855FF] mt-0.5" />
                  <div>
                    <p className="font-medium">Attendees</p>
                    <p className="text-gray-400">{attendees} invited</p>
                  </div>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-gray-400 whitespace-pre-line">{event.description}</p>
              </div>
            )}

            {/* Response stats for event owner */}
            {isOwner && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Response Statistics</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-500">{responseStats.yes}</p>
                    <p className="text-sm text-gray-400">Accepted</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-500">{responseStats.no}</p>
                    <p className="text-sm text-gray-400">Declined</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-yellow-500">{responseStats.maybe}</p>
                    <p className="text-sm text-gray-400">Maybe</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-500">{responseStats.pending}</p>
                    <p className="text-sm text-gray-400">Pending</p>
                  </div>
                </div>
              </div>
            )}

            {/* Invitation response section for invitees */}
            {!isOwner && userInvitation && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Your Response</h2>
                <div className="flex flex-wrap gap-3">
                  <form
                    action={async () => {
                      await respondToInvitation(userInvitation.id, "yes")
                    }}
                  >
                    <Button
                      type="submit"
                      variant={userInvitation.status === "yes" ? "default" : "outline"}
                      className={`min-w-[100px] ${userInvitation.status === "yes" ? "" : "hover:bg-green-500/10 hover:text-green-500 hover:border-green-500"}`}
                    >
                      Accept
                    </Button>
                  </form>

                  <form
                    action={async () => {
                      await respondToInvitation(userInvitation.id, "maybe")
                    }}
                  >
                    <Button
                      type="submit"
                      variant={userInvitation.status === "maybe" ? "default" : "outline"}
                      className={`min-w-[100px] ${userInvitation.status === "maybe" ? "" : "hover:bg-yellow-500/10 hover:text-yellow-500 hover:border-yellow-500"}`}
                    >
                      Maybe
                    </Button>
                  </form>

                  <form
                    action={async () => {
                      await respondToInvitation(userInvitation.id, "no")
                    }}
                  >
                    <Button
                      type="submit"
                      variant={userInvitation.status === "no" ? "default" : "outline"}
                      className={`min-w-[100px] ${userInvitation.status === "no" ? "" : "hover:bg-red-500/10 hover:text-red-500 hover:border-red-500"}`}
                    >
                      Decline
                    </Button>
                  </form>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  Current status:
                  <span
                    className={`ml-2 font-medium ${
                      userInvitation.status === "yes"
                        ? "text-green-500"
                        : userInvitation.status === "no"
                          ? "text-red-500"
                          : userInvitation.status === "maybe"
                            ? "text-yellow-500"
                            : "text-blue-500"
                    }`}
                  >
                    {userInvitation.status === "yes"
                      ? "Accepted"
                      : userInvitation.status === "no"
                        ? "Declined"
                        : userInvitation.status === "maybe"
                          ? "Maybe"
                          : "Pending"}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Sharing panel - 1/3 width on desktop */}
          <div className="space-y-6">
            {/* Invite code section for event owners */}
            {isOwner && (
              <InviteCodeShare eventId={event.id} eventTitle={event.title} initialInviteCode={event.unique_code} />
            )}

            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Share Event</h2>
              <p className="text-sm text-gray-400 mb-4">Share this event with your friends and family:</p>
              <div className="space-y-3">
                <Button
                  onClick={copyInvitationLink}
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Copy Invitation Link
                </Button>
                <Button
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: event.title,
                          text: `Join me at ${event.title}!`,
                          url: invitationUrl,
                        })
                        .catch((err) => console.error("Error sharing:", err))
                    } else {
                      copyInvitationLink()
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Share via...
                </Button>
              </div>
            </div>

            {isOwner && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Event Management</h2>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => (window.location.href = `/events/${event.id}/edit`)}
                  >
                    Edit Event
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => (window.location.href = `/events/${event.id}/invitations`)}
                  >
                    Manage Invitations
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => (window.location.href = `/events/${event.id}/guests`)}
                  >
                    View Guest List
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        {isOwner && (
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mt-6">
              <InviteCodeShare eventId={event.id} eventTitle={event.title} initialInviteCode={event.unique_code} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
