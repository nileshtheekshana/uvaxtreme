"use server";

/**
 * app/actions/finance/admin.ts
 * Admin-only server actions for member management and system settings.
 * All actions verify admin role server-side before executing.
 */

import { revalidatePath } from "next/cache";
import { requireFinanceAdmin } from "@/lib/finance/session";
import { createFinanceServiceClient } from "@/lib/finance/supabase";
import { CreateMemberSchema, SystemSettingsSchema } from "@/lib/finance/validators";
import { writeAuditLog } from "@/lib/finance/audit";
import { headers } from "next/headers";

export type AdminActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Create a new Finance Team member account.
 * Admin only. Uses service-role to create auth user.
 */
export async function createMember(
  _prevState: AdminActionResult,
  formData: FormData
): Promise<AdminActionResult> {
  const { user } = await requireFinanceAdmin();

  const rawInput = {
    full_name: formData.get("full_name")?.toString().trim() ?? "",
    member_id: formData.get("member_id")?.toString().trim() ?? "",
    email: formData.get("email")?.toString().trim() ?? "",
    domain_email: formData.get("domain_email")?.toString().trim() ?? "",
    password: formData.get("password")?.toString() ?? "",
    role: formData.get("role")?.toString() ?? "member",
    gmail_address: formData.get("gmail_address")?.toString().trim() ?? "",
  };

  const parsed = CreateMemberSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const service = createFinanceServiceClient();

  // Create auth user via service-role (bypasses signup restrictions)
  const { data: authUser, error: authError } =
    await service.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Mark as confirmed (admin-provisioned)
    });

  if (authError || !authUser.user) {
    return {
      error: `Failed to create account: ${authError?.message ?? "Unknown error"}`,
    };
  }

  // Create profile record
  const { error: profileError } = await service.from("profiles").insert({
    id: authUser.user.id,
    full_name: data.full_name,
    member_id: data.member_id,
    domain_email: data.domain_email,
    gmail_address: data.gmail_address || null,
    gmail_verified: false,
    role: data.role as "member" | "admin",
    is_active: true,
  });

  if (profileError) {
    // Rollback: delete auth user if profile creation failed
    await service.auth.admin.deleteUser(authUser.user.id);
    return {
      error: `Failed to create profile: ${profileError.message}`,
    };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for") ??
    headerStore.get("x-real-ip") ??
    "unknown";

  await writeAuditLog({
    actor_id: user.id,
    action: "CREATE_MEMBER",
    resource: `profiles:${authUser.user.id}`,
    details: { member_id: data.member_id, domain_email: data.domain_email },
    ip_address: ip,
  });

  revalidatePath("/finance/admin/members");
  return { success: true };
}

/**
 * Deactivate (soft-delete) a member.
 * Does not delete the auth account or DB records to preserve audit trail.
 */
export async function deactivateMember(
  memberId: string
): Promise<AdminActionResult> {
  const { user } = await requireFinanceAdmin();

  if (!memberId) return { error: "Member ID is required." };

  // Prevent admin from deactivating themselves
  if (memberId === user.id) {
    return { error: "You cannot deactivate your own account." };
  }

  const service = createFinanceServiceClient();

  const { error } = await service
    .from("profiles")
    .update({ is_active: false })
    .eq("id", memberId);

  if (error) {
    return { error: `Failed to deactivate member: ${error.message}` };
  }

  await writeAuditLog({
    actor_id: user.id,
    action: "DEACTIVATE_MEMBER",
    resource: `profiles:${memberId}`,
  });

  revalidatePath("/finance/admin/members");
  return { success: true };
}

/**
 * Reactivate a member.
 */
export async function reactivateMember(
  memberId: string
): Promise<AdminActionResult> {
  const { user } = await requireFinanceAdmin();
  if (!memberId) return { error: "Member ID is required." };

  const service = createFinanceServiceClient();

  const { error } = await service
    .from("profiles")
    .update({ is_active: true })
    .eq("id", memberId);

  if (error) {
    return { error: `Failed to reactivate member: ${error.message}` };
  }

  await writeAuditLog({
    actor_id: user.id,
    action: "DEACTIVATE_MEMBER",
    resource: `profiles:${memberId}`,
    details: { reactivated: true },
  });

  revalidatePath("/finance/admin/members");
  return { success: true };
}

/**
 * Update system settings.
 */
export async function updateSystemSettings(
  _prevState: AdminActionResult,
  formData: FormData
): Promise<AdminActionResult> {
  const { user } = await requireFinanceAdmin();

  const rawInput = {
    max_attachment_bytes: parseInt(
      formData.get("max_attachment_bytes")?.toString() ?? "41943040",
      10
    ),
    rate_limit_per_hour: parseInt(
      formData.get("rate_limit_per_hour")?.toString() ?? "20",
      10
    ),
    bcc_monitor_email: formData.get("bcc_monitor_email")?.toString().trim() ?? "",
  };

  const parsed = SystemSettingsSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const service = createFinanceServiceClient();
  const entries = [
    {
      key: "max_attachment_bytes",
      value: String(parsed.data.max_attachment_bytes),
      updated_by: user.id,
    },
    {
      key: "rate_limit_per_hour",
      value: String(parsed.data.rate_limit_per_hour),
      updated_by: user.id,
    },
    ...(parsed.data.bcc_monitor_email
      ? [
          {
            key: "bcc_monitor_email",
            value: parsed.data.bcc_monitor_email,
            updated_by: user.id,
          },
        ]
      : []),
  ];

  for (const entry of entries) {
    const { error } = await service
      .from("system_settings")
      .upsert(entry, { onConflict: "key" });

    if (error) {
      return { error: `Failed to save setting "${entry.key}": ${error.message}` };
    }
  }

  await writeAuditLog({
    actor_id: user.id,
    action: "UPDATE_SETTINGS",
    details: {
      max_attachment_bytes: parsed.data.max_attachment_bytes,
      rate_limit_per_hour: parsed.data.rate_limit_per_hour,
    },
  });

  revalidatePath("/finance/admin/settings");
  return { success: true };
}
