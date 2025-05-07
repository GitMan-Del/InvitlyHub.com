"use client"

import { createClient } from "@/lib/supabase/client"

// Global error handler
export const setupGlobalErrorHandler = () => {
  if (typeof window !== "undefined") {
    window.addEventListener("error", async (event) => {
      console.error("Global error:", event.error)

      // Check if it's an auth error
      if (
        event.error?.message?.includes("refresh_token") ||
        event.error?.message?.includes("not authenticated") ||
        event.error?.status === 400
      ) {
        // Handle auth error
        const supabase = createClient()

        try {
          // Sign out to clear invalid tokens
          await supabase.auth.signOut({ scope: "local" })

          // Clear any auth-related items
          localStorage.removeItem("supabase.auth.token")
          localStorage.removeItem("supabase.auth.refreshToken")

          // Store auth error flag
          localStorage.setItem("auth_error", "true")

          // Redirect to sign in
          window.location.href = "/auth/signin"
        } catch (err) {
          console.error("Error handling auth error:", err)
        }
      }
    })

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", async (event) => {
      console.error("Unhandled promise rejection:", event.reason)

      // Check if it's an auth error
      if (
        event.reason?.message?.includes("refresh_token") ||
        event.reason?.message?.includes("not authenticated") ||
        event.reason?.code === "refresh_token_not_found" ||
        event.reason?.status === 400
      ) {
        // Handle auth error
        const supabase = createClient()

        try {
          // Sign out to clear invalid tokens
          await supabase.auth.signOut({ scope: "local" })

          // Clear any auth-related items
          localStorage.removeItem("supabase.auth.token")
          localStorage.removeItem("supabase.auth.refreshToken")

          // Store auth error flag
          localStorage.setItem("auth_error", "true")

          // Redirect to sign in
          window.location.href = "/auth/signin"
        } catch (err) {
          console.error("Error handling unhandled rejection:", err)
        }
      }
    })
  }
}

// Function to handle specific auth errors
export const handleSpecificAuthError = async (error: any) => {
  if (error?.message?.includes("refresh_token") || error?.code === "refresh_token_not_found" || error?.status === 400) {
    const supabase = createClient()

    try {
      // Sign out to clear invalid tokens
      await supabase.auth.signOut({ scope: "local" })

      // Clear any auth-related items
      if (typeof window !== "undefined") {
        localStorage.removeItem("supabase.auth.token")
        localStorage.removeItem("supabase.auth.refreshToken")

        // Store auth error flag
        localStorage.setItem("auth_error", "true")
      }

      return true // Error was handled
    } catch (err) {
      console.error("Error handling specific auth error:", err)
      return false // Error handling failed
    }
  }

  return false // Not an auth error
}
