import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Send, Download, MoreHorizontal, Clock, CheckCircle2,
  Eye, XCircle, FileText, Mail, PenTool, AlertCircle, RefreshCw,
  Shield, Users, CalendarClock, Loader2,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { generateSignedPdf } from "@/lib/generateSignedPdf";

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: any }> = {
  completed:  { label: "Completed",  className: "bg-green-500/15 text-green-600 border-green-500/20",   icon: CheckCircle2 },
  pending:    { label: "Pending",    className: "bg-yellow-500/15 text-yellow-600 border-yellow-500/20", icon: Clock },
  draft:      { label: "Draft",      className: "bg-slate-500/15 text-slate-500 border-slate-500/20",   icon: FileText },
  declined:   { label: "Declined",   className: "bg-red-500/15 text-red-600 border-red-500/20",         icon: XCircle },
  voided:     { label: "Voided",     className: "bg-red-500/15 text-red-500 border-red-500/20",         icon: AlertCircle },
  signed:     { label: "Signed",     className: "bg-green-500/15 text-green-600 border-green-500/20",   icon: CheckCircle2 },
  viewed:     { label: "Viewed",     className: "bg-blue-500/15 text-blue-500 border-blue-500/20",      icon: Eye },
  sent:       { label: "Sent",       className: "bg-blue-500/15 text-blue-500 border-blue-500/20",      icon: Send },
};

