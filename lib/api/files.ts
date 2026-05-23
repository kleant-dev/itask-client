import { apiClient } from "@/lib/api/client";

export interface FileUploadResult {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
}

export const filesApi = {
  upload: async (file: File): Promise<FileUploadResult> => {
    const form = new FormData();
    form.append("file", file);

    const { data } = await apiClient.post<FileUploadResult>(
      "/files/upload",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data;
  },
};
