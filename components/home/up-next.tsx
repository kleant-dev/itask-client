import { MoreHorizontal, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "./empty-state";
import { useWorkspaceTasks } from "@/lib/hooks/use-tasks";
import type { TaskModel } from "@/types/models";

interface UiTask {
  id: string;
  status: string;
  statusColor: string;
  title: string;
  dueDate: string;
  comments: number;
  links: number;
  attachments: number;
  assignees: { src?: string; name: string; color?: string }[];
}

function mapTaskToUpNext(task: TaskModel): UiTask {
  const isInProgress =
    task.status === "InProgress" || task.status === "InReview";

  return {
    id: task.id,
    status: isInProgress ? "On Progress" : task.status,
    statusColor: isInProgress
      ? "bg-blue-100 text-blue-600"
      : "bg-neutral-100 text-neutral-600",
    title: task.title,
    dueDate: task.dueDate
      ? `Due ${new Date(task.dueDate).toLocaleDateString()}`
      : "No due date",
    comments: 0,
    links: 0,
    attachments: 0,
    assignees: [],
  };
}

export function UpNext() {
  const { data, isLoading } = useWorkspaceTasks({ pageSize: 20 });
  const rawTasks = data?.items ?? [];

  const upcomingTasks = rawTasks
    .filter((t) => t.dueDate)
    .sort(
      (a, b) =>
        new Date(a.dueDate ?? "").getTime() -
        new Date(b.dueDate ?? "").getTime(),
    )
    .slice(0, 5)
    .map(mapTaskToUpNext);

  const isEmpty = !isLoading && upcomingTasks.length === 0;
  return (
    <div className="flex flex-col rounded-lg border border-neutral-200 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-1">
        <div>
          <h3 className="text-label-large font-semibold text-neutral-900">
            Up Next
          </h3>
          <p className="mt-0.5 text-p-small text-neutral-500">
            Keep track of upcoming due dates, mentions, and tasks.
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4 text-neutral-500" />
        </Button>
      </div>

      {/* Task Cards */}
      {isLoading ? (
        <div className="flex flex-col gap-3 p-4 text-p-small text-neutral-500">
          Loading upcoming tasks...
        </div>
      ) : isEmpty ? (
        <EmptyState
          message="No upcoming task."
          illustration={<AddTaskIllustration />}
        />
      ) : (
        <div className="flex flex-col gap-3 p-4">
          {upcomingTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-lg border border-neutral-200 bg-white p-4"
            >
              {/* Status + Due Date */}
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-label-xsmall font-medium ${task.statusColor}`}
                >
                  {task.status}
                </span>
                <div className="flex items-center gap-1.5 text-label-xsmall text-neutral-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>{task.dueDate}</span>
                </div>
              </div>

              {/* Title */}
              <h4 className="mt-3 text-p-medium font-semibold text-neutral-900">
                {task.title}
              </h4>

              {/* Footer */}
              <div className="mt-3 flex items-center justify-between">
                {/* Assignees */}
                <div className="flex -space-x-2">
                  {task.assignees.map((a, i) => (
                    <Avatar key={i} className="h-6 w-6 border-2 border-white">
                      {a.src ? <AvatarImage src={a.src} /> : null}
                      <AvatarFallback
                        className={`text-[10px] text-white ${a.color || "bg-neutral-400"}`}
                      >
                        {a.name}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-label-xsmall text-neutral-500">
                  <span className="flex items-center gap-1">
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {task.comments}
                  </span>
                  <span className="flex items-center gap-1">
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
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    {task.links}
                  </span>
                  <span className="flex items-center gap-1">
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
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    {task.attachments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddTaskIllustration() {
  return (
    <svg viewBox="0 0 150 120" fill="none" className="h-full w-full opacity-60">
      <rect x="25" y="20" width="100" height="80" rx="8" fill="#e9f0fe" />
      <rect
        x="40"
        y="40"
        width="70"
        height="8"
        rx="4"
        fill="#266df0"
        opacity="0.3"
      />
      <rect
        x="40"
        y="56"
        width="50"
        height="8"
        rx="4"
        fill="#266df0"
        opacity="0.2"
      />
      <rect
        x="40"
        y="72"
        width="60"
        height="8"
        rx="4"
        fill="#266df0"
        opacity="0.2"
      />
      <circle cx="110" cy="90" r="18" fill="#266df0" />
      <path
        d="M103 90h14M110 83v14"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
