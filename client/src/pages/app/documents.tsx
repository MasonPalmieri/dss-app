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

  const { data: documents, isLoading } = useQuery<any[]>({
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
              ) : filteredDocs.length === 0 ? (
                <div className="p-16 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                  <p className="text-muted-foreground text-sm">No documents found</p>
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
                              <DropdownMenuItem><Bell className="h-4 w-4 mr-2" />Send Reminder</DropdownMenuItem>
                              <DropdownMenuItem><Download className="h-4 w-4 mr-2" />Download</DropdownMenuItem>
                              <DropdownMenuItem><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
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
