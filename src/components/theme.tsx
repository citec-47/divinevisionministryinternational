"use client";

import { useIsDark } from "@/lib/client-hooks";
import { THEME_STORAGE_KEY } from "@/lib/theme-script";

export function ThemeToggle({
  className,
  labelDark,
  labelLight,
}: {
  className?: string;
  labelDark: string;
  labelLight: string;
}) {
  // Reads the class on <html>, which the pre-paint script has already set, so
  // there is no flash and no state to keep in sync.
  const isDark = useIsDark();

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Private browsing; the choice just will not persist.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={className}
      aria-label={isDark ? labelLight : labelDark}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        aria-hidden="true"
      >
        {isDark ? (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
