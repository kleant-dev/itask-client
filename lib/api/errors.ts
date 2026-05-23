import type { AxiosError } from "axios";

export function getApiErrorMessage(
  err: unknown,
  fallback = "Something went wrong",
): string {
  if (!err || typeof err !== "object") return fallback;

  const axios = err as AxiosError<{ error?: string; title?: string }>;
  const data = axios.response?.data;
  if (data && typeof data === "object") {
    if (typeof data.error === "string" && data.error.trim()) return data.error;
    if (typeof data.title === "string" && data.title.trim()) return data.title;
  }

  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
