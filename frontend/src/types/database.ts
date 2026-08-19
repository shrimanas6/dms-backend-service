/**
 * Hand-maintained mirror of backend/supabase/migrations/.
 *
 * Every table must carry a `Relationships` key: supabase-js constrains each table
 * to `GenericTable`, and a table missing it fails the constraint, which silently
 * collapses every query result in the app to `never`.
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      donations: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          transaction_id: string;
          notes: string | null;
          created_at: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          status: string;
          currency: string;
          amount_paise: number | null;
          method: string | null;
          receipt: string | null;
          failure_reason: string | null;
          paid_at: string | null;
          updated_at: string;
        };
        // NOTE: donations are written exclusively by the backend using the service
        // role key. The browser has SELECT access only - the INSERT/UPDATE/DELETE
        // policies were dropped in
        // supabase/migrations/20260819120000_add_razorpay_payment_fields.sql.
        // These shapes exist because supabase-js requires them; a write attempted
        // from the browser is rejected by the database with error 42501.
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          transaction_id: string;
          notes?: string | null;
          created_at?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          status?: string;
          currency?: string;
          amount_paise?: number | null;
          method?: string | null;
          receipt?: string | null;
          failure_reason?: string | null;
          paid_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          transaction_id?: string;
          notes?: string | null;
          created_at?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          status?: string;
          currency?: string;
          amount_paise?: number | null;
          method?: string | null;
          receipt?: string | null;
          failure_reason?: string | null;
          paid_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          notifications_enabled: boolean;
          sms_enabled: boolean;
          last_reminder_sent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          notifications_enabled?: boolean;
          sms_enabled?: boolean;
          last_reminder_sent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          notifications_enabled?: boolean;
          sms_enabled?: boolean;
          last_reminder_sent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
