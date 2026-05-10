import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, Users, DollarSign, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { projectsApi } from "@/api/projects.api";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#6366f1", "#a78bfa", "#22c55e", "#f59e0b"];

function StatCard({ icon: Icon, label, value, sub, color }: { icon: typeof DollarSign; label: string; value: string; sub?: string; color: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-0.5">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`rounded-lg p-2.5 ${color}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardTab({ projectId }: { projectId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", projectId],
    queryFn: () => projectsApi.dashboard(projectId),
  });

  if (isLoading) return <PageLoader />;
  if (!data) return null;

  const { financials, resources, topRisks, mandays } = data;

  const financialChartData = [
    { name: "Budget", value: financials.totalBudget },
    { name: "Forecasted", value: financials.totalForecasted },
    { name: "Invoiced", value: financials.totalInvoiced },
    { name: "Collected", value: financials.totalCollected },
  ];

  const pieData = [
    { name: "Collected", value: financials.totalCollected },
    { name: "Invoiced", value: Math.max(0, financials.totalInvoiced - financials.totalCollected) },
    { name: "Forecasted", value: Math.max(0, financials.totalForecasted - financials.totalInvoiced) },
    { name: "Pending", value: financials.totalPending },
  ].filter(d => d.value > 0);

  const collectionRate = financials.totalForecasted > 0
    ? Math.round((financials.totalCollected / financials.totalForecasted) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Budget" value={formatCurrency(financials.totalBudget)} color="bg-violet-600" />
        <StatCard icon={DollarSign} label="Forecasted" value={formatCurrency(financials.totalForecasted)} color="bg-blue-600" />
        <StatCard icon={DollarSign} label="Invoiced" value={formatCurrency(financials.totalInvoiced)} color="bg-amber-600" />
        <StatCard icon={DollarSign} label="Collected" value={formatCurrency(financials.totalCollected)} sub={`${collectionRate}% collection rate`} color="bg-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">Financial Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={financialChartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Revenue Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span>{formatCurrency(d.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />Top Risks & Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topRisks.length ? topRisks.map(r => (
              <div key={r.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={r.type} />
                    <span className="text-xs text-muted-foreground">Impact: <span className="font-medium">{r.impact}</span></span>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">No open risks</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Resource Utilization</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {resources.length ? resources.slice(0, 4).map(r => (
                <div key={r.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-muted-foreground">{r.utilizationPct}% · {formatCurrency(r.computedWeeklyCost)}/wk</span>
                  </div>
                  <Progress value={r.utilizationPct} className="h-1.5" />
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-2">No resources assigned</p>
              )}
            </CardContent>
          </Card>

          {mandays && (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-amber-400" />Mandays</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[
                    { label: "Contracted", value: mandays.totalContracted },
                    { label: "Used", value: mandays.used },
                    { label: "Remaining", value: mandays.remaining },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                <Progress value={mandays.totalContracted > 0 ? (mandays.used / mandays.totalContracted) * 100 : 0} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {mandays.billed} billed · {mandays.used - mandays.billed} unbilled
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
