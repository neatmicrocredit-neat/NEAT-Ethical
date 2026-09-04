import { loadBook } from "@/lib/dashboard-data";
import { fullName, money } from "@/lib/format";
import { groupByCustomer, kycCompleteness, topHolders } from "@/lib/analytics";
import { summarizeBook } from "@/lib/investments";
import { CustomerTable } from "@/components/dashboard/customer-table";
import { PageHeader, StatCard } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }) {
  const { q = "" } = await searchParams;
  const now = new Date();
  const { customers, investments } = await loadBook();

  const grouped = groupByCustomer(customers, investments, now);
  const summary = summarizeBook(investments, now);
  const kyc = kycCompleteness(customers);
  const holders = topHolders(grouped, 1);

  // Flattened on the server so the client table never runs domain maths.
  const rows = customers.map((customer) => {
    const entry = grouped.byId.get(String(customer.id));
    return {
      uuid: customer.uuid,
      name: fullName(customer),
      email: customer.email || "",
      phone: customer.phone_number || "",
      state: customer.state || "",
      reference: customer.neat_customer_id || "",
      image: customer.image_url || null,
      placements: entry?.summary.count ?? 0,
      capital: entry?.summary.principal ?? 0,
      status: entry?.status ?? "none",
      joinedAt: customer.created_at,
      joined: customer.created_at ? new Date(customer.created_at).toISOString().slice(0, 10) : "",
    };
  });

  const investing = rows.filter((row) => row.placements > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Portfolio"
        title="Customer directory"
        description="Every customer on file, with the capital they have placed and where their portfolio stands today."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Customers on file" value={customers.length.toLocaleString()} hint={`${investing} with a placement`} />
        <StatCard label="Capital placed" value={money(summary.principal)} hint="Lifetime, all customers" />
        <StatCard
          label="Average per investor"
          value={money(investing ? summary.principal / investing : 0)}
          hint="Capital placed ÷ investing customers"
        />
        <StatCard
          label="KYC complete"
          value={`${Math.round(kyc.rate)}%`}
          hint={`${kyc.complete} of ${kyc.total} fully documented`}
          tone={kyc.rate >= 80 ? "active" : "pending"}
        />
      </div>

      {holders.rows[0] ? (
        <p className="text-xs text-[var(--dash-muted)]">
          Largest single holder: <span className="font-medium text-[var(--dash-ink-2)]">{holders.rows[0].name}</span> at{" "}
          {money(holders.rows[0].value)} — {Math.round(holders.rows[0].share)}% of the book.
        </p>
      ) : null}

      <CustomerTable rows={rows} initialSearch={q} />
    </div>
  );
}
