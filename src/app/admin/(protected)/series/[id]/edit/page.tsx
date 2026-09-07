import { notFound } from "next/navigation";

import { DeleteSeriesForm, SeriesForm } from "@/components/admin/series-form";
import { AdminHeader } from "@/components/admin/ui";
import { toDateInput } from "@/lib/date-input";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditSeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const series = await prisma.series.findUnique({ where: { id } });
  if (!series) notFound();

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Edit series"
        description="Deleting a series never deletes its sermons. They simply stop being grouped."
      />

      <SeriesForm
        values={{
          id: series.id,
          slug: series.slug,
          titleEn: series.titleEn,
          titleFr: series.titleFr,
          descriptionEn: series.descriptionEn,
          descriptionFr: series.descriptionFr,
          imageUrl: series.imageUrl,
          imageAltEn: series.imageAltEn,
          imageAltFr: series.imageAltFr,
          startDate: toDateInput(series.startDate),
          endDate: toDateInput(series.endDate),
        }}
      />

      <DeleteSeriesForm id={series.id} />
    </div>
  );
}
