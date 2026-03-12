// lib/api/auth.ts
import { apiClient } from "./client";
import { CredentialResponse } from "@react-oauth/google";
import { toast } from "sonner";
import { ApiResponse, LoginResponse, RegisterRequest } from "./types";
import { AxiosError } from "axios";

export async function handleGoogleAuth(
  credentialResponse: CredentialResponse,
): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await apiClient.post<LoginResponse>("/auth/google-login", {
      googleToken: credentialResponse.credential,
    });

    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    const errorMessage =
      axiosError.response?.data?.detail ||
      axiosError.message ||
      "Failed to authenticate with Google";

    toast.error("Authentication failed", {
      description: errorMessage,
    });

    console.error(error);

    return {
      success: false,
      error: {
        message: errorMessage,
        status: axiosError.response?.status,
        details: axiosError.response?.data,
      },
    };
  }
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await apiClient.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    const errorMessage =
      axiosError.response?.status === 401
        ? "Invalid email or password"
        : axiosError.response?.data?.detail || "Login failed";

    toast.error("Login failed", {
      description: errorMessage,
    });

    console.error(error);

    return {
      success: false,
      error: {
        message: errorMessage,
        status: axiosError.response?.status,
        details: axiosError.response?.data,
      },
    };
  }
}

export async function registerWithEmail(
  data: RegisterRequest,
): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await apiClient.post<LoginResponse>(
      "/auth/register",
      data,
    );

    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    const errorMessage =
      axiosError.response?.data?.detail || "Registration failed";

    toast.error("Registration failed", {
      description: errorMessage,
    });

    console.error(error);

    return {
      success: false,
      error: {
        message: errorMessage,
        status: axiosError.response?.status,
        details: axiosError.response?.data,
      },
    };
  }
}

export async function refreshToken(
  refreshToken: string,
): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await apiClient.post<LoginResponse>("/auth/refresh", {
      refreshToken,
    });

    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Token refresh failed:", error);

    return {
      success: false,
      error: {
        message: "Token refresh failed",
        status: axiosError.response?.status,
      },
    };
  }
}

export async function logout(): Promise<ApiResponse<void>> {
  try {
    await apiClient.post("/auth/logout");
    return { success: true, data: undefined };
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Logout failed:", error);

    return {
      success: false,
      error: {
        message: "Logout failed",
        status: axiosError.response?.status,
      },
    };
  }
}
