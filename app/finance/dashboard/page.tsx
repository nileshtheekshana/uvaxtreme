/**
 * app/finance/dashboard/page.tsx
 * Member dashboard — overview of recent activity and quick actions.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { requireFinanceAuth } from "@/lib/finance/session";
import { createFinanceServerClient } from "@/lib/finance/supabase";
import PortalNav from "../_components/PortalNav";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { profile } = await requireFinanceAuth();
  const supabase = await createFinanceServerClient();

  // My recent emails (last 5)
  const { data: recentEmails } = await supabase
    .from("email_messages")
    .select("id, to_address, company_name, subject, status, sent_at")
    .eq("sender_profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // My total sent
  const { count: totalSent } = await supabase
    .from("email_messages")
    .select("*", { count: "exact", head: true })
    .eq("sender_profile_id", profile.id)
    .neq("status", "queued");

  // This week's count
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: thisWeek } = await supabase
    .from("email_messages")
    .select("*", { count: "exact", head: true })
    .eq("sender_profile_id", profile.id)
    .gte("created_at", weekAgo);

  const statusColors: Record<string, string> = {
    queued: "#fbbf24",
    accepted: "#60a5fa",
    delivered: "#34d399",
    bounced: "#f87171",
    complained: "#fb923c",
    failed: "#f87171",
  };

  return (
    <div className="fp-shell">
      <PortalNav profile={profile} />

      <main className="fp-main">
        <div className="fp-page-header">
          <div>
            <h1 className="fp-page-title">
              Welcome back, <span className="gradient-text">{profile.full_name.split(" ")[0]}</span>
            </h1>
            <p className="fp-page-subtitle">
              Sending as <strong>{profile.domain_email}</strong>
            </p>
          </div>
          <Link href="/finance/proposals/new" className="fp-btn fp-btn-primary">
            ✉️ New Proposal
          </Link>
        </div>

        {/* Stats */}
        <div className="fp-stats-grid">
          <div className="fp-stat-card">
            <div className="fp-stat-icon" style={{ color: "var(--accent-cyan)" }}>📤</div>
            <div className="fp-stat-value">{totalSent ?? 0}</div>
            <div className="fp-stat-label">Total Emails Sent</div>
          </div>
          <div className="fp-stat-card">
            <div className="fp-stat-icon" style={{ color: "#34d399" }}>📅</div>
            <div className="fp-stat-value">{thisWeek ?? 0}</div>
            <div className="fp-stat-label">Sent This Week</div>
          </div>
          <div className="fp-stat-card">
            <div className="fp-stat-icon" style={{ color: "var(--accent-purple)" }}>🔑</div>
            <div className="fp-stat-value" style={{ textTransform: "capitalize" }}>
              {profile.role}
            </div>
            <div className="fp-stat-label">Your Role</div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="fp-section">
          <div className="fp-section-header">
            <h2 className="fp-section-title">Recent Emails</h2>
            <Link href="/finance/history" className="fp-link">
              View all →
            </Link>
          </div>

          {!recentEmails || recentEmails.length === 0 ? (
            <div className="fp-empty">
              <div className="fp-empty-icon">📭</div>
              <p className="fp-empty-text">No emails sent yet.</p>
              <Link href="/finance/proposals/new" className="fp-btn fp-btn-outline">
                Send Your First Proposal
              </Link>
            </div>
          ) : (
            <div className="fp-table-wrapper">
              <table className="fp-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Company</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEmails.map((email) => (
                    <tr key={email.id}>
                      <td>{email.to_address}</td>
                      <td>{email.company_name || "—"}</td>
                      <td className="fp-table-truncate">{email.subject}</td>
                      <td>
                        <span
                          className="fp-badge"
                          style={{
                            background: `${statusColors[email.status] ?? "#888"}22`,
                            color: statusColors[email.status] ?? "#888",
                            borderColor: `${statusColors[email.status] ?? "#888"}44`,
                          }}
                        >
                          {email.status}
                        </span>
                      </td>
                      <td>
                        {email.sent_at
                          ? new Date(email.sent_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="fp-section">
          <h2 className="fp-section-title">Quick Actions</h2>
          <div className="fp-quick-grid">
            <Link href="/finance/proposals/new" className="fp-quick-card">
              <span className="fp-quick-icon">✉️</span>
              <span>Send Proposal</span>
            </Link>
            <Link href="/finance/history" className="fp-quick-card">
              <span className="fp-quick-icon">📋</span>
              <span>Email History</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
