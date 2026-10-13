/**
 * app/finance/login/page.tsx
 * Finance Portal login page.
 */

import type { Metadata } from "next";
import { requireFinanceGuest } from "@/lib/finance/session";
import LoginForm from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Redirect to dashboard if already authenticated
  await requireFinanceGuest();

  const { next } = await searchParams;

  return (
    <main className="fp-auth-bg">
      <div className="fp-auth-container">
        {/* Logo / Brand */}
        <div className="fp-auth-brand">
          <div className="fp-auth-logo-ring">
            <span className="fp-auth-logo-icon">💰</span>
          </div>
          <h1 className="fp-auth-title">
            Finance<span className="gradient-text"> Portal</span>
          </h1>
          <p className="fp-auth-subtitle">UWAXtreme · Finance Team</p>
        </div>

        {/* Login card */}
        <div className="fp-card fp-auth-card">
          <div className="fp-card-header">
            <h2 className="fp-card-title">Sign In</h2>
            <p className="fp-card-subtitle">
              Authorised team members only. Contact an administrator if you
              need access.
            </p>
          </div>
          <LoginForm nextPath={next} />
        </div>

        {/* Disclosure */}
        <p className="fp-auth-disclosure">
          🔒 All outgoing proposal emails are monitored via BCC for compliance.
        </p>
      </div>
    </main>
  );
}
