"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Type, FileText, Plus } from "lucide-react"
import { useSupabaseClient } from "@/lib/supabase/client-utils"
import { useToast } from "@/components/ui/use-toast"

export default function EventForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter()
  const { toast } = useToast()
  const { createEvent } = useSupabaseClient()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    location: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.event_date}T${formData.event_time || "00:00"}`)

      // Generate a unique code for the event
      const uniqueCode = uuidv4().substring(0, 8).toUpperCase()

      await createEvent({
        title: formData.title,
        description: formData.description,
        event_date: dateTime.toISOString(),
        location: formData.location,
        unique_code: uniqueCode,
      })

      toast({
        title: "Event created",
        description: "Your event has been created successfully.",
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        event_date: "",
        event_time: "",
        location: "",
      })

      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Refresh the page to show the new event
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Failed to create event")
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create event",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Create New Event</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white/70 mb-1">
            Event Title
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Type className="h-5 w-5 text-white/40" />
            </div>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="bg-black/50 border border-white/10 text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-[#9855FF] focus:border-[#9855FF]"
              placeholder="Summer Party"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event_date" className="block text-sm font-medium text-white/70 mb-1">
              Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-white/40" />
              </div>
              <input
                id="event_date"
                name="event_date"
                type="date"
                required
                value={formData.event_date}
                onChange={handleChange}
                className="bg-black/50 border border-white/10 text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-[#9855FF] focus:border-[#9855FF]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="event_time" className="block text-sm font-medium text-white/70 mb-1">
              Time
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-white/40" />
              </div>
              <input
                id="event_time"
                name="event_time"
                type="time"
                value={formData.event_time}
                onChange={handleChange}
                className="bg-black/50 border border-white/10 text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-[#9855FF] focus:border-[#9855FF]"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-white/70 mb-1">
            Location
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-white/40" />
            </div>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              className="bg-black/50 border border-white/10 text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-[#9855FF] focus:border-[#9855FF]"
              placeholder="123 Main St, City"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white/70 mb-1">
            Description
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
              <FileText className="h-5 w-5 text-white/40" />
            </div>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="bg-black/50 border border-white/10 text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-[#9855FF] focus:border-[#9855FF]"
              placeholder="Add details about your event..."
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
              Creating Event...
            </span>
          ) : (
            <span className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Create Event
            </span>
          )}
        </motion.button>
      </form>
    </div>
  )
}
