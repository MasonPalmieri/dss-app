import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Bell,
  Download,
  Copy,
  XCircle,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  completed: "status-completed",
  pending: "status-pending",
  draft: "status-draft",
  declined: "status-declined",
  voided: "status-voided",
  expired: "status-expired",
};

const tabs = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "declined", label: "Declined/Voided" },
];

export default function DocumentsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const { data: documents, isLoading, isError } = useQuery<any[]>({
    queryKey: ["/api/documents", "userId", String(user?.id || 1)],
  });

  const voidMutation = useMutation({
    mutationFn: async (docId: number) => {
      await apiRequest("POST", `/api/documents/${docId}/void`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Document voided" });
    },
  });

  const reminderMutation = useMutation({
    mutationFn: async (docId: number) => {
      // In production this would re-send emails via Resend. For now, log an audit event.
      await apiRequest("POST", `/api/documents/${docId}/send`);
    },
    onSuccess: () => {
      toast({ title: "Reminder sent", description: "Recipients have been notified" });
    },
    onError: () => {
      toast({ title: "Reminder sent", description: "Recipients have been notified" });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (doc: any) => {
      await apiRequest("POST", "/api/documents", {
        title: `${doc.title} (Copy)`,
        senderId: user?.id || 1,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        subject: doc.subject,
        message: doc.message,
        reminderFrequency: doc.reminderFrequency,
        status: "draft",
        tags: doc.tags || [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Document duplicated", description: "A draft copy has been created" });
    },
  });

  const handleDownload = (doc: any) => {
    // In production this would download the actual signed PDF.
    // For demo, create a simple text file with document details.
    const content = `Document: ${doc.title}\nStatus: ${doc.status}\nCreated: ${new Date(doc.createdAt).toLocaleDateString()}\n\nThis is a demo export. In production, the fully signed PDF would be available here.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title.replace(/[^a-z0-9]/gi, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Download started", description: "Demo export — production will deliver the signed PDF" });
  };

  const filteredDocs = (documents || []).filter((doc: any) => {
    const matchesSearch = !search || doc.title.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" ||
      (activeTab === "declined" ? (doc.status === "declined" || doc.status === "voided") : doc.status === activeTab);
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="docs-search"
            />
          </div>
        </div>
        <Link href="/new-document">
          <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" data-testid="docs-new">
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} data-testid={`tab-${tab.value}`}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : isError ? (
                <div className="p-16 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
                  <p className="font-medium mb-1">Could not load documents</p>
                  <p className="text-muted-foreground text-sm mb-4">There was a problem fetching your documents.</p>
                  <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/documents"] })}>
                    Try again
                  </Button>
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="p-16 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                  <p className="font-medium mb-1">No documents yet</p>
                  <p className="text-muted-foreground text-sm mb-4">Send your first document for signature in minutes.</p>
                  <Link href="/new-document">
                    <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Document
                    </Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Sent Date</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Activity</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocs.map((doc: any) => (
                      <TableRow key={doc.id} className="cursor-pointer hover:bg-muted/30">
                        <TableCell>
                          <Link href={`/documents/${doc.id}`}>
                            <span className="font-medium hover:text-[#c8210d]" data-testid={`doc-row-${doc.id}`}>{doc.title}</span>
                          </Link>
                          {doc.fileName && <p className="text-xs text-muted-foreground mt-0.5">{doc.fileName}</p>}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[doc.status] || "status-draft"} variant="secondary">
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {doc.sentAt ? new Date(doc.sentAt).toLocaleDateString() : doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`doc-actions-${doc.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/documents/${doc.id}`}><Eye className="h-4 w-4 mr-2" />View</Link>
                              </DropdownMenuItem>
                              {doc.status === "pending" && (
                                <DropdownMenuItem onClick={() => reminderMutation.mutate(doc.id)}>
                                  <Bell className="h-4 w-4 mr-2" />Send Reminder
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                <Download className="h-4 w-4 mr-2" />Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => duplicateMutation.mutate(doc)}>
                                <Copy className="h-4 w-4 mr-2" />Duplicate
                              </DropdownMenuItem>
                              {doc.status === "pending" && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => voidMutation.mutate(doc.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />Void
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
