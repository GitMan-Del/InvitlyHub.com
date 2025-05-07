"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { handleSpecificAuthError } from "@/lib/utils/error-handler"

type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  created_at: string
}

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)

        const { data, error: notificationsError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (notificationsError) throw notificationsError

        setNotifications(data || [])
        setUnreadCount(data?.filter((n) => !n.read).length || 0)
      } catch (err) {
        console.error("Error fetching notifications:", err)
        setError(err instanceof Error ? err : new Error(String(err)))

        // Check if it's an auth error
        if (err.message?.includes("refresh_token") || err.status === 400) {
          handleSpecificAuthError(err)
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchNotifications()

    // Set up realtime subscription
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refetch notifications when changes occur
          fetchNotifications()
        },
      )
      .subscribe((status, err) => {
        if (status !== "SUBSCRIBED" || err) {
          console.error("Notifications subscription error:", err)
          setError(err instanceof Error ? err : new Error("Failed to subscribe to notifications"))
        }
      })

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

      if (error) throw error

      // Update local state
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Error marking notification as read:", err)

      // Check if it's an auth error
      if (err.message?.includes("refresh_token") || err.status === 400) {
        handleSpecificAuthError(err)
      }
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false)

      if (error) throw error

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Error marking all notifications as read:", err)

      // Check if it's an auth error
      if (err.message?.includes("refresh_token") || err.status === 400) {
        handleSpecificAuthError(err)
      }
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  }
}
