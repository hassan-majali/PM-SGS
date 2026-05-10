import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Package, DollarSign, Users, FileText, ActivitySquare, AlertTriangle, Clock, Settings } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { projectsApi } from "@/api/projects.api";
import { formatCurrency } from "@/lib/utils";
import { DashboardTab } from "./tabs/DashboardTab";
import { DeliverablesTab } from "./tabs/DeliverablesTab";
import { FinancialsTab } from "./tabs/FinancialsTab";
import { ResourcesTab } from "./tabs/ResourcesTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { ActivityLogTab } from "./tabs/ActivityLogTab";
import { RisksTab } from "./tabs/RisksTab";
import { MandaysTab } from "./tabs/MandaysTab";

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "deliverables", label: "Deliverables", icon: Package },
  { value: "financials", label: "Financials", icon: DollarSign },
  { value: "resources", label: "Resources", icon: Users },
  { value: "documents", label: "Documents", icon: FileText },
  { value: "activity", label: "Activity Log", icon: ActivitySquare },
  { value: "risks", label: "Risks & Issues", icon: AlertTriangle },
  { value: "mandays", label: "Mandays", icon: Clock },
];

export function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
  });

  if (isLoading) return <PageLoader />;
  if (!project) return <div className="p-6">Project not found</div>;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={project.name}
        breadcrumbs={[
          { label: "Projects", to: "/projects" },
          { label: project.client?.name || "", to: `/clients/${project.clientId}` },
          { label: project.name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <p className="text-muted-foreground">Budget</p>
              <p className="font-semibold">{formatCurrency(project.budget)}</p>
            </div>
            <StatusBadge status={project.status} />
          </div>
        }
      />

      <div className="flex-1 px-6 overflow-hidden">
        <Tabs defaultValue="dashboard" className="h-full flex flex-col">
          <TabsList className="flex-shrink-0 flex-wrap h-auto gap-1 mb-2">
            {tabs.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-1.5 text-xs">
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto pb-6">
            <TabsContent value="dashboard"><DashboardTab projectId={id!} /></TabsContent>
            <TabsContent value="deliverables"><DeliverablesTab projectId={id!} /></TabsContent>
            <TabsContent value="financials"><FinancialsTab projectId={id!} /></TabsContent>
            <TabsContent value="resources"><ResourcesTab projectId={id!} /></TabsContent>
            <TabsContent value="documents"><DocumentsTab projectId={id!} /></TabsContent>
            <TabsContent value="activity"><ActivityLogTab projectId={id!} project={project} /></TabsContent>
            <TabsContent value="risks"><RisksTab projectId={id!} /></TabsContent>
            <TabsContent value="mandays"><MandaysTab projectId={id!} /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
