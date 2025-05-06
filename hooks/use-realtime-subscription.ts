"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

type SubscriptionOptions = {
  table: string
  schema?: string
  event?: "INSERT" | "UPDATE" | "DELETE" | "*"
  filter?: string
  filterValue?: any
}

export function useRealtimeSubscription<T = any>(
  options: SubscriptionOptions,
  callback: (payload: { new: T; old: T }) => void,
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    try {
      // Create a unique channel name based on the options
      const channelName = `${options.table}_${options.event || "*"}_${options.filter || "all"}`

      // Set up the subscription
      const subscription = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: options.event || "*",
            schema: options.schema || "public",
            table: options.table,
            ...(options.filter && options.filterValue ? { filter: `${options.filter}=eq.${options.filterValue}` } : {}),
          },
          (payload) => {
            callback(payload.new ? { new: payload.new as T, old: payload.old as T } : { new: {} as T, old: {} as T })
          },
        )
        .subscribe((status) => {
          setIsConnected(status === "SUBSCRIBED")
          if (status === "SUBSCRIBED") {
            console.log(`Subscribed to ${options.table} changes`)
          } else if (status === "CHANNEL_ERROR") {
            setError(new Error(`Failed to subscribe to ${options.table} changes`))
          }
        })

      setChannel(subscription)

      return () => {
        subscription.unsubscribe()
      }
    } catch (err) {
      console.error("Error setting up real-time subscription:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return () => {}
    }
  }, [options.table, options.event, options.filter, options.filterValue, options.schema])

  return { isConnected, error }
}
