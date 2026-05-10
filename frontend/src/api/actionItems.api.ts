import api from "./client";
import type { ActionItem } from "@/types";

export const actionItemsApi = {
  list: (initiativeId: string) =>
    api.get<ActionItem[]>(`/initiatives/${initiativeId}/action-items`).then(r => r.data),
  create: (initiativeId: string, data: Partial<ActionItem>) =>
    api.post<ActionItem>(`/initiatives/${initiativeId}/action-items`, data).then(r => r.data),
  update: (initiativeId: string, id: string, data: Partial<ActionItem>) =>
    api.put<ActionItem>(`/initiatives/${initiativeId}/action-items/${id}`, data).then(r => r.data),
  remove: (initiativeId: string, id: string) =>
    api.delete(`/initiatives/${initiativeId}/action-items/${id}`),
};
