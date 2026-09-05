import { ServiceTimeForm } from "@/components/admin/service-time-form";
import { AdminHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminServiceTimesPage() {
  const times = await prisma.serviceTime.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Service times"
        description="The most important information on the whole website. These drive the homepage, the “we are live now” banner, and what search engines and AI assistants answer when someone asks what time you meet."
      />

      <div className="space-y-6">
        {times.map((time) => (
          <ServiceTimeForm
            key={time.id}
            values={{
              id: time.id,
              labelEn: time.labelEn,
              labelFr: time.labelFr,
              dayOfWeek: time.dayOfWeek,
              startTime: time.startTime,
              endTime: time.endTime,
              noteEn: time.noteEn,
              noteFr: time.noteFr,
              location: time.location,
              sortOrder: time.sortOrder,
            }}
          />
        ))}
      </div>

      <div>
        <h2 className="mb-4 font-display text-xl tracking-tight">Add another</h2>
        <ServiceTimeForm values={{ dayOfWeek: 0, startTime: "", sortOrder: times.length }} />
      </div>
    </div>
  );
}
