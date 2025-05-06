"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

type SubscriptionOptions = {
  table: string
  filter?: string
  filterValue?: string
  event?: "INSERT" | "UPDATE" | "DELETE" | "*"
}

export function useRealtimeSubscription(
  options: SubscriptionOptions,
  callback: (payload: RealtimePostgresChangesPayload<any>) => void,
) {
  const { table, filter, filterValue, event = "*" } = options
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Create a unique channel name
    const channelName = `${table}-${filter || "all"}-${filterValue || "all"}-${event}`

    // Set up the subscription
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          ...(filter && filterValue ? { filter: `${filter}=eq.${filterValue}` } : {}),
        },
        (payload) => {
          callback(payload)
        },
      )
      .subscribe((status) => {
        if (status === "CLOSED") {
          console.log(`Subscription to ${table} closed`)
        } else if (status === "CHANNEL_ERROR") {
          console.error(`Error subscribing to ${table}`)
          // Try to reconnect after a delay
          setTimeout(() => {
            channel.subscribe()
          }, 5000)
        }
      })

    channelRef.current = channel

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [table, filter, filterValue, event, callback])
}
