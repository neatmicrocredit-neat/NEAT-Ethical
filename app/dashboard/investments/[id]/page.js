import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";

export default async function InvestmentDetailPage({ params }) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();

  const { data: investment, error: investmentError } = await supabase
    .from("investments")
    .select("*")
    .eq("uuid", id)
    .single();

  const { data: customer } = investment?.customer_id
    ? await supabase
        .from("customers")
        .select("id, first_name, last_name, email, phone_number")
        .eq("id", investment.customer_id)
        .single()
    : { data: null };

  if (investmentError || !investment) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Investment</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Not found</h1>
        </div>

        
        <div>
          <Button className=" rounded-md">
            <Link href="/dashboard/investments" className="text-sm font-medium text-white hover:text-white-300">
              ← Back to investments
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button>
          <Link href="/dashboard/investments" className="text-sm font-medium text-white hover:text-white-300">
            ← Back to investments
          </Link>
        </Button>
      </div>
      
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Investment</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Investment #{id.slice(0, 8)}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Investment details</h2>
            <div className="mt-6 grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Amount</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">₦{Number(investment.amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Payout schedule</p>
                  <p className="mt-1 text-lg text-slate-900">{investment.payout_schedule || "—"}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Start date</p>
                  <p className="mt-1 text-slate-900">{investment.start_date ? new Date(investment.start_date).toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">End date</p>
                  <p className="mt-1 text-slate-900">{investment.end_date ? new Date(investment.end_date).toLocaleDateString() : "—"}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Investment Vehicle</p>
                  <p className="mt-1 text-slate-900">{new String(investment.vehicle).toLocaleUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Rollover</p>
                  <p className="mt-1 text-slate-900">{investment.rollover ? "Enabled" : "Disabled"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Payout information</h2>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Bank name</p>
                <p className="mt-1 text-slate-900">{investment.payout_bank_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Account name</p>
                <p className="mt-1 text-slate-900">{investment.payout_account_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Account number</p>
                <p className="mt-1 font-mono text-sm text-slate-900">{investment.payout_account_number || "—"}</p>
              </div>
              {investment.other_instructions && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">Notes</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{investment.other_instructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-slate-900">Customer</h2>
          {customer ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700">Name</p>
                <p className="mt-1 text-slate-900">{customer.first_name} {customer.last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Email</p>
                <p className="mt-1 text-sm text-slate-600">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Phone</p>
                <p className="mt-1 text-sm text-slate-600">{customer.phone_number || "—"}</p>
              </div>
              <Link href={`/dashboard/customers/${customer.id}`} className="mt-4 block text-sm font-medium text-slate-700 hover:text-slate-900">
                View customer →
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">Customer information unavailable</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase text-slate-500">Created</p>
        <p className="mt-2 text-slate-900">{new Date(investment.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
}
