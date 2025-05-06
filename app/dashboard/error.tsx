"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  const handleReset = () => {
    try {
      // Check if reset is a function before calling it
      if (typeof reset === "function") {
        reset()
      } else {
        // If reset is not a function, refresh the page as a fallback
        window.location.reload()
      }
    } catch (e) {
      console.error("Error resetting:", e)
      // Fallback to page refresh if reset fails
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-white/70 mb-6">
          We encountered an error while loading your dashboard. Please try again later.
        </p>
        <div className="flex gap-4">
          <button onClick={handleReset} className="bg-[#9855FF] text-white font-medium py-2 px-4 rounded-lg">
            Try again
          </button>
          <Link href="/" className="bg-white/10 text-white font-medium py-2 px-4 rounded-lg">
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
