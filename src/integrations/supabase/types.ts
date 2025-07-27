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
      budgets: {
        Row: {
          alert_threshold: number | null
          category: string
          created_at: string
          current_spent: number | null
          id: string
          is_active: boolean | null
          month_year: string
          monthly_limit: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          alert_threshold?: number | null
          category: string
          created_at?: string
          current_spent?: number | null
          id?: string
          is_active?: boolean | null
          month_year: string
          monthly_limit: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          alert_threshold?: number | null
          category?: string
          created_at?: string
          current_spent?: number | null
          id?: string
          is_active?: boolean | null
          month_year?: string
          monthly_limit?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
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
          user_id: string
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
          user_id: string
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
          user_id?: string
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
      chat_messages: {
        Row: {
          content: string
          created_at: string
          financial_context: Json | null
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          financial_context?: Json | null
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          financial_context?: Json | null
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          user_id: string
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
          user_id: string
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
          user_id?: string
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          parent_category_id: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          parent_category_id?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          parent_category_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          budget_category: string | null
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          is_recurring: boolean | null
          linked_deal_id: string | null
          receipt_url: string | null
          subcategory: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          budget_category?: string | null
          category: string
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          is_recurring?: boolean | null
          linked_deal_id?: string | null
          receipt_url?: string | null
          subcategory?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          budget_category?: string | null
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          is_recurring?: boolean | null
          linked_deal_id?: string | null
          receipt_url?: string | null
          subcategory?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_linked_deal_id_fkey"
            columns: ["linked_deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
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
          user_id: string
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
          user_id: string
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
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string | null
          created_at: string
          current_value: number | null
          deadline: string
          description: string | null
          goal_type: string
          id: string
          is_automatic: boolean | null
          name: string
          status: string
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_value?: number | null
          deadline: string
          description?: string | null
          goal_type: string
          id?: string
          is_automatic?: boolean | null
          name: string
          status?: string
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_value?: number | null
          deadline?: string
          description?: string | null
          goal_type?: string
          id?: string
          is_automatic?: boolean | null
          name?: string
          status?: string
          target_value?: number
          updated_at?: string
          user_id?: string
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
          user_id: string
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
          user_id: string
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
          user_id?: string
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
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
