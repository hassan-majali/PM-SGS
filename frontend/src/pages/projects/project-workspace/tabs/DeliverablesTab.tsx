import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Paperclip, Trash2, Upload, FileSpreadsheet, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { deliverablesApi } from "@/api/deliverables.api";
import { formatCurrency } from "@/lib/utils";
import type { Deliverable } from "@/types";

type DeliverableForm = { name: string; description?: string; qty: number; unitPrice: number };

function DeliverableRow({ d, projectId }: { d: Deliverable; projectId: string }) {
  const qc = useQueryClient();
  const [delOpen, setDelOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadMut = useMutation({
    mutationFn: (file: File) => deliverablesApi.uploadAttachment(projectId, d.id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deliverables", projectId] }),
  });

  const deleteMut = useMutation({
    mutationFn: () => deliverablesApi.remove(projectId, d.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deliverables", projectId] }); setDelOpen(false); },
  });

  const remainingPct = d.qty > 0 ? ((d.remainingQty / d.qty) * 100) : 100;

  return (
    <tr className="border-b border-border hover:bg-muted/20 transition-colors">
      <td className="py-3 px-4">
        <p className="font-medium text-sm">{d.name}</p>
        {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}
      </td>
      <td className="py-3 px-4 text-right text-sm">{d.qty}</td>
      <td className="py-3 px-4 text-right text-sm">{formatCurrency(d.unitPrice)}</td>
      <td className="py-3 px-4 text-right font-semibold text-sm">{formatCurrency(d.amount)}</td>
      <td className="py-3 px-4 text-center text-sm">
        <span className={d.billedQty > 0 ? "text-yellow-400" : "text-muted-foreground"}>{d.billedQty}</span>
      </td>
      <td className="py-3 px-4 text-center text-sm">
        <span className={remainingPct < 20 ? "text-red-400 font-semibold" : remainingPct < 50 ? "text-yellow-400" : "text-green-400"}>
          {d.remainingQty}
        </span>
      </td>
      <td className="py-3 px-4 text-center">
        {d.attachmentUrl ? (
          <a href={d.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <ExternalLink className="h-3 w-3" />View
          </a>
        ) : (
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Paperclip className="h-3 w-3" />Attach
          </button>
        )}
        <input ref={fileRef} type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadMut.mutate(e.target.files[0]); }} />
      </td>
      <td className="py-3 px-4 text-center">
        <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => setDelOpen(true)}>
          <Trash2 className="h-3 w-3" />
        </Button>
        <ConfirmDialog open={delOpen} onOpenChange={setDelOpen} title="Delete Deliverable" onConfirm={() => deleteMut.mutate()} loading={deleteMut.isPending} />
      </td>
    </tr>
  );
}

export function DeliverablesTab({ projectId }: { projectId: string }) {
  const [formOpen, setFormOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["deliverables", projectId],
    queryFn: () => deliverablesApi.list(projectId),
  });

  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm<DeliverableForm>({
    defaultValues: { qty: 1, unitPrice: 0 },
  });

  const watchedQty = watch("qty") || 0;
  const watchedPrice = watch("unitPrice") || 0;
  const computedTotal = Number(watchedQty) * Number(watchedPrice);

  const createMut = useMutation({
    mutationFn: (d: DeliverableForm) => deliverablesApi.create(projectId, { ...d, qty: Number(d.qty), unitPrice: Number(d.unitPrice) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deliverables", projectId] }); reset(); setFormOpen(false); },
  });

  const importMut = useMutation({
    mutationFn: (file: File) => deliverablesApi.importExcel(projectId, file),
    onSuccess: (result) => { qc.invalidateQueries({ queryKey: ["deliverables", projectId] }); alert(`Imported ${result.imported} deliverables`); },
  });

  const total = items?.reduce((s, d) => s + d.amount, 0) || 0;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Deliverables</h3>
          <p className="text-sm text-muted-foreground">Contract Total: {formatCurrency(total)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
            <FileSpreadsheet className="h-4 w-4" />Import Excel
          </Button>
          <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={e => { if (e.target.files?.[0]) importMut.mutate(e.target.files[0]); }} />
          <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />Add Deliverable</Button>
        </div>
      </div>

      {!items?.length ? (
        <EmptyState icon={Upload} title="No deliverables yet" description="Add deliverables or import from Excel." action={{ label: "Add Deliverable", onClick: () => setFormOpen(true) }} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">DELIVERABLE</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">QTY</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">UNIT PRICE</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">TOTAL</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground">BILLED</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground">REMAINING</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground">ATTACHMENT</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(d => <DeliverableRow key={d.id} d={d} projectId={projectId} />)}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/20">
                  <td className="py-3 px-4 text-sm font-semibold">Total</td>
                  <td colSpan={2} />
                  <td className="py-3 px-4 text-right font-bold text-primary">{formatCurrency(total)}</td>
                  <td className="py-3 px-4 text-center text-sm text-yellow-400 font-semibold">
                    {items.reduce((s, d) => s + d.billedQty, 0)}
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-green-400 font-semibold">
                    {items.reduce((s, d) => s + d.remainingQty, 0)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Deliverable</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="space-y-4">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input {...register("name", { required: true })} placeholder="Phase 1 Design" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea {...register("description")} rows={2} placeholder="Description..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Quantity *</Label>
                <Input {...register("qty", { required: true })} type="number" min="0" step="0.01" placeholder="1" />
              </div>
              <div className="space-y-1">
                <Label>Unit Price (USD) *</Label>
                <Input {...register("unitPrice", { required: true })} type="number" min="0" step="0.01" placeholder="50000" />
              </div>
            </div>
            <div className="rounded-md bg-muted/30 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(computedTotal)}</span>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { reset(); setFormOpen(false); }}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
