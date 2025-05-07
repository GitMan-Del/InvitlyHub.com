"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"
import { useToast } from "@/components/ui/use-toast"

// Create a singleton instance to prevent multiple instances
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

// Create a client-side Supabase client
export const createClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>({
      options: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }
  return supabaseClient
}

// Helper function to safely check auth state
export const safeGetSession = async () => {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error)

      // If it's a refresh token error, clear the session
      if (error.message?.includes("refresh_token") || error.status === 400) {
        await supabase.auth.signOut({ scope: "local" })
        // Clear any local storage items related to auth
        if (typeof window !== "undefined") {
          localStorage.removeItem("supabase.auth.token")
          localStorage.removeItem("supabase.auth.refreshToken")
        }
      }

      return { session: null }
    }

    return data
  } catch (err) {
    console.error("Failed to get session:", err)
    return { session: null }
  }
}

// Helper function to safely sign out
export const safeSignOut = async () => {
  try {
    const supabase = createClient()
    await supabase.auth.signOut({ scope: "local" })

    // Clear any local storage items related to auth
    if (typeof window !== "undefined") {
      localStorage.removeItem("supabase.auth.token")
      localStorage.removeItem("supabase.auth.refreshToken")
    }

    return { error: null }
  } catch (err) {
    console.error("Failed to sign out:", err)
    return { error: err }
  }
}

// Helper function to handle auth errors
export const handleAuthError = (error: any) => {
  // Check if it's a refresh token error
  if (error?.message?.includes("refresh_token") || error?.code === "refresh_token_not_found" || error?.status === 400) {
    const supabase = createClient()
    // Sign out the user to clear invalid tokens
    supabase.auth.signOut({ scope: "local" })

    // Clear any local storage items related to auth
    if (typeof window !== "undefined") {
      localStorage.removeItem("supabase.auth.token")
      localStorage.removeItem("supabase.auth.refreshToken")
    }

    // Redirect to sign in page
    window.location.href = "/auth/signin"
    return "Your session has expired. Please sign in again."
  }

  return error?.message || "An authentication error occurred"
}

// Custom hook for auth state with error handling
export const useAuth = () => {
  const { toast } = useToast()

  const handleError = (error: any) => {
    const message = handleAuthError(error)
    toast({
      variant: "destructive",
      title: "Authentication Error",
      description: message,
    })
  }

  return { handleError }
}
