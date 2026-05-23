import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskCommentsApi } from "@/lib/api/task-comments";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { TaskCommentModel } from "@/types/models";

export function useTaskComments(taskId: string | null) {
  return useQuery<TaskCommentModel[]>({
    queryKey: ["task-comments", taskId],
    queryFn: () => taskCommentsApi.getByTask(taskId!),
    enabled: !!taskId,
  });
}

export function useCreateTaskComment(taskId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      if (!taskId) throw new Error("No task selected");
      const trimmed = body.trim();
      if (!trimmed) throw new Error("Comment cannot be empty");
      return taskCommentsApi.create(taskId, {
        taskId,
        body: trimmed,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
    },
  });
}

export function getTaskCommentErrorMessage(err: unknown): string {
  return getApiErrorMessage(err, "Could not add comment");
}
