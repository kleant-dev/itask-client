"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { tasksApi } from "@/lib/api/tasks";
import type { TaskModel, TaskStatus, TaskPriority } from "@/types/models";
import { formatShortDate } from "@/lib/utils/format-date";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "Todo", label: "To Do" },
  { status: "InProgress", label: "On Progress" },
  { status: "InReview", label: "Review" },
  { status: "Done", label: "Done" },
];

const priorityUi: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  Low: { label: "Low", className: "text-neutral-500" },
  Medium: {
    label: "Medium",
    className: "bg-blue-100 text-blue-600 rounded px-1.5 py-0.5 text-[11px] font-medium",
  },
  High: {
    label: "High",
    className: "bg-red-100 text-red-600 rounded px-1.5 py-0.5 text-[11px] font-medium",
  },
  Critical: {
    label: "Critical",
    className: "bg-red-100 text-red-600 rounded px-1.5 py-0.5 text-[11px] font-medium",
  },
};

function TaskCard({
  task,
  onDragStart,
}: {
  task: TaskModel;
  onDragStart: (task: TaskModel) => void;
}) {
  const p = priorityUi[task.priority];
  const due = task.dueDate ? formatShortDate(task.dueDate) : null;
  const isBadge =
    task.priority === "Medium" ||
    task.priority === "High" ||
    task.priority === "Critical";

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task)}
      className="cursor-grab rounded-xl border border-neutral-200 bg-white p-3 shadow-sm active:cursor-grabbing"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={cn(
            "text-[11px] font-medium",
            isBadge ? p.className : "text-neutral-500",
          )}
        >
          {p.label}
        </span>
      </div>
      <h3 className="text-[15px] font-semibold leading-snug text-[#111625]">
        {task.title}
      </h3>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-[13px] text-[#596881]">
          {task.description}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between text-[12px] text-[#596881]">
        <span>{due ?? "—"}</span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          0
        </span>
      </div>
    </div>
  );
}

interface ProjectKanbanProps {
  tasks: TaskModel[];
  priorityFilter: TaskPriority | "all";
}

export function ProjectKanban({ tasks, priorityFilter }: ProjectKanbanProps) {
  const queryClient = useQueryClient();
  const [dragTask, setDragTask] = useState<TaskModel | null>(null);

  const filtered = useMemo(() => {
    if (priorityFilter === "all") return tasks;
    return tasks.filter((t) => t.priority === priorityFilter);
  }, [tasks, priorityFilter]);

  const byStatus = useMemo(() => {
    const map = new Map<TaskStatus, TaskModel[]>();
    for (const col of COLUMNS) {
      map.set(col.status, []);
    }
    for (const t of filtered) {
      const list = map.get(t.status);
      if (list) list.push(t);
    }
    return map;
  }, [filtered]);

  const moveMutation = useMutation({
    mutationFn: async ({
      task,
      status,
    }: {
      task: TaskModel;
      status: TaskStatus;
    }) => {
      const payload: Parameters<typeof tasksApi.update>[1] = { status };
      if (status === "Done") {
        payload.completedAtUtc = new Date().toISOString();
      }
      return tasksApi.update(task.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
    },
    onError: () => {
      toast.error("Could not update task");
    },
  });

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {COLUMNS.map((col) => {
        const columnTasks = byStatus.get(col.status) ?? [];
        return (
          <div
            key={col.status}
            className="w-72 shrink-0"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (!dragTask || dragTask.status === col.status) return;
              moveMutation.mutate({ task: dragTask, status: col.status });
              setDragTask(null);
            }}
          >
            <div className="mb-3 flex items-center justify-between px-0.5">
              <h2 className="text-[15px] font-semibold text-[#111625]">
                {col.label}
              </h2>
              <span className="text-[12px] font-medium text-[#8796af]">
                {columnTasks.length}
              </span>
            </div>
            <div className="flex min-h-[120px] flex-col gap-2 rounded-xl bg-[#f7f9fb] p-2">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={(t) => setDragTask(t)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
