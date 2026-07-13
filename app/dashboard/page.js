import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function DashboardHome() {
  const supabase = createSupabaseServerClient();
  const [{ data: customers }, { data: investments }] = await Promise.all([
    supabase.from("customers").select("id, first_name, last_name, email, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("investments").select("id, customer_id, amount, payout_schedule, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const customerCount = customers?.length ?? 0;
  const investmentCount = investments?.length ?? 0;
  const totalCapital = investments?.reduce((sum, inv) => sum + Number(inv.amount || 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Track your latest customers, investments, and capital deployment from one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Customers</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{customerCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Investments</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{investmentCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Capital deployed</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">₦{totalCapital.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent customers</h2>
            <Link href="/dashboard/customers" className="text-sm font-medium text-slate-700 hover:text-slate-900">View all</Link>
          </div>
          <ul className="mt-4 space-y-3">
            {(customers || []).map((customer) => (
              <li key={customer.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <Link href={`/dashboard/customers/${customer.id}`} className="flex-1">
                  <p className="font-medium text-slate-900">{customer.first_name} {customer.last_name}</p>
                  <p className="text-slate-500">{customer.email}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent investments</h2>
            <Link href="/dashboard/investments" className="text-sm font-medium text-slate-700 hover:text-slate-900">View all</Link>
          </div>
          <ul className="mt-4 space-y-3">
            {(investments || []).map((investment) => (
              <li key={investment.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <Link href={`/dashboard/investments/${investment.id}`} className="flex-1">
                  <p className="font-medium text-slate-900">Customer {investment.customer_id}</p>
                  <p className="text-slate-500">{investment.payout_schedule || "—"}</p>
                </Link>
                <span className="font-medium text-slate-900">₦{Number(investment.amount || 0).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
