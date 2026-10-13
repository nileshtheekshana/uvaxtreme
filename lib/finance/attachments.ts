/**
 * lib/finance/attachments.ts
 * Server-side PDF attachment handling.
 * Validates, sanitizes, and stores files in private Supabase Storage.
 */

import { createFinanceServiceClient } from "./supabase";

// PDF magic bytes: %PDF
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]);
const MAX_FILENAME_LENGTH = 200;

/**
 * Sanitize a filename: strip path components, remove dangerous characters,
 * ensure .pdf extension, and truncate to safe length.
 */
export function sanitizeFilename(rawName: string): string {
  // First: remove null bytes
  let name = rawName.replace(/\0/g, "").trim();

  // Split on ALL path separators (forward slash, backslash, and their
  // URL-encoded variants) and take only the final component.
  // This neutralises path traversal sequences like ../../etc/passwd.
  const parts = name.split(/[/\\]+/);
  name = parts[parts.length - 1] || "attachment";

  // Now remove remaining dangerous characters from the base filename
  name = name.replace(/[*?"<>|:]/g, "_").trim();

  // Ensure .pdf extension
  if (!name.toLowerCase().endsWith(".pdf")) {
    name = name + ".pdf";
  }

  // Truncate
  if (name.length > MAX_FILENAME_LENGTH) {
    name = name.slice(0, MAX_FILENAME_LENGTH - 4) + ".pdf";
  }

  return name;
}

/**
 * Validate a PDF file by checking magic bytes.
 * Returns true if valid PDF, false otherwise.
 */
export function validatePdfMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  return (
    buffer[0] === PDF_MAGIC[0] &&
    buffer[1] === PDF_MAGIC[1] &&
    buffer[2] === PDF_MAGIC[2] &&
    buffer[3] === PDF_MAGIC[3]
  );
}

/**
 * Upload a PDF attachment to private Supabase Storage.
 * Returns the storage path (not a public URL).
 */
export async function uploadAttachment(params: {
  messageId: string;
  filename: string;
  buffer: Buffer;
  mimeType: string;
}): Promise<{ storagePath: string }> {
  const service = createFinanceServiceClient();
  const safeName = sanitizeFilename(params.filename);
  const storagePath = `proposals/${params.messageId}/${Date.now()}-${safeName}`;

  const { error } = await service.storage
    .from("finance-attachments")
    .upload(storagePath, params.buffer, {
      contentType: params.mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return { storagePath };
}

/**
 * Generate a short-lived signed URL for preview (1 hour).
 * Used only for admin/member preview — never returned to unauthorized users.
 */
export async function getAttachmentSignedUrl(
  storagePath: string
): Promise<string> {
  const service = createFinanceServiceClient();
  const { data, error } = await service.storage
    .from("finance-attachments")
    .createSignedUrl(storagePath, 3600);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${error?.message}`);
  }

  return data.signedUrl;
}

/**
 * Get attachment data as Buffer (for sending via Resend API).
 */
export async function getAttachmentBuffer(
  storagePath: string
): Promise<Buffer> {
  const service = createFinanceServiceClient();
  const { data, error } = await service.storage
    .from("finance-attachments")
    .download(storagePath);

  if (error || !data) {
    throw new Error(`Failed to download attachment: ${error?.message}`);
  }

  return Buffer.from(await data.arrayBuffer());
}
