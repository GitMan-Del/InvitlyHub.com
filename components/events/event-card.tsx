"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Trash2, MoreVertical, Share2 } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { deleteEvent } from "@/app/actions/event-actions"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Event } from "@/lib/supabase/db-utils"

interface EventCardProps {
  event: Event
  baseUrl: string
}

export default function EventCard({ event, baseUrl }: EventCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

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

  // Generate event URL
  const eventUrl = `${baseUrl}/events/${event.id}`

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteEvent(event.id)

      if (result.success) {
        toast({
          title: "Event deleted",
          description: result.message,
        })
        setShowDeleteDialog(false)
        // Force a page refresh to update the UI
        window.location.reload()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const shareEvent = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: `Check out this event: ${event.title}`,
          url: eventUrl,
        })
      } else {
        await navigator.clipboard.writeText(eventUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)

        toast({
          title: "Link Copied",
          description: "Event link has been copied to clipboard.",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast({
        variant: "destructive",
        title: "Sharing Failed",
        description: "Unable to share the event. Try copying the link instead.",
      })
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden"
      >
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
              <div className="flex items-center text-white/70 text-sm mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(event.event_date)}</span>
              </div>
              <div className="flex items-center text-white/70 text-sm mb-1">
                <Clock className="h-4 w-4 mr-2" />
                <span>{formatTime(event.event_date)}</span>
              </div>
              {event.location && (
                <div className="flex items-center text-white/70 text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end">
              <div className="bg-white/10 rounded-lg px-3 py-1 text-sm text-white mb-2">
                Code: <span className="font-mono font-bold">{event.unique_code}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/events/${event.id}`} className="text-[#9855FF] text-sm hover:underline">
                  View Details
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-1 rounded-md hover:bg-white/5">
                    <MoreVertical size={16} className="text-white/70" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/events/${event.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareEvent}>
                      <Share2 size={16} className="mr-2" />
                      {copied ? "Copied!" : "Share Event"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="mt-3">
              <p className="text-white/70 text-sm line-clamp-2">{event.description}</p>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button
              onClick={shareEvent}
              className="flex items-center text-white/70 hover:text-white text-sm bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md transition-colors"
            >
              <Share2 className="h-4 w-4 mr-1.5" />
              {copied ? "Copied!" : "Share Event"}
            </button>
          </div>
        </div>
      </motion.div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Event"
        description={`Are you sure you want to delete "${event.title}"? This action cannot be undone and will remove all invitations and data associated with this event.`}
        confirmText="Delete Event"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  )
}
