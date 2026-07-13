import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function InvestmentsPage() {
  const supabase = createSupabaseServerClient();
  const { data: investments, error } = await supabase
    .from("investments")
    .select("id, customer_id, amount, start_date, end_date, payout_schedule, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching investments:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Investments</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Active opportunities</h1>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_1fr_1.2fr_1fr_0.7fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          <span>Customer ID</span>
          <span>Amount</span>
          <span>Payout Schedule</span>
          <span>Period</span>
          <span>Created</span>
        </div>
        {(investments || []).map((investment) => (
          <Link key={investment.id} href={`/dashboard/investments/${investment.id}`} className="grid grid-cols-[1fr_1fr_1.2fr_1fr_0.7fr] border-b border-slate-100 px-4 py-4 text-sm text-slate-600 last:border-b-0 hover:bg-slate-50">
            <span className="font-medium text-slate-900">{investment.customer_id}</span>
            <span>₦{Number(investment.amount || 0).toLocaleString()}</span>
            <span>{investment.payout_schedule || "—"}</span>
            <span>{investment.start_date ? new Date(investment.start_date).toLocaleDateString() : "—"}</span>
            <span>{new Date(investment.created_at).toLocaleDateString()}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
