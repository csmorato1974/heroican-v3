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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_usage_events: {
        Row: {
          completion_tokens: number
          created_at: string
          error_status: string | null
          fallback: boolean
          id: string
          latency_ms: number | null
          model: string
          prompt_tokens: number
          provider: string
          request_id: string | null
          route: string
          success: boolean
          total_tokens: number
        }
        Insert: {
          completion_tokens?: number
          created_at?: string
          error_status?: string | null
          fallback?: boolean
          id?: string
          latency_ms?: number | null
          model: string
          prompt_tokens?: number
          provider?: string
          request_id?: string | null
          route: string
          success?: boolean
          total_tokens?: number
        }
        Update: {
          completion_tokens?: number
          created_at?: string
          error_status?: string | null
          fallback?: boolean
          id?: string
          latency_ms?: number | null
          model?: string
          prompt_tokens?: number
          provider?: string
          request_id?: string | null
          route?: string
          success?: boolean
          total_tokens?: number
        }
        Relationships: []
      }
      pet_analysis_events: {
        Row: {
          campaign: string | null
          created_at: string
          detected_animal: string | null
          error_type: string | null
          event_type: Database["public"]["Enums"]["pet_event_type"]
          fallback_used: boolean | null
          id: string
          recommended_focus: string | null
          session_id: string
          size_guess: string | null
          source: string | null
        }
        Insert: {
          campaign?: string | null
          created_at?: string
          detected_animal?: string | null
          error_type?: string | null
          event_type: Database["public"]["Enums"]["pet_event_type"]
          fallback_used?: boolean | null
          id?: string
          recommended_focus?: string | null
          session_id: string
          size_guess?: string | null
          source?: string | null
        }
        Update: {
          campaign?: string | null
          created_at?: string
          detected_animal?: string | null
          error_type?: string | null
          event_type?: Database["public"]["Enums"]["pet_event_type"]
          fallback_used?: boolean | null
          id?: string
          recommended_focus?: string | null
          session_id?: string
          size_guess?: string | null
          source?: string | null
        }
        Relationships: []
      }
      pet_registrations: {
        Row: {
          city: string | null
          consent_location: boolean
          consent_privacy: boolean
          consent_terms: boolean
          consent_whatsapp: boolean
          created_at: string
          dm_payload: string | null
          geolocation_status: string | null
          id: string
          latitude: number | null
          lead_status: string | null
          life_stage: string | null
          longitude: number | null
          pet_name: string | null
          pet_size: string | null
          source: string | null
          tutor_name: string | null
          whatsapp: string | null
        }
        Insert: {
          city?: string | null
          consent_location?: boolean
          consent_privacy?: boolean
          consent_terms?: boolean
          consent_whatsapp?: boolean
          created_at?: string
          dm_payload?: string | null
          geolocation_status?: string | null
          id?: string
          latitude?: number | null
          lead_status?: string | null
          life_stage?: string | null
          longitude?: number | null
          pet_name?: string | null
          pet_size?: string | null
          source?: string | null
          tutor_name?: string | null
          whatsapp?: string | null
        }
        Update: {
          city?: string | null
          consent_location?: boolean
          consent_privacy?: boolean
          consent_terms?: boolean
          consent_whatsapp?: boolean
          created_at?: string
          dm_payload?: string | null
          geolocation_status?: string | null
          id?: string
          latitude?: number | null
          lead_status?: string | null
          life_stage?: string | null
          longitude?: number | null
          pet_name?: string | null
          pet_size?: string | null
          source?: string | null
          tutor_name?: string | null
          whatsapp?: string | null
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
      pet_event_type: "started" | "success" | "failed" | "whatsapp_clicked"
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
      pet_event_type: ["started", "success", "failed", "whatsapp_clicked"],
    },
  },
} as const
