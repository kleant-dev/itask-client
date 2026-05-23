import { apiClient } from "./client";
import type { NotificationModel } from "@/types/models";
import type { PagedResponse } from "@/types/api";

export const notificationsApi = {
  getAll: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    sort?: string;
  }): Promise<PagedResponse<NotificationModel>> => {
    const { data } = await apiClient.get<PagedResponse<NotificationModel>>(
      "/notifications",
      {
        params: {
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 50,
          sort: params?.sort,
        },
      },
    );
    return data;
  },

  markRead: async (notificationId: string): Promise<NotificationModel> => {
    const { data } = await apiClient.patch<NotificationModel>(
      `/notifications/${notificationId}/read`,
    );
    return data;
  },
};
