import api from "./client";
import type { Initiative } from "@/types";

export const initiativesApi = {
  list: (params?: { type?: string; qualificationDecision?: string; clientId?: string }) =>
    api.get<Initiative[]>("/initiatives", { params }).then(r => r.data),
  get: (id: string) => api.get<Initiative>(`/initiatives/${id}`).then(r => r.data),
  create: (data: Partial<Initiative>) => api.post<Initiative>("/initiatives", data).then(r => r.data),
  update: (id: string, data: Partial<Initiative>) =>
    api.put<Initiative>(`/initiatives/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/initiatives/${id}`),
};
