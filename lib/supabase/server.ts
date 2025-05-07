import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"
import { createClient as createServiceClient } from "@supabase/supabase-js"

// Create a server-side Supabase client (with user's session)
export const createClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

// Create a server-side Supabase client with service role (bypasses RLS)
export const createAdminClient = () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
      throw new Error("Missing Supabase URL")
    }

    if (!supabaseServiceKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
      throw new Error("Missing Supabase service role key")
    }

    return createServiceClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("Error creating admin client:", error)
    throw error
  }
}
