import { MinistryForm } from "@/components/admin/ministry-form";
import { AdminHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewMinistryPage() {
  const leaders = await prisma.speaker.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-8">
      <AdminHeader title="Add a ministry" />
      <MinistryForm values={{ sortOrder: 0 }} leaders={leaders} />
    </div>
  );
}
