"use client"

import { useState } from "react"
import { format } from "date-fns"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

interface SimpleRsvpClientProps {
  event: any
  eventCode: string
  isLoggedIn: boolean
  userId?: string
  userEmail?: string
}

export default function SimpleRsvpClient({ event, eventCode, isLoggedIn, userId, userEmail }: SimpleRsvpClientProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [status, setStatus] = useState<"yes" | "no" | "maybe" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  // Format the event date
  const eventDate = new Date(event.event_date)
  const formattedDate = format(eventDate, "EEEE, MMMM d, yyyy")
  const formattedTime = format(eventDate, "h:mm a")

  const handleResponse = async (response: "yes" | "no" | "maybe") => {
    setIsSubmitting(true)
    setStatus(response)

    try {
      if (!isLoggedIn) {
        // Store response in local storage and redirect to login
        localStorage.setItem(
          "pendingRsvp",
          JSON.stringify({
            eventCode,
            response,
          }),
        )
        router.push(`/auth/signin?redirect=/rsvp/${eventCode}`)
        return
      }

      // Check if user already has an invitation
      const { data: existingInvitation } = await supabase
        .from("invitations")
        .select("id")
        .eq("event_id", event.id)
        .eq("user_id", userId)
        .single()

      if (existingInvitation) {
        // Update existing invitation
        await supabase.from("invitations").update({ status: response }).eq("id", existingInvitation.id)
      } else {
        // Create new invitation
        await supabase.from("invitations").insert({
          event_id: event.id,
          user_id: userId,
          email: userEmail,
          status: response,
        })
      }

      setMessage("Response recorded!")

      // Show success message briefly before redirecting
      setTimeout(() => {
        router.push(`/events/${event.id}`)
      }, 1500)
    } catch (error) {
      console.error("Error recording response:", error)
      setMessage("Something went wrong. Please try again.")
      setIsSubmitting(false)
      setStatus(null)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Simple header */}
      <div className="bg-gray-900 p-4 text-center">
        <h1 className="text-xl font-bold text-white">{event.title}</h1>
        <p className="text-sm text-gray-400">
          {formattedDate} at {formattedTime}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {message ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="text-2xl font-bold text-white mb-2">{message}</div>
              <p className="text-gray-400">Redirecting you shortly...</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white text-center mb-6">Will you attend this event?</h2>

              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleResponse("yes")}
                  disabled={isSubmitting}
                  className={`p-4 rounded-lg flex flex-col items-center justify-center transition-all ${
                    isSubmitting && status === "yes"
                      ? "bg-green-500/30 border border-green-500"
                      : "bg-gray-700 hover:bg-green-500/20 hover:border hover:border-green-500"
                  }`}
                >
                  <span className="text-3xl mb-2">👍</span>
                  <span className="font-medium text-white">Yes</span>
                </button>

                <button
                  onClick={() => handleResponse("maybe")}
                  disabled={isSubmitting}
                  className={`p-4 rounded-lg flex flex-col items-center justify-center transition-all ${
                    isSubmitting && status === "maybe"
                      ? "bg-yellow-500/30 border border-yellow-500"
                      : "bg-gray-700 hover:bg-yellow-500/20 hover:border hover:border-yellow-500"
                  }`}
                >
                  <span className="text-3xl mb-2">🤔</span>
                  <span className="font-medium text-white">Maybe</span>
                </button>

                <button
                  onClick={() => handleResponse("no")}
                  disabled={isSubmitting}
                  className={`p-4 rounded-lg flex flex-col items-center justify-center transition-all ${
                    isSubmitting && status === "no"
                      ? "bg-red-500/30 border border-red-500"
                      : "bg-gray-700 hover:bg-red-500/20 hover:border hover:border-red-500"
                  }`}
                >
                  <span className="text-3xl mb-2">👎</span>
                  <span className="font-medium text-white">No</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
