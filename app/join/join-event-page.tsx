"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

interface JoinEventPageProps {
  isAuthenticated: boolean
  userId?: string
}

export default function JoinEventPage({ isAuthenticated, userId }: JoinEventPageProps) {
  const [inviteCode, setInviteCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invite code",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (!isAuthenticated) {
        // If not authenticated, save the code to localStorage and redirect to sign in
        localStorage.setItem("pendingInviteCode", inviteCode.trim())
        router.push(`/auth/signin?redirect=${encodeURIComponent("/join")}`)
        return
      }

      // If authenticated, try to join the event
      const response = await fetch("/api/join-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: data.message || "You've successfully joined the event!",
        })

        // Redirect to the event page
        if (data.eventId) {
          router.push(`/events/${data.eventId}`)
        } else {
          router.push("/dashboard")
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to join the event. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error joining event:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check for pending invite code after authentication
  useState(() => {
    if (isAuthenticated) {
      const pendingCode = localStorage.getItem("pendingInviteCode")
      if (pendingCode) {
        setInviteCode(pendingCode)
        localStorage.removeItem("pendingInviteCode")
        // Auto-submit if we have a pending code
        handleSubmit(new Event("submit") as any)
      }
    }
  })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Join an event</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Enter the invite code you received to join an event</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">
                Invite Code
              </label>
              <div className="mt-1">
                <Input
                  id="inviteCode"
                  name="inviteCode"
                  type="text"
                  autoComplete="off"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter invite code"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? "Joining..." : "Join Event"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div>
                <Link
                  href="/dashboard"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
