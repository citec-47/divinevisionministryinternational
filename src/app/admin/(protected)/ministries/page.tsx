import Link from "next/link";

import { AdminEmpty, AdminHeader, AdminTable, PrimaryLink } from "@/components/admin/ui";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminMinistriesPage() {
  const ministries = await prisma.ministry.findMany({
    orderBy: { sortOrder: "asc" },
    include: { leader: true },
  });

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Ministries"
        description="The groups and teams people can join."
        action={<PrimaryLink href="/admin/ministries/new">Add a ministry</PrimaryLink>}
      />

      {ministries.length ? (
        <AdminTable headings={["Ministry", "Who it is for", "Leader", "Order", ""]}>
          {ministries.map((ministry) => (
            <tr key={ministry.id}>
              <td className="px-5 py-3">
                <p className="font-medium">{ministry.titleEn}</p>
                <p className="text-xs text-ink-faint">{ministry.summaryEn}</p>
              </td>
              <td className="px-5 py-3 text-ink-muted">{ministry.audienceEn ?? "—"}</td>
              <td className="px-5 py-3 text-ink-muted">{ministry.leader?.name ?? "—"}</td>
              <td className="px-5 py-3 text-ink-muted">{ministry.sortOrder}</td>
              <td className="px-5 py-3 text-right">
                <Link
                  href={`/admin/ministries/${ministry.id}/edit`}
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
          title="No ministries yet"
          description="Add the groups people can join — kids, youth, worship, outreach."
          action={<PrimaryLink href="/admin/ministries/new">Add a ministry</PrimaryLink>}
        />
      )}
    </div>
  );
}
