import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

// Create a server-side Supabase client
export function createClient() {
  return createServerComponentClient<Database>({
    cookies,
  })
}
