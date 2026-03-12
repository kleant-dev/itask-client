import { apiClient } from "./client";
import type { TaskModel, TaskStatus, TaskPriority } from "@/types/models";
import type { PagedResponse } from "@/types/api";

export interface CreateTaskRequest {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  parentTaskId?: string;
}

export const tasksApi = {
  // Get all tasks in a workspace with optional filtering
  getWorkspaceTasks: async (
    workspaceId: string,
    params?: {
      pageNumber?: number;
      pageSize?: number;
      sort?: string;
      status?: TaskStatus;
    },
  ): Promise<PagedResponse<TaskModel>> => {
    const response = await apiClient.get<PagedResponse<TaskModel>>(
      `/workspaces/${workspaceId}/tasks`,
      { params },
    );
    return response.data;
  },

  // Get single task
  getById: async (taskId: string): Promise<TaskModel> => {
    const response = await apiClient.get<TaskModel>(`/tasks/${taskId}`);
    return response.data;
  },

  // Create task
  create: async (data: CreateTaskRequest): Promise<TaskModel> => {
    const response = await apiClient.post<TaskModel>("/tasks", data);
    return response.data;
  },

  // Update task
  update: async (
    taskId: string,
    data: Partial<CreateTaskRequest>,
  ): Promise<TaskModel> => {
    const response = await apiClient.patch<TaskModel>(`/tasks/${taskId}`, data);
    return response.data;
  },

  // Delete task
  delete: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};
