"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Create a client-side Supabase client
export const createClient = () => {
  return createClientComponentClient<Database>()
}
