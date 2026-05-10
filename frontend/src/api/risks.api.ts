import api from "./client";
import type { RiskIssue } from "@/types";

export const risksApi = {
  list: (projectId: string, params?: { type?: string; status?: string }) =>
    api.get<RiskIssue[]>(`/projects/${projectId}/risks`, { params }).then(r => r.data),
  create: (projectId: string, data: Partial<RiskIssue>) =>
    api.post<RiskIssue>(`/projects/${projectId}/risks`, data).then(r => r.data),
  update: (projectId: string, id: string, data: Partial<RiskIssue>) =>
    api.put<RiskIssue>(`/projects/${projectId}/risks/${id}`, data).then(r => r.data),
  remove: (projectId: string, id: string) => api.delete(`/projects/${projectId}/risks/${id}`),
};
