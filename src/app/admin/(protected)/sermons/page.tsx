import Link from "next/link";

import {
  AdminEmpty,
  AdminHeader,
  AdminTable,
  PrimaryLink,
  StatusPill,
} from "@/components/admin/ui";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSermonsPage() {
  const sermons = await prisma.sermon.findMany({
    orderBy: { date: "desc" },
    include: { speaker: true, series: true },
  });

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Sermons"
        description="Every message on the site. The newest one leads the homepage."
        action={<PrimaryLink href="/admin/sermons/new">Add a sermon</PrimaryLink>}
      />

      {sermons.length ? (
        <AdminTable headings={["Title", "Date", "Speaker", "Media", "Status", ""]}>
          {sermons.map((sermon) => (
            <tr key={sermon.id}>
              <td className="px-5 py-3">
                <p className="font-medium">{sermon.titleEn}</p>
                {sermon.series ? (
                  <p className="text-xs text-ink-faint">{sermon.series.titleEn}</p>
                ) : null}
              </td>
              <td className="px-5 py-3 text-ink-muted">
                {sermon.date.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-5 py-3 text-ink-muted">{sermon.speaker?.name ?? "—"}</td>
              <td className="px-5 py-3">
                <div className="flex gap-1.5">
                  <StatusPill ok={Boolean(sermon.videoUrl)}>Video</StatusPill>
                  <StatusPill ok={Boolean(sermon.audioUrl)}>Audio</StatusPill>
                </div>
              </td>
              <td className="px-5 py-3">
                <StatusPill ok={sermon.published}>
                  {sermon.published ? "Published" : "Draft"}
                </StatusPill>
              </td>
              <td className="px-5 py-3 text-right">
                <Link
                  href={`/admin/sermons/${sermon.id}/edit`}
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
          title="No sermons yet"
          description="Add Sunday's message and it appears on the homepage, in the sermon library, and in the podcast feed."
          action={<PrimaryLink href="/admin/sermons/new">Add the first sermon</PrimaryLink>}
        />
      )}
    </div>
  );
}
