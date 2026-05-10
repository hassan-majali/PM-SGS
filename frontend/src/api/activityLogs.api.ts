import api from "./client";
import type { ActivityLog } from "@/types";

export const activityLogsApi = {
  list: (projectId: string) => api.get<ActivityLog[]>(`/projects/${projectId}/activity-logs`).then(r => r.data),
  get: (projectId: string, id: string) =>
    api.get<ActivityLog>(`/projects/${projectId}/activity-logs/${id}`).then(r => r.data),
  create: (projectId: string, data: Partial<ActivityLog>) =>
    api.post<ActivityLog>(`/projects/${projectId}/activity-logs`, data).then(r => r.data),
  update: (projectId: string, id: string, data: Partial<ActivityLog>) =>
    api.put<ActivityLog>(`/projects/${projectId}/activity-logs/${id}`, data).then(r => r.data),
  remove: (projectId: string, id: string) => api.delete(`/projects/${projectId}/activity-logs/${id}`),
  export: (projectId: string) =>
    api.get<ActivityLog[]>(`/projects/${projectId}/activity-logs/export`).then(r => r.data),
};
