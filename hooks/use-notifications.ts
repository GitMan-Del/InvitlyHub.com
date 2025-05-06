"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRealtimeSubscription } from "./use-realtime-subscription"

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  created_at: string
  action_url?: string
}

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.read).length || 0)
      setError(null)
    } catch (err) {
      console.error("Error in useNotifications:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Function to mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

      if (error) throw error

      // Update local state
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }, [])

  // Function to mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const supabase = createClient()

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
    }
  }, [userId])

  // Initial data fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Set up real-time subscription
  useRealtimeSubscription({ table: "notifications", filter: "user_id", filterValue: userId }, (payload) => {
    if (payload.new && Object.keys(payload.new).length > 0) {
      // Handle new notification
      const newNotification = payload.new as Notification
      setNotifications((prev) => [newNotification, ...prev])
      if (!newNotification.read) {
        setUnreadCount((prev) => prev + 1)
      }
    } else if (payload.old && Object.keys(payload.old).length > 0) {
      // Handle deleted notification
      const oldNotification = payload.old as Notification
      setNotifications((prev) => prev.filter((n) => n.id !== oldNotification.id))
      if (!oldNotification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    }
  })

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
