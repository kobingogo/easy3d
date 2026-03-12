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
          wechat_openid: string | null
          wechat_avatar: string | null
          wechat_nickname: string | null
          plan_type: string
          credits_remaining: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wechat_openid?: string | null
          wechat_avatar?: string | null
          wechat_nickname?: string | null
          plan_type?: string
          credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wechat_openid?: string | null
          wechat_avatar?: string | null
          wechat_nickname?: string | null
          plan_type?: string
          credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
      }
      models: {
        Row: {
          id: string
          user_id: string | null
          original_image_url: string | null
          model_3d_url: string | null
          thumbnail_url: string | null
          status: string
          quality: string | null
          trip_task_id: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          original_image_url?: string | null
          model_3d_url?: string | null
          thumbnail_url?: string | null
          status?: string
          quality?: string | null
          trip_task_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          original_image_url?: string | null
          model_3d_url?: string | null
          thumbnail_url?: string | null
          status?: string
          quality?: string | null
          trip_task_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          credits_used: number | null
          model_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action?: string
          credits_used?: number | null
          model_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          credits_used?: number | null
          model_id?: string | null
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

export type User = Database['public']['Tables']['users']['Row']
export type Model = Database['public']['Tables']['models']['Row']
export type UsageLog = Database['public']['Tables']['usage_logs']['Row']