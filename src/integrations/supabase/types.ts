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
      badges: {
        Row: {
          description: string | null
          earned_at: string | null
          icon: string | null
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          name: string
          type: string
          user_id: string
        }
        Update: {
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          created_at: string
          creator_id: string
          creator_progress: number
          description: string | null
          end_date: string | null
          icon: string | null
          id: string
          opponent_id: string
          opponent_progress: number
          start_date: string | null
          status: string
          target_value: number
          title: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          creator_progress?: number
          description?: string | null
          end_date?: string | null
          icon?: string | null
          id?: string
          opponent_id: string
          opponent_progress?: number
          start_date?: string | null
          status?: string
          target_value?: number
          title: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          creator_progress?: number
          description?: string | null
          end_date?: string | null
          icon?: string | null
          id?: string
          opponent_id?: string
          opponent_progress?: number
          start_date?: string | null
          status?: string
          target_value?: number
          title?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          created_at: string | null
          date: string | null
          goal_id: string
          id: string
          note: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          goal_id: string
          id?: string
          note?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          goal_id?: string
          id?: string
          note?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_streaks: {
        Row: {
          created_at: string
          current_streak: number
          friend_id: string
          id: string
          last_interaction_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          friend_id: string
          id?: string
          last_interaction_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          friend_id?: string
          id?: string
          last_interaction_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: Database["public"]["Enums"]["goal_category"] | null
          color: string | null
          created_at: string | null
          current_value: number | null
          description: string | null
          icon: string | null
          id: string
          is_featured: boolean | null
          priority: Database["public"]["Enums"]["goal_priority"] | null
          start_date: string | null
          status: Database["public"]["Enums"]["goal_status"] | null
          target_date: string | null
          target_value: number | null
          title: string
          type: Database["public"]["Enums"]["goal_type"] | null
          updated_at: string | null
          user_id: string
          why: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["goal_category"] | null
          color?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          priority?: Database["public"]["Enums"]["goal_priority"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_date?: string | null
          target_value?: number | null
          title: string
          type?: Database["public"]["Enums"]["goal_type"] | null
          updated_at?: string | null
          user_id: string
          why?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["goal_category"] | null
          color?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          priority?: Database["public"]["Enums"]["goal_priority"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_date?: string | null
          target_value?: number | null
          title?: string
          type?: Database["public"]["Enums"]["goal_type"] | null
          updated_at?: string | null
          user_id?: string
          why?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          notification_mode: string | null
          timezone: string | null
          tree_level: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          notification_mode?: string | null
          timezone?: string | null
          tree_level?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          notification_mode?: string | null
          timezone?: string | null
          tree_level?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      streaks: {
        Row: {
          current_streak: number | null
          id: string
          last_check_in_date: string | null
          longest_streak: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          id?: string
          last_check_in_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_streak?: number | null
          id?: string
          last_check_in_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          goal_id: string
          id: string
          order_index: number | null
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          goal_id: string
          id?: string
          order_index?: number | null
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          goal_id?: string
          id?: string
          order_index?: number | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          category: string | null
          created_at: string | null
          current_value: number | null
          description: string | null
          earned_at: string | null
          icon: string | null
          id: string
          is_earned: boolean | null
          name: string
          target_type: string
          target_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          is_earned?: boolean | null
          name: string
          target_type: string
          target_value?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          is_earned?: boolean | null
          name?: string
          target_type?: string
          target_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          created_at: string
          id: string
          league_tier: string
          rank_position: number | null
          total_points: number
          updated_at: string
          user_id: string
          weekly_points: number
        }
        Insert: {
          created_at?: string
          id?: string
          league_tier?: string
          rank_position?: number | null
          total_points?: number
          updated_at?: string
          user_id: string
          weekly_points?: number
        }
        Update: {
          created_at?: string
          id?: string
          league_tier?: string
          rank_position?: number | null
          total_points?: number
          updated_at?: string
          user_id?: string
          weekly_points?: number
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          achievements_display_count: number
          created_at: string
          id: string
          notification_time: string | null
          notifications_enabled: boolean | null
          profile_visibility: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements_display_count?: number
          created_at?: string
          id?: string
          notification_time?: string | null
          notifications_enabled?: boolean | null
          profile_visibility?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements_display_count?: number
          created_at?: string
          id?: string
          notification_time?: string | null
          notifications_enabled?: boolean | null
          profile_visibility?: string | null
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
      get_user_email: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      goal_category:
        | "salud"
        | "finanzas"
        | "aprendizaje"
        | "relaciones"
        | "carrera"
        | "creatividad"
        | "bienestar"
        | "otro"
        | "ejercicio"
      goal_priority: "low" | "medium" | "high"
      goal_status: "active" | "paused" | "completed" | "abandoned"
      goal_type: "checklist" | "habit" | "quantitative"
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
      app_role: ["admin", "moderator", "user"],
      goal_category: [
        "salud",
        "finanzas",
        "aprendizaje",
        "relaciones",
        "carrera",
        "creatividad",
        "bienestar",
        "otro",
        "ejercicio",
      ],
      goal_priority: ["low", "medium", "high"],
      goal_status: ["active", "paused", "completed", "abandoned"],
      goal_type: ["checklist", "habit", "quantitative"],
    },
  },
} as const
