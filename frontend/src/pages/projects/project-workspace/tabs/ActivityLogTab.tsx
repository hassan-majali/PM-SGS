import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, FileDown, ActivitySquare, HelpCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { activityLogsApi } from "@/api/activityLogs.api";
import { supportApi } from "@/api/support.api";
import { formatDate } from "@/lib/utils";
import { exportActivityReportPDF } from "@/lib/pdfExport";
import type { ActivityLog, SupportItem, Project } from "@/types";

function SupportPanel({ projectId }: { projectId: string }) {
  const [formOpen, setFormOpen] = useState(false);
  const qc = useQueryClient();
  const { data: items } = useQuery({ queryKey: ["support-project", projectId], queryFn: () => supportApi.listByProject(projectId) });
  const { register, handleSubmit, setValue, reset } = useForm<Partial<SupportItem>>();

  const createMut = useMutation({
    mutationFn: (d: Partial<SupportItem>) => supportApi.createForProject(projectId, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["support-project", projectId] }); reset(); setFormOpen(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SupportItem> }) => supportApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support-project", projectId] }),
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
                {s.owner && <p className="text-xs text-muted-foreground mt-0.5">Owner: {s.owner}</p>}
                {s.dueDate && <p className="text-xs text-muted-foreground">Due: {formatDate(s.dueDate)}</p>}
              </div>
              <div className="flex items-center gap-2 ml-3">
                <Select value={s.status} onValueChange={v => updateMut.mutate({ id: s.id, data: { status: v as SupportItem["status"] } })}>
                  <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["OPEN", "IN_PROGRESS", "RESOLVED"].map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                  </SelectContent>
                </Select>
                <StatusBadge status={s.priority} />
              </div>
            </div>
          </CardContent>
        </Card>
      )) : (
        <EmptyState icon={HelpCircle} title="No support items" description="Add items that require escalation or support." />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Support Item</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="space-y-4">
            <div className="space-y-1">
              <Label>Description *</Label>
              <Textarea {...register("description", { required: true })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Owner</Label>
                <Input {...register("owner")} />
              </div>
              <div className="space-y-1">
                <Label>Priority</Label>
                <Select onValueChange={v => setValue("priority", v as SupportItem["priority"])} defaultValue="MEDIUM">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["LOW", "MEDIUM", "HIGH"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Due Date</Label>
                <Input {...register("dueDate")} type="date" />
              </div>
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

export function ActivityLogTab({ projectId, project }: { projectId: string; project: Project }) {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["activity-logs", projectId],
    queryFn: () => activityLogsApi.list(projectId),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Partial<ActivityLog>>();

  const createMut = useMutation({
    mutationFn: (d: Partial<ActivityLog>) => activityLogsApi.create(projectId, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["activity-logs", projectId] }); reset(); setFormOpen(false); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => activityLogsApi.remove(projectId, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["activity-logs", projectId] }); setDeleteId(null); },
  });

  const handleExport = async () => {
    const allLogs = await activityLogsApi.export(projectId);
    exportActivityReportPDF(project, allLogs);
  };

  if (isLoading) return <PageLoader />;

  return (
    <Tabs defaultValue="activity">
      <TabsList className="mb-4">
        <TabsTrigger value="activity" className="flex items-center gap-1.5">
          <ActivitySquare className="h-3.5 w-3.5" />Weekly Activity
        </TabsTrigger>
        <TabsTrigger value="support" className="flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5" />Support Needed
        </TabsTrigger>
      </TabsList>

      <TabsContent value="activity">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Weekly Activity Log</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}><FileDown className="h-4 w-4" />Export PDF</Button>
              <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />Add Log</Button>
            </div>
          </div>

          {!logs?.length ? (
            <EmptyState icon={ActivitySquare} title="No activity logs" description="Start logging weekly project activities." action={{ label: "Add Log", onClick: () => setFormOpen(true) }} />
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <Card key={log.id} className="group">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">Week of {formatDate(log.weekStartDate)}</p>
                      <p className="text-xs text-muted-foreground">Reported by {log.reportedBy}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive" onClick={() => setDeleteId(log.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Summary</p>
                      <p className="text-sm">{log.summary}</p>
                    </div>
                    {log.accomplishments && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Accomplishments</p>
                        <p className="text-sm">{log.accomplishments}</p>
                      </div>
                    )}
                    {log.plannedNextWeek && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Planned Next Week</p>
                        <p className="text-sm">{log.plannedNextWeek}</p>
                      </div>
                    )}
                    {log.blockers && (
                      <div>
                        <p className="text-xs font-semibold text-orange-400 uppercase mb-1">Blockers</p>
                        <p className="text-sm text-orange-300">{log.blockers}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="support">
        <SupportPanel projectId={projectId} />
      </TabsContent>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Weekly Activity Log</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Week Start Date *</Label>
                <Input {...register("weekStartDate", { required: true })} type="date" />
              </div>
              <div className="space-y-1">
                <Label>Reported By *</Label>
                <Input {...register("reportedBy", { required: true })} placeholder="PM Name" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Weekly Summary *</Label>
                <Textarea {...register("summary", { required: true })} rows={3} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Accomplishments</Label>
                <Textarea {...register("accomplishments")} rows={2} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Planned Next Week</Label>
                <Textarea {...register("plannedNextWeek")} rows={2} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Blockers</Label>
                <Textarea {...register("blockers")} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Log"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)} title="Delete Log Entry"
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)} loading={deleteMut.isPending} />
    </Tabs>
  );
}
