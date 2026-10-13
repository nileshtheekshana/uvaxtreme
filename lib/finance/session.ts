/**
 * lib/finance/session.ts
 * Server-side session utilities.
 * Auth is cookie-based (fp_session). No Supabase auth call needed.
 */

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const SESSION_COOKIE = "fp_session";

// Minimal profile shape used across portal pages
export type Profile = {
  id: string;
  full_name: string;
  member_id: string;
  domain_email: string;
  gmail_address: string | null;
  gmail_verified: boolean;
  role: "member" | "admin";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Returns true if the fp_session cookie is present and valid.
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === "authenticated";
}

/**
 * Get the current session — returns a minimal session object if authenticated,
 * null otherwise.
 */
export async function getFinanceSession(): Promise<{
  user: { id: string; email: string };
  profile: Profile;
} | null> {
  const authenticated = await isAuthenticated();
  if (!authenticated) return null;

  // Return a generic portal-user identity.
  // Individual member management is handled separately via admin pages.
  const session = {
    user: { id: "portal-user", email: "finance@uvaxtreme.dev" },
    profile: {
      id: "portal-user",
      full_name: "Finance Team",
      member_id: "finance-team",
      domain_email: "finance@uvaxtreme.dev",
      gmail_address: null,
      gmail_verified: false,
      role: "admin" as const,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  return session;
}

/**
 * Require authentication — redirects to login if not authenticated.
 * Use at the top of protected Server Components.
 */
export async function requireFinanceAuth(): Promise<{
  user: { id: string; email: string };
  profile: Profile;
}> {
  const session = await getFinanceSession();
  if (!session) {
    redirect("/finance/login");
  }
  return session;
}

/**
 * Require admin role — redirects to dashboard if not authenticated.
 * (With password-gate auth, all authenticated users are treated as admins.)
 */
export async function requireFinanceAdmin(): Promise<{
  user: { id: string; email: string };
  profile: Profile;
}> {
  return requireFinanceAuth();
}

/**
 * Require that the user is NOT logged in (login page guard).
 * Redirects to dashboard if already authenticated.
 */
export async function requireFinanceGuest(): Promise<void> {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect("/finance/dashboard");
  }
}
