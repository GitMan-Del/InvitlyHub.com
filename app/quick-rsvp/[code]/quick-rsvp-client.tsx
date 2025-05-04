"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock, MapPin, Check, X, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface QuickRsvpClientProps {
  event: any
  invitation: any
}

export default function QuickRsvpClient({ event, invitation }: QuickRsvpClientProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [status, setStatus] = useState(invitation?.status || "pending")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  // Format the event date
  const eventDate = new Date(event.event_date)
  const formattedDate = format(eventDate, "EEEE, MMMM d, yyyy")
  const formattedTime = format(eventDate, "h:mm a")

  const handleResponse = async (response: "yes" | "no" | "maybe") => {
    setIsSubmitting(true)
    setMessage("")

    try {
      const { error } = await supabase.from("invitations").update({ status: response }).eq("id", invitation.id)

      if (error) throw error

      setStatus(response)
      setMessage(
        `You have ${response === "yes" ? "accepted" : response === "no" ? "declined" : "tentatively accepted"} the invitation.`,
      )

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Error updating invitation:", error)
      setMessage("There was an error updating your response. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-6">
        <h1 className="text-2xl font-bold mb-1">{event.title}</h1>
        <p className="text-gray-400">by {event.profiles?.full_name || "Anonymous"}</p>
      </div>

      {/* Event details */}
      <div className="flex-1 p-6">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
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
          </div>
        </div>

        {/* Response section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Will you attend?</h2>

          {message && (
            <div className="mb-6 p-4 bg-gray-700 rounded-lg text-center">
              <p>{message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              onClick={() => handleResponse("yes")}
              disabled={isSubmitting}
              variant="outline"
              className={`h-auto py-6 ${
                status === "yes"
                  ? "bg-green-500/20 border-green-500 text-green-500"
                  : "hover:bg-green-500/10 hover:text-green-500 hover:border-green-500"
              }`}
            >
              <div className="flex flex-col items-center">
                <Check className="w-8 h-8 mb-2" />
                <span className="text-lg font-medium">Yes</span>
                <span className="text-xs text-gray-400 mt-1">I'll be there</span>
              </div>
            </Button>

            <Button
              onClick={() => handleResponse("maybe")}
              disabled={isSubmitting}
              variant="outline"
              className={`h-auto py-6 ${
                status === "maybe"
                  ? "bg-yellow-500/20 border-yellow-500 text-yellow-500"
                  : "hover:bg-yellow-500/10 hover:text-yellow-500 hover:border-yellow-500"
              }`}
            >
              <div className="flex flex-col items-center">
                <HelpCircle className="w-8 h-8 mb-2" />
                <span className="text-lg font-medium">Maybe</span>
                <span className="text-xs text-gray-400 mt-1">Not sure yet</span>
              </div>
            </Button>

            <Button
              onClick={() => handleResponse("no")}
              disabled={isSubmitting}
              variant="outline"
              className={`h-auto py-6 ${
                status === "no"
                  ? "bg-red-500/20 border-red-500 text-red-500"
                  : "hover:bg-red-500/10 hover:text-red-500 hover:border-red-500"
              }`}
            >
              <div className="flex flex-col items-center">
                <X className="w-8 h-8 mb-2" />
                <span className="text-lg font-medium">No</span>
                <span className="text-xs text-gray-400 mt-1">Can't make it</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6">
        <Button variant="link" className="w-full text-gray-400" onClick={() => router.push(`/events/${event.id}`)}>
          View full event details
        </Button>
      </div>
    </div>
  )
}
