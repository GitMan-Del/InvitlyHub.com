"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  X,
  Edit,
  Share2,
  ChevronRight,
  MessageSquare,
  CheckCircle,
  XCircle,
  HelpCircle,
  Copy,
  QrCode,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Event } from "@/lib/supabase/types"
import { EnhancedQRCode } from "@/components/events/enhanced-qr-code"

interface EventDetailsPanelProps {
  event: Event | null
  onClose: () => void
  onEdit?: (event: Event) => void
}

export function EventDetailsPanel({ event, onClose, onEdit }: EventDetailsPanelProps) {
  const { toast } = useToast()
  const [showQRCode, setShowQRCode] = useState(false)

  if (!event) return null

  // Format date and time
  const eventDate = new Date(event.event_date)
  const formattedDate = format(eventDate, "EEEE, MMMM d, yyyy")
  const formattedTime = format(eventDate, "h:mm a")

  // Mock response data
  const responses = {
    yes: 12,
    no: 3,
    pending: 8,
    total: 23,
  }

  // Calculate percentages
  const yesPercent = Math.round((responses.yes / responses.total) * 100)
  const noPercent = Math.round((responses.no / responses.total) * 100)
  const pendingPercent = Math.round((responses.pending / responses.total) * 100)

  // Mock guest list
  const guests = [
    { id: 1, name: "Alex Johnson", status: "yes", avatar: null },
    { id: 2, name: "Jamie Smith", status: "yes", avatar: null },
    { id: 3, name: "Taylor Brown", status: "no", avatar: null },
    { id: 4, name: "Jordan Lee", status: "pending", avatar: null },
    { id: 5, name: "Casey Wilson", status: "yes", avatar: null },
  ]

  // Handle share event
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/invites/${event.unique_code || ""}`
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

  // Handle copy invite code
  const handleCopyCode = async () => {
    if (!event.unique_code) return

    try {
      await navigator.clipboard.writeText(event.unique_code)
      toast({
        title: "Code copied!",
        description: "Invite code copied to clipboard",
      })
    } catch (error) {
      console.error("Error copying code:", error)
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "yes":
        return <CheckCircle size={16} className="text-green-500" />
      case "no":
        return <XCircle size={16} className="text-red-500" />
      default:
        return <HelpCircle size={16} className="text-yellow-500" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden h-full flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#1A0B2E] to-[#2A1659]">
        <h3 className="text-xl font-semibold text-white">Event Details</h3>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(event)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Edit size={18} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <X size={18} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Event Info */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>

          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 text-white/80">
              <Calendar size={18} className="text-[#9855FF]" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-3 text-white/80">
              <Clock size={18} className="text-[#9855FF]" />
              <span>{formattedTime}</span>
            </div>

            {event.location && (
              <div className="flex items-center gap-3 text-white/80">
                <MapPin size={18} className="text-[#9855FF]" />
                <span>{event.location}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-white/80">
              <Users size={18} className="text-[#9855FF]" />
              <span>{responses.total} guests invited</span>
            </div>
          </div>

          {event.description && (
            <div className="mt-6">
              <h4 className="text-white/70 text-sm uppercase mb-2">Description</h4>
              <p className="text-white/90 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {event.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-white/10 text-white/80 hover:bg-white/20">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="responses" className="w-full">
          <div className="border-b border-white/10">
            <TabsList className="bg-transparent border-b-0 p-0">
              <TabsTrigger
                value="responses"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#9855FF] data-[state=active]:border-b-2 data-[state=active]:border-[#9855FF] rounded-none px-6 py-3 text-white/70"
              >
                Responses
              </TabsTrigger>
              <TabsTrigger
                value="guests"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#9855FF] data-[state=active]:border-b-2 data-[state=active]:border-[#9855FF] rounded-none px-6 py-3 text-white/70"
              >
                Guests
              </TabsTrigger>
              <TabsTrigger
                value="share"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#9855FF] data-[state=active]:border-b-2 data-[state=active]:border-[#9855FF] rounded-none px-6 py-3 text-white/70"
              >
                Share
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="responses" className="p-6 mt-0">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white/70 text-sm">Attending ({responses.yes})</h4>
                  <span className="text-white/70 text-sm">{yesPercent}%</span>
                </div>
                <Progress value={yesPercent} className="h-2 bg-white/10" indicatorClassName="bg-green-500" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white/70 text-sm">Not Attending ({responses.no})</h4>
                  <span className="text-white/70 text-sm">{noPercent}%</span>
                </div>
                <Progress value={noPercent} className="h-2 bg-white/10" indicatorClassName="bg-red-500" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white/70 text-sm">Pending ({responses.pending})</h4>
                  <span className="text-white/70 text-sm">{pendingPercent}%</span>
                </div>
                <Progress value={pendingPercent} className="h-2 bg-white/10" indicatorClassName="bg-yellow-500" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guests" className="p-6 mt-0">
            <div className="space-y-3">
              {guests.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarImage src={guest.avatar || undefined} />
                      <AvatarFallback className="bg-[#9855FF]/20 text-[#9855FF]">{guest.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-white">{guest.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(guest.status)}
                    <span className="text-white/70 text-sm capitalize">{guest.status}</span>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full mt-4 border-dashed">
                <Users className="mr-2 h-4 w-4" />
                Invite More Guests
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="share" className="p-6 mt-0">
            <div className="space-y-6">
              {/* Invite Code */}
              {event.unique_code && (
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-white/70 text-sm mb-2">Invite Code</h4>
                  <div className="flex items-center justify-between">
                    <div className="bg-black/30 px-4 py-2 rounded-lg font-mono text-white">{event.unique_code}</div>
                    <Button variant="ghost" size="icon" onClick={handleCopyCode} className="text-white/70">
                      <Copy size={18} />
                    </Button>
                  </div>
                  <p className="text-white/50 text-xs mt-2">
                    Share this code with your guests to let them join the event
                  </p>
                </div>
              )}

              {/* Share Options */}
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-between" onClick={handleShare}>
                  <div className="flex items-center">
                    <Share2 className="mr-2 h-4 w-4 text-[#9855FF]" />
                    Share Invite Link
                  </div>
                  <ChevronRight size={16} className="text-white/50" />
                </Button>

                <Button variant="outline" className="w-full justify-between" onClick={() => setShowQRCode(!showQRCode)}>
                  <div className="flex items-center">
                    <QrCode className="mr-2 h-4 w-4 text-[#9855FF]" />
                    {showQRCode ? "Hide QR Code" : "Show QR Code"}
                  </div>
                  <ChevronRight size={16} className="text-white/50" />
                </Button>

                <Button variant="outline" className="w-full justify-between" disabled>
                  <div className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4 text-[#9855FF]" />
                    Send Message to Guests
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Coming Soon
                  </Badge>
                </Button>
              </div>

              {/* QR Code */}
              <AnimatePresence>
                {showQRCode && event.unique_code && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white/5 p-4 rounded-lg flex flex-col items-center">
                      <EnhancedQRCode
                        value={`${window.location.origin}/invites/${event.unique_code}`}
                        title={event.title}
                        size={200}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  )
}
