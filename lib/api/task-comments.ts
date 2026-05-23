import { apiClient } from "./client";
import type { TaskCommentModel } from "@/types/models";

export interface CreateTaskCommentRequest {
  taskId: string;
  body: string;
  parentCommentId?: string;
}

export const taskCommentsApi = {
  getByTask: async (taskId: string): Promise<TaskCommentModel[]> => {
    const { data } = await apiClient.get<TaskCommentModel[]>(
      `/tasks/${taskId}/comments`,
    );
    return data;
  },

  create: async (
    taskId: string,
    body: CreateTaskCommentRequest,
  ): Promise<TaskCommentModel> => {
    const { data } = await apiClient.post<TaskCommentModel>(
      `/tasks/${taskId}/comments`,
      body,
    );
    return data;
  },

  update: async (
    taskId: string,
    commentId: string,
    body: { body: string },
  ): Promise<TaskCommentModel> => {
    const { data } = await apiClient.patch<TaskCommentModel>(
      `/tasks/${taskId}/comments/${commentId}`,
      body,
    );
    return data;
  },

  delete: async (taskId: string, commentId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`);
  },
};
