import type { Database } from "@/lib/supabase/database.types"

export type Tables = Database["public"]["Tables"]
export type Profile = Tables["profiles"]["Row"]
export type Event = Tables["events"]["Row"]
export type Invitation = Tables["invitations"]["Row"]
export type ActivityLog = Tables["activity_logs"]["Row"]
