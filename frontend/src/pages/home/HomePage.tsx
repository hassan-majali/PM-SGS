import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FolderKanban, Building2, Lightbulb, TrendingUp, AlertTriangle, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { projectsApi } from "@/api/projects.api";
import { clientsApi } from "@/api/clients.api";
import { initiativesApi } from "@/api/initiatives.api";
import { formatCurrency, formatDate } from "@/lib/utils";

function StatCard({ icon: Icon, label, value, sub, color }: { icon: typeof FolderKanban; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <Card className="stat-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`rounded-xl p-3 ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HomePage() {
  const { data: projects, isLoading: loadingP } = useQuery({ queryKey: ["projects"], queryFn: () => projectsApi.list() });
  const { data: clients, isLoading: loadingC } = useQuery({ queryKey: ["clients"], queryFn: () => clientsApi.list() });
  const { data: initiatives, isLoading: loadingI } = useQuery({ queryKey: ["initiatives"], queryFn: () => initiativesApi.list() });

  if (loadingP || loadingC || loadingI) return <PageLoader />;

  const activeProjects = projects?.filter(p => p.status === "ACTIVE") || [];
  const qualifiedInitiatives = initiatives?.filter(i => i.qualificationDecision === "QUALIFIED") || [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Dashboard" description="Overview of your project management portfolio" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total Clients" value={clients?.length || 0} color="bg-blue-600" />
        <StatCard icon={FolderKanban} label="Active Projects" value={activeProjects.length} sub={`${projects?.length || 0} total`} color="bg-violet-600" />
        <StatCard icon={Lightbulb} label="Initiatives" value={initiatives?.length || 0} sub={`${qualifiedInitiatives.length} qualified`} color="bg-amber-600" />
        <StatCard icon={TrendingUp} label="Total Projects" value={projects?.length || 0} color="bg-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Projects</CardTitle>
            <Link to="/projects" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects?.slice(0, 5).map(p => (
              <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.client?.name} · {formatDate(p.endDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatCurrency(p.budget)}</span>
                  <StatusBadge status={p.status} />
                </div>
              </Link>
            ))}
            {!projects?.length && <p className="text-sm text-muted-foreground text-center py-4">No projects yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Initiatives</CardTitle>
            <Link to="/initiatives" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {initiatives?.slice(0, 5).map(i => (
              <Link key={i.id} to={`/initiatives/${i.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">{i.owner} · {i.client?.name || "No client"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {i.expectedRevenue && <span className="text-xs text-muted-foreground">{formatCurrency(i.expectedRevenue)}</span>}
                  <StatusBadge status={i.qualificationDecision} />
                </div>
              </Link>
            ))}
            {!initiatives?.length && <p className="text-sm text-muted-foreground text-center py-4">No initiatives yet</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {activeProjects.slice(0, 3).map(p => (
          <Link key={p.id} to={`/projects/${p.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FolderKanban className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.manager}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{p._count?.resources || 0}</span>
                      <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{p._count?.risks || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
