import { notFound } from "next/navigation";

import { DeleteMinistryForm, MinistryForm } from "@/components/admin/ministry-form";
import { AdminHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditMinistryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [ministry, leaders] = await Promise.all([
    prisma.ministry.findUnique({ where: { id } }),
    prisma.speaker.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!ministry) notFound();

  return (
    <div className="space-y-8">
      <AdminHeader title="Edit ministry" description={ministry.titleEn} />

      <MinistryForm
        values={{
          id: ministry.id,
          slug: ministry.slug,
          titleEn: ministry.titleEn,
          titleFr: ministry.titleFr,
          summaryEn: ministry.summaryEn,
          summaryFr: ministry.summaryFr,
          descriptionEn: ministry.descriptionEn,
          descriptionFr: ministry.descriptionFr,
          audienceEn: ministry.audienceEn,
          audienceFr: ministry.audienceFr,
          meetingTimeEn: ministry.meetingTimeEn,
          meetingTimeFr: ministry.meetingTimeFr,
          imageUrl: ministry.imageUrl,
          imageAltEn: ministry.imageAltEn,
          imageAltFr: ministry.imageAltFr,
          leaderId: ministry.leaderId,
          sortOrder: ministry.sortOrder,
        }}
        leaders={leaders}
      />

      <DeleteMinistryForm id={ministry.id} />
    </div>
  );
}
