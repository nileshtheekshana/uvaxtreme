/**
 * lib/finance/database.types.ts
 * TypeScript types matching the Supabase schema.
 * Conforms to the @supabase/supabase-js Database generic interface.
 * Re-generate with: npx supabase gen types typescript --local > lib/finance/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MemberRole = "member" | "admin";
export type EmailStatus =
  | "queued"
  | "accepted"
  | "delivered"
  | "bounced"
  | "complained"
  | "failed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          member_id: string;
          domain_email: string;
          gmail_address: string | null;
          gmail_verified: boolean;
          role: MemberRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          member_id: string;
          domain_email: string;
          gmail_address?: string | null;
          gmail_verified?: boolean;
          role?: MemberRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          member_id?: string;
          domain_email?: string;
          gmail_address?: string | null;
          gmail_verified?: boolean;
          role?: MemberRole;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      proposal_templates: {
        Row: {
          id: string;
          name: string;
          subject: string;
          body: string;
          is_default: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subject: string;
          body: string;
          is_default?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subject?: string;
          body?: string;
          is_default?: boolean;
          created_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      companies: {
        Row: {
          id: string;
          name: string;
          email: string;
          contact: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          contact?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          contact?: string | null;
          notes?: string | null;
          created_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      email_messages: {
        Row: {
          id: string;
          sender_profile_id: string;
          from_address: string;
          to_address: string;
          company_name: string | null;
          subject: string;
          body: string;
          resend_message_id: string | null;
          idempotency_key: string | null;
          status: EmailStatus;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_profile_id: string;
          from_address: string;
          to_address: string;
          company_name?: string | null;
          subject: string;
          body: string;
          resend_message_id?: string | null;
          idempotency_key?: string | null;
          status?: EmailStatus;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sender_profile_id?: string;
          from_address?: string;
          to_address?: string;
          company_name?: string | null;
          subject?: string;
          body?: string;
          resend_message_id?: string | null;
          idempotency_key?: string | null;
          status?: EmailStatus;
          sent_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      email_attachments: {
        Row: {
          id: string;
          message_id: string;
          filename: string;
          size_bytes: number;
          mime_type: string;
          storage_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          filename: string;
          size_bytes: number;
          mime_type: string;
          storage_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          filename?: string;
          size_bytes?: number;
          mime_type?: string;
          storage_path?: string | null;
        };
        Relationships: [];
      };

      email_events: {
        Row: {
          id: string;
          message_id: string | null;
          resend_event_id: string | null;
          event_type: string;
          payload: Json | null;
          received_at: string;
        };
        Insert: {
          id?: string;
          message_id?: string | null;
          resend_event_id?: string | null;
          event_type: string;
          payload?: Json | null;
          received_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string | null;
          resend_event_id?: string | null;
          event_type?: string;
          payload?: Json | null;
          received_at?: string;
        };
        Relationships: [];
      };

      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          resource: string | null;
          details: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          resource?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };

      system_settings: {
        Row: {
          key: string;
          value: string;
          description: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: string;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_finance_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_active_finance_member: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
