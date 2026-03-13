// lib/api/messages.ts
import { apiClient } from "./client";
import type { MessageModel, ChannelModel } from "@/types/message-models";
import type { PagedResponse } from "@/types/api";

export const messagesApi = {
  /** GET /channels/{channelId}/messages */
  getByChannel: async (
    channelId: string,
    params: { pageNumber?: number; pageSize?: number } = {},
  ): Promise<PagedResponse<MessageModel>> => {
    const { data } = await apiClient.get<PagedResponse<MessageModel>>(
      `/channels/${channelId}/messages`,
      {
        params: {
          pageNumber: params.pageNumber ?? 1,
          pageSize: params.pageSize ?? 50,
        },
      },
    );
    return data;
  },
};

export const channelsApi = {
  /** GET /workspaces/{workspaceId}/channels */
  getByWorkspace: async (
    workspaceId: string,
    params: { pageNumber?: number; pageSize?: number } = {},
  ): Promise<PagedResponse<ChannelModel>> => {
    const { data } = await apiClient.get<PagedResponse<ChannelModel>>(
      `/workspaces/${workspaceId}/channels`,
      {
        params: {
          pageNumber: params.pageNumber ?? 1,
          pageSize: params.pageSize ?? 50,
        },
      },
    );
    return data;
  },

  /** GET /workspaces/{workspaceId}/channels/dm?otherUserId=... */
  getOrCreateDm: async (
    workspaceId: string,
    otherUserId: string,
  ): Promise<ChannelModel> => {
    const { data } = await apiClient.get<ChannelModel>(
      `/workspaces/${workspaceId}/channels/dm`,
      { params: { otherUserId } },
    );
    return data;
  },
};
