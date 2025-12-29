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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      advisor_comments: {
        Row: {
          advisor_name: string
          comment: string
          created_at: string
          decision_id: string
          id: string
          share_id: string
        }
        Insert: {
          advisor_name: string
          comment: string
          created_at?: string
          decision_id: string
          id?: string
          share_id: string
        }
        Update: {
          advisor_name?: string
          comment?: string
          created_at?: string
          decision_id?: string
          id?: string
          share_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_comments_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_comments_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "decision_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      bias_profiles: {
        Row: {
          ai_profile_summary: string | null
          common_biases: Json | null
          created_at: string
          fear_patterns: string | null
          id: string
          overconfidence_patterns: string | null
          risk_tolerance: string | null
          total_decisions_analyzed: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_profile_summary?: string | null
          common_biases?: Json | null
          created_at?: string
          fear_patterns?: string | null
          id?: string
          overconfidence_patterns?: string | null
          risk_tolerance?: string | null
          total_decisions_analyzed?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_profile_summary?: string | null
          common_biases?: Json | null
          created_at?: string
          fear_patterns?: string | null
          id?: string
          overconfidence_patterns?: string | null
          risk_tolerance?: string | null
          total_decisions_analyzed?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      decision_comparisons: {
        Row: {
          ai_comparison_analysis: string | null
          asymmetric_upside: string | null
          created_at: string
          decision_ids: string[]
          emotional_bias_differences: string | null
          hidden_costs: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_comparison_analysis?: string | null
          asymmetric_upside?: string | null
          created_at?: string
          decision_ids: string[]
          emotional_bias_differences?: string | null
          hidden_costs?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_comparison_analysis?: string | null
          asymmetric_upside?: string | null
          created_at?: string
          decision_ids?: string[]
          emotional_bias_differences?: string | null
          hidden_costs?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      decision_reflections: {
        Row: {
          aged_well: boolean | null
          ai_reflection_analysis: string | null
          created_at: string
          decision_id: string
          id: string
          reflection_type: string
          user_id: string
          what_differently: string | null
          what_surprised: string | null
        }
        Insert: {
          aged_well?: boolean | null
          ai_reflection_analysis?: string | null
          created_at?: string
          decision_id: string
          id?: string
          reflection_type: string
          user_id: string
          what_differently?: string | null
          what_surprised?: string | null
        }
        Update: {
          aged_well?: boolean | null
          ai_reflection_analysis?: string | null
          created_at?: string
          decision_id?: string
          id?: string
          reflection_type?: string
          user_id?: string
          what_differently?: string | null
          what_surprised?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decision_reflections_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_scores: {
        Row: {
          ai_score_explanation: string | null
          analysis_depth_score: number | null
          bias_score: number | null
          clarity_score: number | null
          created_at: string
          decision_id: string
          id: string
          overall_score: number | null
          reversibility_score: number | null
          updated_at: string
        }
        Insert: {
          ai_score_explanation?: string | null
          analysis_depth_score?: number | null
          bias_score?: number | null
          clarity_score?: number | null
          created_at?: string
          decision_id: string
          id?: string
          overall_score?: number | null
          reversibility_score?: number | null
          updated_at?: string
        }
        Update: {
          ai_score_explanation?: string | null
          analysis_depth_score?: number | null
          bias_score?: number | null
          clarity_score?: number | null
          created_at?: string
          decision_id?: string
          id?: string
          overall_score?: number | null
          reversibility_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "decision_scores_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: true
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_shares: {
        Row: {
          advisor_email: string
          advisor_name: string | null
          can_comment: boolean | null
          created_at: string
          decision_id: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          share_token: string
          shared_by: string
        }
        Insert: {
          advisor_email: string
          advisor_name?: string | null
          can_comment?: boolean | null
          created_at?: string
          decision_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          share_token?: string
          shared_by: string
        }
        Update: {
          advisor_email?: string
          advisor_name?: string | null
          can_comment?: boolean | null
          created_at?: string
          decision_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          share_token?: string
          shared_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "decision_shares_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_templates: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          name: string
          questions: Json
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id: string
          name: string
          questions: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          questions?: Json
        }
        Relationships: []
      }
      decisions: {
        Row: {
          ai_bias_explanation: string | null
          ai_insight_summary: string | null
          ai_scenario_analysis: string | null
          ai_second_order_analysis: string | null
          best_case_scenario: string | null
          biases_acknowledged: string | null
          biggest_fear: string | null
          category: string | null
          confidence_rating: number | null
          created_at: string
          current_step: number
          decision_summary: string | null
          description: string | null
          detected_biases: Json | null
          do_nothing_outcome: string | null
          final_decision: string | null
          future_regret: string | null
          id: string
          is_locked: boolean | null
          is_reversible: string | null
          key_reasons: string | null
          likely_case_scenario: string | null
          locked_at: string | null
          outcome: string | null
          risks_accepted: string | null
          second_order_effects: string | null
          status: string
          template_id: string | null
          time_horizon: string | null
          title: string
          updated_at: string
          user_id: string
          worst_case_scenario: string | null
        }
        Insert: {
          ai_bias_explanation?: string | null
          ai_insight_summary?: string | null
          ai_scenario_analysis?: string | null
          ai_second_order_analysis?: string | null
          best_case_scenario?: string | null
          biases_acknowledged?: string | null
          biggest_fear?: string | null
          category?: string | null
          confidence_rating?: number | null
          created_at?: string
          current_step?: number
          decision_summary?: string | null
          description?: string | null
          detected_biases?: Json | null
          do_nothing_outcome?: string | null
          final_decision?: string | null
          future_regret?: string | null
          id?: string
          is_locked?: boolean | null
          is_reversible?: string | null
          key_reasons?: string | null
          likely_case_scenario?: string | null
          locked_at?: string | null
          outcome?: string | null
          risks_accepted?: string | null
          second_order_effects?: string | null
          status?: string
          template_id?: string | null
          time_horizon?: string | null
          title: string
          updated_at?: string
          user_id: string
          worst_case_scenario?: string | null
        }
        Update: {
          ai_bias_explanation?: string | null
          ai_insight_summary?: string | null
          ai_scenario_analysis?: string | null
          ai_second_order_analysis?: string | null
          best_case_scenario?: string | null
          biases_acknowledged?: string | null
          biggest_fear?: string | null
          category?: string | null
          confidence_rating?: number | null
          created_at?: string
          current_step?: number
          decision_summary?: string | null
          description?: string | null
          detected_biases?: Json | null
          do_nothing_outcome?: string | null
          final_decision?: string | null
          future_regret?: string | null
          id?: string
          is_locked?: boolean | null
          is_reversible?: string | null
          key_reasons?: string | null
          likely_case_scenario?: string | null
          locked_at?: string | null
          outcome?: string | null
          risks_accepted?: string | null
          second_order_effects?: string | null
          status?: string
          template_id?: string | null
          time_horizon?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          worst_case_scenario?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          decisions_used_this_month: number | null
          email: string
          id: string
          last_decision_reset: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_payment_status: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          decisions_used_this_month?: number | null
          email: string
          id?: string
          last_decision_reset?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_status?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          decisions_used_this_month?: number | null
          email?: string
          id?: string
          last_decision_reset?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_status?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
