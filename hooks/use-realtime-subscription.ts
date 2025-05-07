"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { handleSpecificAuthError } from "@/lib/utils/error-handler"

type RealtimeSubscriptionOptions = {
  table: string
  schema?: string
  event?: "INSERT" | "UPDATE" | "DELETE" | "*"
  filter?: string
}

export function useRealtimeSubscription<T = any>({
  table,
  schema = "public",
  event = "*",
  filter,
}: RealtimeSubscriptionOptions) {
  const [data, setData] = useState<T[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Initial data fetch
    const fetchData = async () => {
      try {
        setIsLoading(true)
        let query = supabase.from(table).select("*")

        if (filter) {
          // This is a simplified approach - in a real app, you'd want to parse the filter
          // and apply it properly based on the filter string
          const [column, value] = filter.split("=")
          if (column && value) {
            query = query.eq(column.trim(), value.trim())
          }
        }

        const { data, error } = await query

        if (error) {
          throw error
        }

        setData(data || [])
      } catch (err) {
        console.error(`Error fetching data from ${table}:`, err)
        setError(err instanceof Error ? err : new Error(String(err)))

        // Check if it's an auth error
        if (err.message?.includes("refresh_token") || err.status === 400) {
          handleSpecificAuthError(err)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Set up realtime subscription
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        {
          event,
          schema,
          table,
        },
        async (payload) => {
          try {
            // Refetch the data when changes occur
            const { data: freshData, error } = await supabase.from(table).select("*")

            if (error) {
              throw error
            }

            setData(freshData || [])
          } catch (err) {
            console.error(`Error handling realtime update for ${table}:`, err)

            // Check if it's an auth error
            if (err.message?.includes("refresh_token") || err.status === 400) {
              handleSpecificAuthError(err)
            }
          }
        },
      )
      .subscribe((status, err) => {
        if (status !== "SUBSCRIBED" || err) {
          console.error(`Subscription error for ${table}:`, err)
          setError(err instanceof Error ? err : new Error(`Failed to subscribe to ${table}`))
        }
      })

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, table, schema, event, filter])

  return { data, error, isLoading }
}
