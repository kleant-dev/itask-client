import { apiClient } from "./client";
import type {
  WorkspaceModel,
  WorkspaceMemberModel,
} from "@/types/models";
import type { PagedResponse } from "@/types/api";

export const workspacesApi = {
  getMyWorkspaces: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    sort?: string;
    fields?: string;
  }): Promise<PagedResponse<WorkspaceModel>> => {
    const response = await apiClient.get<PagedResponse<WorkspaceModel>>(
      "/workspaces",
      { params },
    );
    return response.data;
  },

  getById: async (workspaceId: string): Promise<WorkspaceModel> => {
    const response = await apiClient.get<WorkspaceModel>(
      `/workspaces/${workspaceId}`,
    );
    return response.data;
  },

  getMembers: async (
    workspaceId: string,
    params?: {
      pageNumber?: number;
      pageSize?: number;
      sort?: string;
      role?: string;
    },
  ): Promise<PagedResponse<WorkspaceMemberModel>> => {
    const response = await apiClient.get<PagedResponse<WorkspaceMemberModel>>(
      `/workspaces/${workspaceId}/members`,
      { params },
    );
    return response.data;
  },
};

