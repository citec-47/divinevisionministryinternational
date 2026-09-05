import { notFound } from "next/navigation";

import { DeleteEventForm, EventForm } from "@/components/admin/event-form";
import { AdminHeader } from "@/components/admin/ui";
import { toDateTimeInput } from "@/lib/date-input";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <div className="space-y-8">
      <AdminHeader title="Edit event" description={event.titleEn} />

      <EventForm
        values={{
          id: event.id,
          slug: event.slug,
          titleEn: event.titleEn,
          titleFr: event.titleFr,
          summaryEn: event.summaryEn,
          summaryFr: event.summaryFr,
          descriptionEn: event.descriptionEn,
          descriptionFr: event.descriptionFr,
          start: toDateTimeInput(event.start),
          end: toDateTimeInput(event.end),
          recurrenceEn: event.recurrenceEn,
          recurrenceFr: event.recurrenceFr,
          category: event.category,
          location: event.location,
          address: event.address,
          imageUrl: event.imageUrl,
          imageAltEn: event.imageAltEn,
          imageAltFr: event.imageAltFr,
          registrationEnabled: event.registrationEnabled,
          capacity: event.capacity,
          registrationClosesAt: toDateTimeInput(event.registrationClosesAt),
          externalUrl: event.externalUrl,
          published: event.published,
        }}
      />

      <DeleteEventForm id={event.id} />
    </div>
  );
}
