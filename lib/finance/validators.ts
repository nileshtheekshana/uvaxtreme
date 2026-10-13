/**
 * lib/finance/validators.ts
 * Zod validation schemas for all Finance Portal inputs.
 * All validation happens server-side — client validation is convenience only.
 */

import { z } from "zod";

// ─── Email send ───────────────────────────────────────────────────────────────
export const SendEmailSchema = z.object({
  to_address: z
    .string()
    .min(1, "Recipient email is required")
    .email("Invalid recipient email address")
    .max(320, "Email address too long"),

  company_name: z
    .string()
    .max(200, "Company name too long")
    .optional()
    .or(z.literal("")),

  subject: z
    .string()
    .min(1, "Subject is required")
    .max(998, "Subject line too long"),

  body: z
    .string()
    .min(1, "Email body is required")
    .max(100_000, "Email body too long"),

  template_id: z.string().min(1).optional(),

  idempotency_key: z
    .string()
    .uuid("Invalid idempotency key"),
});

export type SendEmailInput = z.infer<typeof SendEmailSchema>;

// ─── Member creation (admin only) ────────────────────────────────────────────
export const CreateMemberSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name too long"),

  member_id: z
    .string()
    .min(2, "Member ID must be at least 2 characters")
    .max(50, "Member ID too long")
    .regex(/^[a-z0-9-]+$/, "Member ID must be lowercase letters, numbers, or hyphens"),

  email: z
    .string()
    .email("Invalid login email address"),

  domain_email: z
    .string()
    .email("Invalid domain email address")
    .refine(
      (e) => e.endsWith("@uvaxtreme.dev"),
      "Domain email must be @uvaxtreme.dev"
    ),

  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(72, "Password too long"),

  role: z.enum(["member", "admin"]),

  gmail_address: z
    .string()
    .email("Invalid Gmail address")
    .optional()
    .or(z.literal("")),
});

export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;

// ─── Update Gmail address (member self-service) ───────────────────────────────
export const UpdateGmailSchema = z.object({
  gmail_address: z
    .string()
    .email("Invalid Gmail address")
    .refine(
      (e) => e.endsWith("@gmail.com"),
      "Must be a Gmail address (@gmail.com)"
    ),
});

export type UpdateGmailInput = z.infer<typeof UpdateGmailSchema>;

// ─── Proposal template ────────────────────────────────────────────────────────
export const TemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(100),
  subject: z.string().min(1, "Subject is required").max(998),
  body: z.string().min(1, "Body is required").max(100_000),
  is_default: z.boolean().default(false),
});

export type TemplateInput = z.infer<typeof TemplateSchema>;

// ─── Company ──────────────────────────────────────────────────────────────────
export const CompanySchema = z.object({
  name: z.string().min(1, "Company name is required").max(200),
  email: z.string().email("Invalid email").max(320),
  contact: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type CompanyInput = z.infer<typeof CompanySchema>;

// ─── System settings ──────────────────────────────────────────────────────────
export const SystemSettingsSchema = z.object({
  max_attachment_bytes: z
    .number()
    .min(1_000_000, "Minimum 1 MB")
    .max(41_943_040, "Maximum 40 MB (Resend limit)"),
  rate_limit_per_hour: z
    .number()
    .min(1, "At least 1 per hour")
    .max(100, "Maximum 100 per hour"),
  bcc_monitor_email: z
    .string()
    .email("Invalid BCC email address")
    .optional()
    .or(z.literal("")),
});

export type SystemSettingsInput = z.infer<typeof SystemSettingsSchema>;
