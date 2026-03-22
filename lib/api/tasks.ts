import { apiClient } from "./client";
import type { TaskModel, TaskStatus, TaskPriority } from "@/types/models";
import type { PagedResponse } from "@/types/api";
import {
  normalizeTask,
  taskPriorityToApiBody,
  taskStatusToApiBody,
  taskStatusToApiQuery,
} from "./task-normalize";

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
    const response = await apiClient.get<PagedResponse<unknown>>(
      `/workspaces/${workspaceId}/tasks`,
      {
        params: {
          ...params,
          status: params?.status
            ? taskStatusToApiQuery(params.status)
            : undefined,
        },
      },
    );
    const d = response.data as PagedResponse<unknown>;
    return {
      ...d,
      items: (d.items ?? []).map((item) => normalizeTask(item)),
    };
  },

  // Get single task
  getById: async (taskId: string): Promise<TaskModel> => {
    const response = await apiClient.get<unknown>(`/tasks/${taskId}`);
    return normalizeTask(response.data);
  },

  // Create task
  create: async (data: CreateTaskRequest): Promise<TaskModel> => {
    const body = {
      projectId: data.projectId,
      workspaceId: data.workspaceId,
      title: data.title,
      description: data.description,
      parentTaskId: data.parentTaskId,
      dueDate: data.dueDate,
      scheduledAt: data.scheduledAt,
      durationMinutes: data.durationMinutes,
      status: taskStatusToApiBody(data.status ?? "Todo"),
      priority: taskPriorityToApiBody(data.priority ?? "Medium"),
      sortOrder: 0,
    };
    const response = await apiClient.post<unknown>("/tasks", body);
    return normalizeTask(response.data);
  },

  // Update task
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
    if (data.status !== undefined)
      body.status = taskStatusToApiBody(data.status);
    if (data.priority !== undefined)
      body.priority = taskPriorityToApiBody(data.priority);
    if (data.completedAtUtc !== undefined)
      body.completedAtUtc = data.completedAtUtc;

    const response = await apiClient.patch<unknown>(`/tasks/${taskId}`, body);
    return normalizeTask(response.data);
  },

  // Delete task
  delete: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};
