"use client";

/**
 * app/finance/_components/PortalNav.tsx
 * Finance Portal navigation sidebar — shown on all authenticated pages.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/finance/auth";
import type { Profile } from "@/lib/finance/session";

const MEMBER_LINKS = [
  { href: "/finance/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/finance/proposals/new", label: "New Proposal", icon: "✉️" },
  { href: "/finance/history", label: "Email History", icon: "📋" },
];

const ADMIN_LINKS = [
  { href: "/finance/admin", label: "Admin Overview", icon: "📊" },
  { href: "/finance/admin/members", label: "Members", icon: "👥" },
  { href: "/finance/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function PortalNav({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const isAdmin = profile.role === "admin";

  return (
    <aside className="fp-nav">
      {/* Brand */}
      <div className="fp-nav-brand">
        <span className="fp-nav-brand-icon">💰</span>
        <div>
          <div className="fp-nav-brand-title">Finance Portal</div>
          <div className="fp-nav-brand-sub">UWAXtreme</div>
        </div>
      </div>

      {/* Member info */}
      <div className="fp-nav-member">
        <div className="fp-nav-avatar">
          {profile.full_name.charAt(0).toUpperCase()}
        </div>
        <div className="fp-nav-member-info">
          <div className="fp-nav-member-name">{profile.full_name}</div>
          <div className="fp-nav-member-email">{profile.domain_email}</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="fp-nav-links" aria-label="Finance Portal navigation">
        <div className="fp-nav-section-label">Menu</div>
        {MEMBER_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`fp-nav-link ${pathname === link.href || pathname.startsWith(link.href + "/") ? "fp-nav-link-active" : ""}`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="fp-nav-section-label" style={{ marginTop: "24px" }}>
              Administration
            </div>
            {ADMIN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`fp-nav-link ${pathname === link.href || pathname.startsWith(link.href + "/") ? "fp-nav-link-active" : ""}`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Sign out */}
      <form action={signOut} className="fp-nav-footer">
        <button type="submit" className="fp-nav-signout">
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </form>
    </aside>
  );
}
