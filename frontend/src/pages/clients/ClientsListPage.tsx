import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Building2, Mail, User, Phone, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { clientsApi } from "@/api/clients.api";
import type { Client } from "@/types";

function ClientForm({ client, onClose }: { client?: Client; onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Partial<Client>>({
    defaultValues: client,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<Client>) =>
      client ? clientsApi.update(client.id, data) : clientsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); onClose(); },
  });

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <Label>Client Name *</Label>
          <Input {...register("name", { required: true })} placeholder="Acme Corp" />
        </div>
        <div className="space-y-1">
          <Label>Industry</Label>
          <Input {...register("industry")} placeholder="Technology" />
        </div>
        <div className="space-y-1">
          <Label>Contact Name</Label>
          <Input {...register("contactName")} placeholder="John Doe" />
        </div>
        <div className="space-y-1">
          <Label>Contact Email</Label>
          <Input {...register("contactEmail")} type="email" placeholder="john@acme.com" />
        </div>
        <div className="space-y-1">
          <Label>Phone Number</Label>
          <Input {...register("contactPhone")} type="tel" placeholder="+1 555 123 4567" />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Notes</Label>
          <Textarea {...register("notes")} placeholder="Additional notes..." rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : client ? "Update Client" : "Create Client"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ClientsListPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: clients, isLoading } = useQuery({ queryKey: ["clients"], queryFn: () => clientsApi.list() });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); setDeleteId(null); },
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Clients"
        description="Manage your client workspaces"
        actions={<Button onClick={() => { setEditClient(undefined); setFormOpen(true); }}><Plus className="h-4 w-4" />Add Client</Button>}
      />

      {!clients?.length ? (
        <EmptyState icon={Building2} title="No clients yet" description="Create your first client workspace to get started." action={{ label: "Add Client", onClick: () => setFormOpen(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => (
            <Card key={client.id} className="hover:border-primary/30 transition-colors group">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {client.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{client.name}</p>
                      {client.industry && <p className="text-xs text-muted-foreground">{client.industry}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditClient(client); setFormOpen(true); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => setDeleteId(client.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                  {client.contactName && (
                    <div className="flex items-center gap-2"><User className="h-3 w-3" />{client.contactName}</div>
                  )}
                  {client.contactEmail && (
                    <div className="flex items-center gap-2"><Mail className="h-3 w-3" />{client.contactEmail}</div>
                  )}
                  {client.contactPhone && (
                    <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{client.contactPhone}</div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{client._count?.projects || 0} projects</span>
                  <Link to={`/clients/${client.id}`} className="text-xs text-primary flex items-center gap-1 hover:underline">
                    View workspace <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={v => { if (!v) { setFormOpen(false); setEditClient(undefined); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editClient ? "Edit Client" : "New Client"}</DialogTitle>
          </DialogHeader>
          <ClientForm client={editClient} onClose={() => { setFormOpen(false); setEditClient(undefined); }} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={v => !v && setDeleteId(null)}
        title="Delete Client"
        description="This will permanently delete the client and all their projects. This action cannot be undone."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
