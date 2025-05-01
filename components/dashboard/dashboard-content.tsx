"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import type { User } from "@supabase/supabase-js"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  Plus,
  Mail,
  Eye,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  CalendarDays,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import type { Profile, Event, ActivityLog } from "@/lib/supabase/types"
import { useAnalyticsData } from "@/hooks/use-analytics-data"
import { useToast } from "@/components/ui/use-toast"
import { clearAllCache } from "@/lib/utils/cache-utils"
import { EventItemComponent } from "@/components/dashboard/event-item"
import {
  TableSelectionProvider,
  useTableSelection,
  SelectAllCheckbox,
  SelectionActions,
} from "@/components/ui/table-selection"
import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { deleteMultipleEvents } from "@/app/actions/event-actions"

type DashboardContentProps = {
  user: User
  profile: Profile | null
  events: {
    upcoming: Event[]
    past: Event[]
    total: number
  }
  responseStats: {
    yes: number
    no: number
    pending: number
    total: number
  }
  recentActivity: ActivityLog[]
  onSignOut: () => void
  isSigningOut: boolean
}

export default function DashboardContent({
  user,
  profile,
  events,
  responseStats,
  recentActivity,
  onSignOut,
  isSigningOut,
}: DashboardContentProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  // Use the analytics data hook
  const {
    analyticsData,
    isLoading: isLoadingAnalytics,
    isRefetching: isRefetchingAnalytics,
    refetch: refetchAnalytics,
  } = useAnalyticsData(user.id)

  // Format user display name
  const displayName = profile?.full_name || user.email?.split("@")[0] || "User"
  const userInitial = displayName.charAt(0).toUpperCase()

  // Format activity time
  const formatActivityTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
    }
  }

  // Function to refresh all data
  const refreshAllData = async () => {
    setRefreshing(true)

    // Clear all cache
    clearAllCache()

    // Refetch analytics
    await refetchAnalytics()

    // Wait a bit to ensure all refreshes have started
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0A0A0A] border-r border-white/10 hidden md:flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <Image src="/Logo.png" alt="Logo" width={32} height={32} className="rounded-full" />
          <span className="font-bold text-xl text-white">Invitify</span>
        </div>

        <nav className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-white/50 text-xs uppercase mb-3 px-3">Main</p>
            <ul className="space-y-1">
              <li>
                <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#9855FF]/20 text-[#9855FF]">
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <Link
                  href="/events"
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-white/70 hover:bg-white/5"
                >
                  <Calendar size={18} />
                  <span>Events</span>
                </Link>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/70 hover:bg-white/5">
                  <Users size={18} />
                  <span>Guests</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/70 hover:bg-white/5">
                  <Mail size={18} />
                  <span>Messages</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-white/50 text-xs uppercase mb-3 px-3">Settings</p>
            <ul className="space-y-1">
              <li>
                <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-white/70 hover:bg-white/5">
                  <Settings size={18} />
                  <span>Settings</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={onSignOut}
            disabled={isSigningOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-white/70 hover:bg-white/5 disabled:opacity-50"
          >
            <LogOut size={18} />
            <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button className="md:hidden">
              <LayoutDashboard size={20} className="text-white/70" />
            </button>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={refreshAllData}
              disabled={refreshing || isRefetchingAnalytics}
              className="relative p-2 rounded-full hover:bg-white/5 disabled:opacity-50"
              title="Refresh dashboard data"
            >
              <RefreshCw
                size={20}
                className={`text-white/70 ${refreshing || isRefetchingAnalytics ? "animate-spin" : ""}`}
              />
            </button>

            <button className="relative p-2 rounded-full hover:bg-white/5">
              <Bell size={20} className="text-white/70" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#9855FF] rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5"
              >
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url || "/placeholder.svg"}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9855FF] to-[#622A9A] flex items-center justify-center text-white font-medium">
                    {userInitial}
                  </div>
                )}
                <span className="hidden md:block text-white/90">{displayName}</span>
                <ChevronDown size={16} className="hidden md:block text-white/70" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0A0A0A] border border-white/10 rounded-md shadow-lg py-1 z-10">
                  <a href="#" className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5">
                    Your Profile
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5">
                    Account Settings
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5">
                    Billing
                  </a>
                  <div className="border-t border-white/10 my-1"></div>
                  <button
                    onClick={onSignOut}
                    disabled={isSigningOut}
                    className="block w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/5 disabled:opacity-50"
                  >
                    {isSigningOut ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto bg-black">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <section className="bg-gradient-to-r from-[#1A0B2E] to-[#2A1659] rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#9855FF] rounded-full blur-[120px] opacity-30"></div>

              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {displayName}!</h2>
                <p className="text-white/70 mb-4">Here's what's happening with your events today.</p>

                <div className="flex flex-wrap gap-4">
                  <Link href="/events">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-[#9855FF] text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Create New Event
                    </motion.button>
                  </Link>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/10 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2"
                  >
                    <Eye size={18} />
                    View Analytics
                  </motion.button>
                </div>
              </div>
            </section>

            {/* Stats Overview */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCardComponent
                title="Total Views"
                value={analyticsData.views}
                icon={<Eye className="w-5 h-5 text-[#9855FF]" />}
                change={analyticsData.changeRates.views}
                changeType={analyticsData.changeTypes.views}
                isLoading={isLoadingAnalytics || isRefetchingAnalytics}
              />
              <StatsCardComponent
                title="Responses"
                value={analyticsData.responses}
                icon={<Mail className="w-5 h-5 text-[#9855FF]" />}
                change={analyticsData.changeRates.responses}
                changeType={analyticsData.changeTypes.responses}
                isLoading={isLoadingAnalytics || isRefetchingAnalytics}
              />
              <StatsCardComponent
                title="Engagement Rate"
                value={`${analyticsData.engagement}%`}
                icon={<TrendingUp className="w-5 h-5 text-[#9855FF]" />}
                change={analyticsData.changeRates.engagement}
                changeType={analyticsData.changeTypes.engagement}
                isLoading={isLoadingAnalytics || isRefetchingAnalytics}
              />
              <StatsCardComponent
                title="Monthly Growth"
                value={`${analyticsData.growth}%`}
                icon={<BarChart3 className="w-5 h-5 text-[#9855FF]" />}
                change={analyticsData.changeRates.growth}
                changeType={analyticsData.changeTypes.growth}
                isLoading={isLoadingAnalytics || isRefetchingAnalytics}
              />
            </section>

            {/* Response Analytics and Monthly Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Response Analytics */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 lg:col-span-1">
                <h3 className="text-lg font-semibold text-white mb-4">Response Analytics</h3>

                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 mb-6">
                    <CircularProgressbar
                      value={responseStats.yes}
                      text={`${responseStats.yes}%`}
                      styles={buildStyles({
                        textSize: "16px",
                        pathColor: "#9855FF",
                        textColor: "#FFFFFF",
                        trailColor: "#333333",
                      })}
                    />
                  </div>

                  <div className="w-full grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-white/80 text-sm">Yes</span>
                      </div>
                      <p className="text-lg font-bold text-white">{responseStats.yes}%</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <XCircle size={16} className="text-red-500" />
                        <span className="text-white/80 text-sm">No</span>
                      </div>
                      <p className="text-lg font-bold text-white">{responseStats.no}%</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock size={16} className="text-yellow-500" />
                        <span className="text-white/80 text-sm">Pending</span>
                      </div>
                      <p className="text-lg font-bold text-white">{responseStats.pending}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Events */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-4">Events This Month</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm">Total Events</span>
                      <CalendarDays size={18} className="text-[#9855FF]" />
                    </div>
                    <p className="text-2xl font-bold text-white">{events.total}</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm">Upcoming</span>
                      <Calendar size={18} className="text-[#9855FF]" />
                    </div>
                    <p className="text-2xl font-bold text-white">{events.upcoming.length}</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm">Past</span>
                      <Clock size={18} className="text-[#9855FF]" />
                    </div>
                    <p className="text-2xl font-bold text-white">{events.past.length}</p>
                  </div>
                </div>

                {/* Event List with Selection */}
                <TableSelectionProvider>
                  <EventsTable
                    events={events.upcoming.slice(0, 3)}
                    onDeleteMultiple={async (selectedEvents) => {
                      setIsDeleting(true)
                      try {
                        const result = await deleteMultipleEvents(selectedEvents.map((e) => e.id))
                        if (result.success) {
                          toast({
                            title: "Events deleted",
                            description: result.message,
                          })
                          refreshAllData()
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
                    }}
                  />
                </TableSelectionProvider>
              </div>
            </div>

            {/* Recent Activity */}
            <section className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <button className="text-[#9855FF] text-sm hover:underline">View All</button>
              </div>

              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => {
                    // Determine icon based on action
                    let icon
                    if (activity.action.includes("created")) {
                      icon = <Plus size={16} className="text-[#9855FF]" />
                    } else if (activity.action.includes("confirmed")) {
                      icon = <CheckCircle size={16} className="text-green-500" />
                    } else if (activity.action.includes("declined")) {
                      icon = <XCircle size={16} className="text-red-500" />
                    } else if (activity.action.includes("viewed")) {
                      icon = <Eye size={16} className="text-blue-500" />
                    } else {
                      icon = <Mail size={16} className="text-[#9855FF]" />
                    }

                    return (
                      <ActivityItemComponent
                        key={activity.id}
                        icon={icon}
                        title={activity.action.replace("_", " ")}
                        event={activity.event_id ? (activity as any).events?.title || "Event" : ""}
                        time={formatActivityTime(activity.created_at)}
                      />
                    )
                  })
                ) : (
                  <p className="text-white/50 text-center py-4">No recent activity</p>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

// Events Table Component with Row Selection
function EventsTable({
  events,
  onDeleteMultiple,
}: {
  events: Event[]
  onDeleteMultiple: (selectedEvents: Event[]) => Promise<void>
}) {
  const { selectedItems, deselectAll } = useTableSelection<Event>()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteSelected = async () => {
    setIsDeleting(true)
    try {
      await onDeleteMultiple(selectedItems)
      deselectAll()
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <div>
      {selectedItems.length > 0 && (
        <div className="bg-[#1A0B2E] border border-white/10 rounded-lg p-2 mb-4 flex items-center justify-between">
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

      <div className="space-y-3">
        {events.length > 0 ? (
          <>
            <div className="flex items-center px-4 py-2 bg-white/5 rounded-lg">
              <SelectAllCheckbox items={events} className="mr-3" />
              <span className="text-white/70 text-sm font-medium">Select All</span>
            </div>
            {events.map((event) => (
              <EventItemComponent key={event.id} event={event} />
            ))}
          </>
        ) : (
          <p className="text-white/50 text-center py-4">No upcoming events. Create your first event!</p>
        )}
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

// Stats Card Component
function StatsCardComponent({
  title,
  value,
  icon,
  change,
  changeType,
  isLoading = false,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  change: string
  changeType: "positive" | "negative"
  isLoading?: boolean
}) {
  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/70 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">
            {isLoading ? (
              <span className="opacity-50">Loading...</span>
            ) : typeof value === "number" ? (
              value.toLocaleString()
            ) : (
              value
            )}
          </p>
        </div>
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      </div>
      <div className={`text-sm ${changeType === "positive" ? "text-green-500" : "text-red-500"}`}>
        {change} from last month
      </div>
    </div>
  )
}

// Activity Item Component
function ActivityItemComponent({
  icon,
  title,
  event,
  time,
}: {
  icon: React.ReactNode
  title: string
  event: string
  time: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-white/5 rounded-full">{icon}</div>
      <div>
        <p className="text-white font-medium">{title}</p>
        <p className="text-white/70 text-sm">Event: {event}</p>
        <p className="text-white/50 text-xs">{time}</p>
      </div>
    </div>
  )
}
