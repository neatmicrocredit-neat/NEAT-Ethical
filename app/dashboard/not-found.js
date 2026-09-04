import Link from "next/link";
import { SearchX } from "lucide-react";

import { EmptyState, Panel, buttonStyles } from "@/components/dashboard/ui";

export default function DashboardNotFound() {
  return (
    <Panel>
      <EmptyState
        icon={SearchX}
        title="That record no longer exists"
        description="It may have been deleted, or the link points at an id from another environment."
        action={
          <Link href="/dashboard" className={buttonStyles.primary}>
            Back to the dashboard
          </Link>
        }
      />
    </Panel>
  );
}
