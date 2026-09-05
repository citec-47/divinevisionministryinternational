import { SeriesForm } from "@/components/admin/series-form";
import { AdminHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default function NewSeriesPage() {
  return (
    <div className="space-y-8">
      <AdminHeader title="Add a series" />
      <SeriesForm values={{}} />
    </div>
  );
}
