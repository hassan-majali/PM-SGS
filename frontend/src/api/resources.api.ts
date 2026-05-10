import api from "./client";
import type { Resource } from "@/types";

export const resourcesApi = {
  list: (projectId: string) => api.get<Resource[]>(`/projects/${projectId}/resources`).then(r => r.data),
  create: (projectId: string, data: Partial<Resource>) =>
    api.post<Resource>(`/projects/${projectId}/resources`, data).then(r => r.data),
  update: (projectId: string, id: string, data: Partial<Resource>) =>
    api.put<Resource>(`/projects/${projectId}/resources/${id}`, data).then(r => r.data),
  remove: (projectId: string, id: string) => api.delete(`/projects/${projectId}/resources/${id}`),
};
