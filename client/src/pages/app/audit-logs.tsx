import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, FileText, Shield, Clock } from "lucide-react";

// Action label formatter — converts underscore format from mockApi
function formatAction(action: string) {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const ACTION_COLORS: Record<string, string> = {
  document_created: "bg-blue-500/10 text-blue-500",
  document_sent: "bg-green-500/10 text-green-500",
  document_viewed: "bg-yellow-500/10 text-yellow-500",
  document_signed: "bg-emerald-500/10 text-emerald-500",
  document_completed: "bg-green-600/10 text-green-600",
  document_voided: "bg-red-500/10 text-red-500",
  recipient_added: "bg-purple-500/10 text-purple-500",
};

export default function AuditLogs() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: logs = [] } = useQuery<any[]>({
    queryKey: ["/api/audit-logs", "userId", String(user?.id || 1)],
  });

  const filtered = logs.filter((log: any) => {
    const searchText = [log.action, log.actorName, log.actorEmail, log.ipAddress]
      .filter(Boolean).join(" ").toLowerCase();
    const matchesSearch = !search || searchText.includes(search.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = [...new Set(logs.map((l: any) => l.action))] as string[];

  // Latest event = most recent createdAt
  const latestDate = logs.length > 0
    ? new Date(Math.max(...logs.map((l: any) => new Date(l.createdAt).getTime()))).toLocaleDateString()
    : "—";

  const handleExport = () => {
    const csv = ["Timestamp,Action,Actor,Actor Email,IP Address,User Agent"]
      .concat(
        filtered.map(
          (l: any) =>
            `"${new Date(l.createdAt).toISOString()}","${l.action}","${l.actorName || ""}","${l.actorEmail || ""}","${l.ipAddress || ""}","${l.userAgent || ""}"`
        )
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">Track all activity across your documents</p>
        </div>
        <Button variant="outline" onClick={handleExport} data-testid="export-logs">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logs.length}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueActions.length}</p>
                <p className="text-xs text-muted-foreground">Event Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{latestDate}</p>
                <p className="text-xs text-muted-foreground">Latest Event</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by action, actor, or IP…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="audit-search"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-52" data-testid="audit-action-filter">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map((a) => (
              <SelectItem key={a} value={a}>{formatAction(a)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No audit logs found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-left">
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log: any) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50" data-testid={`audit-row-${log.id}`}>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-xs ${ACTION_COLORS[log.action] || "bg-muted text-muted-foreground"}`}>
                        {formatAction(log.action)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{log.actorName || "—"}</p>
                      <p className="text-xs text-muted-foreground">{log.actorEmail || ""}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden md:table-cell">
                      {log.ipAddress || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
