/**
 * app/api/finance/webhooks/resend/route.ts
 * Resend webhook receiver — processes delivery, bounce, complaint, and failure events.
 *
 * Security:
 * - Verifies Resend webhook signature using the Svix-compatible header
 * - Deduplicates events using resend_event_id (unique constraint)
 * - Never exposes secrets in responses
 */

import { NextRequest, NextResponse } from "next/server";
import { createFinanceServiceClient } from "@/lib/finance/supabase";

// Resend uses Svix for webhook signatures
// Header: svix-id, svix-timestamp, svix-signature
async function verifyResendSignature(
  request: NextRequest,
  rawBody: string
): Promise<boolean> {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] RESEND_WEBHOOK_SECRET not configured");
    return false;
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return false;
  }

  // Verify timestamp is within 5 minutes (prevent replay attacks)
  const timestampSeconds = parseInt(svixTimestamp, 10);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestampSeconds) > 300) {
    console.warn("[webhook] Timestamp too old — possible replay attack");
    return false;
  }

  // Reconstruct signed payload
  const signedPayload = `${svixId}.${svixTimestamp}.${rawBody}`;

  // Decode base64 secret (Svix format: "whsec_<base64>")
  const secretBytes = Buffer.from(
    secret.startsWith("whsec_") ? secret.slice(6) : secret,
    "base64"
  );

  // Compute HMAC-SHA256
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload)
  );

  const expectedSig = `v1,${Buffer.from(signature).toString("base64")}`;

  // svix-signature may have multiple values (v1,<sig1> v1,<sig2>)
  const signatures = svixSignature.split(" ");
  return signatures.some((sig) => sig === expectedSig);
}

// Map Resend event types to our internal status
function mapEventToStatus(
  eventType: string
): "delivered" | "bounced" | "complained" | "failed" | null {
  switch (eventType) {
    case "email.delivered":
      return "delivered";
    case "email.bounced":
      return "bounced";
    case "email.complained":
      return "complained";
    case "email.delivery_delayed":
    case "email.send_failed":
      return "failed";
    default:
      return null;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text();

  // Verify signature
  const isValid = await verifyResendSignature(request, rawBody);
  if (!isValid) {
    console.warn("[webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload.type as string;
  const svixId = request.headers.get("svix-id") ?? undefined;

  // Extract resend message ID from payload
  const data = payload.data as Record<string, unknown> | undefined;
  const resendMessageId = data?.email_id as string | undefined;

  const service = createFinanceServiceClient();

  // Find the matching email_message record
  let messageId: string | null = null;
  if (resendMessageId) {
    const { data: msg } = await service
      .from("email_messages")
      .select("id")
      .eq("resend_message_id", resendMessageId)
      .single();
    messageId = msg?.id ?? null;
  }

  // Insert event (dedup via resend_event_id unique constraint)
  try {
    await service.from("email_events").insert({
      message_id: messageId,
      resend_event_id: svixId ?? null,
      event_type: eventType,
      payload: payload as import("@/lib/finance/database.types").Json,
      received_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    // Unique constraint violation = duplicate event, safe to ignore
    const pgErr = err as { code?: string };
    if (pgErr?.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    console.error("[webhook] DB insert error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }

  // Update email_messages status if we matched a record
  const newStatus = mapEventToStatus(eventType);
  if (messageId && newStatus) {
    await service
      .from("email_messages")
      .update({ status: newStatus })
      .eq("id", messageId);
  }

  return NextResponse.json({ ok: true });
}
