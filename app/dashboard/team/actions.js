"use server";

import { revalidatePath } from "next/cache";

import { requireCapability } from "@/lib/auth";
import { recordAudit, diff } from "@/lib/audit";
import { choice, fail, ok, text } from "@/lib/form";
import { MEMBER_STATUSES, ROLES } from "@/lib/team";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function revalidateTeam() {
  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard/settings");
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function inviteMember(_prevState, formData) {
  let member;
  try {
    member = await requireCapability("team.write");
  } catch (error) {
    return fail(error.message);
  }

  const email = text(formData, "email")?.toLowerCase();
  if (!email || !EMAIL.test(email)) return fail("Enter a valid email address.");

  const payload = {
    email,
    name: text(formData, "name"),
    title: text(formData, "title"),
    phone: text(formData, "phone"),
    role: choice(formData, "role", ROLES, "support"),
    status: "invited",
    invited_by: member.email,
  };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("team_members").insert(payload).select("id").single();
  if (error) {
    if (error.code === "23505") return fail("Someone with that email is already on the team.");
    return fail(`Could not add the member: ${error.message}`);
  }

  await recordAudit({
    actor: member.email,
    action: "create",
    entity: "team",
    entityId: data.id,
    entityLabel: email,
    summary: `Invited as ${ROLES[payload.role].label}.`,
  });

  revalidateTeam();
  return ok(`${email} can now sign in with the ${ROLES[payload.role].label} role.`);
}

export async function updateMember(_prevState, formData) {
  let member;
  try {
    member = await requireCapability("team.write");
  } catch (error) {
    return fail(error.message);
  }

  const uuid = text(formData, "uuid");
  if (!uuid) return fail("Missing the member reference.");

  const supabase = createSupabaseServerClient();
  const { data: previous } = await supabase.from("team_members").select("*").eq("uuid", uuid).maybeSingle();
  if (!previous) return fail("That member no longer exists.");

  const payload = {
    name: text(formData, "name"),
    title: text(formData, "title"),
    phone: text(formData, "phone"),
    role: choice(formData, "role", ROLES, previous.role),
    status: choice(formData, "status", MEMBER_STATUSES, previous.status),
  };

  // An owner demoting or suspending themselves can lock the console out of its
  // only account that may edit the team, so the last active owner is protected.
  if (previous.role === "owner" && (payload.role !== "owner" || payload.status !== "active")) {
    const { count } = await supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("role", "owner")
      .eq("status", "active");
    if ((count || 0) <= 1) return fail("This is the last active owner. Promote someone else first.");
  }

  const { error } = await supabase.from("team_members").update(payload).eq("uuid", uuid);
  if (error) return fail(`Could not save the member: ${error.message}`);

  await recordAudit({
    actor: member.email,
    action: "update",
    entity: "team",
    entityId: previous.id,
    entityLabel: previous.email,
    summary:
      previous.role === payload.role
        ? "Member details updated."
        : `Role changed from ${ROLES[previous.role]?.label || previous.role} to ${ROLES[payload.role].label}.`,
    changes: diff(previous, payload),
  });

  revalidateTeam();
  return ok("Member updated.");
}

export async function removeMember(formData) {
  const member = await requireCapability("team.write");

  const uuid = String(formData.get("uuid") || "");
  if (!uuid) return;

  const supabase = createSupabaseServerClient();
  const { data: previous } = await supabase.from("team_members").select("*").eq("uuid", uuid).maybeSingle();
  if (!previous) return;

  if (previous.role === "owner") {
    const { count } = await supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("role", "owner")
      .eq("status", "active");
    if ((count || 0) <= 1) return;
  }

  await supabase.from("team_members").delete().eq("uuid", uuid);

  await recordAudit({
    actor: member.email,
    action: "delete",
    entity: "team",
    entityId: previous.id,
    entityLabel: previous.email,
    summary: "Removed from the team.",
  });

  revalidateTeam();
}
