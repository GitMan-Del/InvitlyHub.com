"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  CheckCircle,
  XCircle,
  HelpCircle,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { respondToInvite } from "@/app/actions/invite-actions"
import { useToast } from "@/components/ui/use-toast"
import { formatEventDate, formatEventTime } from "@/lib/utils/invitation-utils"

interface InviteResponsePageProps {
  invitation: any
  event: any
  isLoggedIn: boolean
  userEmail: string | null
  isInvitedUser: boolean
  baseUrl: string
}

export default function InviteResponsePage({
  invitation,
  event,
  isLoggedIn,
  userEmail,
  isInvitedUser,
  baseUrl,
}: InviteResponsePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [responding, setResponding] = useState(false)
  const [response, setResponse] = useState<"yes" | "no" | "maybe" | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingResponse, setPendingResponse] = useState<"yes" | "no" | "maybe" | null>(null)
  const [processingAuth, setProcessingAuth] = useState(false)

  // Determine the current status of the invitation
  const currentStatus = invitation.status || "pending"

  // Check for pending response after login
  useEffect(() => {
    if (isLoggedIn && isInvitedUser && pendingResponse) {
      handleResponse(pendingResponse)
      setPendingResponse(null)
    }
  }, [isLoggedIn, isInvitedUser, pendingResponse])

  // Check if we're returning from authentication
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const authReturn = urlParams.get("auth_return")

    if (authReturn === "true" && isLoggedIn) {
      setProcessingAuth(true)

      // Get stored response from localStorage
      const storedResponse = localStorage.getItem("pendingInviteResponse")
      if (storedResponse) {
        const responseData = JSON.parse(storedResponse)
        if (responseData.inviteCode === invitation.id || responseData.inviteCode === invitation.short_code) {
          // Clear stored response
          localStorage.removeItem("pendingInviteResponse")

          // Submit the response after a short delay
          setTimeout(() => {
            handleResponse(responseData.response)
            setProcessingAuth(false)
          }, 1000)
        } else {
          setProcessingAuth(false)
        }
      } else {
        setProcessingAuth(false)
      }
    }
  }, [isLoggedIn, invitation])

  const handleResponse = async (responseType: "yes" | "no" | "maybe") => {
    if (!isLoggedIn) {
      // Store the intended response
      localStorage.setItem(
        "pendingInviteResponse",
        JSON.stringify({
          inviteCode: invitation.id,
          response: responseType,
        }),
      )

      // Show authentication modal
      setShowAuthModal(true)
      setPendingResponse(responseType)
      return
    }

    if (!isInvitedUser) {
      toast({
        title: "Wrong Account",
        description: `This invitation was sent to ${invitation.email}. Please sign in with that email address.`,
        variant: "destructive",
      })
      return
    }

    setResponding(true)
    setResponse(responseType)

    try {
      // Use the invitation ID or short code, whichever is available
      const inviteCode = invitation.id || invitation.short_code
      const result = await respondToInvite(inviteCode, responseType)

      if (result.success) {
        toast({
          title: "Response Recorded",
          description: result.message,
        })

        // Show success animation
        setTimeout(() => {
          router.push(`/events/${event.id}`)
          router.refresh()
        }, 1500)
      } else if (result.requiresAuth) {
        // Handle authentication requirement
        setShowAuthModal(true)
        setPendingResponse(responseType)
        setResponding(false)
      } else if (result.wrongEmail) {
        // Handle wrong email
        toast({
          title: "Wrong Email Address",
          description: `This invitation was sent to ${result.invitationEmail}. Please sign in with that email.`,
          variant: "destructive",
        })
        setResponding(false)
      } else {
        // Handle other errors
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

  // Redirect to authentication
  const handleAuthRedirect = (type: "signin" | "signup") => {
    const redirectUrl = `${window.location.pathname}?auth_return=true`
    router.push(`/auth/${type}?redirect=${encodeURIComponent(redirectUrl)}`)
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
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {processingAuth && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 max-w-md w-full text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#9855FF]" />
              <h3 className="text-xl font-bold mb-2">Processing Your Response</h3>
              <p className="text-white/70">Please wait while we record your response...</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showAuthModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
              onClick={() => setShowAuthModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4">Authentication Required</h3>
                <p className="text-white/70 mb-6">
                  To respond to this invitation, please sign in or create an account with{" "}
                  <span className="text-white font-medium">{invitation.email}</span>.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAuthRedirect("signin")}
                    className="bg-[#9855FF] hover:bg-[#8144E5] text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthRedirect("signup")}
                    className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Create Account
                  </button>
                </div>

                <button
                  onClick={() => setShowAuthModal(false)}
                  className="w-full text-white/50 hover:text-white mt-4 py-2"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="md:col-span-2">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h1 className="text-3xl font-bold text-white mb-4">{event.title}</h1>

              <div className="flex flex-wrap gap-y-3 gap-x-6 mb-6">
                <div className="flex items-center text-white/70">
                  <Calendar className="h-5 w-5 mr-2 text-[#9855FF]" />
                  <span>{formatEventDate(event.event_date)}</span>
                </div>

                <div className="flex items-center text-white/70">
                  <Clock className="h-5 w-5 mr-2 text-[#9855FF]" />
                  <span>{formatEventTime(event.event_date)}</span>
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

              {/* Authentication Status Alert */}
              {!isLoggedIn && (
                <div className="bg-[#9855FF]/20 border border-[#9855FF]/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[#9855FF] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-white mb-1">Authentication Required</h4>
                    <p className="text-white/70 text-sm mb-3">
                      You need to sign in to respond to this invitation. Please create an account or sign in with{" "}
                      <span className="text-white font-medium">{invitation.email}</span>.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAuthRedirect("signin")}
                        className="inline-block bg-[#9855FF] hover:bg-[#8144E5] text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => handleAuthRedirect("signup")}
                        className="inline-block bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Wrong Account Alert */}
              {isLoggedIn && !isInvitedUser && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-white mb-1">Wrong Account</h4>
                    <p className="text-white/70 text-sm mb-3">
                      This invitation was sent to <span className="text-white font-medium">{invitation.email}</span>,
                      but you're signed in as <span className="text-white font-medium">{userEmail}</span>.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          const supabase = (await import("@/lib/supabase/client")).createClient()
                          await supabase.auth.signOut()
                          router.refresh()
                        }}
                        className="inline-block bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Sign Out
                      </button>
                      <button
                        onClick={() => handleAuthRedirect("signin")}
                        className="inline-block bg-[#9855FF] hover:bg-[#8144E5] text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Sign In with Correct Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Response Buttons */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Will you attend this event?</h3>

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
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="md:col-span-1">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Event Information</h3>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg mb-4">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `${baseUrl}/invites/${invitation.short_code || invitation.id}`,
                  )}`}
                  alt="Invitation QR Code"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>

              {/* Share Options */}
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        `${baseUrl}/invites/${invitation.short_code || invitation.id}`,
                      )
                      toast({
                        title: "Link Copied",
                        description: "Invitation link has been copied to clipboard.",
                      })
                    } catch (error) {
                      console.error("Error copying:", error)
                    }
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
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
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy Invitation Link
                </button>

                <button
                  onClick={async () => {
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: `Invitation to ${event.title}`,
                          text: `You're invited to ${event.title}!`,
                          url: `${baseUrl}/invites/${invitation.short_code || invitation.id}`,
                        })
                      } else {
                        throw new Error("Web Share API not supported")
                      }
                    } catch (error) {
                      console.error("Error sharing:", error)
                      // Fallback to copy
                      await navigator.clipboard.writeText(
                        `${baseUrl}/invites/${invitation.short_code || invitation.id}`,
                      )
                      toast({
                        title: "Link Copied",
                        description: "Invitation link has been copied to clipboard.",
                      })
                    }
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  Share Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
