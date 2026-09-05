import { SettingsForm } from "@/components/admin/settings-form";
import { AdminHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findFirst();

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Church details"
        description="Everything about the church itself. These values appear across the whole site, in both languages."
      />

      <SettingsForm
        values={{
          name: settings?.name,
          shortName: settings?.shortName,
          taglineEn: settings?.taglineEn,
          taglineFr: settings?.taglineFr,
          descriptionEn: settings?.descriptionEn,
          descriptionFr: settings?.descriptionFr,
          logoUrl: settings?.logoUrl,
          addressLine: settings?.addressLine,
          city: settings?.city,
          region: settings?.region,
          country: settings?.country,
          addressNoteEn: settings?.addressNoteEn,
          addressNoteFr: settings?.addressNoteFr,
          phone: settings?.phone,
          whatsapp: settings?.whatsapp,
          email: settings?.email,
          timezone: settings?.timezone,
          currency: settings?.currency,
          livestreamEmbedUrl: settings?.livestreamEmbedUrl,
          livestreamChannelUrl: settings?.livestreamChannelUrl,
          forceLive: settings?.forceLive,
          givingBlurbEn: settings?.givingBlurbEn,
          givingBlurbFr: settings?.givingBlurbFr,
          momoMtn: settings?.momoMtn,
          momoOrange: settings?.momoOrange,
          momoAccountName: settings?.momoAccountName,
          bankName: settings?.bankName,
          bankAccountName: settings?.bankAccountName,
          bankAccountNumber: settings?.bankAccountNumber,
          facebookUrl: settings?.facebookUrl,
          youtubeUrl: settings?.youtubeUrl,
          instagramUrl: settings?.instagramUrl,
          tiktokUrl: settings?.tiktokUrl,
        }}
      />
    </div>
  );
}
