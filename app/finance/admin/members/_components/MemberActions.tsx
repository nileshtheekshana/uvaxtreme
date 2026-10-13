"use client";

/**
 * app/finance/admin/members/_components/MemberActions.tsx
 * Activate/deactivate member buttons with confirmation.
 */

import { useTransition, useState } from "react";
import {
  deactivateMember,
  reactivateMember,
} from "@/app/actions/finance/admin";

interface Props {
  memberId: string;
  isActive: boolean;
  memberName: string;
}

export default function MemberActions({
  memberId,
  isActive,
  memberName,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAction = () => {
    const confirmed = window.confirm(
      isActive
        ? `Deactivate ${memberName}? They will no longer be able to sign in.`
        : `Reactivate ${memberName}? They will regain access to the portal.`
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = isActive
        ? await deactivateMember(memberId)
        : await reactivateMember(memberId);
      if (result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleAction}
        disabled={isPending}
        className={`fp-btn ${isActive ? "fp-btn-danger-sm" : "fp-btn-success-sm"}`}
      >
        {isPending ? "…" : isActive ? "Deactivate" : "Activate"}
      </button>
      {error && <p className="fp-field-error" style={{ marginTop: "4px" }}>{error}</p>}
    </div>
  );
}
