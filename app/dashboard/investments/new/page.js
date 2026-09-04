import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createInvestment } from "@/app/dashboard/actions";
import { loadCustomerById, loadCustomerOptions } from "@/lib/dashboard-data";
import { fullName } from "@/lib/format";
import { InvestmentForm } from "@/components/dashboard/investment-form";
import { PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function NewInvestmentPage({ searchParams }) {
  const { customer } = await searchParams;

  // When launched from a customer's page the customer is fixed; otherwise the
  // operator picks one from the full list.
  const preset = customer ? await loadCustomerById(customer) : null;
  const customers = preset ? [] : await loadCustomerOptions();

  return (
    <div className="space-y-6">
      <Link
        href={preset ? `/dashboard/customers/${preset.uuid}` : "/dashboard/investments"}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-ink-2)] transition hover:text-[var(--dash-ink)]"
      >
        <ArrowLeft className="size-4" />
        {preset ? `Back to ${fullName(preset)}` : "Back to placements"}
      </Link>

      <PageHeader
        eyebrow="Portfolio"
        title="Record a placement"
        description={
          preset
            ? `A new investment for ${fullName(preset)}. The projection updates as you type.`
            : "Capture a new investment against a customer. The projection updates as you type."
        }
      />

      <InvestmentForm
        action={createInvestment}
        customers={customers}
        customerId={preset?.id}
        submitLabel="Create placement"
        cancelHref={preset ? `/dashboard/customers/${preset.uuid}` : "/dashboard/investments"}
      />
    </div>
  );
}
