"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Ticket, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { joinEventWithInviteCode } from "@/app/actions/invite-code-actions"
import { useToast } from "@/components/ui/use-toast"
import { isValidInviteCodeFormat } from "@/lib/utils/invite-code-utils"

export default function JoinWithCode() {
  const router = useRouter()
  const { toast } = useToast()
  const [inviteCode, setInviteCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and remove spaces
    const formattedCode = e.target.value.toUpperCase().replace(/\s/g, "")
    setInviteCode(formattedCode)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate code format
    if (!isValidInviteCodeFormat(inviteCode)) {
      setError("Invalid code format. Codes should be 8 characters.")
      return
    }

    setIsJoining(true)
    setError(null)

    try {
      const result = await joinEventWithInviteCode(inviteCode)

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        })

        // Navigate to the event page
        router.push(`/events/${result.event.id}`)
      } else {
        setError(result.error || "Failed to join event")
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to join event",
        })
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred")
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred",
      })
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">Join Event with Code</h3>
      <p className="text-gray-400 text-sm mb-4">Enter an invite code to join an event directly.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Ticket className="h-5 w-5 text-white/40" />
            </div>
            <Input
              value={inviteCode}
              onChange={handleCodeChange}
              placeholder="Enter invite code"
              className="bg-black/50 border border-white/10 text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-[#9855FF] focus:border-[#9855FF] uppercase"
              maxLength={8}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Codes are 8 characters, letters and numbers only</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isJoining || inviteCode.length < 8}
          className="w-full bg-gradient-to-r from-[#9855FF] to-[#622A9A] text-white font-medium py-2.5 px-4 rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isJoining ? (
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
