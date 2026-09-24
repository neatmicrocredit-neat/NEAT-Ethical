import { redirect } from "next/navigation";
import { CustomerProfileForm } from "@/components/customer-profile-form";
import { CustomerPortalSection } from "@/components/customer-portal-section";
import { getCustomerSession } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage() {
  const { customer } = await getCustomerSession();
  if (!customer) redirect("/auth/login?redirectTo=/portal/profile");
  return <CustomerPortalSection customer={customer} eyebrow="Profile" title="Complete your profile" description="Keep your personal, next-of-kin, and verification details current. We reuse these details for future requests."><CustomerProfileForm customer={customer}/></CustomerPortalSection>;
}
