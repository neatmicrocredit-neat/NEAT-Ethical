import { DashboardShell } from "@/components/dashboard/shell";
import { currentAdmin } from "@/lib/auth";
import { countAwaiting } from "@/lib/messaging";

export const metadata = {
  title: "Admin console · NEAT Ethical Investments",
};

export default async function DashboardLayout({ children }) {
  // countAwaiting resolves to 0 when the messaging migration has not been
  // applied yet, so the shell renders either way.
  const [admin, awaiting] = await Promise.all([currentAdmin(), countAwaiting()]);

  return (
    <DashboardShell adminEmail={admin?.email} badges={{ messages: awaiting }}>
      {children}
    </DashboardShell>
  );
}
