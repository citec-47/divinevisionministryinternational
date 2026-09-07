"use client";

import { useSyncExternalStore } from "react";

/**
 * Client-only values, subscribed to properly.
 *
 * The site is statically rendered, so "what time is it" and "which theme is on"
 * cannot be answered on the server, they would be frozen at build time. These
 * hooks return a null/false server snapshot and the real value after hydration,
 * which is exactly what `useSyncExternalStore` is for. Doing it this way, rather
 * than with `setState` inside an effect, avoids the cascading render React now
 * warns about.
 */

// --- A ticking clock --------------------------------------------------------

const TICK_MS = 30_000;

let currentTime = 0;
const clockListeners = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | null = null;

function subscribeToClock(listener: () => void) {
  clockListeners.add(listener);

  if (currentTime === 0) currentTime = Date.now();

  if (!clockTimer) {
    clockTimer = setInterval(() => {
      currentTime = Date.now();
      for (const notify of clockListeners) notify();
    }, TICK_MS);
  }

  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0 && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
  };
}

/** The current time, or null until the component has hydrated. */
export function useNow(): Date | null {
  const ms = useSyncExternalStore(
    subscribeToClock,
    () => currentTime,
    () => 0,
  );
  return ms === 0 ? null : new Date(ms);
}

// --- The active theme -------------------------------------------------------

/**
 * Watches the `dark` class on <html>, which the pre-paint script sets and the
 * toggle flips. A MutationObserver means the icon stays right even if something
 * else changes the theme.
 */
function subscribeToTheme(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

export function useIsDark(): boolean {
  return useSyncExternalStore(
    subscribeToTheme,
    () => document.documentElement.classList.contains("dark"),
    // The server cannot know; the pre-paint script fixes it before anyone sees.
    () => false,
  );
}

// --- Hydration timestamp ----------------------------------------------------

/** Captured once when the bundle first runs in the browser. */
const CLIENT_LOADED_AT = typeof window === "undefined" ? 0 : Date.now();

function noopSubscribe() {
  return () => {};
}

/**
 * When this page loaded in the browser, or 0 on the server. Used as the
 * anti-spam timing signal: a form submitted within a couple of seconds of the
 * page loading was not filled in by a person.
 */
export function useClientLoadedAt(): number {
  return useSyncExternalStore(
    noopSubscribe,
    () => CLIENT_LOADED_AT,
    () => 0,
  );
}
