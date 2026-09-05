import type { Metadata } from "next";

import { LegalPageBody } from "@/components/legal-page";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { getPrivacyPage } from "@/lib/legal";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return {
    title: dict.common.privacy,
    description: getPrivacyPage(locale).title,
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: { en: "/en/privacy", fr: "/fr/privacy" },
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return <LegalPageBody eyebrow={dict.common.privacy} page={getPrivacyPage(locale)} />;
}
