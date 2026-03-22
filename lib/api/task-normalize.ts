import type { TaskModel, TaskPriority, TaskStatus } from "@/types/models";

/** Maps API / C# enum shapes to client TaskModel fields. */
export function normalizeTask(raw: unknown): TaskModel {
  const t = raw as Record<string, unknown>;
  return {
    id: String(t.id),
    projectId: String(t.projectId),
    workspaceId: String(t.workspaceId),
    createdById: t.createdById != null ? String(t.createdById) : null,
    parentTaskId: t.parentTaskId != null ? String(t.parentTaskId) : null,
    title: String(t.title ?? ""),
    description: t.description != null ? String(t.description) : null,
    status: normalizeStatus(t.status),
    priority: normalizePriority(t.priority),
    dueDate: t.dueDate != null ? String(t.dueDate) : null,
    scheduledAt: t.scheduledAt != null ? String(t.scheduledAt) : null,
    durationMinutes:
      t.durationMinutes != null ? Number(t.durationMinutes) : null,
    sortOrder: Number(t.sortOrder ?? 0),
    createdAtUtc: String(t.createdAtUtc ?? ""),
    updatedAtUtc: t.updatedAtUtc != null ? String(t.updatedAtUtc) : null,
    completedAtUtc: t.completedAtUtc != null ? String(t.completedAtUtc) : null,
  };
}

function normalizeStatus(s: unknown): TaskStatus {
  if (typeof s === "number") {
    const byIndex: TaskStatus[] = [
      "Todo",
      "InProgress",
      "InReview",
      "Done",
      "Archived",
    ];
    return byIndex[s] ?? "Todo";
  }
  const str = String(s);
  if (str === "ToDo") return "Todo";
  if (str === "Review") return "InReview";
  if (
    str === "Todo" ||
    str === "InProgress" ||
    str === "InReview" ||
    str === "Done" ||
    str === "Archived"
  ) {
    return str as TaskStatus;
  }
  return "Todo";
}

function normalizePriority(p: unknown): TaskPriority {
  if (typeof p === "number") {
    const map: TaskPriority[] = [
      "Low",
      "Low",
      "Medium",
      "High",
      "Critical",
    ];
    return map[p] ?? "Low";
  }
  const str = String(p);
  if (str === "None") return "Low";
  if (str === "Urgent") return "Critical";
  if (
    str === "Low" ||
    str === "Medium" ||
    str === "High" ||
    str === "Critical"
  ) {
    return str as TaskPriority;
  }
  return "Low";
}

/** Query param for GET /tasks — server compares to `TaskStatus.ToString()`. */
export function taskStatusToApiQuery(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    Todo: "ToDo",
    InProgress: "InProgress",
    InReview: "Review",
    Done: "Done",
    Archived: "Archived",
  };
  return map[status];
}

/** Request body for PATCH — Newtonsoft accepts enum string names. */
export function taskStatusToApiBody(status: TaskStatus): string {
  return taskStatusToApiQuery(status);
}

export function taskPriorityToApiBody(priority: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    Low: "Low",
    Medium: "Medium",
    High: "High",
    Critical: "Urgent",
  };
  return map[priority];
}
