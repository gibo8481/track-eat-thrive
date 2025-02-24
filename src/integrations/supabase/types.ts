export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      diet_preferences: {
        Row: {
          cooking_preference: string[] | null
          created_at: string
          diet_type: string | null
          id: string
          max_cooking_time: number | null
          max_ingredients: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cooking_preference?: string[] | null
          created_at?: string
          diet_type?: string | null
          id?: string
          max_cooking_time?: number | null
          max_ingredients?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cooking_preference?: string[] | null
          created_at?: string
          diet_type?: string | null
          id?: string
          max_cooking_time?: number | null
          max_ingredients?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      food_items: {
        Row: {
          calories: number
          carbs_g: number
          created_at: string
          fat_g: number
          fiber_g: number
          id: string
          name: string
          protein_g: number
          serving_size: string
          vitamin_a_mcg: number
          vitamin_b1_mg: number
          vitamin_b12_mcg: number
          vitamin_b6_mg: number
          vitamin_d_mcg: number
          vitamin_k_mcg: number
        }
        Insert: {
          calories: number
          carbs_g: number
          created_at?: string
          fat_g: number
          fiber_g: number
          id?: string
          name: string
          protein_g: number
          serving_size: string
          vitamin_a_mcg?: number
          vitamin_b1_mg?: number
          vitamin_b12_mcg?: number
          vitamin_b6_mg?: number
          vitamin_d_mcg?: number
          vitamin_k_mcg?: number
        }
        Update: {
          calories?: number
          carbs_g?: number
          created_at?: string
          fat_g?: number
          fiber_g?: number
          id?: string
          name?: string
          protein_g?: number
          serving_size?: string
          vitamin_a_mcg?: number
          vitamin_b1_mg?: number
          vitamin_b12_mcg?: number
          vitamin_b6_mg?: number
          vitamin_d_mcg?: number
          vitamin_k_mcg?: number
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          date: string
          food_item_id: string
          id: string
          logged_at: string
          meal_type: string
          servings: number
          user_id: string
        }
        Insert: {
          date?: string
          food_item_id: string
          id?: string
          logged_at?: string
          meal_type: string
          servings?: number
          user_id: string
        }
        Update: {
          date?: string
          food_item_id?: string
          id?: string
          logged_at?: string
          meal_type?: string
          servings?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          id: string
          user_id: string
          week_start_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          week_start_date: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          week_start_date?: string
        }
        Relationships: []
      }
      planned_meals: {
        Row: {
          day_of_week: number
          id: string
          meal_plan_id: string
          meal_type: string
          recipe_id: string
        }
        Insert: {
          day_of_week: number
          id?: string
          meal_plan_id: string
          meal_type: string
          recipe_id: string
        }
        Update: {
          day_of_week?: number
          id?: string
          meal_plan_id?: string
          meal_type?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planned_meals_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_meals_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          gender: string | null
          goal: string | null
          height_feet: number | null
          height_inches: number | null
          id: string
          updated_at: string
          weight_pounds: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          gender?: string | null
          goal?: string | null
          height_feet?: number | null
          height_inches?: number | null
          id: string
          updated_at?: string
          weight_pounds?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          gender?: string | null
          goal?: string | null
          height_feet?: number | null
          height_inches?: number | null
          id?: string
          updated_at?: string
          weight_pounds?: number | null
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          amount: number
          food_item_id: string
          id: string
          recipe_id: string
          unit: string
        }
        Insert: {
          amount: number
          food_item_id: string
          id?: string
          recipe_id: string
          unit: string
        }
        Update: {
          amount?: number
          food_item_id?: string
          id?: string
          recipe_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          recipe_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          recipe_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_reviews_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cooking_time_minutes: number | null
          created_at: string
          description: string | null
          id: string
          instructions: string
          name: string
          prep_time_minutes: number | null
          rating: number | null
          review_count: number | null
          servings: number | null
        }
        Insert: {
          cooking_time_minutes?: number | null
          created_at?: string
          description?: string | null
          id?: string
          instructions: string
          name: string
          prep_time_minutes?: number | null
          rating?: number | null
          review_count?: number | null
          servings?: number | null
        }
        Update: {
          cooking_time_minutes?: number | null
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string
          name?: string
          prep_time_minutes?: number | null
          rating?: number | null
          review_count?: number | null
          servings?: number | null
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          amount: number
          food_item_id: string
          id: string
          purchased: boolean
          shopping_list_id: string
          shopping_run: number
          unit: string
        }
        Insert: {
          amount: number
          food_item_id: string
          id?: string
          purchased?: boolean
          shopping_list_id: string
          shopping_run?: number
          unit: string
        }
        Update: {
          amount?: number
          food_item_id?: string
          id?: string
          purchased?: boolean
          shopping_list_id?: string
          shopping_run?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          id: string
          meal_plan_id: string
          split_into_runs: number
        }
        Insert: {
          created_at?: string
          id?: string
          meal_plan_id: string
          split_into_runs?: number
        }
        Update: {
          created_at?: string
          id?: string
          meal_plan_id?: string
          split_into_runs?: number
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      daily_nutrient_totals: {
        Row: {
          date: string | null
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_fiber: number | null
          total_protein: number | null
          total_vitamin_a: number | null
          total_vitamin_b1: number | null
          total_vitamin_b12: number | null
          total_vitamin_b6: number | null
          total_vitamin_d: number | null
          total_vitamin_k: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
