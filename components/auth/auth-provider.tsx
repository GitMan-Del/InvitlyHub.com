"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()

        if (error) {
          if (error.message?.includes("refresh_token") || error.status === 400) {
            // Clear invalid session
            await supabase.auth.signOut({ scope: "local" })
            if (typeof window !== "undefined") {
              localStorage.removeItem("supabase.auth.token")
              localStorage.removeItem("supabase.auth.refreshToken")
            }

            // Only show toast if not on auth pages
            const path = window.location.pathname
            if (!path.startsWith("/auth/")) {
              toast({
                variant: "destructive",
                title: "Session expired",
                description: "Your session has expired. Please sign in again.",
              })
              router.push("/auth/signin")
            }
          } else {
            console.error("Auth error:", error)
          }
          setUser(null)
        } else {
          setUser(data.user)
        }
      } catch (err) {
        console.error("Failed to get user:", err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    // Initial user fetch
    getUser()

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
      } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        setUser(null)
        router.refresh()
      } else if (event === "TOKEN_REFRESHED") {
        // Successfully refreshed token
        if (session?.user) {
          setUser(session.user)
        }
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router, toast])

  const signOut = async () => {
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

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}
