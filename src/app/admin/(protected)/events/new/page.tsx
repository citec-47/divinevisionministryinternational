import { EventForm } from "@/components/admin/event-form";
import { AdminHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default function NewEventPage() {
  return (
    <div className="space-y-8">
      <AdminHeader
        title="Add an event"
        description="Only the title and the start time are required."
      />
      <EventForm values={{ published: true }} />
    </div>
  );
}
