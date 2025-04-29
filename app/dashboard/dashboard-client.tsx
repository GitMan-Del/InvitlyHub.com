"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import DashboardContent from "@/components/dashboard/dashboard-content"
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
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
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
