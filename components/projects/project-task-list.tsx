"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { TaskModel, TaskPriority } from "@/types/models";
import { formatShortDate } from "@/lib/utils/format-date";

const statusLabel: Record<string, string> = {
  Todo: "To Do",
  InProgress: "On Progress",
  InReview: "Review",
  Done: "Done",
  Archived: "Archived",
};

const priorityClass: Record<TaskPriority, string> = {
  Low: "text-neutral-500",
  Medium: "text-blue-600",
  High: "text-red-600",
  Critical: "text-red-600",
};

interface ProjectTaskListProps {
  tasks: TaskModel[];
  priorityFilter: TaskPriority | "all";
}

export function ProjectTaskList({
  tasks,
  priorityFilter,
}: ProjectTaskListProps) {
  const rows = useMemo(() => {
    let list = tasks;
    if (priorityFilter !== "all") {
      list = tasks.filter((t) => t.priority === priorityFilter);
    }
    return [...list].sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
    );
  }, [tasks, priorityFilter]);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200">
      <div className="grid grid-cols-[1fr_120px_100px_100px] gap-2 border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[#8796af]">
        <span>Task</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Due</span>
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-p-small text-neutral-500">
          No tasks match this filter.
        </div>
      ) : (
        rows.map((task) => (
          <div
            key={task.id}
            className="grid grid-cols-[1fr_120px_100px_100px] gap-2 border-b border-neutral-100 px-4 py-3 text-[14px] last:border-0"
          >
            <div>
              <div className="font-medium text-[#111625]">{task.title}</div>
              {task.description && (
                <div className="mt-0.5 line-clamp-1 text-[13px] text-[#596881]">
                  {task.description}
                </div>
              )}
            </div>
            <div className="text-[#596881]">
              {statusLabel[task.status] ?? task.status}
            </div>
            <div className={cn("font-medium", priorityClass[task.priority])}>
              {task.priority}
            </div>
            <div className="text-[#596881]">
              {task.dueDate ? formatShortDate(task.dueDate) : "—"}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
