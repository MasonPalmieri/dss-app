import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { mockApi } from "@/lib/mockApi";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Send,
  Clock,
  CheckCircle2,
  FileEdit,
  Plus,
  FolderOpen,
  ArrowRight,
  FileText,
  Eye,
  PenTool,
  XCircle,
  MoreHorizontal,
  X,
  AlertCircle,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors: Record<string, string> = {
  completed: "status-completed",
  pending: "status-pending",
  draft: "status-draft",
  declined: "status-declined",
  voided: "status-voided",
  expired: "status-expired",
};

const activityIcons: Record<string, any> = {
  document_created: FileEdit,
  document_sent: Send,
  document_viewed: Eye,
  document_signed: PenTool,
  document_completed: CheckCircle2,
  document_declined: XCircle,
};

const onboardingSteps = [
  {
    title: "Upload your first document",
    description: "Choose a PDF or Word file to get started.",
    href: "/new-document",
    cta: true,
  },
  {
    title: "Add recipients and send for signature",
    description: "Enter your signers' email addresses and assign fields for them to complete.",
  },
  {
    title: "Download the signed copy",
    description: "Once all parties have signed, download the fully executed document.",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const userId = String(user?.id || 1);
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);

  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery<any>({
    queryKey: ["/api/stats", userId],
    queryFn: () => mockApi.getStats(userId),
    enabled: !!userId && userId !== "1",
  });

  const { data: documents, isLoading: docsLoading } = useQuery<any[]>({
    queryKey: ["/api/documents", userId],
    queryFn: () => mockApi.getDocuments(userId),
    enabled: !!userId && userId !== "1",
  });

  const { data: auditLogs } = useQuery<any[]>({
    queryKey: ["/api/audit-logs", userId],
    queryFn: () => mockApi.getAuditLogsByUser(userId),
    enabled: !!userId && userId !== "1",
  });

  const statCards = [
    { label: "Sent This Month", value: stats?.total ?? 0, icon: Send, color: "text-blue-600" },
    { label: "Pending Signatures", value: stats?.pending ?? 0, icon: Clock, color: "text-orange-500" },
    { label: "Completed", value: stats?.completed ?? 0, icon: CheckCircle2, color: "text-green-600" },
    { label: "Drafts", value: stats?.draft ?? 0, icon: FileEdit, color: "text-gray-500" },
  ];

  const recentDocs = (documents || []).slice(0, 5);
  const recentActivity = (auditLogs || []).slice(0, 8);

  const showOnboarding = !dismissedOnboarding && (!documents || documents.length === 0);
  const onboardingProgress = 0; // Step 1 is always next for a new user

  return (
    <div className="space-y-6">

      {/* Onboarding Checklist — shown only when user has 0 documents */}
      {showOnboarding && (
        <Card className="border-[#c8210d]/20 bg-[#c8210d]/[0.03]">
          <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Welcome to DraftSendSign 👋
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Get up and running in 3 easy steps.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setDismissedOnboarding(true)}
              aria-label="Dismiss onboarding"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <Progress value={onboardingProgress} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                0 of 3 complete
              </span>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {onboardingSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 rounded-lg p-3 ${
                    idx === 0
                      ? "bg-background border border-[#c8210d]/20"
                      : "opacity-60"
                  }`}
                >
                  <div
                    className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      idx === 0
                        ? "bg-[#c8210d] text-white"
                        : "bg-muted text-muted-foreground border"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link href="/new-document">
              <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white w-full sm:w-auto">
                <Send className="h-4 w-4 mr-2" />
                Send Your First Document
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : statsError ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-xs">Failed to load</p>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/new-document">
          <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" data-testid="dash-new-doc">
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
        </Link>
        <Link href="/templates">
          <Button variant="outline" data-testid="dash-templates">
            <FolderOpen className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Recent Documents</CardTitle>
              <Link href="/documents">
                <Button variant="ghost" size="sm" className="text-xs">View all <ArrowRight className="h-3 w-3 ml-1" /></Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {docsLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : recentDocs.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm">No documents yet</p>
                  <Link href="/new-document"><Button variant="link" size="sm" className="text-[#c8210d] mt-1">Create your first document</Button></Link>
                </div>
              ) : (
                <div className="divide-y">
                  {recentDocs.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <Link href={`/documents/${doc.id}`}>
                            <p className="text-sm font-medium truncate hover:text-[#c8210d] cursor-pointer">{doc.title}</p>
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[doc.status] || "status-draft"} variant="secondary">
                          {doc.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link href={`/documents/${doc.id}`}>View</Link></DropdownMenuItem>
                            <DropdownMenuItem>Download</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivity.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No recent activity</div>
            ) : (
              <div className="divide-y">
                {recentActivity.map((log: any) => {
                  const Icon = activityIcons[log.action] || FileText;
                  return (
                    <div key={log.id} className="px-4 py-3 flex gap-3">
                      <div className="mt-0.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{log.actorName || "System"}</span>{" "}
                          <span className="text-muted-foreground">{log.action?.replace(/_/g, " ")}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
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
    </div>
  );
}
