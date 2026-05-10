import api from "./client";
import type { Mandays } from "@/types";

export const mandaysApi = {
  get: (projectId: string) => api.get<Mandays>(`/projects/${projectId}/mandays`).then(r => r.data),
  update: (projectId: string, data: Partial<Mandays>) =>
    api.put<Mandays>(`/projects/${projectId}/mandays`, data).then(r => r.data),
};
