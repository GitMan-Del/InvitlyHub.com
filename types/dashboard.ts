import type { User } from "@supabase/supabase-js"

export interface Profile {
  id: string
  updated_at: string | null
  username: string | null
  full_name: string | null
  avatar_url: string | null
  website: string | null
}

export interface EventsData {
  total: number
  upcoming: number
  past: number
}

export interface ResponseStats {
  yes: number
  no: number
  pending: number
  total: number
}

export interface AnalyticsData {
  views: number
  responses: number
  engagement: number
  growth: number
}

export interface DashboardContentProps {
  user: User
  profile: Profile | null
  events: EventsData
  responseStats: ResponseStats
  analyticsData: AnalyticsData
}
