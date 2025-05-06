"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"
import DashboardContent from "@/components/dashboard/dashboard-content"
import type { Profile, Event, ActivityLog } from "@/lib/supabase/types"
import { useToast } from "@/components/ui/use-toast"

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
    changeRates?: {
      views: string
      responses: string
      engagement: string
      growth: string
    }
    changeTypes?: {
      views: "positive" | "negative"
      responses: "positive" | "negative"
      engagement: "positive" | "negative"
      growth: "positive" | "negative"
    }
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
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Error boundary for client-side errors
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Client error:", error)
      setError(error.error)
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "An error occurred while rendering the dashboard. Please try refreshing the page.",
      })
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [toast])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await supabase.auth.signOut()
      router.refresh()
      router.push("/auth/signin")
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
      })
      setIsSigningOut(false)
    }
  }

  // If there's a client-side error, show an error message
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-white/70 mb-6">
            We encountered an error while rendering your dashboard. Please try refreshing the page.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-[#9855FF] text-white font-medium py-2 px-4 rounded-lg"
            >
              Refresh page
            </button>
            <button onClick={handleSignOut} className="bg-white/10 text-white font-medium py-2 px-4 rounded-lg">
              Sign out
            </button>
          </div>
        </div>
      </div>
    )
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
      isSigningOut={isSigningOut}
    />
  )
}
