import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { FileText, Trash2, Download, Upload, File, FileImage, FileArchive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { documentsApi } from "@/api/documents.api";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { Document } from "@/types";

function fileIcon(mime?: string) {
  if (!mime) return File;
  if (mime.startsWith("image/")) return FileImage;
  if (mime.includes("zip") || mime.includes("archive")) return FileArchive;
  return FileText;
}

export function DocumentsTab({ projectId }: { projectId: string }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  const { data: docs, isLoading } = useQuery({
    queryKey: ["documents", projectId],
    queryFn: () => documentsApi.list(projectId),
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => documentsApi.upload(projectId, file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documents", projectId] }); setUploading(false); },
    onError: () => setUploading(false),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => documentsApi.remove(projectId, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documents", projectId] }); setDeleteId(null); },
  });

  const onDrop = useCallback((files: File[]) => {
    for (const file of files) {
      setUploading(true);
      uploadMut.mutate(file);
    }
  }, [uploadMut]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/20"}`}
      >
        <input {...getInputProps()} />
        <Upload className={`h-8 w-8 mx-auto mb-3 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
        <p className="font-medium text-sm">{isDragActive ? "Drop files here" : "Drag & drop files here"}</p>
        <p className="text-xs text-muted-foreground mt-1">or click to browse files</p>
        {uploading && <p className="text-xs text-primary mt-2 animate-pulse">Uploading...</p>}
      </div>

      {!docs?.length ? (
        <EmptyState icon={FileText} title="No documents yet" description="Upload project documents by dragging them above." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {docs.map(doc => {
            const Icon = fileIcon(doc.mimeType);
            return (
              <Card key={doc.id} className="group hover:border-primary/30 transition-colors">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.sizeBytes ? formatFileSize(doc.sizeBytes) : "—"} · {formatDate(doc.createdAt)}
                      </p>
                      {doc.uploadedBy && <p className="text-xs text-muted-foreground">{doc.uploadedBy}</p>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="ghost" className="h-7 w-7"><Download className="h-3 w-3" /></Button>
                      </a>
                      <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => setDeleteId(doc.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)} title="Delete Document"
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)} loading={deleteMut.isPending} />
    </div>
  );
}
