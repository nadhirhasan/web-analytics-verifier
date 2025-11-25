export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'business' | 'enterprise'
          subscription_status: 'active' | 'cancelled' | 'expired'
          subscription_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'business' | 'enterprise'
          subscription_status?: 'active' | 'cancelled' | 'expired'
          subscription_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'business' | 'enterprise'
          subscription_status?: 'active' | 'cancelled' | 'expired'
          subscription_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      google_analytics_accounts: {
        Row: {
          id: string
          user_id: string
          account_id: string
          property_id: string
          property_name: string | null
          access_token: string
          refresh_token: string
          token_expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          property_id: string
          property_name?: string | null
          access_token: string
          refresh_token: string
          token_expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          property_id?: string
          property_name?: string | null
          access_token?: string
          refresh_token?: string
          token_expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          user_id: string
          ga_account_id: string | null
          name: string
          target_url: string
          utm_source: string
          utm_medium: string
          utm_campaign: string
          utm_term: string | null
          utm_content: string | null
          goal_visitors: number | null
          goal_duration: number | null
          goal_bounce_rate: number | null
          start_date: string
          end_date: string | null
          shareable_link: string
          shareable_token: string
          status: 'active' | 'paused' | 'completed' | 'archived'
          is_public: boolean
          quality_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ga_account_id?: string | null
          name: string
          target_url: string
          utm_source: string
          utm_medium: string
          utm_campaign: string
          utm_term?: string | null
          utm_content?: string | null
          goal_visitors?: number | null
          goal_duration?: number | null
          goal_bounce_rate?: number | null
          start_date?: string
          end_date?: string | null
          shareable_link: string
          shareable_token: string
          status?: 'active' | 'paused' | 'completed' | 'archived'
          is_public?: boolean
          quality_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ga_account_id?: string | null
          name?: string
          target_url?: string
          utm_source?: string
          utm_medium?: string
          utm_campaign?: string
          utm_term?: string | null
          utm_content?: string | null
          goal_visitors?: number | null
          goal_duration?: number | null
          goal_bounce_rate?: number | null
          start_date?: string
          end_date?: string | null
          shareable_link?: string
          shareable_token?: string
          status?: 'active' | 'paused' | 'completed' | 'archived'
          is_public?: boolean
          quality_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      campaign_metrics: {
        Row: {
          id: string
          campaign_id: string
          date: string
          visitors: number
          sessions: number
          page_views: number
          bounce_rate: number | null
          avg_session_duration: number | null
          new_users: number
          returning_users: number
          conversion_rate: number | null
          top_sources: Json | null
          top_countries: Json | null
          top_devices: Json | null
          hourly_data: Json | null
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          date: string
          visitors?: number
          sessions?: number
          page_views?: number
          bounce_rate?: number | null
          avg_session_duration?: number | null
          new_users?: number
          returning_users?: number
          conversion_rate?: number | null
          top_sources?: Json | null
          top_countries?: Json | null
          top_devices?: Json | null
          hourly_data?: Json | null
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          date?: string
          visitors?: number
          sessions?: number
          page_views?: number
          bounce_rate?: number | null
          avg_session_duration?: number | null
          new_users?: number
          returning_users?: number
          conversion_rate?: number | null
          top_sources?: Json | null
          top_countries?: Json | null
          top_devices?: Json | null
          hourly_data?: Json | null
          last_updated?: string
          created_at?: string
        }
      }
      freelancer_access: {
        Row: {
          id: string
          campaign_id: string
          freelancer_email: string
          access_token: string
          can_view_details: boolean
          can_export_data: boolean
          expires_at: string | null
          last_accessed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          freelancer_email: string
          access_token: string
          can_view_details?: boolean
          can_export_data?: boolean
          expires_at?: string | null
          last_accessed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          freelancer_email?: string
          access_token?: string
          can_view_details?: boolean
          can_export_data?: boolean
          expires_at?: string | null
          last_accessed_at?: string | null
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          campaign_id: string | null
          action: string
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          campaign_id?: string | null
          action: string
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          campaign_id?: string | null
          action?: string
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
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
