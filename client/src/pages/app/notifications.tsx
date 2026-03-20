import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Check, CheckCheck, FileText, UserCheck, AlertCircle, Clock, Send } from "lucide-react";
import { Link } from "wouter";

// mockApi seeds types: "signed", "viewed", "completed", "reminder"
// normalize any variation
function normalizeType(type: string) {
  if (!type) return "default";
  if (type.includes("sign")) return "signed";
  if (type.includes("view")) return "viewed";
  if (type.includes("complet")) return "completed";
  if (type.includes("declin")) return "declined";
  if (type.includes("remind")) return "reminder";
  if (type.includes("sent")) return "sent";
  return "default";
}

function getIcon(type: string) {
  const t = normalizeType(type);
  switch (t) {
    case "sent": return <Send className="h-4 w-4" />;
    case "signed": return <UserCheck className="h-4 w-4" />;
    case "completed": return <CheckCheck className="h-4 w-4" />;
    case "declined": return <AlertCircle className="h-4 w-4" />;
    case "reminder": return <Clock className="h-4 w-4" />;
    case "viewed": return <FileText className="h-4 w-4" />;
    default: return <Bell className="h-4 w-4" />;
  }
}

function getIconColor(type: string) {
  const t = normalizeType(type);
  switch (t) {
    case "sent": return "bg-blue-500/10 text-blue-500";
    case "signed": return "bg-green-500/10 text-green-500";
    case "completed": return "bg-emerald-500/10 text-emerald-500";
    case "declined": return "bg-red-500/10 text-red-500";
    case "reminder": return "bg-yellow-500/10 text-yellow-500";
    case "viewed": return "bg-purple-500/10 text-purple-500";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function Notifications() {
  const { user } = useAuth();

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications", "userId", String(user?.id || 1)],
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read-all", { userId: user?.id || 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            data-testid="mark-all-read"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              You'll see notifications here when there's activity on your documents
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {notifications.map((n: any) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors ${!n.read ? "bg-[#c8210d]/5" : ""}`}
                data-testid={`notification-${n.id}`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${getIconColor(n.type)}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? "font-medium" : ""}`}>{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      {n.documentId && (
                        <Link href={`/documents/${n.documentId}`}>
                          <span className="text-[10px] text-[#c8210d] hover:underline mt-0.5 inline-block">
                            View document →
                          </span>
                        </Link>
                      )}
                    </div>
                    {!n.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => markReadMutation.mutate(n.id)}
                        disabled={markReadMutation.isPending}
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                  </p>
                </div>
                {!n.read && <div className="h-2 w-2 rounded-full bg-[#c8210d] shrink-0 mt-2" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
