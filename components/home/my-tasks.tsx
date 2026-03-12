"use client";

import { useMemo, useState } from "react";
import { Plus, MoreHorizontal, ChevronDown, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useWorkspaceTasks } from "@/lib/hooks/use-tasks";
import type { TaskModel, TaskStatus } from "@/types/models";

type Priority = "High" | "Medium" | "Low";
type TabFilter = "All" | "To Do" | "On Progress" | "Done" | "Archived";

interface UiTask {
  id: string;
  title: string;
  dueDate: string;
  assignees: { src?: string; name: string; color?: string }[];
  priority: Priority;
}

interface TaskGroup {
  label: string;
  tasks: UiTask[];
  color: string;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  High: { label: "High", className: "bg-red-100 text-red-600" },
  Medium: { label: "Medium", className: "bg-blue-100 text-blue-600" },
  Low: { label: "Low", className: "text-neutral-500" },
};

const tabs: TabFilter[] = ["All", "To Do", "On Progress", "Done", "Archived"];

function mapStatusToTab(status: TaskStatus): TabFilter {
  switch (status) {
    case "Todo":
      return "To Do";
    case "InProgress":
      return "On Progress";
    case "Done":
      return "Done";
    case "InReview":
      return "On Progress";
    case "Archived":
      return "Archived";
    default:
      return "All";
  }
}

function mapTaskToUi(task: TaskModel): UiTask {
  let priority: Priority = "Low";
  if (task.priority === "High" || task.priority === "Critical") {
    priority = "High";
  } else if (task.priority === "Medium") {
    priority = "Medium";
  }

  return {
    id: task.id,
    title: task.title,
    dueDate: task.dueDate
      ? new Date(task.dueDate).toLocaleDateString()
      : "No due date",
    assignees: [], // could be filled from members API later
    priority,
  };
}

function TaskRow({ task }: { task: UiTask }) {
  const priority = priorityConfig[task.priority];
  return (
    <div className="group flex h-8 items-center border-b border-neutral-100 hover:bg-neutral-50">
      {/* Checkbox */}
      <div className="flex w-8 items-center justify-center">
        <div className="h-4 w-4 rounded border border-neutral-300" />
      </div>

      {/* Task name */}
      <div className="flex flex-1 items-center gap-2 px-2">
        <span className="text-p-small text-neutral-900">{task.title}</span>
      </div>

      {/* Due Date */}
      <div className="w-40 text-p-small text-neutral-700">{task.dueDate}</div>

      {/* Assignee */}
      <div className="flex w-40 items-center">
        <div className="flex -space-x-1.5">
          {task.assignees.map((a, i) => (
            <Avatar key={i} className="h-6 w-6 border-2 border-white">
              {a.src ? <AvatarImage src={a.src} /> : null}
              <AvatarFallback
                className={`text-[9px] text-white ${a.color || "bg-neutral-400"}`}
              >
                {a.name}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="flex w-40 items-center gap-1">
        {task.priority !== "Low" ? (
          <span
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-label-xsmall font-medium ${priority.className}`}
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
            {priority.label}
          </span>
        ) : (
          <span
            className={`flex items-center gap-1 text-label-xsmall ${priority.className}`}
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
            {priority.label}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="w-8 opacity-0 group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function TaskGroupSection({ group }: { group: TaskGroup }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      {/* Group Header */}
      <div className="flex h-9 items-center rounded-lg bg-neutral-50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 px-3"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 text-neutral-500 transition-transform",
              collapsed && "-rotate-90",
            )}
          />
          <span className="text-label-small font-semibold text-neutral-900">
            {group.label}
          </span>
          <span className="text-label-small text-neutral-400">
            {group.tasks.length}
          </span>
        </button>

        <div className="ml-auto pr-2 opacity-0 group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-3.5 w-3.5 text-neutral-500" />
          </Button>
        </div>
      </div>

      {/* Column Headers (only when expanded) */}
      {!collapsed && group.tasks.length > 0 && (
        <>
          <div className="flex h-8 items-center border-b border-neutral-100 text-label-xsmall text-neutral-500">
            <div className="w-8" />
            <div className="flex flex-1 items-center gap-1 px-2">
              <Loader className="h-3.5 w-3.5" />
              <span>Task</span>
            </div>
            <div className="flex w-40 items-center gap-1">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Due Date</span>
            </div>
            <div className="flex w-40 items-center gap-1">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Assignee</span>
            </div>
            <div className="flex w-40 items-center gap-1">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                />
              </svg>
              <span>Priority</span>
            </div>
            <div className="w-8" />
          </div>

          {group.tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </>
      )}
    </div>
  );
}

export function MyTasks() {
  const [activeTab, setActiveTab] = useState<TabFilter>("All");

  const { data, isLoading } = useWorkspaceTasks({ pageSize: 200 });
  const tasks = data?.items ?? [];

  const grouped: TaskGroup[] = useMemo(() => {
    const groupsMap: Record<string, TaskGroup> = {
      "To Do": { label: "To Do", color: "text-neutral-700", tasks: [] },
      "On Progress": {
        label: "On Progress",
        color: "text-neutral-700",
        tasks: [],
      },
      Review: { label: "Review", color: "text-neutral-700", tasks: [] },
      Done: { label: "Done", color: "text-neutral-700", tasks: [] },
      Archived: { label: "Archived", color: "text-neutral-700", tasks: [] },
    };

    tasks.forEach((task) => {
      const tab = mapStatusToTab(task.status);
      const uiTask = mapTaskToUi(task);
      if (tab === "Done") {
        groupsMap.Done.tasks.push(uiTask);
      } else if (tab === "Archived") {
        groupsMap.Archived.tasks.push(uiTask);
      } else if (tab === "On Progress") {
        groupsMap["On Progress"].tasks.push(uiTask);
      } else {
        groupsMap["To Do"].tasks.push(uiTask);
      }
    });

    return Object.values(groupsMap);
  }, [tasks]);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5">
        <h3 className="text-label-large font-semibold text-neutral-900">
          My Tasks
        </h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4 text-neutral-500" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4 text-neutral-500" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 px-5 pt-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-2 text-p-small transition-colors px-1",
              activeTab === tab
                ? "border-b-2 border-primary-500 font-medium text-primary-500"
                : "text-neutral-500 hover:text-neutral-700",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task Groups */}
      <div className="flex flex-col gap-2 p-4">
        {isLoading && (
          <div className="text-p-small text-neutral-500 px-2 py-4">
            Loading tasks...
          </div>
        )}
        {!isLoading &&
          grouped
            .filter((group) => {
              if (activeTab === "All") return true;
              return group.label === activeTab;
            })
            .map((group) => (
              <TaskGroupSection key={group.label} group={group} />
            ))}
      </div>
    </div>
  );
}
