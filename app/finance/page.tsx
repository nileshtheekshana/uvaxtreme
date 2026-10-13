/**
 * app/finance/page.tsx
 * /finance entry point — redirects to login or dashboard based on session.
 */

import { redirect } from "next/navigation";
import { getFinanceSession } from "@/lib/finance/session";

export default async function FinancePage() {
  const session = await getFinanceSession();

  if (session) {
    redirect("/finance/dashboard");
  } else {
    redirect("/finance/login");
  }
}
