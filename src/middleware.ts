import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, LOCALES, localeFromAcceptLanguage } from "@/lib/i18n";

/**
 * Puts every visitor on a locale-prefixed path.
 *
 * Cameroon is bilingual, so guessing well matters: we read Accept-Language and
 * send a French browser to /fr and everyone else to /en. The choice is only a
 * redirect, never a lock — the language switcher in the header rewrites the
 * path, so anyone can override it in one tap.
 */
const PUBLIC_FILE = /\.[^/]+$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The admin, the API, Next internals and real files are not localized.
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale =
    localeFromAcceptLanguage(request.headers.get("accept-language")) ?? DEFAULT_LOCALE;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
