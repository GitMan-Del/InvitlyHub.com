"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Plus, User, X } from "lucide-react"
import { createInvitation } from "@/app/actions/invitation-actions"
import { useToast } from "@/components/ui/use-toast"
import EnhancedQRCode from "@/components/events/enhanced-qr-code"

interface InvitationFormProps {
  eventId: string
  eventTitle: string
  baseUrl: string
  onClose?: () => void
}

export default function InvitationForm({ eventId, eventTitle, baseUrl, onClose }: InvitationFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    email: "",
    name: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdInvitation, setCreatedInvitation] = useState<{ id: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await createInvitation(eventId, formData.email, formData.name || undefined)

      if (result.success) {
        toast({
          title: "Invitation Sent",
          description: result.message,
        })

        // Store the created invitation
        setCreatedInvitation({ id: result.invitationId })

        // Reset form
        setFormData({
          email: "",
          name: "",
        })
      } else {
        setError(result.error)
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      }
    } catch (error: any) {
      setError(error.message || "Failed to create invitation")
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create invitation",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Invite Someone</h3>
        {onClose && (
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {createdInvitation ? (
        <div className="space-y-4">
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
            <p className="text-white mb-2">Invitation created successfully!</p>
            <p className="text-white/70 text-sm">Share this QR code with your guest</p>
          </div>

          <EnhancedQRCode
            eventId={eventId}
            eventTitle={eventTitle}
            invitationId={createdInvitation.id}
            baseUrl={baseUrl}
          />

          <div className="flex justify-center mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCreatedInvitation(null)}
              className="bg-[#9855FF] text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <Plus size={18} />
              Create Another Invitation
            </motion.button>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white/40" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-black/50 border border-white/10 text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-[#9855FF] focus:border-[#9855FF]"
                  placeholder="guest@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1">
                Guest Name (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-white/40" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-black/50 border border-white/10 text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-[#9855FF] focus:border-[#9855FF]"
                  placeholder="John Doe"
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
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending Invitation...
                </span>
              ) : (
                <span className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Send Invitation
                </span>
              )}
            </motion.button>
          </form>
        </>
      )}
    </div>
  )
}
