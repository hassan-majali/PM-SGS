import api from "./client";
import type { Deliverable } from "@/types";

export const deliverablesApi = {
  list: (projectId: string) => api.get<Deliverable[]>(`/projects/${projectId}/deliverables`).then(r => r.data),
  create: (projectId: string, data: Partial<Deliverable>) =>
    api.post<Deliverable>(`/projects/${projectId}/deliverables`, data).then(r => r.data),
  update: (projectId: string, id: string, data: Partial<Deliverable>) =>
    api.put<Deliverable>(`/projects/${projectId}/deliverables/${id}`, data).then(r => r.data),
  remove: (projectId: string, id: string) => api.delete(`/projects/${projectId}/deliverables/${id}`),
  uploadAttachment: (projectId: string, id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<Deliverable>(`/projects/${projectId}/deliverables/${id}/attachment`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  importExcel: (projectId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/projects/${projectId}/deliverables/import/excel`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
};
