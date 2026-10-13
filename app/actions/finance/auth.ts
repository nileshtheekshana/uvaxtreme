"use server";

/**
 * app/actions/finance/auth.ts
 * Simple password-gate for the Finance Portal.
 * The correct password is stored in FINANCE_PORTAL_PASSWORD (server-side only).
 */

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export type AuthActionResult = {
  error?: string;
};

const COOKIE_NAME = "fp_session";
// Session lasts 8 hours
const COOKIE_MAX_AGE = 60 * 60 * 8;

/**
 * Sign in with the shared Finance Portal password.
 */
export async function signIn(
  _prevState: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const password = formData.get("password")?.toString() ?? "";
  const nextPath = formData.get("next")?.toString() ?? "/finance/dashboard";

  if (!password) {
    return { error: "Password is required." };
  }

  const correctPassword = process.env.FINANCE_PORTAL_PASSWORD;
  if (!correctPassword) {
    console.error("FINANCE_PORTAL_PASSWORD environment variable is not set.");
    return { error: "Portal is not configured. Contact the administrator." };
  }

  if (password !== correctPassword) {
    return { error: "Incorrect password. Please try again." };
  }

  // Set a signed session cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/finance",
  });

  // Validate the redirect path to prevent open redirects
  const safePath =
    nextPath.startsWith("/finance") && !nextPath.includes("//")
      ? nextPath
      : "/finance/dashboard";

  redirect(safePath);
}

/**
 * Sign out — clear the session cookie.
 */
export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/finance/login");
}
