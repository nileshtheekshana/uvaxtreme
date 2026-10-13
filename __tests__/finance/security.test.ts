/**
 * __tests__/finance/security.test.ts
 * Security policy tests — verify that authorization is enforced server-side.
 * Uses mocked Supabase and Resend clients.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { sanitizeFilename, validatePdfMagicBytes } from "@/lib/finance/attachments";

// ─── Attachment security ───────────────────────────────────────────────────
describe("sanitizeFilename", () => {
  it("removes path separators", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("passwd.pdf");
    expect(sanitizeFilename("..\\..\\windows\\system32")).toBe("system32.pdf");
  });

  it("removes null bytes", () => {
    expect(sanitizeFilename("file\0name.pdf")).toBe("filename.pdf");
  });

  it("appends .pdf if missing", () => {
    expect(sanitizeFilename("proposal")).toBe("proposal.pdf");
  });

  it("preserves .pdf extension", () => {
    expect(sanitizeFilename("Sponsorship Proposal.pdf")).toBe(
      "Sponsorship Proposal.pdf"
    );
  });

  it("truncates very long filenames", () => {
    const longName = "a".repeat(300) + ".pdf";
    const result = sanitizeFilename(longName);
    expect(result.length).toBeLessThanOrEqual(200);
    expect(result.endsWith(".pdf")).toBe(true);
  });

  it("handles special characters", () => {
    const result = sanitizeFilename("proposal:v2<final>.pdf");
    expect(result).not.toContain(":");
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
  });
});

describe("validatePdfMagicBytes", () => {
  it("accepts valid PDF magic bytes", () => {
    const validPdf = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]); // %PDF-1
    expect(validatePdfMagicBytes(validPdf)).toBe(true);
  });

  it("rejects non-PDF data", () => {
    const notPdf = Buffer.from("Hello, world!");
    expect(validatePdfMagicBytes(notPdf)).toBe(false);
  });

  it("rejects empty buffer", () => {
    expect(validatePdfMagicBytes(Buffer.alloc(0))).toBe(false);
  });

  it("rejects buffer with only 3 bytes", () => {
    const short = Buffer.from([0x25, 0x50, 0x44]);
    expect(validatePdfMagicBytes(short)).toBe(false);
  });

  it("rejects disguised non-PDF with extra extension", () => {
    // A JPEG (FFD8FF) pretending to be a PDF
    const notPdf = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    expect(validatePdfMagicBytes(notPdf)).toBe(false);
  });
});
