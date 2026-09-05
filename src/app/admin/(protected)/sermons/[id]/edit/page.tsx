import { notFound } from "next/navigation";

import { DeleteSermonForm, SermonForm } from "@/components/admin/sermon-form";
import { AdminHeader } from "@/components/admin/ui";
import { toDateInput } from "@/lib/date-input";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditSermonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [sermon, speakers, series] = await Promise.all([
    prisma.sermon.findUnique({ where: { id } }),
    prisma.speaker.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.series.findMany({
      orderBy: { titleEn: "asc" },
      select: { id: true, titleEn: true },
    }),
  ]);

  if (!sermon) notFound();

  return (
    <div className="space-y-8">
      <AdminHeader title="Edit sermon" description={sermon.titleEn} />

      <SermonForm
        values={{
          id: sermon.id,
          slug: sermon.slug,
          titleEn: sermon.titleEn,
          titleFr: sermon.titleFr,
          summaryEn: sermon.summaryEn,
          summaryFr: sermon.summaryFr,
          date: toDateInput(sermon.date),
          speakerId: sermon.speakerId,
          seriesId: sermon.seriesId,
          scriptures: sermon.scriptures,
          imageUrl: sermon.imageUrl,
          imageAltEn: sermon.imageAltEn,
          imageAltFr: sermon.imageAltFr,
          videoUrl: sermon.videoUrl,
          audioUrl: sermon.audioUrl,
          durationSeconds: sermon.durationSeconds,
          audioByteLength: sermon.audioByteLength,
          transcriptEn: sermon.transcriptEn,
          transcriptFr: sermon.transcriptFr,
          published: sermon.published,
        }}
        speakers={speakers}
        series={series.map((item) => ({ id: item.id, title: item.titleEn }))}
      />

      <DeleteSermonForm id={sermon.id} />
    </div>
  );
}
