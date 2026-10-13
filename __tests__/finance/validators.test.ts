/**
 * __tests__/finance/validators.test.ts
 * Tests for Zod validation schemas.
 */

import { describe, it, expect } from "vitest";
import {
  SendEmailSchema,
  CreateMemberSchema,
  SystemSettingsSchema,
} from "@/lib/finance/validators";
import { v4 as uuidv4 } from "uuid";

describe("SendEmailSchema", () => {
  const validBase = {
    to_address: "sponsor@acme.com",
    subject: "UWAXtreme Sponsorship Proposal",
    body: "Dear Sponsor, please find attached.",
    idempotency_key: uuidv4(),
  };

  it("accepts a valid email payload", () => {
    const result = SendEmailSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("rejects missing to_address", () => {
    const result = SendEmailSchema.safeParse({ ...validBase, to_address: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email in to_address", () => {
    const result = SendEmailSchema.safeParse({
      ...validBase,
      to_address: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing subject", () => {
    const result = SendEmailSchema.safeParse({ ...validBase, subject: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing body", () => {
    const result = SendEmailSchema.safeParse({ ...validBase, body: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid idempotency_key", () => {
    const result = SendEmailSchema.safeParse({
      ...validBase,
      idempotency_key: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });
});

describe("CreateMemberSchema", () => {
  const validMember = {
    full_name: "Kasun Perera",
    member_id: "kasun-001",
    email: "kasun.perera@gmail.com",
    domain_email: "kasun@uvaxtreme.dev",
    password: "SuperSecure123!",
    role: "member",
  };

  it("accepts a valid member", () => {
    const result = CreateMemberSchema.safeParse(validMember);
    expect(result.success).toBe(true);
  });

  it("rejects domain email not ending in @uvaxtreme.dev", () => {
    const result = CreateMemberSchema.safeParse({
      ...validMember,
      domain_email: "kasun@gmail.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects member_id with spaces", () => {
    const result = CreateMemberSchema.safeParse({
      ...validMember,
      member_id: "kasun perera",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 12 characters", () => {
    const result = CreateMemberSchema.safeParse({
      ...validMember,
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = CreateMemberSchema.safeParse({
      ...validMember,
      role: "superadmin",
    });
    expect(result.success).toBe(false);
  });
});

describe("SystemSettingsSchema", () => {
  it("accepts valid settings", () => {
    const result = SystemSettingsSchema.safeParse({
      max_attachment_bytes: 20971520, // 20 MB
      rate_limit_per_hour: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects max_attachment_bytes above 40 MB", () => {
    const result = SystemSettingsSchema.safeParse({
      max_attachment_bytes: 50_000_000,
      rate_limit_per_hour: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects rate_limit_per_hour of 0", () => {
    const result = SystemSettingsSchema.safeParse({
      max_attachment_bytes: 10_000_000,
      rate_limit_per_hour: 0,
    });
    expect(result.success).toBe(false);
  });
});
