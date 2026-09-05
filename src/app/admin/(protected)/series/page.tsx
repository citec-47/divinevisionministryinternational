import Link from "next/link";

import { AdminEmpty, AdminHeader, AdminTable, PrimaryLink } from "@/components/admin/ui";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSeriesPage() {
  const series = await prisma.series.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { sermons: true } } },
  });

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Sermon series"
        description="Group messages that belong together, so people can work through them in order."
        action={<PrimaryLink href="/admin/series/new">Add a series</PrimaryLink>}
      />

      {series.length ? (
        <AdminTable headings={["Series", "Messages", "Started", ""]}>
          {series.map((item) => (
            <tr key={item.id}>
              <td className="px-5 py-3 font-medium">{item.titleEn}</td>
              <td className="px-5 py-3 text-ink-muted">{item._count.sermons}</td>
              <td className="px-5 py-3 text-ink-muted">
                {item.startDate
                  ? item.startDate.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </td>
              <td className="px-5 py-3 text-right">
                <Link
                  href={`/admin/series/${item.id}/edit`}
                  className="underline underline-offset-4 hover:no-underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <AdminEmpty
          title="No series yet"
          description="A series is optional — a sermon can stand on its own. Create one when you start preaching through a book or a theme."
          action={<PrimaryLink href="/admin/series/new">Add a series</PrimaryLink>}
        />
      )}
    </div>
  );
}
