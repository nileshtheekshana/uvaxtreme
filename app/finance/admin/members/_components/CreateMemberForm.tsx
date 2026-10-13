"use client";

/**
 * app/finance/admin/members/_components/CreateMemberForm.tsx
 * Admin form to create a new Finance Team member account.
 */

import { useActionState } from "react";
import { createMember } from "@/app/actions/finance/admin";
import type { AdminActionResult } from "@/app/actions/finance/admin";

const initialState: AdminActionResult = {};

export default function CreateMemberForm() {
  const [state, formAction, isPending] = useActionState(
    createMember,
    initialState
  );

  return (
    <form action={formAction} className="fp-form">
      {state.success && (
        <div className="fp-alert fp-alert-success" role="status">
          ✅ Member created successfully! They can now sign in.
        </div>
      )}
      {state.error && (
        <div className="fp-alert fp-alert-error" role="alert">
          ⚠️ {state.error}
        </div>
      )}

      <div className="fp-form-grid-2">
        <div className="fp-field">
          <label htmlFor="full_name" className="fp-label">
            Full Name <span className="fp-required">*</span>
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            className="fp-input"
            required
            placeholder="Kasun Perera"
            disabled={isPending}
          />
          {state.fieldErrors?.full_name && (
            <p className="fp-field-error">{state.fieldErrors.full_name[0]}</p>
          )}
        </div>

        <div className="fp-field">
          <label htmlFor="member_id" className="fp-label">
            Member ID <span className="fp-required">*</span>
          </label>
          <input
            id="member_id"
            name="member_id"
            type="text"
            className="fp-input"
            required
            placeholder="kasun-001"
            pattern="[a-z0-9-]+"
            title="Lowercase letters, numbers, and hyphens only"
            disabled={isPending}
          />
          {state.fieldErrors?.member_id && (
            <p className="fp-field-error">{state.fieldErrors.member_id[0]}</p>
          )}
        </div>

        <div className="fp-field">
          <label htmlFor="email" className="fp-label">
            Login Email <span className="fp-required">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="fp-input"
            required
            placeholder="kasun.perera@gmail.com"
            disabled={isPending}
          />
          {state.fieldErrors?.email && (
            <p className="fp-field-error">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="fp-field">
          <label htmlFor="domain_email" className="fp-label">
            Domain Email <span className="fp-required">*</span>
          </label>
          <input
            id="domain_email"
            name="domain_email"
            type="email"
            className="fp-input"
            required
            placeholder="kasun@uvaxtreme.dev"
            disabled={isPending}
          />
          <p className="fp-field-hint">Must be @uvaxtreme.dev</p>
          {state.fieldErrors?.domain_email && (
            <p className="fp-field-error">
              {state.fieldErrors.domain_email[0]}
            </p>
          )}
        </div>

        <div className="fp-field">
          <label htmlFor="password" className="fp-label">
            Initial Password <span className="fp-required">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="fp-input"
            required
            minLength={12}
            placeholder="Min. 12 characters"
            disabled={isPending}
          />
          <p className="fp-field-hint">
            Member should change this after first login.
          </p>
          {state.fieldErrors?.password && (
            <p className="fp-field-error">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <div className="fp-field">
          <label htmlFor="role" className="fp-label">
            Role <span className="fp-required">*</span>
          </label>
          <select
            id="role"
            name="role"
            className="fp-input"
            defaultValue="member"
            disabled={isPending}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="fp-field">
          <label htmlFor="gmail_address" className="fp-label">
            Personal Gmail (for forwarding)
          </label>
          <input
            id="gmail_address"
            name="gmail_address"
            type="email"
            className="fp-input"
            placeholder="kasun@gmail.com"
            disabled={isPending}
          />
          <p className="fp-field-hint">
            Optional. Configure Cloudflare routing separately.
          </p>
          {state.fieldErrors?.gmail_address && (
            <p className="fp-field-error">
              {state.fieldErrors.gmail_address[0]}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="fp-btn fp-btn-primary"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <span className="fp-spinner" aria-hidden="true" />
            Creating…
          </>
        ) : (
          "Create Member Account"
        )}
      </button>
    </form>
  );
}
