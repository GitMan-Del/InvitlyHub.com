"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, ArrowLeft, Trash2 } from "lucide-react"
import EventForm from "@/components/events/event-form"
import EventCard from "@/components/events/event-card"
import CodeEntry from "@/components/events/code-entry"
import {
  TableSelectionProvider,
  useTableSelection,
  SelectAllCheckbox,
  SelectionActions,
  SelectRowCheckbox,
} from "@/components/ui/table-selection"
import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { deleteMultipleEvents } from "@/app/actions/event-actions"
import { useToast } from "@/components/ui/use-toast"
import type { Event } from "@/lib/supabase/db-utils"

interface EventsPageProps {
  events: Event[]
  baseUrl: string
}

export default function EventsPage({ events, baseUrl }: EventsPageProps) {
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-[#0A0A0A] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center text-white/70 hover:text-white">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 bg-[#9855FF] hover:bg-[#8144E5] text-white px-3 py-1.5 rounded-md transition-colors"
          >
            {showForm ? (
              <span>Cancel</span>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>New Event</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">My Events</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <EventForm onSuccess={() => setShowForm(false)} />
              </motion.div>
            )}

            {events.length > 0 ? (
              <TableSelectionProvider>
                <EventsList events={events} baseUrl={baseUrl} />
              </TableSelectionProvider>
            ) : (
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 text-center">
                <h3 className="text-xl font-semibold text-white mb-2">No Events Yet</h3>
                <p className="text-white/70 mb-4">Create your first event to get started!</p>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-[#9855FF] hover:bg-[#8144E5] text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <CodeEntry />
          </div>
        </div>
      </main>
    </div>
  )
}

function EventsList({ events, baseUrl }: { events: Event[]; baseUrl: string }) {
  const { selectedItems, deselectAll } = useTableSelection<Event>()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDeleteSelected = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteMultipleEvents(selectedItems.map((e) => e.id))
      if (result.success) {
        toast({
          title: "Events deleted",
          description: result.message,
        })
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
      setShowDeleteDialog(false)
    }
  }

  return (
    <div>
      {selectedItems.length > 0 && (
        <div className="bg-[#1A0B2E] border border-white/10 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="text-white">
            <span className="font-medium">{selectedItems.length}</span> event{selectedItems.length !== 1 ? "s" : ""}{" "}
            selected
          </div>
          <SelectionActions>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-1"
            >
              <Trash2 size={14} />
              Delete Selected
            </Button>
          </SelectionActions>
        </div>
      )}

      <div className="mb-4 flex items-center px-4 py-2 bg-white/5 rounded-lg">
        <SelectAllCheckbox items={events} className="mr-3" />
        <span className="text-white/70 text-sm font-medium">Select All Events</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-3">
            <SelectRowCheckbox item={event} />
            <div className="flex-1">
              <EventCard event={event} baseUrl={baseUrl} />
            </div>
          </div>
        ))}
      </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Selected Events"
        description={`Are you sure you want to delete ${selectedItems.length} selected event${selectedItems.length !== 1 ? "s" : ""}? This action cannot be undone and will remove all invitations and data associated with these events.`}
        confirmText="Delete Events"
        variant="destructive"
        onConfirm={handleDeleteSelected}
        isLoading={isDeleting}
      />
    </div>
  )
}
