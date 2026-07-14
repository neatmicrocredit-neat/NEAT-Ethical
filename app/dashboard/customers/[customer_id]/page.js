import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";

export default async function CustomerDetailPage({ params }) {
  const { customer_id } = await params;
  const supabase = createSupabaseServerClient();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("uuid", customer_id)
    .single();

  const { data: investments } = await supabase
    .from("investments")
    .select("id, amount, start_date, end_date, payout_schedule, rollover, created_at")
    .eq("customer_id", customer_id)
    .order("created_at", { ascending: false });

  if (customerError || !customer) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/customers" className="text-sm font-medium text-slate-700 hover:text-slate-900">
          ← Back to customers
        </Link>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Customer</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Not found</h1>
        </div>
      </div>
    );
  }

  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount || 0), 0) ?? 0;

  return (
    <div className="space-y-6">

      <div>
        <Button>
          <Link href="/dashboard/customers" className="text-sm font-medium text-white hover:text-white-300">
            ← Back to customers
          </Link>
        </Button>
      </div>

      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Customer</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{customer.first_name} {customer.last_name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Personal information</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Email</p>
                <p className="mt-1 text-slate-900">{customer.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Phone</p>
                <p className="mt-1 text-slate-900">{customer.phone_number || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Gender</p>
                <p className="mt-1 text-slate-900">{customer.gender || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Date of birth</p>
                <p className="mt-1 text-slate-900">{customer.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : "—"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-slate-500">Address</p>
                <p className="mt-1 text-slate-900">{customer.address || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">State</p>
                <p className="mt-1 text-slate-900">{customer.state || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">LGA</p>
                <p className="mt-1 text-slate-900">{customer.lga || "—"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Identification</h2>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">ID type</p>
                <p className="mt-1 text-slate-900">{customer.id_type || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">ID number</p>
                <p className="mt-1 font-mono text-sm text-slate-900">{customer.id_number || "—"}</p>
              </div>
            </div>
            {(customer.id_front_url || customer.id_back_url) && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-6">
                {customer.id_front_url && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500 mb-2">ID Front</p>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <Image 
                        src={customer.id_front_url} 
                        alt="ID Front"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                {customer.id_back_url && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500 mb-2">ID Back</p>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <Image 
                        src={customer.id_back_url} 
                        alt="ID Back"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Next of kin details</h2>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Name</p>
                  <p className="mt-1 text-slate-900">{customer.nok_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Relationship</p>
                  <p className="mt-1 text-slate-900">{customer.nok_relationship || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Gender</p>
                  <p className="mt-1 text-slate-900">{customer.nok_gender || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Phone</p>
                  <p className="mt-1 text-slate-900">{customer.nok_phone_number || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Address</p>
                  <p className="mt-1 text-slate-900">{customer.nok_address || "—"}</p>
                </div>
              </div>
            </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Investment portfolio</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Investments</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{investments?.length ?? 0}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Total invested</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">₦{totalInvested.toLocaleString()}</p>
              </div>
            </div>
            {investments && investments.length > 0 && (
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
                <p className="text-sm font-semibold text-slate-700">Placements</p>
                {investments.map((inv) => (
                  <Link key={inv?.id} href={`/dashboard/investments/${inv?.id}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 text-sm hover:bg-slate-100">
                    <div>
                      <p className="font-medium text-slate-900">Investment #{inv?.id}</p>
                      <p className="text-xs text-slate-500">{inv?.payout_schedule || "—"}</p>
                    </div>
                    <span className="font-medium text-slate-900">₦{Number(inv?.amount || 0).toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-slate-900">Profile photo</h2>
          {customer.image_url ? (
            <div className="mt-4">
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <Image 
                  src={customer.image_url} 
                  alt={`${customer.first_name} ${customer.last_name}`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 w-full h-64 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
              No photo
            </div>
          )}
          <div className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm">
            <div>
              <p className="font-medium text-slate-900">Member since</p>
              <p className="mt-1 text-slate-600">{new Date(customer.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
