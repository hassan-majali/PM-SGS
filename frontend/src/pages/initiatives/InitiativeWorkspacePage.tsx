import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, FileDown, HelpCircle, ListTodo } from "lucide-react";
import { useForm } from "react-hook-form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { actionItemsApi } from "@/api/actionItems.api";
import { supportApi } from "@/api/support.api";
import { exportInitiativePDF } from "@/lib/pdfExport";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { ActionItem, ActionItemStatus, SupportItem } from "@/types";

const ACTION_STATUSES: ActionItemStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED"];

function ActionItemsTab({ initiativeId }: { initiativeId: string }) {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ["action-items", initiativeId],
    queryFn: () => actionItemsApi.list(initiativeId),
  });

  const { register, handleSubmit, setValue, reset, formState: { isSubmitting } } = useForm<Partial<ActionItem>>();

  const createMut = useMutation({
    mutationFn: (d: Partial<ActionItem>) => actionItemsApi.create(initiativeId, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["action-items", initiativeId] }); reset(); setFormOpen(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ActionItem> }) => actionItemsApi.update(initiativeId, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["action-items", initiativeId] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => actionItemsApi.remove(initiativeId, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["action-items", initiativeId] }); setDeleteId(null); },
  });

  const done = items?.filter(a => a.status === "COMPLETED").length || 0;
  const total = items?.length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Action Items</h3>
          {total > 0 && <p className="text-sm text-muted-foreground">{done}/{total} completed</p>}
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />Add Action</Button>
      </div>

      {!items?.length ? (
        <EmptyState icon={ListTodo} title="No action items" description="Add action items to track what needs to be done." action={{ label: "Add Action", onClick: () => setFormOpen(true) }} />
      ) : (
        <div className="space-y-3">
          {items.map(a => (
            <Card key={a.id} className="group">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{a.title}</p>
                    {a.description && <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Owner: <span className="text-foreground">{a.owner}</span></span>
                      {a.dueDate && <span>Due: {formatDate(a.dueDate)}</span>}
                    </div>
                    {a.updates && (
                      <div className="mt-2 p-2 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground font-semibold uppercase mb-0.5">Latest Update</p>
                        <p className="text-xs">{a.updates}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Select value={a.status} onValueChange={v => updateMut.mutate({ id: a.id, data: { status: v as ActionItemStatus } })}>
                      <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{ACTION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive" onClick={() => setDeleteId(a.id)}>
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
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Action Item</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="space-y-4">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input {...register("title", { required: true })} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea {...register("description")} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Owner *</Label>
                <Input {...register("owner", { required: true })} />
              </div>
              <div className="space-y-1">
                <Label>Due Date</Label>
                <Input {...register("dueDate")} type="date" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Status</Label>
                <Select onValueChange={v => setValue("status", v as ActionItemStatus)} defaultValue="PENDING">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ACTION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Updates</Label>
                <Textarea {...register("updates")} rows={2} placeholder="Latest update notes..." />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)} title="Delete Action Item"
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)} loading={deleteMut.isPending} />
    </div>
  );
}

function SupportTab({ initiativeId }: { initiativeId: string }) {
  const [formOpen, setFormOpen] = useState(false);
  const qc = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ["support-initiative", initiativeId],
    queryFn: () => supportApi.listByInitiative(initiativeId),
  });

  const { register, handleSubmit, setValue, reset } = useForm<Partial<SupportItem>>();

  const createMut = useMutation({
    mutationFn: (d: Partial<SupportItem>) => supportApi.createForInitiative(initiativeId, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["support-initiative", initiativeId] }); reset(); setFormOpen(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SupportItem> }) => supportApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support-initiative", initiativeId] }),
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />Add Support Item</Button>
      </div>
      {items?.length ? items.map(s => (
        <Card key={s.id} className="bg-muted/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{s.description}</p>
                {s.owner && <p className="text-xs text-muted-foreground">Owner: {s.owner}</p>}
                {s.dueDate && <p className="text-xs text-muted-foreground">Due: {formatDate(s.dueDate)}</p>}
              </div>
              <div className="flex items-center gap-2 ml-3">
                <Select value={s.status} onValueChange={v => updateMut.mutate({ id: s.id, data: { status: v as SupportItem["status"] } })}>
                  <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["OPEN", "IN_PROGRESS", "RESOLVED"].map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
                </Select>
                <StatusBadge status={s.priority} />
              </div>
            </div>
          </CardContent>
        </Card>
      )) : (
        <EmptyState icon={HelpCircle} title="No support items" description="Add items that need escalation or support." />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Support Item</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="space-y-4">
            <div className="space-y-1"><Label>Description *</Label><Textarea {...register("description", { required: true })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Owner</Label><Input {...register("owner")} /></div>
              <div className="space-y-1">
                <Label>Priority</Label>
                <Select onValueChange={v => setValue("priority", v as SupportItem["priority"])} defaultValue="MEDIUM">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["LOW", "MEDIUM", "HIGH"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1"><Label>Due Date</Label><Input {...register("dueDate")} type="date" /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function InitiativeWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: initiative, isLoading } = useQuery({
    queryKey: ["initiatives", id],
    queryFn: () => initiativesApi.get(id!),
    enabled: !!id,
  });

  if (isLoading) return <PageLoader />;
  if (!initiative) return <div className="p-6">Initiative not found</div>;

  const handleExportPDF = () => exportInitiativePDF(initiative);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={initiative.name}
        breadcrumbs={[{ label: "Initiatives", to: "/initiatives" }, { label: initiative.name }]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExportPDF}><FileDown className="h-4 w-4" />Export PDF</Button>
            <div className="flex gap-2">
              <StatusBadge status={initiative.type} />
              <StatusBadge status={initiative.qualificationDecision} />
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Type", value: initiative.type === "SUTHERLAND_DRIVEN" ? "Sutherland" : "RFP" },
          { label: "Owner", value: initiative.owner },
          { label: "Client", value: initiative.client?.name || "—" },
          { label: "Expected Revenue", value: initiative.expectedRevenue ? formatCurrency(initiative.expectedRevenue) : "—" },
        ].map(({ label, value }) => (
          <Card key={label} className="bg-muted/20">
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-semibold text-sm mt-0.5">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {initiative.description && (
        <Card className="bg-muted/10">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Description</p>
            <p className="text-sm">{initiative.description}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="actions">
        <TabsList>
          <TabsTrigger value="actions" className="flex items-center gap-1.5">
            <ListTodo className="h-3.5 w-3.5" />Action Items
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" />Support Needed
          </TabsTrigger>
        </TabsList>
        <TabsContent value="actions"><ActionItemsTab initiativeId={id!} /></TabsContent>
        <TabsContent value="support"><SupportTab initiativeId={id!} /></TabsContent>
      </Tabs>
    </div>
  );
}
