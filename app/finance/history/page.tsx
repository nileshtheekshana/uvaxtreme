/**
 * app/finance/history/page.tsx
 * Email history page — members see their own, admins see all.
 */

import type { Metadata } from "next";
import { requireFinanceAuth } from "@/lib/finance/session";
import { createFinanceServerClient } from "@/lib/finance/supabase";
import PortalNav from "../_components/PortalNav";

export const metadata: Metadata = {
  title: "Email History",
};

const PAGE_SIZE = 20;

const STATUS_COLORS: Record<string, string> = {
  queued: "#fbbf24",
  accepted: "#60a5fa",
  delivered: "#34d399",
  bounced: "#f87171",
  complained: "#fb923c",
  failed: "#f87171",
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const { profile } = await requireFinanceAuth();
  const supabase = await createFinanceServerClient();
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search?.trim() ?? "";
  const statusFilter = params.status ?? "";

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Build query — RLS ensures members only see their own rows
  let query = supabase
    .from("email_messages")
    .select(
      "id, from_address, to_address, company_name, subject, status, sent_at, resend_message_id",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (statusFilter) {
    query = query.eq("status", statusFilter as import("@/lib/finance/database.types").EmailStatus);
  }

  if (search) {
    query = query.or(
      `to_address.ilike.%${search}%,subject.ilike.%${search}%,company_name.ilike.%${search}%`
    );
  }

  const { data: emails, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  // Build pagination URL helper
  const buildUrl = (p: number) => {
    const sp = new URLSearchParams();
    if (p > 1) sp.set("page", String(p));
    if (search) sp.set("search", search);
    if (statusFilter) sp.set("status", statusFilter);
    const qs = sp.toString();
    return `/finance/history${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="fp-shell">
      <PortalNav profile={profile} />

      <main className="fp-main">
        <div className="fp-page-header">
          <div>
            <h1 className="fp-page-title">Email History</h1>
            <p className="fp-page-subtitle">
              {profile.role === "admin"
                ? "All team proposal emails"
                : "Your sent proposals"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <form method="get" className="fp-filters">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search recipient, company, subject…"
            className="fp-input fp-filter-search"
          />
          <select
            name="status"
            defaultValue={statusFilter}
            className="fp-input fp-filter-select"
          >
            <option value="">All Statuses</option>
            <option value="queued">Queued</option>
            <option value="accepted">Accepted</option>
            <option value="delivered">Delivered</option>
            <option value="bounced">Bounced</option>
            <option value="complained">Complained</option>
            <option value="failed">Failed</option>
          </select>
          <button type="submit" className="fp-btn fp-btn-outline">
            Filter
          </button>
          {(search || statusFilter) && (
            <a href="/finance/history" className="fp-btn fp-btn-ghost">
              Clear
            </a>
          )}
        </form>

        {/* Table */}
        {!emails || emails.length === 0 ? (
          <div className="fp-empty">
            <div className="fp-empty-icon">📭</div>
            <p className="fp-empty-text">
              {search || statusFilter
                ? "No emails match your filters."
                : "No emails sent yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="fp-table-wrapper">
              <table className="fp-table">
                <thead>
                  <tr>
                    {profile.role === "admin" && <th>From</th>}
                    <th>To</th>
                    <th>Company</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Sent At</th>
                    <th>Provider ID</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((email) => (
                    <tr key={email.id}>
                      {profile.role === "admin" && (
                        <td>{email.from_address}</td>
                      )}
                      <td>{email.to_address}</td>
                      <td>{email.company_name || "—"}</td>
                      <td className="fp-table-truncate">{email.subject}</td>
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
                          ? new Date(email.sent_at).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td>
                        <code className="fp-code">
                          {email.resend_message_id
                            ? email.resend_message_id.slice(0, 12) + "…"
                            : "—"}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="fp-pagination">
                <span className="fp-page-info">
                  Page {page} of {totalPages} ({count} total)
                </span>
                <div className="fp-page-btns">
                  {page > 1 && (
                    <a href={buildUrl(page - 1)} className="fp-btn fp-btn-outline">
                      ← Previous
                    </a>
                  )}
                  {page < totalPages && (
                    <a href={buildUrl(page + 1)} className="fp-btn fp-btn-outline">
                      Next →
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
