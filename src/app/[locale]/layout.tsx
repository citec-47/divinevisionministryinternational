import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { notFound } from "next/navigation";

import { LiveBanner } from "@/components/live-status";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JsonLd, churchSchema } from "@/components/structured-data";
import { getSettings } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n";
import { themeInitScript } from "@/lib/theme-script";
import { siteUrl } from "@/lib/utils";

import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const settings = await getSettings(locale);

  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: `${settings.name} — ${settings.tagline}`,
      template: `%s — ${settings.shortName}`,
    },
    description: settings.description,
    applicationName: settings.name,
    keywords: [
      settings.name,
      "Divine Vision",
      "Prophet Emmanuel Ayuh",
      `church in ${settings.address.city}`,
      `église ${settings.address.city}`,
      "Yaoundé church",
      "Cameroon church",
    ],
    openGraph: {
      type: "website",
      siteName: settings.name,
      title: settings.name,
      description: settings.description,
      url: `${siteUrl()}/${locale}`,
      locale: locale === "fr" ? "fr_CM" : "en_CM",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.name,
      description: settings.description,
    },
    alternates: {
      canonical: `/${locale}`,
      // Tells search engines the two versions are the same page, not duplicates.
      languages: {
        en: "/en",
        fr: "/fr",
        "x-default": "/en",
      },
      types: {
        "application/rss+xml": [
          { url: "/api/podcast.xml", title: `${settings.shortName} sermon podcast` },
        ],
      },
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1116" },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const settings = await getSettings(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Runs before paint so a dark-mode visitor never sees a light flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.variable} ${fraunces.variable} antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-5 focus:py-3 focus:text-brand-contrast"
        >
          {dict.nav.skipToContent}
        </a>

        <LiveBanner settings={settings} locale={locale} dict={dict} />
        <SiteHeader
          locale={locale}
          dict={dict}
          shortName={settings.shortName}
          churchName={settings.name}
        />

        <main id="main">{children}</main>

        <SiteFooter settings={settings} locale={locale} dict={dict} />

        <JsonLd data={churchSchema(settings, locale)} />
      </body>
    </html>
  );
}
