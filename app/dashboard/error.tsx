"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient, handleAuthError } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error)

    // Check if it's an auth error
    if (
      error.message?.includes("refresh_token") ||
      error.message?.includes("not authenticated") ||
      error.message?.includes("JWT") ||
      error.message?.includes("token")
    ) {
      handleAuthError(error)
    }
  }, [error])

  const handleReset = () => {
    try {
      if (typeof reset === "function") {
        reset()
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error("Reset error:", error)
      window.location.reload()
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/auth/signin")
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-white/70 mb-6">
          We encountered an error while loading your dashboard. This could be due to a network issue or a temporary
          server problem.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleReset}
            className="bg-[#9855FF] text-white font-medium py-2 px-4 rounded-lg hover:bg-[#8A4AE8] transition-colors"
          >
            Try again
          </button>
          <button
            onClick={handleSignOut}
            className="bg-white/10 text-white font-medium py-2 px-4 rounded-lg hover:bg-white/20 transition-colors"
          >
            Sign out
          </button>
          <Link
            href="/"
            className="bg-transparent text-white font-medium py-2 px-4 rounded-lg border border-white/20 hover:bg-white/5 transition-colors text-center"
          >
            Go to home page
          </Link>
        </div>
      </div>
    </div>
  )
}
