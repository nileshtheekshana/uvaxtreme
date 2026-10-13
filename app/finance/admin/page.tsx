/**
 * app/finance/admin/page.tsx
 * Admin overview dashboard — all-team statistics.
 * Uses separate queries to avoid Supabase foreign-key join type inference issues.
 */

import type { Metadata } from "next";
import { requireFinanceAdmin } from "@/lib/finance/session";
import { createFinanceServerClient } from "@/lib/finance/supabase";
import type { Database } from "@/lib/finance/database.types";
import PortalNav from "../_components/PortalNav";

export const metadata: Metadata = {
  title: "Admin Overview",
};

type EmailRow = Database["public"]["Tables"]["email_messages"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const STATUS_COLORS: Record<string, string> = {
  queued: "#fbbf24",
  accepted: "#60a5fa",
  delivered: "#34d399",
  bounced: "#f87171",
  complained: "#fb923c",
  failed: "#f87171",
};

export default async function AdminPage() {
  const { profile } = await requireFinanceAdmin();
  const supabase = await createFinanceServerClient();

  // All-team statistics (separate queries — simpler, avoids join type issues)
  const [
    { count: totalEmails },
    { count: deliveredCount },
    { count: bouncedCount },
    { count: failedCount },
    { data: allEmails },
    { data: allProfiles },
  ] = await Promise.all([
    supabase.from("email_messages").select("*", { count: "exact", head: true }),
    supabase
      .from("email_messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "delivered"),
    supabase
      .from("email_messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "bounced"),
    supabase
      .from("email_messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed"),
    // All email rows for aggregation (lightweight — only needed fields)
    supabase
      .from("email_messages")
      .select("id, sender_profile_id, to_address, company_name, subject, status, sent_at")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, domain_email, is_active"),
  ]);

  const activeMembers = (allProfiles ?? []).filter((p) => p.is_active).length;

  // Build profile lookup map
  const profileMap: Record<string, { full_name: string; domain_email: string }> = {};
  (allProfiles ?? []).forEach((p) => {
    profileMap[p.id] = { full_name: p.full_name, domain_email: p.domain_email };
  });

  // Per-member send counts
  const memberCounts: Record<string, { name: string; email: string; count: number }> = {};
  (allEmails ?? []).forEach((msg: Pick<EmailRow, "sender_profile_id">) => {
    const pid = msg.sender_profile_id;
    if (!memberCounts[pid]) {
      const p = profileMap[pid];
      memberCounts[pid] = {
        name: p?.full_name ?? "Unknown",
        email: p?.domain_email ?? "—",
        count: 0,
      };
    }
    memberCounts[pid].count++;
  });

  const memberCountList = Object.values(memberCounts).sort((a, b) => b.count - a.count);

  // Recent 10 emails
  const recentEmails = (allEmails ?? []).slice(0, 10) as Array<
    Pick<EmailRow, "id" | "sender_profile_id" | "to_address" | "company_name" | "subject" | "status" | "sent_at">
  >;

  return (
    <div className="fp-shell">
      <PortalNav profile={profile} />
      <main className="fp-main">
        <div className="fp-page-header">
          <div>
            <h1 className="fp-page-title">
              Admin <span className="gradient-text">Overview</span>
            </h1>
            <p className="fp-page-subtitle">All-team email activity</p>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="fp-stats-grid"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
        >
          <div className="fp-stat-card">
            <div className="fp-stat-icon" style={{ color: "var(--accent-cyan)" }}>📤</div>
            <div className="fp-stat-value">{totalEmails ?? 0}</div>
            <div className="fp-stat-label">Total Emails</div>
          </div>
          <div className="fp-stat-card">
            <div className="fp-stat-icon" style={{ color: "#34d399" }}>✅</div>
            <div className="fp-stat-value">{deliveredCount ?? 0}</div>
            <div className="fp-stat-label">Delivered</div>
          </div>
          <div className="fp-stat-card">
            <div className="fp-stat-icon" style={{ color: "#f87171" }}>↩️</div>
            <div className="fp-stat-value">{bouncedCount ?? 0}</div>
            <div className="fp-stat-label">Bounced</div>
          </div>
          <div className="fp-stat-card">
            <div className="fp-stat-icon" style={{ color: "#f87171" }}>❌</div>
            <div className="fp-stat-value">{failedCount ?? 0}</div>
            <div className="fp-stat-label">Failed</div>
          </div>
          <div className="fp-stat-card">
            <div className="fp-stat-icon" style={{ color: "var(--accent-purple)" }}>👥</div>
            <div className="fp-stat-value">{activeMembers}</div>
            <div className="fp-stat-label">Active Members</div>
          </div>
        </div>

        <div className="fp-admin-grid">
          {/* Per-member breakdown */}
          <div className="fp-section">
            <h2 className="fp-section-title">Emails by Member</h2>
            {memberCountList.length === 0 ? (
              <div className="fp-empty">
                <p className="fp-empty-text">No emails sent yet.</p>
              </div>
            ) : (
              <div className="fp-table-wrapper">
                <table className="fp-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Email</th>
                      <th>Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberCountList.map((m) => (
                      <tr key={m.email}>
                        <td>{m.name}</td>
                        <td>{m.email}</td>
                        <td>{m.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="fp-section">
            <h2 className="fp-section-title">Recent Activity</h2>
            {recentEmails.length === 0 ? (
              <div className="fp-empty">
                <p className="fp-empty-text">No recent activity.</p>
              </div>
            ) : (
              <div className="fp-table-wrapper">
                <table className="fp-table">
                  <thead>
                    <tr>
                      <th>Sent by</th>
                      <th>To</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEmails.map((email) => {
                      const sender = profileMap[email.sender_profile_id];
                      return (
                        <tr key={email.id}>
                          <td>{sender?.full_name ?? "—"}</td>
                          <td>{email.to_address}</td>
                          <td>{email.company_name || "—"}</td>
                          <td>
                            <span
                              className="fp-badge"
                              style={{
                                background: `${STATUS_COLORS[email.status] ?? "#888"}22`,
                                color: STATUS_COLORS[email.status] ?? "#888",
                                borderColor: `${STATUS_COLORS[email.status] ?? "#888"}44`,
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
