import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, FolderKanban, Calendar, DollarSign, User, Trash2, ArrowRight } from "lucide-react";
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
import { projectsApi } from "@/api/projects.api";
import { clientsApi } from "@/api/clients.api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Project } from "@/types";

function ProjectForm({ onClose, defaultClientId }: { onClose: () => void; defaultClientId?: string }) {
  const qc = useQueryClient();
  const { data: clients } = useQuery({ queryKey: ["clients"], queryFn: () => clientsApi.list() });
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<Partial<Project>>({
    defaultValues: { clientId: defaultClientId, status: "ACTIVE", budget: 0 },
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<Project>) => projectsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); onClose(); },
  });

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <Label>Project Name *</Label>
          <Input {...register("name", { required: true })} placeholder="Project Alpha" />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Client *</Label>
          <Select onValueChange={v => setValue("clientId", v)} defaultValue={defaultClientId}>
            <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
            <SelectContent>
              {clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Manager *</Label>
          <Input {...register("manager", { required: true })} placeholder="Jane Smith" />
        </div>
        <div className="space-y-1">
          <Label>Budget (USD) *</Label>
          <Input {...register("budget", { required: true })} type="number" min="0" step="0.01" placeholder="100000" />
        </div>
        <div className="space-y-1">
          <Label>Start Date *</Label>
          <Input {...register("startDate", { required: true })} type="date" />
        </div>
        <div className="space-y-1">
          <Label>End Date *</Label>
          <Input {...register("endDate", { required: true })} type="date" />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Status</Label>
          <Select onValueChange={v => setValue("status", v as Project["status"])} defaultValue="ACTIVE">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Description</Label>
          <Textarea {...register("description")} placeholder="Project description..." rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Project"}</Button>
      </DialogFooter>
    </form>
  );
}

export function ProjectsListPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId") || undefined;
  const qc = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", clientId],
    queryFn: () => projectsApi.list({ clientId }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); setDeleteId(null); },
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Projects"
        description="Manage all your projects"
        actions={<Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />New Project</Button>}
      />

      {!projects?.length ? (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Create your first project to get started." action={{ label: "New Project", onClick: () => setFormOpen(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(p => (
            <Card key={p.id} className="hover:border-primary/30 transition-colors group">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderKanban className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.client?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusBadge status={p.status} />
                    <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive" onClick={() => setDeleteId(p.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5"><User className="h-3 w-3" />{p.manager}</div>
                  <div className="flex items-center gap-1.5"><DollarSign className="h-3 w-3" />{formatCurrency(p.budget)}</div>
                  <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />{formatDate(p.startDate)} — {formatDate(p.endDate)}</div>
                </div>

                {p.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.description}</p>}

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{p._count?.deliverables || 0} deliverables</span>
                    <span>{p._count?.resources || 0} resources</span>
                  </div>
                  <Link to={`/projects/${p.id}`} className="text-xs text-primary flex items-center gap-1 hover:underline">
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
          <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
          <ProjectForm onClose={() => setFormOpen(false)} defaultClientId={clientId} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={v => !v && setDeleteId(null)}
        title="Delete Project"
        description="This will permanently delete the project and all its data. This action cannot be undone."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
