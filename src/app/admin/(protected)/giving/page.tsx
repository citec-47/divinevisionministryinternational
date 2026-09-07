import {
  AdminCard,
  AdminEmpty,
  AdminHeader,
  AdminTable,
  StatusPill,
} from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { isFlutterwaveConfigured } from "@/lib/flutterwave";

export const dynamic = "force-dynamic";

export default async function AdminGivingPage() {
  const [donations, successful] = await Promise.all([
    prisma.donation.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.donation.findMany({ where: { status: "SUCCESSFUL" } }),
  ]);

  // Only completed gifts count toward the total. Pending rows are attempts that
  // may never finish, and showing them as income would be misleading.
  const totalsByCurrency = successful.reduce<Record<string, number>>((totals, donation) => {
    totals[donation.currency] = (totals[donation.currency] ?? 0) + donation.amount;
    return totals;
  }, {});

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Giving"
        description="Gifts given through the website. Mobile Money sent directly to your MTN or Orange number does not appear here, only online checkout does."
      />

      {!isFlutterwaveConfigured() ? (
        <div className="rounded-card border border-accent/40 bg-accent/10 px-5 py-4 text-sm">
          Online giving is switched off. The giving page currently shows your Mobile Money
          details only. Add your Flutterwave keys to accept card and Mobile Money checkout.
        </div>
      ) : null}

      {Object.keys(totalsByCurrency).length ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Object.entries(totalsByCurrency).map(([currency, total]) => (
            <AdminCard key={currency}>
              <p className="text-xs uppercase tracking-wider text-ink-faint">
                Received ({currency})
              </p>
              <p className="mt-1 font-display text-3xl tracking-tight">
                {total.toLocaleString()} {currency}
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                {successful.filter((d) => d.currency === currency).length} completed gifts
              </p>
            </AdminCard>
          ))}
        </div>
      ) : null}

      {donations.length ? (
        <AdminTable headings={["When", "Amount", "Fund", "Giver", "Method", "Status"]}>
          {donations.map((donation) => (
            <tr key={donation.id}>
              <td className="px-5 py-3 text-ink-muted">
                {donation.createdAt.toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-5 py-3 font-medium">
                {donation.amount.toLocaleString()} {donation.currency}
                {donation.recurring ? (
                  <span className="text-xs text-ink-faint"> /month</span>
                ) : null}
              </td>
              <td className="px-5 py-3 text-ink-muted">{donation.fund}</td>
              <td className="px-5 py-3 text-ink-muted">
                {donation.donorName ?? donation.donorEmail ?? "-"}
              </td>
              <td className="px-5 py-3 text-ink-muted">{donation.channel ?? "-"}</td>
              <td className="px-5 py-3">
                <StatusPill ok={donation.status === "SUCCESSFUL"}>{donation.status}</StatusPill>
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <AdminEmpty
          title="No online gifts yet"
          description="Gifts made through the website's checkout appear here, with the payment method and whether they completed."
        />
      )}
    </div>
  );
}
