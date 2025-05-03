"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { safeSignOut } from "@/lib/supabase/client"
import DashboardContent from "@/components/dashboard/dashboard-content"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@supabase/supabase-js"
import type { Profile, Event, ActivityLog } from "@/lib/supabase/types"

interface DashboardClientProps {
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
  analyticsData: {
    views: number
    responses: number
    engagement: number
    growth: number
  }
  recentActivity: ActivityLog[]
}

export default function DashboardClient({
  user,
  profile,
  events,
  responseStats,
  analyticsData,
  recentActivity,
}: DashboardClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      const { error } = await safeSignOut()

      if (error) {
        console.error("Error signing out:", error)
        toast({
          title: "Sign out failed",
          description: "Please try again later",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Signed out successfully",
          description: "You have been signed out of your account",
        })
      }

      // Redirect regardless of error to ensure user can get back to home page
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error("Unexpected error during sign out:", err)
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardContent
      user={user}
      profile={profile}
      events={events}
      responseStats={responseStats}
      analyticsData={analyticsData}
      recentActivity={recentActivity}
      onSignOut={handleSignOut}
      isSigningOut={loading}
    />
  )
}
