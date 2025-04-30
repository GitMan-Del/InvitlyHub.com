"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, ArrowLeft, CheckCircle, XCircle, HelpCircle, User } from "lucide-react"
import { respondToInvitation } from "@/app/actions/invitation-actions"
import { useToast } from "@/components/ui/use-toast"
import EnhancedQRCode from "@/components/events/enhanced-qr-code"

interface InvitationResponseClientProps {
  invitation: any
  event: any
  isLoggedIn: boolean
  userEmail: string | null
  baseUrl: string
}

export default function InvitationResponseClient({
  invitation,
  event,
  isLoggedIn,
  userEmail,
  baseUrl,
}: InvitationResponseClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [responding, setResponding] = useState(false)
  const [response, setResponse] = useState<"yes" | "no" | "maybe" | null>(null)

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

  const handleResponse = async (responseType: "yes" | "no" | "maybe") => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please sign in to respond to this invitation.",
        variant: "destructive",
      })
      router.push(`/auth/signin?redirect=/invitations/${invitation.id}?event=${event.id}`)
      return
    }

    setResponding(true)
    setResponse(responseType)

    try {
      const result = await respondToInvitation(invitation.id, responseType)

      if (result.success) {
        toast({
          title: "Response Recorded",
          description: result.message,
        })

        // Redirect to the event page after a short delay
        setTimeout(() => {
          router.push(`/events/${event.id}`)
          router.refresh()
        }, 1500)
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        setResponding(false)
        setResponse(null)
      }
    } catch (error) {
      console.error("Error responding to invitation:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setResponding(false)
      setResponse(null)
    }
  }

  // Check if the invitation is for the current user
  const isForCurrentUser = userEmail && userEmail.toLowerCase() === invitation.email.toLowerCase()

  // Determine the current status of the invitation
  const currentStatus = invitation.status || "pending"

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-[#0A0A0A] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center text-white/70 hover:text-white">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
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

              {/* Invitation Details */}
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Invitation Details</h3>
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-[#9855FF]" />
                  <span className="text-white/70">
                    Invited: <span className="text-white">{invitation.name || invitation.email}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      currentStatus === "yes"
                        ? "bg-green-500"
                        : currentStatus === "no"
                          ? "bg-red-500"
                          : currentStatus === "maybe"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                    }`}
                  ></div>
                  <span className="text-white/70">
                    Status: <span className="text-white capitalize">{currentStatus}</span>
                  </span>
                </div>
              </div>

              {/* Response Buttons */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Will you attend this event?</h3>

                {isForCurrentUser ? (
                  <div className="grid grid-cols-3 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleResponse("yes")}
                      disabled={responding}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                        response === "yes" || currentStatus === "yes"
                          ? "bg-green-500/20 border-green-500"
                          : "bg-black/30 border-white/10 hover:border-green-500/50"
                      } transition-colors`}
                    >
                      <CheckCircle size={24} className="text-green-500 mb-2" />
                      <span className="font-medium">Yes</span>
                      {(response === "yes" || currentStatus === "yes") && (
                        <span className="text-xs mt-1 text-green-400">
                          {responding ? "Saving..." : "You're attending"}
                        </span>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleResponse("maybe")}
                      disabled={responding}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                        response === "maybe" || currentStatus === "maybe"
                          ? "bg-yellow-500/20 border-yellow-500"
                          : "bg-black/30 border-white/10 hover:border-yellow-500/50"
                      } transition-colors`}
                    >
                      <HelpCircle size={24} className="text-yellow-500 mb-2" />
                      <span className="font-medium">Maybe</span>
                      {(response === "maybe" || currentStatus === "maybe") && (
                        <span className="text-xs mt-1 text-yellow-400">
                          {responding ? "Saving..." : "You might attend"}
                        </span>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleResponse("no")}
                      disabled={responding}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                        response === "no" || currentStatus === "no"
                          ? "bg-red-500/20 border-red-500"
                          : "bg-black/30 border-white/10 hover:border-red-500/50"
                      } transition-colors`}
                    >
                      <XCircle size={24} className="text-red-500 mb-2" />
                      <span className="font-medium">No</span>
                      {(response === "no" || currentStatus === "no") && (
                        <span className="text-xs mt-1 text-red-400">
                          {responding ? "Saving..." : "You're not attending"}
                        </span>
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <div className="bg-black/30 border border-white/10 rounded-lg p-4 text-center">
                    <p className="text-white/70 mb-2">
                      This invitation was sent to <span className="text-white">{invitation.email}</span>
                    </p>
                    {isLoggedIn ? (
                      <p className="text-white/70">You're currently signed in with a different email address.</p>
                    ) : (
                      <Link
                        href={`/auth/signin?redirect=/invitations/${invitation.id}?event=${event.id}`}
                        className="inline-block bg-[#9855FF] hover:bg-[#8144E5] text-white font-medium py-2 px-4 rounded-lg transition-colors mt-2"
                      >
                        Sign In to Respond
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="md:col-span-1">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Share This Invitation</h3>
              <EnhancedQRCode
                eventId={event.id}
                eventTitle={event.title}
                invitationId={invitation.id}
                baseUrl={baseUrl}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
