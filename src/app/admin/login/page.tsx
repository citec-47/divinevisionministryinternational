import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Already signed in? Skip the form.
  if (await getSession()) redirect("/admin");

  return (
    <main className="grid min-h-dvh place-items-center bg-ground px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-full bg-brand font-display text-lg text-brand-contrast"
          >
            DV
          </span>
          <div>
            <p className="font-display text-lg leading-tight tracking-tight">Divine Vision</p>
            <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">Church admin</p>
          </div>
        </div>

        <h1 className="mt-8 font-display text-2xl tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-ink-muted">
          For church staff. Visitors do not need an account.
        </p>

        <LoginForm />
      </div>
    </main>
  );
}
