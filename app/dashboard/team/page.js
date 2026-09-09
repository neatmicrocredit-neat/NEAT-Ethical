import { currentMember, hasCapability } from "@/lib/auth";
import { CAPABILITIES, ROLES, capabilitiesFor, loadTeam, roleOf } from "@/lib/team";
import { relativeTime } from "@/lib/format";
import { TeamManager } from "@/components/dashboard/team-manager";
import { PageHeader, Panel, PanelHeader, SetupNotice, StatCard } from "@/components/dashboard/ui";
import { inviteMember, removeMember, updateMember } from "@/app/dashboard/team/actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Team · Admin console" };

export default async function TeamPage() {
  const [{ members, missing }, me, canManage] = await Promise.all([
    loadTeam(),
    currentMember(),
    hasCapability("team.write"),
  ]);

  if (missing) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Governance" title="Team" description="Who can sign in, and what they may do." />
        <SetupNotice feature="Roles and permissions" migration="supabase/migrations/0003_operations.sql" tables={["team_members"]} />
      </div>
    );
  }

  const rows = members.map((member) => ({
    uuid: member.uuid,
    email: member.email,
    name: member.name || "",
    title: member.title || "",
    phone: member.phone || "",
    role: member.role,
    status: member.status,
    lastSeen: member.last_seen_at ? relativeTime(member.last_seen_at) : "Never",
    isMe: me?.email?.toLowerCase() === member.email?.toLowerCase(),
  }));

  const active = rows.filter((row) => row.status === "active").length;
  const owners = rows.filter((row) => row.role === "owner" && row.status === "active").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Team"
        description="Who can sign in to the console, and what each role is allowed to do."
      />

      {me?.bootstrap ? (
        <p className="rounded-2xl bg-[#fdf4e0] px-5 py-4 text-sm text-[#7a5600] ring-1 ring-[#f0dcae]">
          No team members are on file yet, so everyone who can sign in is treated as an owner. Add yourself below to lock that down —
          once at least one member exists, anyone not on the list gets the lowest role.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Members" value={rows.length.toLocaleString()} hint={`${active} active`} />
        <StatCard label="Owners" value={owners.toLocaleString()} hint="Can change roles and settings" />
        <StatCard
          label="Suspended"
          value={rows.filter((row) => row.status === "suspended").length.toLocaleString()}
          hint="Blocked from every action"
          upIsGood={false}
        />
        <StatCard label="Your role" value={roleOf(me).label} hint={roleOf(me).note} />
      </div>

      <TeamManager
        rows={rows}
        inviteAction={inviteMember}
        updateAction={updateMember}
        removeAction={removeMember}
        canManage={canManage}
      />

      <Panel>
        <PanelHeader
          title="What each role can do"
          description="Permissions are cumulative — every role includes everything the roles below it can do."
        />
        <div className="overflow-x-auto dash-scroll">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs">
              <tr className="border-b border-[var(--dash-line)] text-[var(--dash-muted)]">
                <th scope="col" className="px-5 py-2.5 font-medium">Capability</th>
                {Object.values(ROLES)
                  .sort((a, b) => a.rank - b.rank)
                  .map((role) => (
                    <th key={role.key} scope="col" className="px-4 py-2.5 text-center font-medium">
                      {role.label}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dash-line)]">
              {CAPABILITIES.map((capability) => (
                <tr key={capability}>
                  <td className="px-5 py-2.5 font-mono text-xs text-[var(--dash-ink-2)]">{capability}</td>
                  {Object.values(ROLES)
                    .sort((a, b) => a.rank - b.rank)
                    .map((role) => (
                      <td key={role.key} className="px-4 py-2.5 text-center">
                        {capabilitiesFor(role.key).includes(capability) ? (
                          <span className="text-[var(--status-good-ink)]" aria-label="Allowed">●</span>
                        ) : (
                          <span className="text-[var(--dash-line)]" aria-label="Not allowed">—</span>
                        )}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
