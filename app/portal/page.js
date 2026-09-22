import { redirect } from "next/navigation";
import CustomerPortal from "@/components/customer-portal";
import { getCustomerSession } from "@/lib/customer-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const { customer } = await getCustomerSession();
  if (!customer) redirect("/auth/login?redirectTo=/portal");
  const supabase = createSupabaseServerClient();
  const [{ data: investments = [] }, { data: fundingRequests = [] }, { data: loanRequests = [] }, { data: transactions = [] }] = await Promise.all([
    supabase.from("investments").select("id, uuid, amount, vehicle, status, submitted_at, created_at").eq("customer_id", customer.id).order("created_at", { ascending: false }),
    supabase.from("funding_requests").select("id, uuid, amount, status, created_at").eq("customer_id", customer.id).order("created_at", { ascending: false }),
    supabase.from("loan_requests").select("id, uuid, amount, purpose, term_months, status, created_at").eq("customer_id", customer.id).order("created_at", { ascending: false }),
    supabase.from("transactions").select("id, uuid, kind, direction, amount, status, value_date, created_at").eq("customer_id", customer.id).order("value_date", { ascending: false }).limit(20),
  ]);
  return <CustomerPortal customer={customer} investments={investments} fundingRequests={fundingRequests} loanRequests={loanRequests} transactions={transactions} />;
}
