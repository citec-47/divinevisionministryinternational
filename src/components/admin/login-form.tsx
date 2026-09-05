"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signIn } from "@/app/admin/actions";
import { initialFormState } from "@/lib/form-state";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand font-medium text-brand-contrast transition-colors hover:bg-brand-soft disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(signIn, initialFormState);

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-xl border border-live/40 bg-live/10 px-4 py-3 text-sm"
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3.5 py-2.5"
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3.5 py-2.5"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