const ACTION_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  document_created:   { label: "Document created",             icon: FileText,     color: "#6b7280" },
  document_sent:      { label: "Document sent to recipients",  icon: Send,         color: "#3b82f6" },
  document_viewed:    { label: "Document viewed",              icon: Eye,          color: "#8b5cf6" },
  document_signed:    { label: "Document signed",              icon: PenTool,      color: "#22c55e" },
  document_completed: { label: "All parties signed — complete",icon: CheckCircle2, color: "#22c55e" },
  document_declined:  { label: "Document declined",            icon: XCircle,      color: "#ef4444" },
  document_voided:    { label: "Document voided",              icon: AlertCircle,  color: "#f97316" },
  reminder_sent:      { label: "Reminder sent",                icon: Mail,         color: "#6b7280" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

export default function DocumentDetailPage() {
  const [, params] = useRoute("/documents/:id");
  const docId = params?.id;
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const pdfBytes = await generateSignedPdf(Number(docId));
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc?.title || 'document'}-signed.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({ title: 'Download failed', description: err.message, variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  const { data: doc, isLoading } = useQuery<any>({
    queryKey: [`/api/documents/${docId}`],
    enabled: !!docId,
    refetchInterval: 15000, // poll every 15s for live updates
  });

  const { data: recipients } = useQuery<any[]>({
    queryKey: [`/api/documents/${docId}/recipients`],
    enabled: !!docId,
    refetchInterval: 15000,
  });

  const { data: auditLogs } = useQuery<any[]>({
    queryKey: [`/api/audit-logs/document/${docId}`],
    enabled: !!docId,
    refetchInterval: 15000,
  });

  const sendMutation = useMutation({
    mutationFn: async () => { await apiRequest("POST", `/api/documents/${docId}/send`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${docId}`] });
      toast({ title: "Document sent to all recipients" });
    },
  });

  const remindMutation = useMutation({
    mutationFn: async () => { await apiRequest("POST", `/api/documents/${docId}/remind`); },
    onSuccess: () => toast({ title: "Reminder sent to pending signers" }),
  });

  const voidMutation = useMutation({
    mutationFn: async () => { await apiRequest("POST", `/api/documents/${docId}/void`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${docId}`] });
      toast({ title: "Document voided" });
    },
  });

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  if (!doc) return (
    <div className="text-center py-16">
      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">Document not found</p>
      <Link href="/documents"><Button variant="link" className="mt-2">Back to documents</Button></Link>
    </div>
  );

  const signedCount = recipients?.filter((r: any) => r.status === "signed").length || 0;
  const totalSigners = recipients?.filter((r: any) => r.role === "signer").length || 0;
  const progress = totalSigners > 0 ? Math.round((signedCount / totalSigners) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/documents">
            <Button variant="ghost" size="icon" className="mt-0.5"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold">{doc.title}</h2>
              <StatusBadge status={doc.status} />
            </div>
            {doc.fileName && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {doc.fileName} {doc.fileSize && `· ${doc.fileSize}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {doc.status === "draft" && (
            <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending}>
              <Send className="h-4 w-4 mr-2" />
              Send Document
            </Button>
          )}
          {doc.status === "pending" && (
            <Button variant="outline" onClick={() => remindMutation.mutate()} disabled={remindMutation.isPending}>
              <Mail className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownload} disabled={downloading}>
                {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { queryClient.invalidateQueries({ queryKey: [`/api/documents/${docId}`] }); toast({ title: "Status refreshed" }); }}>
                <RefreshCw className="h-4 w-4 mr-2" />Refresh Status
              </DropdownMenuItem>
              {doc.status === "pending" && (
                <DropdownMenuItem className="text-destructive" onClick={() => voidMutation.mutate()}>
                  <XCircle className="h-4 w-4 mr-2" />Void Document
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress bar for pending docs */}
      {doc.status === "pending" && totalSigners > 0 && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Signing Progress</span>
              <span className="text-sm text-muted-foreground">{signedCount} of {totalSigners} signed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Recipients */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Recipients
                </CardTitle>
                <span className="text-xs text-muted-foreground">{recipients?.length || 0} total</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!recipients || recipients.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No recipients added</div>
              ) : (
                <div className="divide-y">
                  {[...recipients].sort((a: any, b: any) => (a.signingOrder || 0) - (b.signingOrder || 0)).map((r: any, i: number) => {
                    const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                    const Icon = cfg.icon;
                    return (
                      <div key={r.id} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Order badge */}
                          <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: r.color || "#3b82f6" }}>
                            {r.signingOrder || i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{r.name}</p>
                            <p className="text-xs text-muted-foreground">{r.email}</p>
                            {r.viewedAt && <p className="text-[10px] text-muted-foreground mt-0.5">Viewed {new Date(r.viewedAt).toLocaleString()}</p>}
                            {r.signedAt && <p className="text-[10px] text-green-600 mt-0.5">Signed {new Date(r.signedAt).toLocaleString()}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">{r.role}</Badge>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.className}`}>
                            <Icon className="h-2.5 w-2.5" />
                            {cfg.label}
                          </span>
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
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!auditLogs || auditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No activity recorded yet</p>
              ) : (
                <div className="relative">
                  {auditLogs.map((log: any, i: number) => {
                    const cfg = ACTION_CONFIG[log.action] || { label: log.action?.replace(/_/g, " "), icon: FileText, color: "#6b7280" };
                    const Icon = cfg.icon;
                    const isLast = i === auditLogs.length - 1;
                    return (
                      <div key={log.id} className="flex gap-4 relative">
                        {/* Connector line */}
                        {!isLast && (
                          <div className="absolute left-[15px] top-8 w-px bg-border" style={{ height: "calc(100% - 8px)" }} />
                        )}
                        {/* Icon */}
                        <div className="shrink-0 mt-1">
                          <div className="h-8 w-8 rounded-full border-2 border-background flex items-center justify-center" style={{ backgroundColor: `${cfg.color}20` }}>
                            <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                          </div>
                        </div>
                        {/* Content */}
                        <div className="pb-6 flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight">{cfg.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {log.actorName && <span className="font-medium text-foreground/70">{log.actorName}</span>}
                            {log.actorEmail && <span className="ml-1 opacity-60">({log.actorEmail})</span>}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            {log.createdAt && (
                              <span className="text-[11px] text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString()}
                              </span>
                            )}
                            {log.ipAddress && (
                              <span className="text-[11px] text-muted-foreground font-mono">
                                {log.ipAddress}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                Document Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Status",    value: <StatusBadge status={doc.status} /> },
                { label: "Created",   value: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "—" },
                { label: "Sent",      value: doc.sentAt ? new Date(doc.sentAt).toLocaleDateString() : "—" },
                { label: "Completed", value: doc.completedAt ? new Date(doc.completedAt).toLocaleDateString() : "—" },
                { label: "Expires",   value: doc.expiresAt ? new Date(doc.expiresAt).toLocaleDateString() : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                  <span className="text-xs font-medium text-right">{value}</span>
                </div>
              ))}
              {doc.subject && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Subject</p>
                    <p className="text-xs">{doc.subject}</p>
                  </div>
                </>
              )}
              {doc.message && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Message</p>
                  <p className="text-xs">{doc.message}</p>
                </div>
              )}
              <Separator />
              <Button
                variant="outline"
                className="w-full text-sm"
                data-testid="download-doc"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                {downloading ? 'Generating PDF...' : 'Download PDF'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
