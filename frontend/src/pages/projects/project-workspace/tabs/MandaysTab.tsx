import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Clock, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { mandaysApi } from "@/api/mandays.api";
import type { Mandays } from "@/types";

export function MandaysTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();

  const { data: mandays, isLoading } = useQuery({
    queryKey: ["mandays", projectId],
    queryFn: () => mandaysApi.get(projectId),
  });

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Partial<Mandays>>();

  const updateMut = useMutation({
    mutationFn: (d: Partial<Mandays>) => mandaysApi.update(projectId, d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mandays", projectId] }),
  });

  if (isLoading) return <PageLoader />;

  const usedPct = mandays && mandays.totalContracted > 0 ? (mandays.used / mandays.totalContracted) * 100 : 0;
  const billedPct = mandays && mandays.totalContracted > 0 ? (mandays.billed / mandays.totalContracted) * 100 : 0;
  const remaining = mandays ? mandays.totalContracted - mandays.used : 0;
  const unbilled = mandays ? mandays.used - mandays.billed : 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="font-semibold">Mandays Consumption</h3>
        <p className="text-sm text-muted-foreground">Track contracted vs. consumed vs. billed mandays</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Contracted", value: mandays?.totalContracted || 0, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Used", value: mandays?.used || 0, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Billed", value: mandays?.billed || 0, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Remaining", value: remaining, color: remaining < 0 ? "text-red-400" : "text-purple-400", bg: remaining < 0 ? "bg-red-500/10" : "bg-purple-500/10" },
        ].map(({ label, value, color, bg }) => (
          <Card key={label} className={bg}>
            <CardContent className="pt-4 pb-4 text-center">
              <Clock className={`h-5 w-5 mx-auto mb-2 ${color}`} />
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {mandays && mandays.totalContracted > 0 && (
        <Card>
          <CardContent className="pt-5 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Used ({usedPct.toFixed(0)}%)</span>
                <span>{mandays.used} / {mandays.totalContracted} days</span>
              </div>
              <Progress value={usedPct} className={usedPct > 90 ? "[&>div]:bg-red-500" : usedPct > 75 ? "[&>div]:bg-amber-500" : ""} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Billed ({billedPct.toFixed(0)}%)</span>
                <span>{mandays.billed} / {mandays.totalContracted} days</span>
              </div>
              <Progress value={billedPct} className="[&>div]:bg-green-500" />
            </div>
            {unbilled > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-amber-400 font-medium">{unbilled} mandays used but not yet billed</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm">Update Mandays</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(d => updateMut.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Total Contracted</Label>
                <Input {...register("totalContracted")} type="number" min="0" step="0.5" defaultValue={mandays?.totalContracted} />
              </div>
              <div className="space-y-1">
                <Label>Used</Label>
                <Input {...register("used")} type="number" min="0" step="0.5" defaultValue={mandays?.used} />
              </div>
              <div className="space-y-1">
                <Label>Billed</Label>
                <Input {...register("billed")} type="number" min="0" step="0.5" defaultValue={mandays?.billed} />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} size="sm">
              <Save className="h-4 w-4" />{isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
