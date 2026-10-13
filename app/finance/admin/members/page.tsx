/**
 * app/finance/admin/members/page.tsx
 * Member management — create, view, activate/deactivate members.
 */

import type { Metadata } from "next";
import { requireFinanceAdmin } from "@/lib/finance/session";
import { createFinanceServerClient } from "@/lib/finance/supabase";
import PortalNav from "../../_components/PortalNav";
import CreateMemberForm from "./_components/CreateMemberForm";
import MemberActions from "./_components/MemberActions";

export const metadata: Metadata = {
  title: "Members",
};

export default async function MembersPage() {
  const { profile } = await requireFinanceAdmin();
  const supabase = await createFinanceServerClient();

  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");

  return (
    <div className="fp-shell">
      <PortalNav profile={profile} />
      <main className="fp-main">
        <div className="fp-page-header">
          <div>
            <h1 className="fp-page-title">
              Team <span className="gradient-text">Members</span>
            </h1>
            <p className="fp-page-subtitle">
              Manage Finance Team accounts and permissions
            </p>
          </div>
        </div>

        {/* Member list */}
        <div className="fp-section">
          <h2 className="fp-section-title">Current Members</h2>
          {!members || members.length === 0 ? (
            <div className="fp-empty">
              <div className="fp-empty-icon">👥</div>
              <p className="fp-empty-text">No members yet.</p>
            </div>
          ) : (
            <div className="fp-table-wrapper">
              <table className="fp-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Domain Email</th>
                    <th>Role</th>
                    <th>Gmail</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div>{m.full_name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {m.member_id}
                        </div>
                      </td>
                      <td>{m.domain_email}</td>
                      <td>
                        <span className={`fp-badge ${m.role === "admin" ? "fp-badge-purple" : "fp-badge-cyan"}`}>
                          {m.role}
                        </span>
                      </td>
                      <td>
                        {m.gmail_address ? (
                          <span style={{ fontSize: "0.85rem" }}>
                            {m.gmail_address}
                            {m.gmail_verified ? " ✅" : " ⏳"}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                      <td>
                        <span
                          className="fp-badge"
                          style={{
                            background: m.is_active ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
                            color: m.is_active ? "#34d399" : "#f87171",
                            borderColor: m.is_active ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)",
                          }}
                        >
                          {m.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {m.id !== profile.id && (
                          <MemberActions
                            memberId={m.id}
                            isActive={m.is_active}
                            memberName={m.full_name}
                          />
                        )}
                        {m.id === profile.id && (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                            (you)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create member form */}
        <div className="fp-section">
          <h2 className="fp-section-title">Add New Member</h2>
          <div className="fp-card" style={{ padding: "28px" }}>
            <CreateMemberForm />
          </div>
        </div>
      </main>
    </div>
  );
}
