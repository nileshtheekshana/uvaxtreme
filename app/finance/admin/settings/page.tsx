/**
 * app/finance/admin/settings/page.tsx
 * System settings — rate limits, attachment size, BCC address.
 */

import type { Metadata } from "next";
import { requireFinanceAdmin } from "@/lib/finance/session";
import { createFinanceServerClient } from "@/lib/finance/supabase";
import PortalNav from "../../_components/PortalNav";
import SettingsForm from "./_components/SettingsForm";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const { profile } = await requireFinanceAdmin();
  const supabase = await createFinanceServerClient();

  // Load all settings
  const { data: settings } = await supabase
    .from("system_settings")
    .select("*")
    .order("key");

  const settingsMap: Record<string, string> = {};
  (settings ?? []).forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return (
    <div className="fp-shell">
      <PortalNav profile={profile} />
      <main className="fp-main">
        <div className="fp-page-header">
          <div>
            <h1 className="fp-page-title">
              System <span className="gradient-text">Settings</span>
            </h1>
            <p className="fp-page-subtitle">Email limits, BCC, and system health</p>
          </div>
        </div>

        <div className="fp-card" style={{ padding: "32px", maxWidth: "680px" }}>
          <SettingsForm settings={settingsMap} />
        </div>

        {/* Health checklist */}
        <div className="fp-section" style={{ marginTop: "40px" }}>
          <h2 className="fp-section-title">Configuration Checklist</h2>
          <div className="fp-checklist">
            <div className="fp-checklist-item">
              <span className="fp-check-icon">
                {process.env.RESEND_API_KEY ? "✅" : "❌"}
              </span>
              <div>
                <div className="fp-check-label">Resend API Key</div>
                <div className="fp-check-hint">
                  {process.env.RESEND_API_KEY
                    ? "Configured via environment variable."
                    : "Set RESEND_API_KEY in your Vercel project environment."}
                </div>
              </div>
            </div>
            <div className="fp-checklist-item">
              <span className="fp-check-icon">
                {process.env.RESEND_WEBHOOK_SECRET ? "✅" : "⚠️"}
              </span>
              <div>
                <div className="fp-check-label">Resend Webhook Secret</div>
                <div className="fp-check-hint">
                  {process.env.RESEND_WEBHOOK_SECRET
                    ? "Configured. Delivery events will be recorded."
                    : "Set RESEND_WEBHOOK_SECRET to receive delivery events."}
                </div>
              </div>
            </div>
            <div className="fp-checklist-item">
              <span className="fp-check-icon">
                {process.env.FINANCE_ADMIN_BCC_EMAIL ? "✅" : "⚠️"}
              </span>
              <div>
                <div className="fp-check-label">Admin BCC Email</div>
                <div className="fp-check-hint">
                  {process.env.FINANCE_ADMIN_BCC_EMAIL
                    ? "Configured via environment variable."
                    : "Set FINANCE_ADMIN_BCC_EMAIL or configure via settings above."}
                </div>
              </div>
            </div>
            <div className="fp-checklist-item">
              <span className="fp-check-icon">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅" : "❌"}
              </span>
              <div>
                <div className="fp-check-label">Supabase Connection</div>
                <div className="fp-check-hint">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL
                    ? "Supabase URL configured."
                    : "Set NEXT_PUBLIC_SUPABASE_URL."}
                </div>
              </div>
            </div>
            <div className="fp-checklist-item">
              <span className="fp-check-icon">⚠️</span>
              <div>
                <div className="fp-check-label">Domain Verification (Resend)</div>
                <div className="fp-check-hint">
                  Verify uvaxtreme.dev in your Resend dashboard before sending
                  production emails. See setup guide for DNS records.
                </div>
              </div>
            </div>
            <div className="fp-checklist-item">
              <span className="fp-check-icon">⚠️</span>
              <div>
                <div className="fp-check-label">Email Forwarding (Cloudflare)</div>
                <div className="fp-check-hint">
                  Configure MX records and forwarding rules in Cloudflare Email
                  Routing for each member address. See setup guide.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
