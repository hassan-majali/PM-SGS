import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, AlertTriangle, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { risksApi } from "@/api/risks.api";
import { formatDate } from "@/lib/utils";
import type { RiskIssue, RiskLevel, RiskStatus } from "@/types";

const IMPACTS: RiskLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES: RiskStatus[] = ["OPEN", "MITIGATED", "CLOSED", "ACCEPTED"];

export function RisksTab({ projectId }: { projectId: string }) {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const qc = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["risks", projectId],
    queryFn: () => risksApi.list(projectId),
  });

  const { register, handleSubmit, setValue, reset, formState: { isSubmitting } } = useForm<Partial<RiskIssue>>({
    defaultValues: { type: "RISK", impact: "MEDIUM", status: "OPEN" },
  });

  const createMut = useMutation({
    mutationFn: (d: Partial<RiskIssue>) => risksApi.create(projectId, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["risks", projectId] }); reset(); setFormOpen(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RiskIssue> }) => risksApi.update(projectId, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["risks", projectId] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => risksApi.remove(projectId, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["risks", projectId] }); setDeleteId(null); },
  });

  const filtered = items?.filter(i => typeFilter === "ALL" || i.type === typeFilter) || [];
  const openCount = items?.filter(i => i.status === "OPEN").length || 0;
  const criticalCount = items?.filter(i => i.impact === "CRITICAL").length || 0;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">Risks & Issues</h3>
          <div className="flex items-center gap-2 text-xs">
            {openCount > 0 && <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">{openCount} open</span>}
            {criticalCount > 0 && <span className="bg-red-600/30 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full">{criticalCount} critical</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden text-xs">
            {["ALL", "RISK", "ISSUE"].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 transition-colors ${typeFilter === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >{t}</button>
            ))}
          </div>
          <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />Add</Button>
        </div>
      </div>

      {!filtered.length ? (
        <EmptyState icon={AlertTriangle} title="No risks or issues" description="Track project risks and issues to stay ahead of problems." action={{ label: "Add Risk", onClick: () => setFormOpen(true) }} />
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <Card key={r.id} className="group">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {r.type === "RISK" ? <Shield className="h-4 w-4 text-orange-400" /> : <AlertTriangle className="h-4 w-4 text-red-400" />}
                      <p className="font-semibold text-sm">{r.title}</p>
                    </div>
                    {r.description && <p className="text-xs text-muted-foreground mb-2">{r.description}</p>}
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={r.type} />
                      <span className="text-xs text-muted-foreground">Impact:</span>
                      <StatusBadge status={r.impact} />
                      {r.probability && <><span className="text-xs text-muted-foreground">Probability:</span><StatusBadge status={r.probability} /></>}
                      {r.owner && <span className="text-xs text-muted-foreground">Owner: {r.owner}</span>}
                      {r.dueDate && <span className="text-xs text-muted-foreground">Due: {formatDate(r.dueDate)}</span>}
                    </div>
                    {r.mitigationPlan && (
                      <div className="mt-2 p-2 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground font-semibold uppercase mb-0.5">Mitigation Plan</p>
                        <p className="text-xs">{r.mitigationPlan}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Select value={r.status} onValueChange={v => updateMut.mutate({ id: r.id, data: { status: v as RiskStatus } })}>
                      <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive" onClick={() => setDeleteId(r.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Risk / Issue</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select onValueChange={v => setValue("type", v as RiskIssue["type"])} defaultValue="RISK">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="RISK">Risk</SelectItem><SelectItem value="ISSUE">Issue</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select onValueChange={v => setValue("status", v as RiskStatus)} defaultValue="OPEN">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Title *</Label>
                <Input {...register("title", { required: true })} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Description</Label>
                <Textarea {...register("description")} rows={2} />
              </div>
              <div className="space-y-1">
                <Label>Impact</Label>
                <Select onValueChange={v => setValue("impact", v as RiskLevel)} defaultValue="MEDIUM">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{IMPACTS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Probability</Label>
                <Select onValueChange={v => setValue("probability", v as RiskLevel)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{IMPACTS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Owner</Label>
                <Input {...register("owner")} />
              </div>
              <div className="space-y-1">
                <Label>Due Date</Label>
                <Input {...register("dueDate")} type="date" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Mitigation Plan</Label>
                <Textarea {...register("mitigationPlan")} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)} title="Delete Risk/Issue"
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)} loading={deleteMut.isPending} />
    </div>
  );
}
