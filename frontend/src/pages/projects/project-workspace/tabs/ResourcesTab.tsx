import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { resourcesApi } from "@/api/resources.api";
import { formatCurrency } from "@/lib/utils";
import type { Resource } from "@/types";

export function ResourcesTab({ projectId }: { projectId: string }) {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: resources, isLoading } = useQuery({
    queryKey: ["resources", projectId],
    queryFn: () => resourcesApi.list(projectId),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Partial<Resource>>();

  const createMut = useMutation({
    mutationFn: (d: Partial<Resource>) => resourcesApi.create(projectId, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["resources", projectId] }); reset(); setFormOpen(false); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => resourcesApi.remove(projectId, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["resources", projectId] }); setDeleteId(null); },
  });

  const totalWeeklyCost = resources?.reduce((s, r) => s + r.computedWeeklyCost, 0) || 0;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Resources</h3>
          <p className="text-sm text-muted-foreground">Total weekly cost: {formatCurrency(totalWeeklyCost)}</p>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />Add Resource</Button>
      </div>

      {!resources?.length ? (
        <EmptyState icon={Users} title="No resources yet" description="Add team members to track utilization and costs." action={{ label: "Add Resource", onClick: () => setFormOpen(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map(r => (
            <Card key={r.id} className="relative group">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                      {r.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{r.name}</p>
                      {r.role && <p className="text-xs text-muted-foreground">{r.role}</p>}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive" onClick={() => setDeleteId(r.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Utilization</span>
                    <span className="font-medium">{r.utilizationPct}%</span>
                  </div>
                  <Progress value={r.utilizationPct} className={r.utilizationPct > 90 ? "[&>div]:bg-red-500" : r.utilizationPct > 70 ? "[&>div]:bg-amber-500" : ""} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Hrs/Week", value: r.weeklyHours.toString() },
                    { label: "Cost/Hr", value: formatCurrency(r.costPerHour) },
                    { label: "Weekly Cost", value: formatCurrency(r.computedWeeklyCost) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-muted/30 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Resource</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label>Name *</Label>
                <Input {...register("name", { required: true })} placeholder="Jane Smith" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Role</Label>
                <Input {...register("role")} placeholder="Senior Developer" />
              </div>
              <div className="space-y-1">
                <Label>Utilization %</Label>
                <Input {...register("utilizationPct")} type="number" min="0" max="100" step="5" placeholder="100" />
              </div>
              <div className="space-y-1">
                <Label>Weekly Hours</Label>
                <Input {...register("weeklyHours")} type="number" min="0" step="0.5" placeholder="40" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Cost per Hour (USD)</Label>
                <Input {...register("costPerHour")} type="number" min="0" step="0.01" placeholder="75" />
              </div>
              <div className="space-y-1">
                <Label>Start Date</Label>
                <Input {...register("startDate")} type="date" />
              </div>
              <div className="space-y-1">
                <Label>End Date</Label>
                <Input {...register("endDate")} type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)} title="Remove Resource"
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)} loading={deleteMut.isPending} />
    </div>
  );
}
