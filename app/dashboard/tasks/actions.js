"use server";

import { revalidatePath } from "next/cache";

import { requireCapability } from "@/lib/auth";
import { recordAudit, diff } from "@/lib/audit";
import { choice, date, fail, integer, ok, text } from "@/lib/form";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/tasks";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function revalidateTasks(customerUuid, investmentUuid) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  if (customerUuid) revalidatePath(`/dashboard/customers/${customerUuid}`);
  if (investmentUuid) revalidatePath(`/dashboard/investments/${investmentUuid}`);
}

export async function createTask(_prevState, formData) {
  let member;
  try {
    member = await requireCapability("tasks.write");
  } catch (error) {
    return fail(error.message);
  }

  const title = text(formData, "title");
  if (!title) return fail("Give the task a title.");

  const payload = {
    title,
    detail: text(formData, "detail"),
    status: choice(formData, "status", TASK_STATUSES, "open"),
    priority: choice(formData, "priority", TASK_PRIORITIES, "normal"),
    due_on: date(formData, "due_on"),
    assignee: text(formData, "assignee"),
    customer_id: integer(formData, "customer_id"),
    investment_id: integer(formData, "investment_id"),
    created_by: member.email,
  };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("tasks").insert(payload).select("id").single();
  if (error) return fail(`Could not create the task: ${error.message}`);

  await recordAudit({
    actor: member.email,
    action: "create",
    entity: "task",
    entityId: data.id,
    entityLabel: title,
    summary: payload.due_on ? `Task created, due ${payload.due_on}.` : "Task created.",
  });

  revalidateTasks(text(formData, "customer_uuid"), text(formData, "investment_uuid"));
  return ok("Task created.");
}

export async function updateTask(_prevState, formData) {
  let member;
  try {
    member = await requireCapability("tasks.write");
  } catch (error) {
    return fail(error.message);
  }

  const uuid = text(formData, "uuid");
  if (!uuid) return fail("Missing the task reference.");

  const title = text(formData, "title");
  if (!title) return fail("Give the task a title.");

  const status = choice(formData, "status", TASK_STATUSES, "open");
  const payload = {
    title,
    detail: text(formData, "detail"),
    status,
    priority: choice(formData, "priority", TASK_PRIORITIES, "normal"),
    due_on: date(formData, "due_on"),
    assignee: text(formData, "assignee"),
    // Completing a task stamps the time; re-opening one clears it, so the
    // column never claims a completion that was undone.
    completed_at: status === "done" ? new Date().toISOString() : null,
  };

  const supabase = createSupabaseServerClient();
  const { data: previous } = await supabase.from("tasks").select("*").eq("uuid", uuid).maybeSingle();
  if (!previous) return fail("That task no longer exists.");

  const { error } = await supabase.from("tasks").update(payload).eq("uuid", uuid);
  if (error) return fail(`Could not save the task: ${error.message}`);

  await recordAudit({
    actor: member.email,
    action: "update",
    entity: "task",
    entityId: previous.id,
    entityLabel: title,
    summary: previous.status === status ? "Task updated." : `Moved to ${TASK_STATUSES[status].label.toLowerCase()}.`,
    changes: diff(previous, payload),
  });

  revalidateTasks(text(formData, "customer_uuid"), text(formData, "investment_uuid"));
  return ok("Task saved.");
}

/** One-click status change from a list row. */
export async function setTaskStatus(formData) {
  const member = await requireCapability("tasks.write");

  const uuid = String(formData.get("uuid") || "");
  const status = String(formData.get("status") || "");
  if (!uuid || !TASK_STATUSES[status]) return;

  const supabase = createSupabaseServerClient();
  const { data: previous } = await supabase.from("tasks").select("id, title, status").eq("uuid", uuid).maybeSingle();
  if (!previous) return;

  await supabase
    .from("tasks")
    .update({ status, completed_at: status === "done" ? new Date().toISOString() : null })
    .eq("uuid", uuid);

  await recordAudit({
    actor: member.email,
    action: "update",
    entity: "task",
    entityId: previous.id,
    entityLabel: previous.title,
    summary: `Moved to ${TASK_STATUSES[status].label.toLowerCase()}.`,
    changes: { status: { from: previous.status, to: status } },
  });

  revalidateTasks(String(formData.get("customer_uuid") || ""), String(formData.get("investment_uuid") || ""));
}

export async function deleteTask(formData) {
  const member = await requireCapability("tasks.write");

  const uuid = String(formData.get("uuid") || "");
  if (!uuid) return;

  const supabase = createSupabaseServerClient();
  const { data: previous } = await supabase.from("tasks").select("id, title").eq("uuid", uuid).maybeSingle();
  await supabase.from("tasks").delete().eq("uuid", uuid);

  if (previous) {
    await recordAudit({
      actor: member.email,
      action: "delete",
      entity: "task",
      entityId: previous.id,
      entityLabel: previous.title,
      summary: "Task deleted.",
    });
  }

  revalidateTasks(String(formData.get("customer_uuid") || ""), String(formData.get("investment_uuid") || ""));
}
