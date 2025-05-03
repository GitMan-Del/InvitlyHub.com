"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

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
    return { error: null }
  } catch (err) {
    console.error("Failed to sign out:", err)
    return { error: err }
  }
}
