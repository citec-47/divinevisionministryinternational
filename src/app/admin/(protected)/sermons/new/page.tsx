import { SermonForm } from "@/components/admin/sermon-form";
import { AdminHeader } from "@/components/admin/ui";
import { toDateInput } from "@/lib/date-input";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewSermonPage() {
  const [speakers, series] = await Promise.all([
    prisma.speaker.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.series.findMany({
      orderBy: { titleEn: "asc" },
      select: { id: true, titleEn: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Add a sermon"
        description="Only the title and the date are required. Everything else can follow later."
      />

      <SermonForm
        values={{
          // Sunday's date is the common case, so default to today.
          date: toDateInput(new Date()),
          published: true,
        }}
        speakers={speakers}
        series={series.map((item) => ({ id: item.id, title: item.titleEn }))}
      />
    </div>
  );
}
