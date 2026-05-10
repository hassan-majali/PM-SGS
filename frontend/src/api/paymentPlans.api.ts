import api from "./client";
import type { PaymentPlan, FiscalYearSummary } from "@/types";

export const paymentPlansApi = {
  list: (projectId: string, params?: { fiscalYear?: string; status?: string; unbilledOnly?: boolean }) =>
    api.get<PaymentPlan[]>(`/projects/${projectId}/payment-plans`, { params }).then(r => r.data),
  summary: (projectId: string, fiscalYear?: string) =>
    api.get<FiscalYearSummary[]>(`/projects/${projectId}/payment-plans/summary`, {
      params: fiscalYear ? { fiscalYear } : {},
    }).then(r => r.data),
  create: (projectId: string, data: Partial<PaymentPlan>) =>
    api.post<PaymentPlan>(`/projects/${projectId}/payment-plans`, data).then(r => r.data),
  update: (projectId: string, id: string, data: Partial<PaymentPlan>) =>
    api.put<PaymentPlan>(`/projects/${projectId}/payment-plans/${id}`, data).then(r => r.data),
  remove: (projectId: string, id: string) => api.delete(`/projects/${projectId}/payment-plans/${id}`),
  uploadAttachment: (projectId: string, id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<PaymentPlan>(`/projects/${projectId}/payment-plans/${id}/attachment`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
  importExcel: (projectId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/projects/${projectId}/payment-plans/import/excel`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },
};
