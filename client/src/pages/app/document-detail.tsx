import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Send,
  Download,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  Eye,
  XCircle,
  FileText,
  Mail,
  PenTool,
  AlertCircle,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  completed: "status-completed",
  pending: "status-pending",
  draft: "status-draft",
  declined: "status-declined",
  voided: "status-voided",
  signed: "status-signed",
  viewed: "status-viewed",
  sent: "status-sent",
};

const recipientStatusIcons: Record<string, any> = {
  signed: CheckCircle2,
  viewed: Eye,
  pending: Clock,
  sent: Send,
  declined: XCircle,
};

const activityIcons: Record<string, any> = {
  document_created: FileText,
  document_sent: Send,
  document_viewed: Eye,
  document_signed: PenTool,
  document_completed: CheckCircle2,
  document_declined: XCircle,
  document_voided: AlertCircle,
};

export default function DocumentDetailPage() {
  const [, params] = useRoute("/documents/:id");
  const docId = params?.id;
  const { toast } = useToast();

  const { data: doc, isLoading } = useQuery<any>({
    queryKey: [`/api/documents/${docId}`],
    enabled: !!docId,
  });

  const { data: recipients } = useQuery<any[]>({
    queryKey: [`/api/documents/${docId}/recipients`],
    enabled: !!docId,
  });

  const { data: auditLogs } = useQuery<any[]>({
    queryKey: [`/api/audit-logs/document/${docId}`],
    enabled: !!docId,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/documents/${docId}/send`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${docId}`] });
      toast({ title: "Document sent!" });
    },
  });

  const voidMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/documents/${docId}/void`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${docId}`] });
      toast({ title: "Document voided" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Document not found</p>
        <Link href="/documents"><Button variant="link" className="mt-2">Back to documents</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/documents">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{doc.title}</h2>
              <Badge className={statusColors[doc.status] || "status-draft"} variant="secondary">
                {doc.status}
              </Badge>
            </div>
            {doc.fileName && <p className="text-sm text-muted-foreground">{doc.fileName} {doc.fileSize && `(${doc.fileSize})`}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {doc.status === "draft" && (
            <Button
              className="bg-[#c8210d] hover:bg-[#a61b0b] text-white"
              onClick={() => sendMutation.mutate()}
              disabled={sendMutation.isPending}
              data-testid="send-doc-btn"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Document
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Download className="h-4 w-4 mr-2" />Download</DropdownMenuItem>
              {doc.status === "pending" && (
                <DropdownMenuItem className="text-destructive" onClick={() => voidMutation.mutate()}>
                  <XCircle className="h-4 w-4 mr-2" />Void Document
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recipients */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recipients</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!recipients || recipients.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No recipients added</div>
              ) : (
                <div className="divide-y">
                  {recipients.map((r: any) => {
                    const StatusIcon = recipientStatusIcons[r.status] || Clock;
                    return (
                      <div key={r.id} className="flex items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold"
                            style={{ backgroundColor: r.color || "#3b82f6" }}
                          >
                            {r.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{r.name}</p>
                            <p className="text-xs text-muted-foreground">{r.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">{r.role}</Badge>
                          <Badge className={statusColors[r.status] || "status-pending"} variant="secondary">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {r.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {!auditLogs || auditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
              ) : (
                <div className="space-y-0">
                  {auditLogs.map((log: any, i: number) => {
                    const Icon = activityIcons[log.action] || FileText;
                    return (
                      <div key={log.id} className="flex gap-3 relative">
                        {i < auditLogs.length - 1 && (
                          <div className="absolute left-[11px] top-8 w-0.5 h-full bg-border" />
                        )}
                        <div className="mt-1 shrink-0">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                            <Icon className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="pb-6">
                          <p className="text-sm">
                            <span className="font-medium">{log.actorName || "System"}</span>{" "}
                            {log.action?.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                            {log.ipAddress && ` · ${log.ipAddress}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Document Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "-"}</p>
              </div>
              {doc.sentAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Sent</p>
                  <p className="text-sm">{new Date(doc.sentAt).toLocaleDateString()}</p>
                </div>
              )}
              {doc.completedAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-sm">{new Date(doc.completedAt).toLocaleDateString()}</p>
                </div>
              )}
              {doc.expiresAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Expires</p>
                  <p className="text-sm">{new Date(doc.expiresAt).toLocaleDateString()}</p>
                </div>
              )}
              {doc.subject && (
                <div>
                  <p className="text-xs text-muted-foreground">Subject</p>
                  <p className="text-sm">{doc.subject}</p>
                </div>
              )}
              {doc.message && (
                <div>
                  <p className="text-xs text-muted-foreground">Message</p>
                  <p className="text-sm">{doc.message}</p>
                </div>
              )}
              <Separator />
              <Button variant="outline" className="w-full" data-testid="download-doc">
                <Download className="h-4 w-4 mr-2" />
                Download Document
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
