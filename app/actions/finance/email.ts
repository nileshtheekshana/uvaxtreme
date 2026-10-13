"use server";

/**
 * app/actions/finance/email.ts
 * Server Action: send a sponsorship proposal email via Resend.
 */

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { requireFinanceAuth } from "@/lib/finance/session";
import { SendEmailSchema } from "@/lib/finance/validators";
import { validatePdfMagicBytes, sanitizeFilename } from "@/lib/finance/attachments";

export type SendEmailResult = {
  success?: boolean;
  messageId?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// ── HTML email builder — black + orange + white theme ─────────────────────────

const SIGNATURE_REGEX = /^(kind regards|warm regards|sincerely|best regards|regards)/i;
const ATTACHMENT_REGEX = /proposal attached|find.*attached|attached.*proposal/i;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const SIGNATURE_TRIGGER = /^(kind regards|warm regards|sincerely|best regards|regards)/i;

function buildHtmlEmail(
  textBody: string,
  subject: string,
  senderName?: string,
  senderPhone?: string,
  senderEmail?: string
): string {
  // Normalize Windows line endings
  const normalized = textBody.replace(/\r\n/g, "\n").trim();
  const rawParagraphs = normalized.split(/\n\s*\n/);

  // Detect where the user starts their closing / signature (e.g. "Kind regards", "Sincerely")
  let sigIdx = rawParagraphs.length;
  for (let i = 0; i < rawParagraphs.length; i++) {
    const firstLine = rawParagraphs[i].trim().split("\n")[0]?.trim() || "";
    if (SIGNATURE_TRIGGER.test(firstLine)) {
      sigIdx = i;
      break;
    }
  }

  // Only take the actual letter body before the signature block
  const bodyParas = rawParagraphs.slice(0, sigIdx);

  // Render paragraphs cleanly with proper typographic hierarchy
  const bodyHtml = bodyParas
    .map((para) => {
      const trimmed = para.trim();
      if (!trimmed) return "";

      const lines = trimmed.split("\n");
      const bulletLines = lines.filter((l) => /^[•\-\*·]\s*/.test(l.trim()));
      const isBulletList = bulletLines.length > 0;

      // Bullet list items
      if (isBulletList) {
        const nonBulletLines = lines.filter((l) => !/^[•\-\*·]\s*/.test(l.trim()) && l.trim().length > 0);
        const headersHtml = nonBulletLines
          .map((l) => `<p style="margin:24px 0 10px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#0f172a;letter-spacing:0.2px;">${esc(l.trim())}</p>`)
          .join("\n");

        const itemsHtml = bulletLines
          .map((l) => {
            const cleanLine = l.trim().replace(/^[•\-\*·]\s*/, "");
            if (!cleanLine) return "";
            
            // Check for title: description pattern (e.g. "Talent Engagement Opportunities: ...")
            const colonIdx = cleanLine.indexOf(":");
            if (colonIdx > 0 && colonIdx < 45) {
              const bTitle = cleanLine.substring(0, colonIdx);
              const bDesc = cleanLine.substring(colonIdx + 1).trim();
              return `
              <tr>
                <td style="width:20px;vertical-align:top;padding:6px 0;font-size:16px;color:#ea580c;line-height:1.5;">&bull;</td>
                <td style="vertical-align:top;padding:6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14.5px;color:#334155;line-height:1.65;">
                  <strong style="color:#0f172a;">${esc(bTitle)}:</strong> ${esc(bDesc)}
                </td>
              </tr>`;
            }

            return `
              <tr>
                <td style="width:20px;vertical-align:top;padding:6px 0;font-size:16px;color:#ea580c;line-height:1.5;">&bull;</td>
                <td style="vertical-align:top;padding:6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14.5px;color:#334155;line-height:1.65;">
                  ${esc(cleanLine)}
                </td>
              </tr>`;
          })
          .join("");

        return `
          ${headersHtml}
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:14px 0 20px 0;background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #ea580c;border-radius:6px;padding:12px 18px;">
            ${itemsHtml}
          </table>`;
      }

      // Section header ("Why Partner with UvaXtreme 2026:")
      if (trimmed.endsWith(":") && trimmed.length < 60) {
        return `<p style="margin:24px 0 10px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#0f172a;letter-spacing:0.2px;">${esc(trimmed)}</p>`;
      }

      // Salutation ("Dear ...")
      if (/^dear\s/i.test(trimmed)) {
        return `<p style="margin:0 0 18px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;color:#0f172a;line-height:1.5;">${esc(trimmed).replace(/\n/g, "<br>")}</p>`;
      }

      // Standard letter paragraph
      return `<p style="margin:0 0 16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:#334155;line-height:1.75;">${esc(trimmed).replace(/\n/g, "<br>")}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  const sName = senderName || "Finance Committee";
  const sPhone = senderPhone || "+94 76 283 2088";
  const sEmail = senderEmail || "finance@uvaxtreme.dev";

  // Executive signature card (sleek corporate dark card)
  const signatureCard = `
    <div style="margin-top:26px;padding-top:18px;border-top:1px solid #e2e8f0;">
      <p style="margin:0 0 12px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:#334155;">Sincerely,</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="background-color:#090d16;border-left:4px solid #ea580c;border-radius:6px;padding:20px 24px;">
            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:15.5px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">
              ${esc(sName)}
            </p>
            <p style="margin:4px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:#cbd5e1;">
              Finance Committee &amp; Corporate Relations &bull; UvaXtreme 2026
            </p>
            <p style="margin:2px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:12px;color:#94a3b8;">
              IEEE Computer Society Student Branch Chapter &bull; Uva Wellassa University of Sri Lanka
            </p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:12px;padding-top:10px;border-top:1px solid #1e293b;width:100%;">
              <tr>
                <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:12px;color:#94a3b8;line-height:1.8;">
                  <span>📧 Email: <a href="mailto:${esc(sEmail)}" style="color:#f97316;text-decoration:none;">${esc(sEmail)}</a></span>
                  &nbsp;&bull;&nbsp;
                  <span>📞 Phone: <span style="color:#e2e8f0;">${esc(sPhone)}</span></span>
                  <br>
                  <span>🌐 Website: <a href="https://uvaxtreme.dev" target="_blank" style="color:#f97316;text-decoration:none;">www.uvaxtreme.dev</a></span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;-webkit-font-smoothing:antialiased;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f1f5f9;">
  <tr>
    <td align="center" style="padding:28px 12px 36px;">

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">

        <!-- ══ OFFICIAL BANNER IMAGE ═══════════════════════════════════════ -->
        <tr>
          <td style="padding:0;background-color:#000000;line-height:0;font-size:0;">
            <img
              src="https://i.imgur.com/q0XnubA.png"
              alt="UvaXtreme 2026 - Sponsorship Proposal"
              width="600"
              style="width:100%;max-width:600px;height:auto;display:block;border:0;outline:none;text-decoration:none;"
            />
          </td>
        </tr>

        <!-- ══ ORANGE ACCENT LINE ═════════════════════════════════════════ -->
        <tr>
          <td style="background:linear-gradient(90deg,#ea580c 0%,#f97316 50%,#fbbf24 100%);height:4px;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- ══ BODY CONTENT ═══════════════════════════════════════════════ -->
        <tr>
          <td style="background-color:#ffffff;padding:36px 40px 32px 40px;">
            ${bodyHtml}
            ${signatureCard}
          </td>
        </tr>

        <!-- ══ FOOTER ════════════════════════════════════════════════════ -->
        <tr>
          <td style="background-color:#020617;padding:18px 36px;border-top:1px solid #0f172a;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:middle;">
                  <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Arial,sans-serif;font-size:11px;color:#64748b;line-height:1.5;">
                    &copy; 2026 UvaXtreme &bull; IEEE Computer Society Student Branch Chapter &bull; Uva Wellassa University, Sri Lanka
                  </p>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <a href="https://uvaxtreme.dev" target="_blank" style="font-family:-apple-system,BlinkMacSystemFont,Arial,sans-serif;font-size:12px;font-weight:700;color:#ea580c;text-decoration:none;">uvaxtreme.dev &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
</body>
</html>`;
}


// ── DB helpers (best-effort, never throw to caller) ────────────────────────────

async function tryInsertEmailRecord(payload: {
  sender_profile_id: string;
  from_address: string;
  to_address: string;
  company_name: string | null;
  subject: string;
  body: string;
  idempotency_key: string;
}): Promise<{ id: string } | null> {
  // If service key is not configured, skip DB entirely
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || serviceKey === "your-supabase-service-role-key") {
    console.warn("[email] SUPABASE_SERVICE_ROLE_KEY not set — skipping DB record creation.");
    return null;
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await service
      .from("email_messages")
      .insert({ ...payload, status: "queued" })
      .select("id")
      .single();

    if (error) {
      // 23505 = duplicate idempotency key — already sent
      if (error.code === "23505") throw new Error("DUPLICATE");
      console.warn("[email] DB insert skipped (migration not run?):", error.message);
      return null;
    }
    return data as { id: string };
  } catch (err) {
    if (err instanceof Error && err.message === "DUPLICATE") throw err;
    console.warn("[email] DB unavailable, skipping record creation:", String(err));
    return null;
  }
}

async function tryUpdateEmailRecord(
  id: string,
  fields: { status?: string; resend_message_id?: string; sent_at?: string }
): Promise<void> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || serviceKey === "your-supabase-service-role-key") return;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    await service.from("email_messages").update(fields).eq("id", id);
  } catch {
    // Silently skip — DB not available
  }
}

// ── Main action ────────────────────────────────────────────────────────────────

export async function sendProposalEmail(
  _prevState: SendEmailResult,
  formData: FormData
): Promise<SendEmailResult> {
  // ── 1. Authentication ──────────────────────────────────────────────────────
  const { user, profile } = await requireFinanceAuth();

  // ── 2. Input validation ────────────────────────────────────────────────────
  const rawInput = {
    to_address:      formData.get("to_address")?.toString().trim() ?? "",
    company_name:    formData.get("company_name")?.toString() ?? "",
    subject:         formData.get("subject")?.toString() ?? "",
    body:            formData.get("body")?.toString() ?? "",
    template_id:     formData.get("template_id")?.toString() || undefined,
    idempotency_key: formData.get("idempotency_key")?.toString() ?? "",
  };

  console.log("[email] Raw input received:", {
    to_address: rawInput.to_address,
    subject: rawInput.subject,
    body_length: rawInput.body.length,
    idempotency_key: rawInput.idempotency_key,
  });

  const parsed = SendEmailSchema.safeParse(rawInput);
  if (!parsed.success) {
    console.error("[email] Validation failed:", parsed.error.flatten().fieldErrors);
    return {
      error: "Validation failed. Please check your inputs.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { to_address, company_name, subject, body, idempotency_key } = parsed.data;

  // ── 3. Sender identity from server-side profile & form details ───────────
  const from_address = profile.domain_email;
  const rawSenderName = formData.get("sender_name")?.toString().trim();
  const rawSenderPhone = formData.get("sender_phone")?.toString().trim();
  const rawSenderEmail = formData.get("sender_email")?.toString().trim();
  const from_name = rawSenderName && rawSenderName.length > 0
    ? `${rawSenderName} | UvaXtreme 2026`
    : "Finance Committee | UvaXtreme 2026";

  // ── 4. Process PDF attachment ──────────────────────────────────────────────
  const MAX_BYTES = 40 * 1024 * 1024; // 40 MB (Resend limit)
  const useDefaultPdf = formData.get("use_default_pdf") === "true";
  const pdfFile = formData.get("attachment") as File | null;
  let attachmentData: { filename: string; content: Buffer; size: number } | null = null;

  if (useDefaultPdf) {
    try {
      const defaultPdfPath = path.join(process.cwd(), "public", "Sponsorship Proposal.pdf");
      const buffer = await fs.readFile(defaultPdfPath);
      attachmentData = {
        filename: "UvaXtreme-2026-Sponsorship-Proposal.pdf",
        content: buffer,
        size: buffer.length,
      };
      console.log(
        `[email] Attached default PDF from disk: ${attachmentData.filename} (${(attachmentData.size / 1024 / 1024).toFixed(2)} MB)`
      );
    } catch (readErr) {
      console.error("[email] Failed to read default PDF from disk:", readErr);
      return { error: "Failed to load default sponsorship proposal on server." };
    }
  } else if (pdfFile && pdfFile.size > 0) {
    if (pdfFile.size > MAX_BYTES) {
      return { error: `Attachment too large. Maximum size is 40 MB.` };
    }

    const buffer = Buffer.from(await pdfFile.arrayBuffer());

    if (!validatePdfMagicBytes(buffer)) {
      return { error: "Attachment must be a valid PDF file." };
    }

    attachmentData = {
      filename: sanitizeFilename(pdfFile.name),
      content: buffer,
      size: pdfFile.size,
    };
  }

  // ── 5. Create DB record (best-effort — never blocks email send) ────────────
  let msgRecord: { id: string } | null = null;
  try {
    msgRecord = await tryInsertEmailRecord({
      sender_profile_id: user.id,
      from_address,
      to_address,
      company_name: company_name || null,
      subject,
      body,
      idempotency_key,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "DUPLICATE") {
      return { error: "This email was already submitted. Please refresh and try again." };
    }
    // Any other DB error: log and continue (don't block email send)
    console.warn("[email] Unexpected DB error (will continue to send):", String(err));
  }

  // ── 6. BCC — always from env, never from client ───────────────────────────
  // Only include BCC if it's a real address (not the placeholder)
  const rawBcc = process.env.FINANCE_ADMIN_BCC_EMAIL ?? "";
  const bccEmail =
    rawBcc && rawBcc !== "admin-monitor@example.com" ? rawBcc : null;

  if (bccEmail) {
    console.log("[email] BCC configured:", bccEmail);
  } else {
    console.log("[email] BCC not configured — sending without BCC.");
  }

  // ── 7. Send via Resend ────────────────────────────────────────────────────
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY is not set.");
    return { error: "Email service is not configured. Please contact the administrator." };
  }

  const resend = new Resend(apiKey);

  const emailPayload: Parameters<typeof resend.emails.send>[0] = {
    from: `${from_name} <${from_address}>`,
    to: [to_address],
    replyTo: rawSenderEmail || from_address,
    subject,
    // HTML: branded executive template with official banner image
    html: buildHtmlEmail(
      body,
      subject,
      rawSenderName,
      rawSenderPhone,
      rawSenderEmail || from_address
    ),
    // Plain text: fallback for email clients that don't render HTML
    text: body,
    headers: {
      "X-Entity-Ref-ID": idempotency_key,
    },
    ...(bccEmail ? { bcc: [bccEmail] } : {}),
    ...(attachmentData
      ? { attachments: [{ filename: attachmentData.filename, content: attachmentData.content }] }
      : {}),
  };

  console.log("[email] Sending via Resend:", {
    from: emailPayload.from,
    to: emailPayload.to,
    subject: emailPayload.subject,
    has_bcc: !!bccEmail,
    has_attachment: !!attachmentData,
  });

  // idempotencyKey is the second arg (request option), not part of the payload
  const requestOptions: Parameters<typeof resend.emails.send>[1] = {
    idempotencyKey: `proposal/${idempotency_key}`,
  };

  let resendData: { id: string } | null = null;
  let resendError: { message: string; name: string } | null = null;

  try {
    const result = await resend.emails.send(emailPayload, requestOptions);
    resendData = result.data;
    resendError = result.error;
  } catch (networkErr) {
    console.error("[email] Resend network error:", networkErr);
    resendError = {
      message: networkErr instanceof Error ? networkErr.message : "Network error",
      name:    "NetworkError",
    };
  }

  if (resendError || !resendData?.id) {
    console.error("[email] Resend send failed:", resendError?.message);
    if (msgRecord) {
      await tryUpdateEmailRecord(msgRecord.id, { status: "failed" });
    }
    return {
      error: `Email send failed: ${resendError?.message ?? "Unknown error"}. Please try again.`,
    };
  }

  const resendId = resendData.id;
  console.log("[email] Sent successfully. Resend ID:", resendId);

  // ── 8. Update DB record with Resend ID (best-effort) ─────────────────────
  if (msgRecord) {
    await tryUpdateEmailRecord(msgRecord.id, {
      status:            "accepted",
      resend_message_id: resendId,
      sent_at:           new Date().toISOString(),
    });
  }

  revalidatePath("/finance/history");
  revalidatePath("/finance/admin");

  return {
    success:   true,
    messageId: msgRecord?.id ?? resendId,
  };
}
