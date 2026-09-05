import type { Metadata } from "next";

import { LegalPageBody } from "@/components/legal-page";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { getAccessibilityPage } from "@/lib/legal";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return {
    title: dict.common.accessibility,
    description: getAccessibilityPage(locale).title,
    alternates: {
      canonical: `/${locale}/accessibility`,
      languages: { en: "/en/accessibility", fr: "/fr/accessibility" },
    },
  };
}

export default async function AccessibilityPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return (
    <LegalPageBody eyebrow={dict.common.accessibility} page={getAccessibilityPage(locale)} />
  );
}
