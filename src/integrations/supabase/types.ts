export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          add_ons: Json | null
          balance_due_date: string | null
          created_at: string | null
          dates: string
          deposit_paid: boolean | null
          flight_number: string | null
          fondy_order_id: string | null
          id: string
          installment_status: Json | null
          lead_booker_name: string | null
          lead_booker_phone: string | null
          number_of_guests: number
          package_name: string
          package_price: number
          payment_plan: string | null
          payment_status: string
          remaining_amount: number | null
          room_type: string
          scheduled_payment_intent_id: string | null
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          stripe_session_id: string | null
          total_amount: number
          updated_at: string | null
          user_email: string
        }
        Insert: {
          add_ons?: Json | null
          balance_due_date?: string | null
          created_at?: string | null
          dates: string
          deposit_paid?: boolean | null
          flight_number?: string | null
          fondy_order_id?: string | null
          id?: string
          installment_status?: Json | null
          lead_booker_name?: string | null
          lead_booker_phone?: string | null
          number_of_guests: number
          package_name: string
          package_price: number
          payment_plan?: string | null
          payment_status?: string
          remaining_amount?: number | null
          room_type: string
          scheduled_payment_intent_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string | null
          user_email: string
        }
        Update: {
          add_ons?: Json | null
          balance_due_date?: string | null
          created_at?: string | null
          dates?: string
          deposit_paid?: boolean | null
          flight_number?: string | null
          fondy_order_id?: string | null
          id?: string
          installment_status?: Json | null
          lead_booker_name?: string | null
          lead_booker_phone?: string | null
          number_of_guests?: number
          package_name?: string
          package_price?: number
          payment_plan?: string | null
          payment_status?: string
          remaining_amount?: number | null
          room_type?: string
          scheduled_payment_intent_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string | null
          user_email?: string
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          booking_id: string | null
          coupon_code: string
          created_at: string | null
          id: string
          number_of_people: number
          user_email: string
        }
        Insert: {
          booking_id?: string | null
          coupon_code: string
          created_at?: string | null
          id?: string
          number_of_people: number
          user_email: string
        }
        Update: {
          booking_id?: string | null
          coupon_code?: string
          created_at?: string | null
          id?: string
          number_of_people?: number
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_booking_id_bookings_id_fk"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      drizzle_migrations: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      guests: {
        Row: {
          add_ons: Json | null
          booking_id: string | null
          created_at: string | null
          date_of_birth: string
          email: string
          id: string
          name: string
          phone: string
          updated_at: string | null
        }
        Insert: {
          add_ons?: Json | null
          booking_id?: string | null
          created_at?: string | null
          date_of_birth: string
          email: string
          id?: string
          name: string
          phone: string
          updated_at?: string | null
        }
        Update: {
          add_ons?: Json | null
          booking_id?: string | null
          created_at?: string | null
          date_of_birth?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guests_booking_id_bookings_id_fk"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      installment_payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          paid_at: string | null
          payment_method_id: string | null
          plan_id: string
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          paid_at?: string | null
          payment_method_id?: string | null
          plan_id: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          paid_at?: string | null
          payment_method_id?: string | null
          plan_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "installment_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "installment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      installment_plans: {
        Row: {
          cancellation_requested: boolean | null
          cancelled_at: string | null
          created_at: string
          currency: string
          customer_email: string
          customer_name: string | null
          id: string
          package_type: string | null
          selected_addons: Json | null
          status: string
          stripe_customer_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          cancellation_requested?: boolean | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_name?: string | null
          id?: string
          package_type?: string | null
          selected_addons?: Json | null
          status?: string
          stripe_customer_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          cancellation_requested?: boolean | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string | null
          id?: string
          package_type?: string | null
          selected_addons?: Json | null
          status?: string
          stripe_customer_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          booking_id: string | null
          created_at: string | null
          email: string
          id: string
          lead_booker_id: string | null
          name: string | null
          package_name: string | null
          phone: string | null
          role: string | null
          status: string
          with_lead_name: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          lead_booker_id?: string | null
          name?: string | null
          package_name?: string | null
          phone?: string | null
          role?: string | null
          status?: string
          with_lead_name?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          lead_booker_id?: string | null
          name?: string | null
          package_name?: string | null
          phone?: string | null
          role?: string | null
          status?: string
          with_lead_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_booking_id_bookings_id_fk"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_lead_booker_id_leads_id_fk"
            columns: ["lead_booker_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          fondy_order_id: string | null
          fondy_response: Json | null
          id: string
          payment_provider: string
          payment_type: string
          processed_at: string | null
          scheduled_at: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_response: Json | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          fondy_order_id?: string | null
          fondy_response?: Json | null
          id?: string
          payment_provider?: string
          payment_type: string
          processed_at?: string | null
          scheduled_at?: string | null
          status: string
          stripe_payment_intent_id?: string | null
          stripe_response?: Json | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          fondy_order_id?: string | null
          fondy_response?: Json | null
          id?: string
          payment_provider?: string
          payment_type?: string
          processed_at?: string | null
          scheduled_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_response?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_booking_id_bookings_id_fk"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          email: string | null
          hashed_password: string
          id: string
          username: string
        }
        Insert: {
          email?: string | null
          hashed_password: string
          id?: string
          username: string
        }
        Update: {
          email?: string | null
          hashed_password?: string
          id?: string
          username?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
