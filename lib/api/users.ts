// TODO: USER API CALLS
// lib/api/users.ts
import { apiClient } from "./client";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export const usersApi = {
  // Get current user
  getMe: async (): Promise<User> => {
    const response = await apiClient.get("/users/me");
    return response.data;
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Update current user
  updateMe: async (
    data: Partial<Pick<User, "name" | "avatarUrl">>,
  ): Promise<User> => {
    const response = await apiClient.patch("/users/me", data);
    return response.data;
  },
};
