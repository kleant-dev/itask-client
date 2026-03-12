import { apiClient } from "./client";
import type { PagedResponse } from "@/types/api";

export interface CalendarEventModel {
  id: string;
  workspaceId: string;
  createdById: string;
  taskId?: string | null;
  title: string;
  description?: string | null;
  scheduleType?: string | null;
  startsAtUtc: string;
  endsAtUtc: string;
  isAllDay: boolean;
  createdAtUtc: string;
}

export const calendarEventsApi = {
  getByWorkspace: async (
    workspaceId: string,
  ): Promise<CalendarEventModel[]> => {
    const response = await apiClient.get<CalendarEventModel[]>(
      `/workspaces/${workspaceId}/calendar-events`,
    );
    return response.data;
  },

  getByRange: async (
    workspaceId: string,
    fromUtc: string,
    toUtc: string,
  ): Promise<CalendarEventModel[]> => {
    const response = await apiClient.get<CalendarEventModel[]>(
      `/workspaces/${workspaceId}/calendar-events/range`,
      { params: { fromUtc, toUtc } },
    );
    return response.data;
  },
};

