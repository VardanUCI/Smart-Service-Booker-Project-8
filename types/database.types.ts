// @ts-nocheck
// TypeScript types for every Supabase table and RPC function — import Database into createClient<Database>() for type-safe queries.

type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string
          role: 'user' | 'business'
          onboarding_completed: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          phone?: string | null
          email: string
          role?: 'user' | 'business'
          onboarding_completed?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          phone?: string | null
          email?: string
          role?: 'user' | 'business'
          onboarding_completed?: boolean
        }
        Relationships: []
      }
      providers: {
        Row: {
          id: string
          business_name: string
          category: string
          location: unknown
          address: string | null
          phone: string | null
          google_place_id: string | null
          stripe_customer_id: string | null
          is_available: boolean
          available_until: string | null
          created_at: string
        }
        Insert: {
          id: string
          business_name: string
          category: string
          location: string
          address?: string | null
          phone?: string | null
          google_place_id?: string | null
          stripe_customer_id?: string | null
          is_available?: boolean
          available_until?: string | null
          created_at?: string
        }
        Update: {
          business_name?: string
          category?: string
          location?: string
          address?: string | null
          phone?: string | null
          google_place_id?: string | null
          stripe_customer_id?: string | null
          is_available?: boolean
          available_until?: string | null
        }
        Relationships: []
      }
      waitlists: {
        Row: {
          id: string
          user_id: string
          category: string
          search_location: unknown | null
          expires_at: string
          status: string
          provider_id: string | null
          service: string | null
          urgency: 'now' | 'today' | 'this-week' | 'flexible' | null
          contact_method: 'sms' | 'email' | null
          contact_value: string | null
          notified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          search_location?: string | null
          expires_at: string
          status?: string
          provider_id?: string | null
          service?: string | null
          urgency?: 'now' | 'today' | 'this-week' | 'flexible' | null
          contact_method?: 'sms' | 'email' | null
          contact_value?: string | null
          notified_at?: string | null
          created_at?: string
        }
        Update: {
          status?: string
          expires_at?: string
          contact_method?: 'sms' | 'email' | null
          contact_value?: string | null
          notified_at?: string | null
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          id: string
          provider_id: string
          date: string
          start_time: string
          end_time: string
          capacity: number
          booked_count: number
          created_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          date: string
          start_time: string
          end_time: string
          capacity?: number
          booked_count?: number
          created_at?: string
        }
        Update: {
          date?: string
          start_time?: string
          end_time?: string
          capacity?: number
          booked_count?: number
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          waitlist_id: string | null
          provider_id: string
          customer_id: string
          slot_id: string | null
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          waitlist_id?: string | null
          provider_id: string
          customer_id: string
          slot_id?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string | null
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          slot_id?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'spot-available' | 'reminder' | 'confirmation' | 'update' | 'request'
          title: string
          message: string
          read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'spot-available' | 'reminder' | 'confirmation' | 'update' | 'request'
          title: string
          message: string
          read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          read?: boolean
        }
        Relationships: []
      }
      dispatch_requests: {
        Row: {
          id: string
          customer_id: string
          category: string
          description: string | null
          address: string
          location: unknown
          radius_meters: number
          expires_in_minutes: number
          expires_at: string
          status: 'open' | 'claimed' | 'cancelled' | 'expired'
          claimed_by: string | null
          claimed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          category: string
          description?: string | null
          address: string
          location: string
          radius_meters?: number
          expires_in_minutes?: number
          expires_at: string
          status?: 'open' | 'claimed' | 'cancelled' | 'expired'
          claimed_by?: string | null
          claimed_at?: string | null
          created_at?: string
        }
        Update: {
          status?: 'open' | 'claimed' | 'cancelled' | 'expired'
          claimed_by?: string | null
          claimed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_available_providers_nearby: {
        Args: {
          user_lat: number
          user_lon: number
          search_radius_meters: number
          search_category: string
        }
        Returns: {
          id: string
          business_name: string
          dist_meters: number
        }[]
      }
      get_user_waitlists: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          provider_id: string | null
          business_name: string | null
          category: string
          service: string | null
          urgency: string | null
          status: string
          joined_at: string
          expires_at: string
          position: number
          contact_method: string | null
          contact_value: string | null
        }[]
      }
      get_provider_dashboard_stats: {
        Args: { p_provider_id: string }
        Returns: {
          openSlots: number
          pendingRequests: number
          activeWaitlists: number
          fillRate: number
          todayAppointments: number
          weeklyBookings: number
        }
      }
      get_requests_for_provider: {
        Args: { p_provider_id: string }
        Returns: {
          id: string
          customer_id: string
          customer_name: string
          customer_email: string
          service: string | null
          category: string
          urgency: string
          contact_method: string | null
          contact_value: string | null
          status: string
          requested_at: string
          expires_at: string
        }[]
      }
      get_open_dispatch_requests_for_provider: {
        Args: { p_provider_id: string }
        Returns: {
          id: string
          customer_id: string
          category: string
          description: string | null
          address: string
          radius_meters: number
          expires_in_minutes: number
          expires_at: string
          status: string
          created_at: string
        }[]
      }
      claim_dispatch_request: {
        Args: {
          p_dispatch_id: string
          p_provider_id: string
        }
        Returns: Json
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
