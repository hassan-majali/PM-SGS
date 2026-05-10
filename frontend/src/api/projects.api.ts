import api from "./client";
import type { Project, DashboardData } from "@/types";

export const projectsApi = {
  list: (params?: { clientId?: string; status?: string }) =>
    api.get<Project[]>("/projects", { params }).then(r => r.data),
  get: (id: string) => api.get<Project>(`/projects/${id}`).then(r => r.data),
  create: (data: Partial<Project>) => api.post<Project>("/projects", data).then(r => r.data),
  update: (id: string, data: Partial<Project>) => api.put<Project>(`/projects/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/projects/${id}`),
  dashboard: (id: string) => api.get<DashboardData>(`/projects/${id}/dashboard`).then(r => r.data),
};
