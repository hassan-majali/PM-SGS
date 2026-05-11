import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Paperclip, ExternalLink, FileSpreadsheet } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { paymentPlansApi } from "@/api/paymentPlans.api";
import { deliverablesApi } from "@/api/deliverables.api";
import { formatCurrency, formatDate, fiscalYearOptions, getCurrentFiscalYear } from "@/lib/utils";
import type { PaymentPlan, PaymentStatus } from "@/types";

const STATUSES: PaymentStatus[] = ["PENDING", "IN_PROGRESS", "INVOICED", "COLLECTED"];

type InvoiceForm = {
  deliverableId: string;
  billedQty: number;
  invoicingDate: string;
  status: PaymentStatus;
  fiscalYear: string;
  invoiceNumber?: string;
  notes?: string;
};

function PaymentRow({ p, projectId }: { p: PaymentPlan; projectId: string }) {
  const qc = useQueryClient();
  const [delOpen, setDelOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const updateMut = useMutation({
    mutationFn: (data: Partial<PaymentPlan>) => paymentPlansApi.update(projectId, p.id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-plans", projectId] }),
  });

  const deleteMut = useMutation({
    mutationFn: () => paymentPlansApi.remove(projectId, p.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-plans", projectId] });
      qc.invalidateQueries({ queryKey: ["deliverables", projectId] });
      setDelOpen(false);
    },
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => paymentPlansApi.uploadAttachment(projectId, p.id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-plans", projectId] }),
  });

  return (
    <tr className="border-b border-border hover:bg-muted/20 transition-colors">
      <td className="py-3 px-3 text-sm">{p.deliverable?.name || "—"}</td>
      <td className="py-3 px-3 text-sm text-right">{p.billedQty ?? "—"}</td>
      <td className="py-3 px-3 text-sm font-medium text-right">{formatCurrency(p.amount)}</td>
      <td className="py-3 px-3 text-sm text-center">{formatDate(p.invoicingDate)}</td>
      <td className="py-3 px-3 text-center">
        <Select value={p.status} onValueChange={v => updateMut.mutate({ status: v as PaymentStatus })}>
          <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </td>
      <td className="py-3 px-3 text-sm text-center">{p.fiscalYear}</td>
      <td className="py-3 px-3 text-center">
        {p.attachmentUrl ? (
          <a href={p.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <ExternalLink className="h-3 w-3" />View
          </a>
        ) : (
          <button onClick={() => fileRef.current?.click()} className="text-xs text-muted-foreground hover:text-primary transition-colors">
            <Paperclip className="h-3 w-3 inline mr-1" />Attach
          </button>
        )}
        <input ref={fileRef} type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadMut.mutate(e.target.files[0]); }} />
      </td>
      <td className="py-3 px-3 text-center">
        <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => setDelOpen(true)}>
          <Trash2 className="h-3 w-3" />
        </Button>
        <ConfirmDialog open={delOpen} onOpenChange={setDelOpen} title="Delete Invoice Entry" onConfirm={() => deleteMut.mutate()} loading={deleteMut.isPending} />
      </td>
    </tr>
  );
}

export function FinancialsTab({ projectId }: { projectId: string }) {
  const [formOpen, setFormOpen] = useState(false);
  const [fyFilter, setFyFilter] = useState(getCurrentFiscalYear());
  const [unbilledOnly, setUnbilledOnly] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const fyOptions = fiscalYearOptions();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["payment-plans", projectId, fyFilter, unbilledOnly],
    queryFn: () => paymentPlansApi.list(projectId, { fiscalYear: fyFilter || undefined, unbilledOnly }),
  });

  const { data: summary } = useQuery({
    queryKey: ["payment-plans-summary", projectId],
    queryFn: () => paymentPlansApi.summary(projectId),
  });

  const { data: deliverables } = useQuery({
    queryKey: ["deliverables", projectId],
    queryFn: () => deliverablesApi.list(projectId),
  });

  const { register, handleSubmit, control, watch, reset, formState: { isSubmitting } } = useForm<InvoiceForm>({
    defaultValues: { status: "PENDING", fiscalYear: getCurrentFiscalYear(), billedQty: 1 },
  });

  const watchedDeliverableId = watch("deliverableId");
  const watchedBilledQty = watch("billedQty");
  const selectedDeliverable = deliverables?.find(d => d.id === watchedDeliverableId);
  const computedAmount = selectedDeliverable ? Number(watchedBilledQty || 0) * selectedDeliverable.unitPrice : 0;

  const createMut = useMutation({
    mutationFn: (d: InvoiceForm) => paymentPlansApi.create(projectId, { ...d, billedQty: Number(d.billedQty) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-plans", projectId] });
      qc.invalidateQueries({ queryKey: ["payment-plans-summary", projectId] });
      qc.invalidateQueries({ queryKey: ["deliverables", projectId] });
      reset(); setFormOpen(false);
    },
  });

  const importMut = useMutation({
    mutationFn: (file: File) => paymentPlansApi.importExcel(projectId, file),
    onSuccess: (result) => { qc.invalidateQueries({ queryKey: ["payment-plans", projectId] }); alert(`Imported ${result.imported} entries`); },
  });

  if (isLoading) return <PageLoader />;

  const allPlans = plans || [];
  const totals = {
    forecasted: allPlans.reduce((s, p) => s + p.amount, 0),
    invoiced: allPlans.filter(p => ["INVOICED", "COLLECTED"].includes(p.status)).reduce((s, p) => s + p.amount, 0),
    collected: allPlans.filter(p => p.status === "COLLECTED").reduce((s, p) => s + p.amount, 0),
    pending: allPlans.filter(p => p.status === "PENDING").reduce((s, p) => s + p.amount, 0),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Select value={fyFilter} onValueChange={setFyFilter}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Years</SelectItem>
              {fyOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant={unbilledOnly ? "default" : "outline"} size="sm" onClick={() => setUnbilledOnly(u => !u)}>
            Unbilled Only
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
            <FileSpreadsheet className="h-4 w-4" />Import Excel
          </Button>
          <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={e => { if (e.target.files?.[0]) importMut.mutate(e.target.files[0]); }} />
          <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />Add Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Forecasted", value: totals.forecasted, color: "text-blue-400" },
          { label: "Invoiced", value: totals.invoiced, color: "text-purple-400" },
          { label: "Collected", value: totals.collected, color: "text-green-400" },
          { label: "Pending", value: totals.pending, color: "text-yellow-400" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="bg-muted/20">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-xl font-bold mt-0.5 ${color}`}>{formatCurrency(value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {summary && summary.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Fiscal Year Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={summary} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="fiscalYear" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="forecasted" name="Forecasted" fill="#6366f1" radius={[2, 2, 0, 0]} />
                <Bar dataKey="invoiced" name="Invoiced" fill="#a78bfa" radius={[2, 2, 0, 0]} />
                <Bar dataKey="collected" name="Collected" fill="#22c55e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Deliverable", "Qty Billed", "Amount", "Invoice Date", "Status", "Fiscal Year", "Attachment", ""].map(h => (
                  <th key={h} className="py-3 px-3 text-xs font-semibold text-muted-foreground text-center first:text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allPlans.map(p => <PaymentRow key={p.id} p={p} projectId={projectId} />)}
            </tbody>
          </table>
          {!allPlans.length && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No invoice entries{unbilledOnly ? " with pending/in-progress status" : ""}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Invoice Entry</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="space-y-4">
            <div className="space-y-1">
              <Label>Deliverable *</Label>
              <Controller
                control={control}
                name="deliverableId"
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select deliverable" /></SelectTrigger>
                    <SelectContent>
                      {deliverables?.map(d => (
                        <SelectItem key={d.id} value={d.id} disabled={d.remainingQty <= 0}>
                          {d.name} — {formatCurrency(d.unitPrice)}/unit · {d.remainingQty} remaining
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {selectedDeliverable && (
              <div className="rounded-md bg-muted/30 px-4 py-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unit Price</span>
                  <span>{formatCurrency(selectedDeliverable.unitPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Qty</span>
                  <span>{selectedDeliverable.qty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Billed</span>
                  <span className="text-yellow-400">{selectedDeliverable.billedQty}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Available to Bill</span>
                  <span className="text-green-400">{selectedDeliverable.remainingQty}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Qty to Bill *</Label>
                <Input
                  {...register("billedQty", { required: true, min: 0.01, max: selectedDeliverable?.remainingQty })}
                  type="number" min="0.01" step="0.01"
                  max={selectedDeliverable?.remainingQty}
                  placeholder="1"
                />
              </div>
              <div className="space-y-1">
                <Label>Invoice Amount</Label>
                <div className="h-10 rounded-md border border-border bg-muted/30 px-3 flex items-center font-semibold text-primary">
                  {formatCurrency(computedAmount)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Invoice Date *</Label>
                <Input {...register("invoicingDate", { required: true })} type="date" />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label>Fiscal Year</Label>
                <Controller
                  control={control}
                  name="fiscalYear"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{fyOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label>Invoice Number</Label>
                <Input {...register("invoiceNumber")} placeholder="INV-001" />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea {...register("notes")} rows={2} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { reset(); setFormOpen(false); }}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Invoice"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
