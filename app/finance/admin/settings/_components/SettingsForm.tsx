"use client";

/**
 * app/finance/admin/settings/_components/SettingsForm.tsx
 */

import { useActionState } from "react";
import { updateSystemSettings } from "@/app/actions/finance/admin";
import type { AdminActionResult } from "@/app/actions/finance/admin";

const initialState: AdminActionResult = {};

export default function SettingsForm({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const [state, formAction, isPending] = useActionState(
    updateSystemSettings,
    initialState
  );

  const maxMB = Math.round(
    parseInt(settings.max_attachment_bytes ?? "41943040", 10) / 1024 / 1024
  );
  const rateLimit = settings.rate_limit_per_hour ?? "20";
  const bccEmail = settings.bcc_monitor_email ?? "";

  return (
    <form action={formAction} className="fp-form">
      {state.success && (
        <div className="fp-alert fp-alert-success" role="status">
          ✅ Settings saved successfully.
        </div>
      )}
      {state.error && (
        <div className="fp-alert fp-alert-error" role="alert">
          ⚠️ {state.error}
        </div>
      )}

      <div className="fp-field">
        <label htmlFor="max_attachment_bytes" className="fp-label">
          Max Attachment Size (MB)
        </label>
        <input
          id="max_attachment_bytes"
          name="max_attachment_bytes"
          type="number"
          min={1}
          max={40}
          className="fp-input"
          defaultValue={maxMB}
          disabled={isPending}
        />
        <p className="fp-field-hint">
          Resend's limit is 40 MB. The value is stored as bytes internally.
        </p>
        {state.fieldErrors?.max_attachment_bytes && (
          <p className="fp-field-error">
            {state.fieldErrors.max_attachment_bytes[0]}
          </p>
        )}
      </div>

      <div className="fp-field">
        <label htmlFor="rate_limit_per_hour" className="fp-label">
          Rate Limit (emails per member per hour)
        </label>
        <input
          id="rate_limit_per_hour"
          name="rate_limit_per_hour"
          type="number"
          min={1}
          max={100}
          className="fp-input"
          defaultValue={rateLimit}
          disabled={isPending}
        />
        {state.fieldErrors?.rate_limit_per_hour && (
          <p className="fp-field-error">
            {state.fieldErrors.rate_limit_per_hour[0]}
          </p>
        )}
      </div>

      <div className="fp-field">
        <label htmlFor="bcc_monitor_email" className="fp-label">
          Admin BCC Monitor Email
        </label>
        <input
          id="bcc_monitor_email"
          name="bcc_monitor_email"
          type="email"
          className="fp-input"
          defaultValue={bccEmail}
          placeholder="admin@example.com"
          disabled={isPending}
        />
        <p className="fp-field-hint">
          Every outgoing proposal email will be BCC&apos;d to this address.
          Leave blank to use the FINANCE_ADMIN_BCC_EMAIL environment variable.
        </p>
        {state.fieldErrors?.bcc_monitor_email && (
          <p className="fp-field-error">
            {state.fieldErrors.bcc_monitor_email[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="fp-btn fp-btn-primary"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <span className="fp-spinner" aria-hidden="true" />
            Saving…
          </>
        ) : (
          "Save Settings"
        )}
      </button>
    </form>
  );
}
