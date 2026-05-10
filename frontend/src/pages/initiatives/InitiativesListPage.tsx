import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Lightbulb, Trash2, ArrowRight, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/layout/PageHeader";
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
import { initiativesApi } from "@/api/initiatives.api";
import { clientsApi } from "@/api/clients.api";
import { formatCurrency } from "@/lib/utils";
import type { Initiative, InitiativeType, QualificationDecision } from "@/types";

const TYPES: InitiativeType[] = ["RFP", "SUTHERLAND_DRIVEN"];
const QUALIFICATIONS: QualificationDecision[] = ["PENDING", "QUALIFIED", "NOT_QUALIFIED", "ON_HOLD"];

function InitiativeForm({ onClose, defaultClientId }: { onClose: () => void; defaultClientId?: string }) {
  const qc = useQueryClient();
  const { data: clients } = useQuery({ queryKey: ["clients"], queryFn: () => clientsApi.list() });
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<Partial<Initiative>>({
    defaultValues: { type: "RFP", qualificationDecision: "PENDING", clientId: defaultClientId },
  });

  const mutation = useMutation({
    mutationFn: (d: Partial<Initiative>) => initiativesApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["initiatives"] }); onClose(); },
  });

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <Label>Name *</Label>
          <Input {...register("name", { required: true })} placeholder="Digital Transformation Initiative" />
        </div>
        <div className="space-y-1">
          <Label>Type *</Label>
          <Select onValueChange={v => setValue("type", v as InitiativeType)} defaultValue="RFP">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="RFP">RFP</SelectItem>
              <SelectItem value="SUTHERLAND_DRIVEN">Sutherland Driven</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Owner *</Label>
          <Input {...register("owner", { required: true })} placeholder="Owner Name" />
        </div>
        <div className="space-y-1">
          <Label>Client</Label>
          <Select onValueChange={v => setValue("clientId", v === "none" ? undefined : v)} defaultValue={defaultClientId || "none"}>
            <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No client</SelectItem>
              {clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Qualification Decision</Label>
          <Select onValueChange={v => setValue("qualificationDecision", v as QualificationDecision)} defaultValue="PENDING">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{QUALIFICATIONS.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Expected Revenue (USD)</Label>
          <Input {...register("expectedRevenue")} type="number" min="0" step="1000" placeholder="500000" />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Description</Label>
          <Textarea {...register("description")} rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Initiative"}</Button>
      </DialogFooter>
    </form>
  );
}

export function InitiativesListPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId") || undefined;
  const qc = useQueryClient();

  const { data: initiatives, isLoading } = useQuery({
    queryKey: ["initiatives", clientId, typeFilter],
    queryFn: () => initiativesApi.list({ clientId, type: typeFilter !== "ALL" ? typeFilter : undefined }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => initiativesApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["initiatives"] }); setDeleteId(null); },
  });

  if (isLoading) return <PageLoader />;

  const qualified = initiatives?.filter(i => i.qualificationDecision === "QUALIFIED").length || 0;
  const totalRevenue = initiatives?.filter(i => i.qualificationDecision === "QUALIFIED").reduce((s, i) => s + (i.expectedRevenue || 0), 0) || 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Initiatives"
        description="Track RFP and Sutherland-driven initiatives"
        actions={<Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />New Initiative</Button>}
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2.5 py-1 rounded-full text-xs">{qualified} qualified</span>
          {totalRevenue > 0 && <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full text-xs">{formatCurrency(totalRevenue)} pipeline</span>}
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden text-xs">
          {["ALL", "RFP", "SUTHERLAND_DRIVEN"].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 transition-colors ${typeFilter === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >{t === "SUTHERLAND_DRIVEN" ? "Sutherland" : t}</button>
          ))}
        </div>
      </div>

      {!initiatives?.length ? (
        <EmptyState icon={Lightbulb} title="No initiatives yet" description="Create your first initiative to track opportunities." action={{ label: "New Initiative", onClick: () => setFormOpen(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {initiatives.map(i => (
            <Card key={i.id} className="hover:border-primary/30 transition-colors group">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.owner} · {i.client?.name || "No client"}</p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive flex-shrink-0" onClick={() => setDeleteId(i.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <StatusBadge status={i.type} />
                  <StatusBadge status={i.qualificationDecision} />
                </div>

                {i.expectedRevenue && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <DollarSign className="h-3 w-3" />Expected: {formatCurrency(i.expectedRevenue)}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{i._count?.actionItems || 0} action items</span>
                  <Link to={`/initiatives/${i.id}`} className="text-xs text-primary flex items-center gap-1 hover:underline">
                    Open <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Initiative</DialogTitle></DialogHeader>
          <InitiativeForm onClose={() => setFormOpen(false)} defaultClientId={clientId} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)} title="Delete Initiative"
        description="This will permanently delete the initiative and all action items."
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)} loading={deleteMut.isPending} />
    </div>
  );
}
