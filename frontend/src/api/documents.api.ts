import api from "./client";
import type { Document } from "@/types";

export const documentsApi = {
  list: (projectId: string) => api.get<Document[]>(`/projects/${projectId}/documents`).then(r => r.data),
  upload: (projectId: string, file: File, meta?: { name?: string; uploadedBy?: string; category?: string }) => {
    const form = new FormData();
    form.append("file", file);
    if (meta?.name) form.append("name", meta.name);
    if (meta?.uploadedBy) form.append("uploadedBy", meta.uploadedBy);
    if (meta?.category) form.append("category", meta.category);
    return api.post<Document>(`/projects/${projectId}/documents`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  remove: (projectId: string, id: string) => api.delete(`/projects/${projectId}/documents/${id}`),
};
