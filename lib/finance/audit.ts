/**
 * lib/finance/audit.ts
 * Server-side audit logging.
 * Uses service-role client so logs cannot be suppressed by RLS.
 */

import { createFinanceServiceClient } from "./supabase";

type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "SEND_EMAIL"
  | "UPLOAD_ATTACHMENT"
  | "CREATE_MEMBER"
  | "DEACTIVATE_MEMBER"
  | "UPDATE_SETTINGS"
  | "CREATE_TEMPLATE"
  | "CREATE_COMPANY"
  | "UPDATE_GMAIL";

export async function writeAuditLog(params: {
  actor_id: string | null;
  action: AuditAction;
  resource?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
}) {
  try {
    const service = createFinanceServiceClient();
    await service.from("audit_logs").insert({
      actor_id: params.actor_id,
      action: params.action,
      resource: params.resource ?? null,
      details: (params.details ?? null) as import("./database.types").Json | null,
      ip_address: params.ip_address ?? null,
    });
  } catch (err) {
    // Audit log failures must never break the main operation.
    // Log to stderr for Vercel function logs.
    console.error("[audit] Failed to write audit log:", err);
  }
}
