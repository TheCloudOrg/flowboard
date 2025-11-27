/**
 * Database Types
 *
 * TypeScript types for Supabase database tables
 * These match the schema in supabase/migrations/001_initial_schema_simplified.sql
 */

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          slug: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
      };
      boards: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name?: string;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      columns: {
        Row: {
          id: string;
          board_id: string;
          title: string;
          color: string;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          title: string;
          color?: string;
          position: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          title?: string;
          color?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      cards: {
        Row: {
          id: string;
          column_id: string;
          board_id: string;
          title: string;
          description: string | null;
          notes: string | null;
          position: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          column_id: string;
          board_id: string;
          title: string;
          description?: string | null;
          notes?: string | null;
          position: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          column_id?: string;
          board_id?: string;
          title?: string;
          description?: string | null;
          notes?: string | null;
          position?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          organization_id: string;
          plan_tier: string;
          status: string;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          plan_tier?: string;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          plan_tier?: string;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      usage_tracking: {
        Row: {
          id: string;
          organization_id: string;
          metric_type: string;
          count: number;
          period_month: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          metric_type: string;
          count?: number;
          period_month: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          metric_type?: string;
          count?: number;
          period_month?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      waitlist: {
        Row: {
          id: string;
          email: string;
          plan_interest: string;
          organization_id: string | null;
          user_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          plan_interest: string;
          organization_id?: string | null;
          user_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          plan_interest?: string;
          organization_id?: string | null;
          user_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
};

// Helper types for easier usage
export type User = Database['public']['Tables']['users']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row'];
export type Board = Database['public']['Tables']['boards']['Row'];
export type Column = Database['public']['Tables']['columns']['Row'];
export type Card = Database['public']['Tables']['cards']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type UsageTracking = Database['public']['Tables']['usage_tracking']['Row'];
export type Waitlist = Database['public']['Tables']['waitlist']['Row'];

export type InsertUser = Database['public']['Tables']['users']['Insert'];
export type InsertOrganization = Database['public']['Tables']['organizations']['Insert'];
export type InsertOrganizationMember =
  Database['public']['Tables']['organization_members']['Insert'];
export type InsertBoard = Database['public']['Tables']['boards']['Insert'];
export type InsertColumn = Database['public']['Tables']['columns']['Insert'];
export type InsertCard = Database['public']['Tables']['cards']['Insert'];
export type InsertSubscription = Database['public']['Tables']['subscriptions']['Insert'];
export type InsertUsageTracking = Database['public']['Tables']['usage_tracking']['Insert'];
export type InsertWaitlist = Database['public']['Tables']['waitlist']['Insert'];

export type UpdateUser = Database['public']['Tables']['users']['Update'];
export type UpdateOrganization = Database['public']['Tables']['organizations']['Update'];
export type UpdateOrganizationMember =
  Database['public']['Tables']['organization_members']['Update'];
export type UpdateBoard = Database['public']['Tables']['boards']['Update'];
export type UpdateColumn = Database['public']['Tables']['columns']['Update'];
export type UpdateCard = Database['public']['Tables']['cards']['Update'];
export type UpdateSubscription = Database['public']['Tables']['subscriptions']['Update'];
export type UpdateUsageTracking = Database['public']['Tables']['usage_tracking']['Update'];
export type UpdateWaitlist = Database['public']['Tables']['waitlist']['Update'];
