"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { Dictionary } from "@/lib/dictionaries";
import { LOCALES, localePath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme";

export function SiteHeader({
  locale,
  dict,
  shortName,
  churchName,
}: {
  locale: Locale;
  dict: Dictionary;
  shortName: string;
  churchName: string;
}) {
  const pathname = usePathname();

  // Keyed on the path rather than a boolean, so navigating anywhere closes the
  // menu without an effect that has to chase the route.
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const open = openForPath === pathname;

  function toggleMenu() {
    setOpenForPath(open ? null : pathname);
  }

  const navItems = [
    { href: "/visit", label: dict.nav.visit },
    { href: "/about", label: dict.nav.about },
    { href: "/sermons", label: dict.nav.sermons },
    { href: "/events", label: dict.nav.events },
    { href: "/ministries", label: dict.nav.ministries },
  ];

  // Stop the page scrolling behind the open menu.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenForPath(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function isActive(href: string) {
    const full = localePath(locale, href);
    return pathname === full || pathname.startsWith(`${full}/`);
  }

  /** Same page, other language: swap the leading locale segment. */
  function pathInLocale(target: Locale) {
    const rest = pathname.replace(new RegExp(`^/(${LOCALES.join("|")})`), "");
    return `/${target}${rest || ""}`;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ground/85 backdrop-blur-md">
      <div className="container-page flex h-18 items-center justify-between gap-4">
        <Link
          href={localePath(locale, "/")}
          className="flex items-center gap-3"
          aria-label={churchName}
        >
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-brand font-display text-lg text-brand-contrast"
          >
            DV
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg tracking-tight">{shortName}</span>
            <span className="text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint">
              {dict.common.ministryInternational}
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 xl:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={localePath(locale, item.href)}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-[0.95rem] transition-colors hover:bg-surface-2",
                isActive(item.href) ? "text-ink font-medium" : "text-ink-muted",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div
            className="hidden items-center rounded-full border border-line p-0.5 sm:flex"
            role="group"
            aria-label={dict.nav.languageLabel}
          >
            {LOCALES.map((code) => (
              <Link
                key={code}
                href={pathInLocale(code)}
                hrefLang={code}
                aria-current={code === locale ? "true" : undefined}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors",
                  code === locale
                    ? "bg-brand text-brand-contrast"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {code}
              </Link>
            ))}
          </div>

          <ThemeToggle
            labelDark={dict.nav.switchToDark}
            labelLight={dict.nav.switchToLight}
            className="grid size-10 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          />

          <Link
            href={localePath(locale, "/give")}
            className="hidden h-10 items-center rounded-full bg-accent px-5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-soft sm:inline-flex"
          >
            {dict.nav.give}
          </Link>

          <button
            type="button"
            onClick={toggleMenu}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface-2 xl:hidden"
          >
            <span className="sr-only">{open ? dict.nav.menuClose : dict.nav.menuOpen}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      <div id="mobile-nav" hidden={!open} className="border-t border-line bg-ground xl:hidden">
        <nav aria-label="Mobile" className="container-page flex flex-col py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={localePath(locale, item.href)}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "border-b border-line py-3.5 text-lg",
                isActive(item.href) ? "text-ink font-medium" : "text-ink-muted",
              )}
            >
              {item.label}
            </Link>
          ))}

          <div className="mt-5 flex flex-col gap-2.5">
            <Link
              href={localePath(locale, "/give")}
              className="inline-flex h-12 items-center justify-center rounded-full bg-accent font-medium text-accent-contrast"
            >
              {dict.nav.give}
            </Link>
            <Link
              href={localePath(locale, "/prayer")}
              className="inline-flex h-12 items-center justify-center rounded-full border border-line font-medium"
            >
              {dict.nav.prayer}
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-2" aria-label={dict.nav.languageLabel}>
            {LOCALES.map((code) => (
              <Link
                key={code}
                href={pathInLocale(code)}
                hrefLang={code}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium uppercase",
                  code === locale
                    ? "border-brand bg-brand text-brand-contrast"
                    : "border-line text-ink-muted",
                )}
              >
                {code}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
