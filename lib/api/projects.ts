import { apiClient } from "./client";
import type { ProjectModel } from "@/types/models";
import type { PagedResponse } from "@/types/api";

export interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  startDate?: string;
  targetDate?: string;
}

export const projectsApi = {
  // Get all projects for a workspace
  getWorkspaceProjects: async (
    workspaceId: string,
    params?: { pageNumber?: number; pageSize?: number; sort?: string },
  ): Promise<PagedResponse<ProjectModel>> => {
    const response = await apiClient.get<PagedResponse<ProjectModel>>(
      `/workspaces/${workspaceId}/projects`,
      { params },
    );
    return response.data;
  },

  // Get single project by id
  getById: async (projectId: string): Promise<ProjectModel> => {
    const response = await apiClient.get<ProjectModel>(`/projects/${projectId}`);
    return response.data;
  },

  // Create project within a workspace
  create: async (
    workspaceId: string,
    data: CreateProjectRequest,
  ): Promise<ProjectModel> => {
    const response = await apiClient.post<ProjectModel>(
      `/workspaces/${workspaceId}/projects`,
      data,
    );
    return response.data;
  },

  // Update project
  update: async (
    projectId: string,
    data: Partial<CreateProjectRequest>,
  ): Promise<ProjectModel> => {
    const response = await apiClient.patch<ProjectModel>(
      `/projects/${projectId}`,
      data,
    );
    return response.data;
  },

  // Archive project
  archive: async (projectId: string): Promise<void> => {
    await apiClient.post(`/projects/${projectId}/archive`);
  },
};
