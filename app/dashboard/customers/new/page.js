import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createCustomer } from "@/app/dashboard/actions";
import { CustomerForm } from "@/components/dashboard/customer-form";
import { PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-ink-2)] transition hover:text-[var(--dash-ink)]"
      >
        <ArrowLeft className="size-4" />
        Back to directory
      </Link>

      <PageHeader
        eyebrow="Portfolio"
        title="Add a customer"
        description="Onboard a customer manually. You can record their first placement once they're saved."
      />

      <CustomerForm action={createCustomer} cancelHref="/dashboard/customers" submitLabel="Create customer" />
    </div>
  );
}
