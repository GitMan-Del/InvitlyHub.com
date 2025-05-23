export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          dashboard_preferences: Json | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          dashboard_preferences?: Json | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          dashboard_preferences?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          event_date: string
          location: string | null
          created_at: string
          updated_at: string
          unique_code: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          event_date: string
          location?: string | null
          created_at?: string
          updated_at?: string
          unique_code?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          event_date?: string
          location?: string | null
          created_at?: string
          updated_at?: string
          unique_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          id: string
          event_id: string
          email: string
          name: string | null
          status: string
          created_at: string
          updated_at: string
          short_code: string | null
        }
        Insert: {
          id?: string
          event_id: string
          email: string
          name?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          short_code?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          email?: string
          name?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          short_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          event_id: string | null
          action: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id?: string | null
          action: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string | null
          action?: string
          details?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
