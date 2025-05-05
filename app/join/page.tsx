import { createClient } from "@/lib/supabase/server"
import JoinEventPage from "./join-event-page"

export default async function JoinPage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // We don't redirect unauthenticated users, but pass the auth status to the client component
  return <JoinEventPage isAuthenticated={!!session} userId={session?.user?.id} />
}
