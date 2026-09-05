import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "accent" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-brand-contrast hover:bg-brand-soft",
  accent: "bg-accent text-accent-contrast hover:bg-accent-soft",
  outline: "border border-line bg-transparent text-ink hover:bg-surface-2",
  ghost: "text-ink hover:bg-surface-2",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return cn(BASE, VARIANTS[variant], SIZES[size]);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={cn(buttonClass(variant, size), className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  external,
  ...props
}: ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  external?: boolean;
}) {
  const classes = cn(buttonClass(variant, size), className);

  if (external) {
    return (
      <a
        href={String(href)}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        {...(props as ComponentPropsWithoutRef<"a">)}
      />
    );
  }

  return <Link href={href} className={classes} {...props} />;
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface transition-colors",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Small uppercase label that sits above a section heading. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.18em] text-accent",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="font-display display-balance text-3xl leading-tight tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className={cn("max-w-2xl text-lg text-ink-muted", align === "center" && "mx-auto")}>
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/** Standard vertical rhythm for a page section. */
export function Section({
  className,
  children,
  id,
  tone = "ground",
}: {
  className?: string;
  children: ReactNode;
  id?: string;
  tone?: "ground" | "surface" | "brand";
}) {
  const tones = {
    ground: "",
    surface: "bg-surface border-y border-line",
    brand: "bg-brand text-brand-contrast",
  } as const;

  return (
    <section id={id} className={cn("py-16 sm:py-24", tones[tone], className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

/** Fallback artwork for content with no image, so cards never look broken. */
export function ImageFallback({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      aria-hidden="true"
      className={cn(
        // Always used inside a `relative` aspect-ratio box, so it fills it
        // rather than collapsing to the height of the initials.
        "absolute inset-0 flex size-full items-center justify-center",
        "bg-linear-to-br from-brand to-accent",
        className,
      )}
    >
      <span className="font-display text-3xl text-white/85">{initials}</span>
    </div>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-medium text-ink-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-10 text-center">
      <p className="font-display text-xl">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-ink-muted">{description}</p>
    </Card>
  );
}
