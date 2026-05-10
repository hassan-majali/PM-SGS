import api from "./client";
import type { Client } from "@/types";

export const clientsApi = {
  list: () => api.get<Client[]>("/clients").then(r => r.data),
  get: (id: string) => api.get<Client>(`/clients/${id}`).then(r => r.data),
  create: (data: Partial<Client>) => api.post<Client>("/clients", data).then(r => r.data),
  update: (id: string, data: Partial<Client>) => api.put<Client>(`/clients/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/clients/${id}`),
};
