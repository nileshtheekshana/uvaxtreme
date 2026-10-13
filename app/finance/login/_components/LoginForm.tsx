"use client";

/**
 * app/finance/login/_components/LoginForm.tsx
 * Password-only login form for the Finance Portal.
 */

import { useActionState } from "react";
import { signIn } from "@/app/actions/finance/auth";
import type { AuthActionResult } from "@/app/actions/finance/auth";

const initialState: AuthActionResult = {};

export default function LoginForm({ nextPath }: { nextPath?: string }) {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="fp-form">
      {state.error && (
        <div className="fp-alert fp-alert-error" role="alert">
          <span>⚠️</span>
          <span>{state.error}</span>
        </div>
      )}

      <input type="hidden" name="next" value={nextPath ?? ""} />

      <div className="fp-field">
        <label htmlFor="password" className="fp-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••••••"
          className="fp-input"
          disabled={isPending}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="fp-btn fp-btn-primary w-full"
      >
        {isPending ? (
          <>
            <span className="fp-spinner" aria-hidden="true" />
            Signing in…
          </>
        ) : (
          "Enter Portal"
        )}
      </button>
    </form>
  );
}
