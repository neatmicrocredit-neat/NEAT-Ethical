import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function CustomersPage() {
  const supabase = createSupabaseServerClient();
  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, first_name, last_name, email, phone_number, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customers:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Customers</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Client portfolio overview</h1>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.4fr_1.2fr_1.2fr_0.7fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          <span>Name</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Joined</span>
        </div>
        {(customers || []).map((customer) => (
          <Link key={customer.id} href={`/dashboard/customers/${customer.id}`} className="grid grid-cols-[1.4fr_1.2fr_1.2fr_0.7fr] border-b border-slate-100 px-4 py-4 text-sm text-slate-600 last:border-b-0 hover:bg-slate-50">
            <span className="font-medium text-slate-900">{customer.first_name} {customer.last_name}</span>
            <span>{customer.email}</span>
            <span>{customer.phone_number || "—"}</span>
            <span>{new Date(customer.created_at).toLocaleDateString()}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
