"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Trash2, MoreVertical, Calendar, MapPin, Users, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { deleteEvent } from "@/app/actions/event-actions"
import { useEventStats } from "@/hooks/use-event-stats"
import { SelectRowCheckbox } from "@/components/ui/table-selection"
import type { Event } from "@/lib/supabase/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface EventItemProps {
  event: Event
  onDeleted?: () => void
}

export function EventItemComponent({ event, onDeleted }: EventItemProps) {
  // Use the event stats hook with caching
  const { stats, isLoading } = useEventStats(event.id)
  const { toast } = useToast()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

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
        if (onDeleted) onDeleted()
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
    const shareUrl = `${window.location.origin}/events/${event.id}`
    const shareText = `Join my event "${event.title}" on Invitify!`

    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: shareText,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Link copied!",
          description: "Event link copied to clipboard",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  return (
    <>
      <motion.div
        className="bg-white/5 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-colors duration-200 border border-transparent hover:border-white/10"
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <div className="flex items-center gap-3">
          <SelectRowCheckbox item={event} />
          <div>
            <Link
              href={`/events/${event.id}`}
              className="font-medium text-white hover:text-[#9855FF] transition-colors"
            >
              {event.title}
            </Link>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Calendar size={12} />
              <span>{formatDate(event.event_date)}</span>
              {event.location && (
                <>
                  <span className="mx-1">•</span>
                  <MapPin size={12} />
                  <span className="truncate max-w-[150px]">{event.location}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white/70 text-xs">Attendees</p>
            <p className="text-white font-medium flex items-center gap-1">
              <Users size={12} className="text-[#9855FF]" />
              {isLoading ? <span className="opacity-50">...</span> : stats.attendees}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-white/70 text-xs">Responses</p>
            <p className="text-white font-medium">
              {isLoading ? <span className="opacity-50">...</span> : stats.responses}
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 hidden sm:block"></div>

          <div className="flex gap-2">
            <button
              onClick={shareEvent}
              className="p-2 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Share Event"
            >
              <Share2 size={16} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                <MoreVertical size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0A0A0A] border-white/10 text-white">
                <DropdownMenuItem
                  asChild
                  className="hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white"
                >
                  <Link href={`/events/${event.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 hover:bg-red-500/10 hover:text-red-500 focus:bg-red-500/10 focus:text-red-500"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
