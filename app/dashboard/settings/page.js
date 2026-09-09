import { notFound } from "next/navigation";
import Link from "next/link";

import { hasCapability } from "@/lib/auth";
import { dateTime } from "@/lib/format";
import { loadSettings } from "@/lib/settings";
import { VEHICLES } from "@/lib/investments";
import { SettingsForms } from "@/components/dashboard/settings-forms";
import { PageHeader, Panel, PanelHeader, SetupNotice, buttonStyles } from "@/components/dashboard/ui";
import { saveCompanySettings, savePolicySettings, saveVehicleSettings } from "@/app/dashboard/settings/actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings · Admin console" };

export default async function SettingsPage() {
  if (!(await hasCapability("settings.write"))) notFound();

  const { settings, meta, missing } = await loadSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Settings"
        description="Company details, published rates and the operating policy the console enforces."
        actions={
          <Link href="/dashboard/team" className={buttonStyles.secondary}>
            Manage team
          </Link>
        }
      />

      {missing ? (
        <SetupNotice
          feature="Editable settings"
          migration="supabase/migrations/0003_operations.sql"
          tables={["app_settings"]}
        />
      ) : null}

      <SettingsForms
        settings={settings}
        meta={meta}
        readOnly={missing}
        vehicleKeys={Object.keys(VEHICLES)}
        companyAction={saveCompanySettings}
        vehicleAction={saveVehicleSettings}
        policyAction={savePolicySettings}
      />

      <Panel>
        <PanelHeader
          title="Where these values are used"
          description="Settings are read at request time; nothing is cached between deploys."
        />
        <dl className="grid gap-5 p-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--dash-muted)]">Company</dt>
            <dd className="mt-1 text-[var(--dash-ink-2)]">
              Shown on statements and exports generated from Reports. Updated{" "}
              {meta.company?.updatedAt ? dateTime(meta.company.updatedAt) : "never"}.
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--dash-muted)]">Vehicle rates</dt>
            <dd className="mt-1 text-[var(--dash-ink-2)]">
              Recorded for reporting and reference. Existing placements keep the rate they were priced at — changing a
              rate here does not re-price the book.
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--dash-muted)]">Policy</dt>
            <dd className="mt-1 text-[var(--dash-ink-2)]">
              Enforced at approval time. Turning KYC off lets a placement through with an incomplete file.
            </dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}
