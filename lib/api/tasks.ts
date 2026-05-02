// lib/api/tasks.ts
import { apiClient } from "./client";
import type { TaskModel, TaskStatus, TaskPriority } from "@/types/models";
import type { PagedResponse } from "@/types/api";

export interface CreateTaskRequest {
  projectId: string;
  workspaceId: string;
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
  getWorkspaceTasks: async (
    workspaceId: string,
    params?: {
      pageNumber?: number;
      pageSize?: number;
      sort?: string;
      status?: TaskStatus;
      projectId?: string;
    },
  ): Promise<PagedResponse<TaskModel>> => {
    const response = await apiClient.get<PagedResponse<TaskModel>>(
      `/workspaces/${workspaceId}/tasks`,
      { params },
    );
    return response.data;
  },

  getById: async (taskId: string): Promise<TaskModel> => {
    const response = await apiClient.get<TaskModel>(`/tasks/${taskId}`);
    return response.data;
  },

  create: async (data: CreateTaskRequest): Promise<TaskModel> => {
    const response = await apiClient.post<TaskModel>("/tasks", {
      projectId: data.projectId,
      workspaceId: data.workspaceId,
      title: data.title,
      description: data.description,
      parentTaskId: data.parentTaskId,
      dueDate: data.dueDate,
      scheduledAt: data.scheduledAt,
      durationMinutes: data.durationMinutes,
      status: data.status ?? "Todo",
      priority: data.priority ?? "Medium",
      sortOrder: 0,
    });
    return response.data;
  },

  update: async (
    taskId: string,
    data: Partial<CreateTaskRequest> & {
      completedAtUtc?: string | null;
    },
  ): Promise<TaskModel> => {
    const body: Record<string, unknown> = {};
    if (data.title !== undefined) body.title = data.title;
    if (data.description !== undefined) body.description = data.description;
    if (data.parentTaskId !== undefined) body.parentTaskId = data.parentTaskId;
    if (data.dueDate !== undefined) body.dueDate = data.dueDate;
    if (data.scheduledAt !== undefined) body.scheduledAt = data.scheduledAt;
    if (data.durationMinutes !== undefined)
      body.durationMinutes = data.durationMinutes;
    if (data.status !== undefined) body.status = data.status;
    if (data.priority !== undefined) body.priority = data.priority;
    if (data.completedAtUtc !== undefined)
      body.completedAtUtc = data.completedAtUtc;

    const response = await apiClient.patch<TaskModel>(`/tasks/${taskId}`, body);
    return response.data;
  },

  delete: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};
