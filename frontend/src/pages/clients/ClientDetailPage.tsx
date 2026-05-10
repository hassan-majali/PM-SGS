import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, Lightbulb, ArrowRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { clientsApi } from "@/api/clients.api";
import { formatCurrency, formatDate } from "@/lib/utils";

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: client, isLoading } = useQuery({
    queryKey: ["clients", id],
    queryFn: () => clientsApi.get(id!),
    enabled: !!id,
  });

  if (isLoading) return <PageLoader />;
  if (!client) return <div className="p-6">Client not found</div>;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={client.name}
        description={client.industry}
        breadcrumbs={[{ label: "Clients", to: "/clients" }, { label: client.name }]}
        actions={
          <div className="flex gap-2">
            <Link to={`/projects?clientId=${client.id}`}>
              <Button variant="outline"><Plus className="h-4 w-4" />New Project</Button>
            </Link>
            <Link to={`/initiatives?clientId=${client.id}`}>
              <Button variant="outline"><Plus className="h-4 w-4" />New Initiative</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-primary" />Projects
            </CardTitle>
            <Link to={`/projects?clientId=${client.id}`} className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {client.projects?.length ? client.projects.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.manager} · Due {formatDate(p.endDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatCurrency(p.budget)}</span>
                  <StatusBadge status={p.status} />
                </div>
              </Link>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-6">No projects yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />Initiatives
            </CardTitle>
            <Link to={`/initiatives?clientId=${client.id}`} className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {client.initiatives?.length ? client.initiatives.map(i => (
              <Link key={i.id} to={`/initiatives/${i.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">{i.owner} · {i.type}</p>
                </div>
                <StatusBadge status={i.qualificationDecision} />
              </Link>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-6">No initiatives yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
