import { apiClient } from "./client";
import type { SearchResponseModel } from "@/types/models";

export const searchApi = {
  searchWorkspace: async (
    workspaceId: string,
    params: { q: string; limit?: number },
  ): Promise<SearchResponseModel> => {
    const { data } = await apiClient.get<SearchResponseModel>(
      `/workspaces/${workspaceId}/search`,
      { params: { q: params.q, limit: params.limit ?? 20 } },
    );
    return data;
  },
};
