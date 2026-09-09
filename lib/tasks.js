import { cache } from "react";

import { createSupabaseServerClient, isMissingTable } from "@/lib/supabase-server";
import { toDate } from "@/lib/format";

export const TASKS_TABLE = "tasks";

export const TASK_STATUSES = {
  open: { key: "open", label: "Open", tone: "pending" },
  in_progress: { key: "in_progress", label: "In progress", tone: "active" },
  done: { key: "done", label: "Done", tone: "matured" },
  cancelled: { key: "cancelled", label: "Cancelled", tone: "closed" },
};

export const TASK_PRIORITIES = {
  urgent: { key: "urgent", label: "Urgent", rank: 4 },
  high: { key: "high", label: "High", rank: 3 },
  normal: { key: "normal", label: "Normal", rank: 2 },
  low: { key: "low", label: "Low", rank: 1 },
};

export const OPEN_STATUSES = ["open", "in_progress"];

const COLUMNS =
  "id, uuid, title, detail, status, priority, due_on, assignee, customer_id, investment_id, created_by, completed_at, created_at";

export const loadTasks = cache(async ({ limit = 1000 } = {}) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .select(COLUMNS)
    .order("due_on", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) {
    if (isMissingTable(error)) return { tasks: [], missing: true, error: null };
    console.error("Failed to load tasks:", error);
    return { tasks: [], missing: false, error };
  }
  return { tasks: data || [], missing: false, error: null };
});

export const loadTasksForCustomer = cache(async (customerId) => {
  if (!customerId) return [];
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .select(COLUMNS)
    .eq("customer_id", customerId)
    .order("due_on", { ascending: true, nullsFirst: false });
  if (error && !isMissingTable(error)) console.error("Failed to load customer tasks:", error);
  return data || [];
});

export const loadTasksForInvestment = cache(async (investmentId) => {
  if (!investmentId) return [];
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .select(COLUMNS)
    .eq("investment_id", investmentId)
    .order("due_on", { ascending: true, nullsFirst: false });
  if (error && !isMissingTable(error)) console.error("Failed to load placement tasks:", error);
  return data || [];
});

export async function countOpenTasks(supabase = createSupabaseServerClient()) {
  const { count, error } = await supabase
    .from(TASKS_TABLE)
    .select("id", { count: "exact", head: true })
    .in("status", OPEN_STATUSES);
  if (error) return 0;
  return count || 0;
}

export function isOverdue(task, now = new Date()) {
  if (!OPEN_STATUSES.includes(task?.status)) return false;
  const due = toDate(task?.due_on);
  return Boolean(due) && due < startOfDay(now);
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function taskSummary(tasks = [], now = new Date()) {
  const summary = { total: tasks.length, open: 0, inProgress: 0, done: 0, overdue: 0, dueToday: 0, unassigned: 0 };
  const today = startOfDay(now).getTime();

  for (const task of tasks) {
    if (task.status === "open") summary.open += 1;
    if (task.status === "in_progress") summary.inProgress += 1;
    if (task.status === "done") summary.done += 1;
    if (isOverdue(task, now)) summary.overdue += 1;
    if (OPEN_STATUSES.includes(task.status)) {
      if (!task.assignee) summary.unassigned += 1;
      const due = toDate(task.due_on);
      if (due && startOfDay(due).getTime() === today) summary.dueToday += 1;
    }
  }
  return summary;
}

/** Overdue first, then by due date, then by priority — the order to work in. */
export function sortForWork(tasks = [], now = new Date()) {
  return [...tasks].sort((a, b) => {
    const aOverdue = isOverdue(a, now);
    const bOverdue = isOverdue(b, now);
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

    const aDue = toDate(a.due_on)?.getTime() ?? Infinity;
    const bDue = toDate(b.due_on)?.getTime() ?? Infinity;
    if (aDue !== bDue) return aDue - bDue;

    const aRank = TASK_PRIORITIES[a.priority]?.rank ?? 2;
    const bRank = TASK_PRIORITIES[b.priority]?.rank ?? 2;
    return bRank - aRank;
  });
}
