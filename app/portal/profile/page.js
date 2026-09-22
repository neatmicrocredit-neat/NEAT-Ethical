import { redirect } from "next/navigation";
import { CustomerPortalSection } from "@/components/customer-portal-section";
import { getCustomerSession } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";
export default async function CustomerProfilePage() {
  const { customer } = await getCustomerSession(); if (!customer) redirect("/auth/login?redirectTo=/portal/profile");
  const fields = [["Name", [customer.first_name, customer.other_names, customer.last_name].filter(Boolean).join(" ")], ["Email", customer.email], ["Phone", customer.phone_number], ["Address", customer.address], ["Next of kin", customer.nok_name], ["Next of kin phone", customer.nok_phone_number], ["Relationship", customer.nok_relationship]];
  return <CustomerPortalSection customer={customer} eyebrow="Profile" title="Your profile" description="These details are attached to your account and reused for future requests."><div className="grid gap-4 rounded-3xl bg-white p-6 sm:grid-cols-2 ring-1 ring-slate-200">{fields.map(([label, value]) => <div key={label}><p className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 font-bold">{value || "Not provided"}</p></div>)}</div></CustomerPortalSection>;
}
