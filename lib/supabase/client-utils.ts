"use client"

import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

export type Tables = Database["public"]["Tables"]
export type Profile = Tables["profiles"]["Row"]
export type Event = Tables["events"]["Row"]
export type Invitation = Tables["invitations"]["Row"]
export type ActivityLog = Tables["activity_logs"]["Row"]

// Client-side functions
export function useSupabaseClient() {
  const supabase = createClient()

  return {
    createEvent: async (
      eventData: Omit<Tables["events"]["Insert"], "id" | "user_id" | "created_at" | "updated_at"> & {
        unique_code?: string
      },
    ) => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("events")
        .insert({
          ...eventData,
          user_id: session.user.id,
        })
        .select()
        .single()

      if (error) throw error

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: session.user.id,
        event_id: data.id,
        action: "created_event",
        details: { event_title: eventData.title },
      })

      return data
    },

    sendInvitation: async (invitation: Omit<Tables["invitations"]["Insert"], "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("invitations").insert(invitation).select().single()

      if (error) throw error

      return data
    },

    updateInvitationStatus: async (invitationId: string, status: string) => {
      const { data, error } = await supabase
        .from("invitations")
        .update({ status })
        .eq("id", invitationId)
        .select()
        .single()

      if (error) throw error

      return data
    },

    joinEventByCode: async (code: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      // Find event by code
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("unique_code", code)
        .single()

      if (eventError || !event) {
        throw new Error("Invalid event code")
      }

      // Check if user is already invited
      const { data: existingInvitation } = await supabase
        .from("invitations")
        .select("*")
        .eq("event_id", event.id)
        .eq("email", session.user.email)
        .single()

      if (!existingInvitation) {
        // Create invitation
        await supabase.from("invitations").insert({
          event_id: event.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.full_name,
          status: "yes",
        })

        // Log activity
        await supabase.from("activity_logs").insert({
          user_id: session.user.id,
          event_id: event.id,
          action: "joined_event",
          details: { event_title: event.title },
        })
      }

      return event
    },
  }
}
