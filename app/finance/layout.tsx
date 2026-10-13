/**
 * app/finance/layout.tsx
 * Finance Portal root layout — completely isolated from the public website.
 * Does NOT include the public Navbar or Footer.
 * Has its own metadata and design scope.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Finance Portal — UWAXtreme",
    template: "%s | Finance Portal — UWAXtreme",
  },
  description: "UWAXtreme Finance Team internal portal",
  robots: { index: false, follow: false }, // Do not index finance portal
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The finance portal has its own layout shell.
  // It does NOT inherit Navbar/Footer from the public site.
  return <div className="finance-portal">{children}</div>;
}
