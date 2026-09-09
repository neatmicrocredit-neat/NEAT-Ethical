import { deriveStatus } from "@/lib/investments";

/**
 * A placement has two notions of "status" and they answer different questions.
 *
 *   deriveStatus()  — where the *term* is: pending / active / matured.
 *                     Pure arithmetic on the start and end dates.
 *
 *   WORKFLOW        — where the *decision* is: has an operator approved this,
 *                     has the money landed, has it been closed out.
 *
 * The console shows the workflow state wherever a human acts on a record, and
 * the derived state wherever the projection maths is what matters. `lifecycle()`
 * below folds the two into the one label a reader actually wants.
 */
export const WORKFLOW = {
  draft: {
    key: "draft",
    label: "Draft",
    tone: "draft",
    note: "Being prepared. Not visible to the customer.",
    next: ["pending", "cancelled"],
  },
  pending: {
    key: "pending",
    label: "Awaiting approval",
    tone: "pending",
    note: "Submitted and waiting on a reviewer.",
    next: ["approved", "rejected", "cancelled"],
  },
  approved: {
    key: "approved",
    label: "Approved",
    tone: "approved",
    note: "Signed off. Waiting for the capital to arrive.",
    next: ["active", "cancelled"],
  },
  active: {
    key: "active",
    label: "Active",
    tone: "active",
    note: "Funded and earning.",
    next: ["closed", "defaulted"],
  },
  closed: {
    key: "closed",
    label: "Closed",
    tone: "closed",
    note: "Settled in full. No further obligation.",
    next: [],
  },
  rejected: {
    key: "rejected",
    label: "Rejected",
    tone: "rejected",
    note: "Declined at review. Kept for the record.",
    next: ["pending"],
  },
  cancelled: {
    key: "cancelled",
    label: "Cancelled",
    tone: "closed",
    note: "Withdrawn before it was funded.",
    next: [],
  },
  defaulted: {
    key: "defaulted",
    label: "Defaulted",
    tone: "rejected",
    note: "Obligations not met. Under recovery.",
    next: ["closed", "active"],
  },
};

export const WORKFLOW_KEYS = Object.keys(WORKFLOW);

/** Statuses where the placement is not yet (or no longer) earning. */
export const DORMANT = new Set(["draft", "pending", "approved", "rejected", "cancelled"]);

/** Statuses a reviewer still has to act on. */
export const NEEDS_REVIEW = new Set(["draft", "pending"]);

export function workflowOf(investment) {
  const raw = String(investment?.status ?? "").trim().toLowerCase();
  return WORKFLOW[raw] || WORKFLOW.active;
}

export function isDormant(investment) {
  return DORMANT.has(workflowOf(investment).key);
}

/**
 * The one status to show a reader.
 *
 * While a placement is still working its way through review, the workflow state
 * is the whole story. Once it is live, the term is — an "active" placement whose
 * end date has passed is really `matured`, and saying so is what stops the
 * maturity list from silently under-reporting.
 */
export function lifecycle(investment, now = new Date()) {
  const flow = workflowOf(investment);
  if (flow.key !== "active") return { key: flow.key, label: flow.label, tone: flow.tone, derived: null };

  const derived = deriveStatus(investment, now);
  if (derived === "matured") return { key: "matured", label: "Matured", tone: "matured", derived };
  if (derived === "pending") return { key: "scheduled", label: "Starts later", tone: "pending", derived };
  return { key: "active", label: "Active", tone: "active", derived };
}

/** Guard the transitions the UI offers so an invalid state is never written. */
export function canTransition(from, to) {
  const current = WORKFLOW[from] || WORKFLOW.active;
  return current.next.includes(to);
}

export function transitionsFor(investment) {
  return workflowOf(investment).next.map((key) => WORKFLOW[key]);
}

/** Column patch for a status change, so the timestamps stay consistent. */
export function transitionPatch(to, actor, note) {
  const now = new Date().toISOString();
  const patch = { status: to, decision_note: note || null };

  if (to === "pending") patch.submitted_at = now;
  if (to === "approved" || to === "rejected") {
    patch.approved_at = to === "approved" ? now : null;
    patch.approved_by = actor || null;
  }
  if (to === "active") patch.funded_at = now;
  if (to === "closed" || to === "cancelled") patch.closed_at = now;

  return patch;
}
