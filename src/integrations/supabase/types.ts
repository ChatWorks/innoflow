export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      cashflow_entries: {
        Row: {
          amount: number
          category: string
          created_at: string
          deal_id: string | null
          description: string
          fixed_cost_id: string | null
          id: string
          is_projected: boolean | null
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          deal_id?: string | null
          description: string
          fixed_cost_id?: string | null
          id?: string
          is_projected?: boolean | null
          transaction_date: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          deal_id?: string | null
          description?: string
          fixed_cost_id?: string | null
          id?: string
          is_projected?: boolean | null
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cashflow_entries_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashflow_entries_fixed_cost_id_fkey"
            columns: ["fixed_cost_id"]
            isOneToOne: false
            referencedRelation: "fixed_costs"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          amount: number
          client_name: string
          contract_length: number | null
          created_at: string
          deal_type: string
          description: string | null
          expected_date: string | null
          id: string
          invoice_date: string | null
          monthly_amount: number | null
          payment_due_date: string | null
          payment_received_date: string | null
          probability: number | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_name: string
          contract_length?: number | null
          created_at?: string
          deal_type?: string
          description?: string | null
          expected_date?: string | null
          id?: string
          invoice_date?: string | null
          monthly_amount?: number | null
          payment_due_date?: string | null
          payment_received_date?: string | null
          probability?: number | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_name?: string
          contract_length?: number | null
          created_at?: string
          deal_type?: string
          description?: string | null
          expected_date?: string | null
          id?: string
          invoice_date?: string | null
          monthly_amount?: number | null
          payment_due_date?: string | null
          payment_received_date?: string | null
          probability?: number | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      fixed_costs: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_revenue: {
        Row: {
          created_at: string
          deal_id: string
          end_date: string | null
          id: string
          is_active: boolean
          monthly_amount: number
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          monthly_amount: number
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          monthly_amount?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_revenue_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
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
