import { hasCapability } from "@/lib/auth";
import { loadBook } from "@/lib/dashboard-data";
import { fullName } from "@/lib/format";
import { isOverdue, loadTasks, sortForWork, taskSummary } from "@/lib/tasks";
import { loadTeam } from "@/lib/team";
import { TaskBoard } from "@/components/dashboard/task-board";
import { PageHeader, SetupNotice, StatCard } from "@/components/dashboard/ui";
import { createTask, deleteTask, setTaskStatus } from "@/app/dashboard/tasks/actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Tasks · Admin console" };

export default async function TasksPage() {
  const now = new Date();
  const [{ customers }, { tasks, missing }, { members }, canWrite] = await Promise.all([
    loadBook(),
    loadTasks(),
    loadTeam(),
    hasCapability("tasks.write"),
  ]);

  if (missing) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Operations" title="Tasks" description="Follow-ups tied to a customer or placement." />
        <SetupNotice feature="Task tracking" migration="supabase/migrations/0003_operations.sql" tables={["tasks"]} />
      </div>
    );
  }

  const customersById = new Map(customers.map((customer) => [String(customer.id), customer]));
  const summary = taskSummary(tasks, now);

  const rows = sortForWork(tasks, now).map((task) => {
    const customer = customersById.get(String(task.customer_id));
    return {
      uuid: task.uuid,
      title: task.title,
      detail: task.detail,
      status: task.status,
      priority: task.priority,
      dueOn: task.due_on,
      assignee: task.assignee,
      customer: customer ? fullName(customer) : null,
      customerUuid: customer?.uuid || null,
      overdue: isOverdue(task, now),
    };
  });

  const assignees = [...new Set([...members.map((member) => member.email), ...tasks.map((task) => task.assignee)].filter(Boolean))];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Tasks"
        description="Follow-ups tied to a customer or placement, ordered by what needs doing first."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="To do" value={summary.open.toLocaleString()} hint={`${summary.inProgress} in progress`} />
        <StatCard
          label="Overdue"
          value={summary.overdue.toLocaleString()}
          hint="Past their due date"
          tone={summary.overdue ? "pending" : undefined}
          upIsGood={false}
        />
        <StatCard label="Due today" value={summary.dueToday.toLocaleString()} hint="Scheduled for today" />
        <StatCard
          label="Unassigned"
          value={summary.unassigned.toLocaleString()}
          hint="Open work with no owner"
          upIsGood={false}
        />
      </div>

      <TaskBoard
        rows={rows}
        createAction={createTask}
        statusAction={setTaskStatus}
        deleteAction={deleteTask}
        canWrite={canWrite}
        customers={customers}
        assignees={assignees}
      />
    </div>
  );
}
