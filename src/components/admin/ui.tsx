import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl tracking-tight">{title}</h1>
        {description ? <p className="mt-1.5 text-ink-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-card border border-line bg-surface p-6", className)}>
      {children}
    </div>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center rounded-full bg-brand px-5 font-medium text-brand-contrast transition-colors hover:bg-brand-soft"
    >
      {children}
    </Link>
  );
}

/** Empty state for a list that has nothing in it yet. */
export function AdminEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <AdminCard className="text-center">
      <p className="font-display text-xl">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </AdminCard>
  );
}

export function AdminTable({
  headings,
  children,
}: {
  headings: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-line text-xs uppercase tracking-wider text-ink-faint">
          <tr>
            {headings.map((heading) => (
              <th key={heading} scope="col" className="px-5 py-3 font-semibold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">{children}</tbody>
      </table>
    </div>
  );
}

export function StatusPill({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        ok ? "bg-accent/15 text-accent" : "bg-surface-2 text-ink-muted",
      )}
    >
      {children}
    </span>
  );
}
