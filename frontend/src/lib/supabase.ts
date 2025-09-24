import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      marketplace_accounts: {
        Row: {
          id: string
          user_id: string
          company_id: string
          user_type: string
          access_token: string
          refresh_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          user_type: string
          access_token: string
          refresh_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          user_type?: string
          access_token?: string
          refresh_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subaccounts: {
        Row: {
          id: string
          user_id: string
          location_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          location_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          location_id?: string
          name?: string
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          subaccount_id: string
          status: string
          phone_number: string | null
          qr: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subaccount_id: string
          status: string
          phone_number?: string | null
          qr?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subaccount_id?: string
          status?: string
          phone_number?: string | null
          qr?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          subaccount_id: string
          from_number: string
          to_number: string
          body: string
          media_url: string | null
          media_mime: string | null
          direction: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          subaccount_id: string
          from_number: string
          to_number: string
          body: string
          media_url?: string | null
          media_mime?: string | null
          direction: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          subaccount_id?: string
          from_number?: string
          to_number?: string
          body?: string
          media_url?: string | null
          media_mime?: string | null
          direction?: string
          created_at?: string
        }
      }
    }
  }
}
