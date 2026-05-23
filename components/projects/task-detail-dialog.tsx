"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { tasksApi } from "@/lib/api/tasks";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useTask } from "@/lib/hooks/use-tasks";
import {
  useTaskComments,
  useCreateTaskComment,
  getTaskCommentErrorMessage,
} from "@/lib/hooks/use-task-comments";
import { useWorkspaceMembersById } from "@/lib/hooks/use-channels";
import type { TaskPriority, TaskStatus } from "@/types/models";
import { formatNotificationTime } from "@/lib/utils/notifications";
import { cn } from "@/lib/utils";

const STATUSES: TaskStatus[] = [
  "Todo",
  "InProgress",
  "InReview",
  "Done",
  "Archived",
];

const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High"];

const STATUS_LABELS: Record<TaskStatus, string> = {
  Todo: "To do",
  InProgress: "In progress",
  InReview: "In review",
  Done: "Done",
  Archived: "Archived",
};

function memberInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface TaskDetailDialogProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({
  taskId,
  open,
  onOpenChange,
}: TaskDetailDialogProps) {
  const queryClient = useQueryClient();
  const { data: task, isLoading, isError } = useTask(open ? taskId : null);
  const { data: comments = [], isLoading: commentsLoading } = useTaskComments(
    open ? taskId : null,
  );
  const { data: membersData, isLoading: membersLoading } =
    useWorkspaceMembersById(open ? task?.workspaceId : null);
  const createComment = useCreateTaskComment(open ? taskId : null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("Todo");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [commentBody, setCommentBody] = useState("");

  const members = (membersData?.items ?? [])
    .filter((m) => m.user)
    .map((m) => ({
      id: m.userId,
      name: m.user!.name,
      avatarColor: m.user!.avatarColor,
    }));

  useEffect(() => {
    if (!open) {
      setCommentBody("");
      return;
    }
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setAssigneeIds(task.assigneeUserIds ?? []);
  }, [open, task]);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!taskId) throw new Error("No task selected");
      return tasksApi.update(taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        assigneeUserIds: assigneeIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
      toast.success("Task saved");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Could not save task")),
  });

  function toggleAssignee(userId: string) {
    setAssigneeIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-neutral-100 px-6 py-4">
          <DialogTitle className="pr-8 text-left text-[16px] font-semibold text-[#111625]">
            {isLoading ? "Loading task…" : (task?.title ?? "Task details")}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-[13px] text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : isError || !task ? (
          <div className="px-6 py-12 text-center text-[13px] text-neutral-500">
            This task could not be loaded. It may have been deleted or you may
            not have access.
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <div className="space-y-2">
                <Label htmlFor="task-detail-title">Title</Label>
                <Input
                  id="task-detail-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-detail-desc">Description</Label>
                <textarea
                  id="task-detail-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="border-input w-full resize-y rounded-md border bg-transparent px-3 py-2 text-[13px] shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-[#266df0]/30"
                  placeholder="What needs to be done?"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="task-detail-status">Status</Label>
                  <select
                    id="task-detail-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="border-input flex h-9 w-full rounded-md border bg-white px-3 text-[13px] shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-[#266df0]/30"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-detail-priority">Priority</Label>
                  <select
                    id="task-detail-priority"
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as TaskPriority)
                    }
                    className="border-input flex h-9 w-full rounded-md border bg-white px-3 text-[13px] shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-[#266df0]/30"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assignees</Label>
                {membersLoading ? (
                  <p className="text-[13px] text-neutral-400">Loading team…</p>
                ) : members.length === 0 ? (
                  <p className="text-[13px] text-neutral-400">
                    No members in this workspace yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {members.map((m) => {
                      const selected = assigneeIds.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleAssignee(m.id)}
                          className={cn(
                            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                            selected
                              ? "border-[#266df0] bg-[#f0f5ff] text-[#111625]"
                              : "border-[#dde3ee] bg-white text-[#596881] hover:border-[#c5d0e0] hover:bg-[#f7f9fb]",
                          )}
                        >
                          <Avatar className="h-5 w-5">
                            <AvatarFallback
                              className="text-[9px] text-white"
                              style={{
                                backgroundColor: m.avatarColor ?? "#266df0",
                              }}
                            >
                              {memberInitials(m.name)}
                            </AvatarFallback>
                          </Avatar>
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !title.trim()}
                className="w-fit bg-[#266df0] hover:bg-[#1f5ed4]"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>

            <div className="shrink-0 border-t border-neutral-100 bg-[#fafbfc] px-6 py-4">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#596881]" />
                <h3 className="text-[13px] font-semibold text-[#111625]">
                  Comments
                  <span className="ml-1.5 font-normal text-neutral-400">
                    ({comments.length})
                  </span>
                </h3>
              </div>

              {commentsLoading ? (
                <p className="mb-3 text-[13px] text-neutral-400">
                  Loading comments…
                </p>
              ) : comments.length === 0 ? (
                <p className="mb-3 text-[13px] text-neutral-400">
                  No comments yet. Start the discussion below.
                </p>
              ) : (
                <ul className="mb-4 flex max-h-40 flex-col gap-2 overflow-y-auto pr-1">
                  {comments.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-lg border border-neutral-100 bg-white px-3 py-2.5 text-[13px] shadow-sm"
                    >
                      <p className="mb-0.5 text-[11px] font-medium text-[#596881]">
                        {c.authorName ??
                          members.find((m) => m.id === c.authorId)?.name ??
                          "Team member"}
                      </p>
                      <p className="text-[#111625] leading-snug">{c.body}</p>
                      <span className="mt-1.5 block text-[11px] text-neutral-400">
                        {formatNotificationTime(c.createdAtUtc)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const body = commentBody.trim();
                  if (!body || !taskId) return;
                  createComment.mutate(body, {
                    onSuccess: () => {
                      setCommentBody("");
                      toast.success("Comment posted");
                    },
                    onError: (err) =>
                      toast.error(getTaskCommentErrorMessage(err)),
                  });
                }}
              >
                <Input
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Write a comment…"
                  className="flex-1 bg-white"
                  disabled={createComment.isPending}
                />
                <Button
                  type="submit"
                  disabled={createComment.isPending || !commentBody.trim()}
                  className="shrink-0 bg-[#266df0] hover:bg-[#1f5ed4]"
                >
                  {createComment.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Post"
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
