-- =============================================================================
-- UWAXtreme Finance Portal — Database Migration
-- Version: 001
-- Run via: supabase db push  (or paste into Supabase SQL editor)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: auto-updated updated_at trigger
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. profiles  (extends auth.users — one row per finance team member)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id             uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      text        NOT NULL,
  member_id      text        NOT NULL UNIQUE,          -- e.g. "amal-001"
  domain_email   text        NOT NULL UNIQUE,          -- e.g. "amal@uvaxtreme.dev"
  gmail_address  text,                                 -- personal Gmail for forwarding
  gmail_verified boolean     NOT NULL DEFAULT false,
  role           text        NOT NULL DEFAULT 'member'
                             CHECK (role IN ('member', 'admin')),
  is_active      boolean     NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. proposal_templates
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.proposal_templates (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  subject     text        NOT NULL,
  body        text        NOT NULL,
  is_default  boolean     NOT NULL DEFAULT false,
  created_by  uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_proposal_templates_updated_at
  BEFORE UPDATE ON public.proposal_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. companies  (approved contact list)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.companies (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  email       text        NOT NULL,
  contact     text,
  notes       text,
  created_by  uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. email_messages  (core audit log of all sent proposals)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_messages (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_profile_id uuid        NOT NULL REFERENCES public.profiles(id),
  from_address      text        NOT NULL,   -- always server-set domain email
  to_address        text        NOT NULL,
  company_name      text,
  subject           text        NOT NULL,
  body              text        NOT NULL,
  resend_message_id text,                   -- provider tracking ID
  idempotency_key   text        UNIQUE,     -- prevents duplicate sends
  status            text        NOT NULL DEFAULT 'queued'
                                CHECK (status IN ('queued','accepted','delivered','bounced','complained','failed')),
  sent_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_messages_sender    ON public.email_messages(sender_profile_id);
CREATE INDEX idx_email_messages_status    ON public.email_messages(status);
CREATE INDEX idx_email_messages_sent_at   ON public.email_messages(sent_at DESC);

CREATE TRIGGER trg_email_messages_updated_at
  BEFORE UPDATE ON public.email_messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. email_attachments  (metadata only; actual file in private Supabase Storage)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_attachments (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id    uuid        NOT NULL REFERENCES public.email_messages(id) ON DELETE CASCADE,
  filename      text        NOT NULL,
  size_bytes    bigint      NOT NULL,
  mime_type     text        NOT NULL,
  storage_path  text,       -- private bucket path, NOT a public URL
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_attachments_message ON public.email_attachments(message_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. email_events  (Resend webhook delivery events)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_events (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      uuid        REFERENCES public.email_messages(id) ON DELETE SET NULL,
  resend_event_id text        UNIQUE,   -- dedup webhook replays
  event_type      text        NOT NULL, -- delivered | bounced | complained | failed
  payload         jsonb,
  received_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_events_message  ON public.email_events(message_id);
CREATE INDEX idx_email_events_type     ON public.email_events(event_type);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. audit_logs
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      text        NOT NULL,  -- e.g. "SEND_EMAIL", "LOGIN", "CREATE_MEMBER"
  resource    text,                  -- e.g. "email_messages:uuid"
  details     jsonb,
  ip_address  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor     ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action    ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created   ON public.audit_logs(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. system_settings  (admin-only key-value config)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.system_settings (
  key         text        PRIMARY KEY,
  value       text        NOT NULL,
  description text,
  updated_by  uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Default settings
INSERT INTO public.system_settings (key, value, description) VALUES
  ('max_attachment_bytes',  '41943040', 'Maximum PDF attachment size in bytes (default: 40 MB)'),
  ('rate_limit_per_hour',   '20',       'Max emails a member can send per hour'),
  ('proposals_disclosure',  'true',     'Whether members are informed about BCC monitoring')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Seed: default proposal template
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.proposal_templates (name, subject, body, is_default) VALUES (
  'Standard Sponsorship Proposal',
  'UWAXtreme Hackathon — Sponsorship Proposal',
  E'Dear {{recipient_name}},\n\nGreetings from UWAXtreme!\n\nWe are reaching out to explore a potential sponsorship partnership for our upcoming hackathon. We believe that {{company_name}} could play an important role in supporting student innovation, technical excellence, and the next generation of technology professionals.\n\nPlease find our sponsorship proposal attached, outlining the event, sponsorship opportunities, and potential benefits for your organization.\n\nWe would be grateful for the opportunity to discuss this proposal with your team.\n\nThank you for your time and consideration.\n\nBest regards,\n{{sender_name}}\nFinance Team\nUWAXtreme\n{{sender_email}}',
  true
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Row Level Security Policies
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_attachments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings     ENABLE ROW LEVEL SECURITY;

-- Helper function: check if caller is admin
CREATE OR REPLACE FUNCTION is_finance_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: check if caller is active member or admin
CREATE OR REPLACE FUNCTION is_active_finance_member()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- profiles: members read own; admins read all; only service-role writes
CREATE POLICY "profiles_select_own"  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR is_finance_admin());

CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- proposal_templates: all active members can read; only admin can write
CREATE POLICY "templates_select"  ON public.proposal_templates FOR SELECT
  USING (is_active_finance_member());

CREATE POLICY "templates_insert"  ON public.proposal_templates FOR INSERT
  WITH CHECK (is_finance_admin());

CREATE POLICY "templates_update"  ON public.proposal_templates FOR UPDATE
  USING (is_finance_admin());

-- companies: all active members can read; admin writes
CREATE POLICY "companies_select"  ON public.companies FOR SELECT
  USING (is_active_finance_member());

CREATE POLICY "companies_insert"  ON public.companies FOR INSERT
  WITH CHECK (is_finance_admin());

CREATE POLICY "companies_update"  ON public.companies FOR UPDATE
  USING (is_finance_admin());

-- email_messages: members read own; admins read all; insert via server only
CREATE POLICY "email_messages_select" ON public.email_messages FOR SELECT
  USING (sender_profile_id = auth.uid() OR is_finance_admin());

-- email_attachments: inherit message access
CREATE POLICY "attachments_select" ON public.email_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.email_messages em
      WHERE em.id = message_id
        AND (em.sender_profile_id = auth.uid() OR is_finance_admin())
    )
  );

-- email_events: admin only
CREATE POLICY "events_select" ON public.email_events FOR SELECT
  USING (is_finance_admin());

-- audit_logs: members read own; admin reads all
CREATE POLICY "audit_select" ON public.audit_logs FOR SELECT
  USING (actor_id = auth.uid() OR is_finance_admin());

-- system_settings: admin only
CREATE POLICY "settings_select" ON public.system_settings FOR SELECT
  USING (is_finance_admin());

CREATE POLICY "settings_update" ON public.system_settings FOR UPDATE
  USING (is_finance_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. Supabase Storage bucket for attachments (run separately in dashboard)
-- ─────────────────────────────────────────────────────────────────────────────
-- NOTE: Execute this via the Supabase Storage dashboard UI, or via the
-- management API. The bucket must be PRIVATE (public=false).
--
-- bucket name: finance-attachments
-- public: false
-- file size limit: 41943040 (40 MB)
-- allowed mime types: application/pdf
