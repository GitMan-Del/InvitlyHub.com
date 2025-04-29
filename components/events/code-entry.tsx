"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Ticket, ArrowRight } from "lucide-react"
import { useSupabaseClient } from "@/lib/supabase/db-utils"
import { useToast } from "@/components/ui/use-toast"

export default function CodeEntry() {
  const router = useRouter()
  const { toast } = useToast()
  const { joinEventByCode } = useSupabaseClient()

  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      setError("Please enter an event code")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const event = await joinEventByCode(code.trim())

      toast({
        title: "Success!",
        description: `You've been added to "${event.title}"`,
      })

      // Navigate to the event page
      router.push(`/events/${event.id}`)
    } catch (error: any) {
      setError(error.message || "Invalid event code")
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Invalid event code",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Join an Event</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="event-code" className="block text-sm font-medium text-white/70 mb-1">
            Enter Event Code
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Ticket className="h-5 w-5 text-white/40" />
            </div>
            <input
              id="event-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-black/50 border border-white/10 text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-[#9855FF] focus:border-[#9855FF] uppercase"
              placeholder="ABCD1234"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#9855FF] to-[#622A9A] text-white font-medium py-2.5 px-4 rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Joining...
            </span>
          ) : (
            <span className="flex items-center">
              Join Event
              <ArrowRight className="ml-2 h-5 w-5" />
            </span>
          )}
        </motion.button>
      </form>
    </div>
  )
}
