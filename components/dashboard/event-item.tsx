"use client"

import { useState } from "react"
import Link from "next/link"
import { Trash2, MoreVertical } from "lucide-react"
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

  return (
    <>
      <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SelectRowCheckbox item={event} />
          <div>
            <Link
              href={`/events/${event.id}`}
              className="font-medium text-white hover:text-[#9855FF] transition-colors"
            >
              {event.title}
            </Link>
            <p className="text-white/70 text-sm">{formatDate(event.event_date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white/70 text-xs">Attendees</p>
            <p className="text-white font-medium">
              {isLoading ? <span className="opacity-50">...</span> : stats.attendees}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs">Responses</p>
            <p className="text-white font-medium">
              {isLoading ? <span className="opacity-50">...</span> : stats.responses}
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>

          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 rounded-md hover:bg-white/5">
              <MoreVertical size={16} className="text-white/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/events/${event.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 size={16} className="mr-2" />
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
