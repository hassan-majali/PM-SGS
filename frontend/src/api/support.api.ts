import api from "./client";
import type { SupportItem } from "@/types";

export const supportApi = {
  listByProject: (projectId: string) =>
    api.get<SupportItem[]>(`/support/project/${projectId}`).then(r => r.data),
  createForProject: (projectId: string, data: Partial<SupportItem>) =>
    api.post<SupportItem>(`/support/project/${projectId}`, data).then(r => r.data),
  listByInitiative: (initiativeId: string) =>
    api.get<SupportItem[]>(`/support/initiative/${initiativeId}`).then(r => r.data),
  createForInitiative: (initiativeId: string, data: Partial<SupportItem>) =>
    api.post<SupportItem>(`/support/initiative/${initiativeId}`, data).then(r => r.data),
  listByActivityLog: (logId: string) =>
    api.get<SupportItem[]>(`/support/activity-log/${logId}`).then(r => r.data),
  createForActivityLog: (logId: string, data: Partial<SupportItem>) =>
    api.post<SupportItem>(`/support/activity-log/${logId}`, data).then(r => r.data),
  update: (id: string, data: Partial<SupportItem>) =>
    api.put<SupportItem>(`/support/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/support/${id}`),
};
