import { Link, useLocation } from "wouter";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function TopNav() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  const { data: notifications } = useQuery<any[]>({
    queryKey: ["/api/notifications", "userId", String(user?.id || 1)],
    enabled: !!user,
  });

  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const getPageTitle = () => {
    if (location === "/dashboard") return "Dashboard";
    if (location === "/documents") return "Documents";
    if (location.startsWith("/documents/")) return "Document Details";
    if (location === "/new-document") return "New Document";
    if (location === "/templates") return "Templates";
    if (location === "/contacts") return "Contacts";
    if (location === "/teams") return "Teams";
    if (location === "/audit-logs") return "Audit Logs";
    if (location === "/integrations") return "Integrations";
    if (location === "/billing") return "Billing";
    if (location === "/settings") return "Settings";
    if (location === "/notifications") return "Notifications";
    return "";
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4" data-testid="top-nav">
      <SidebarTrigger className="-ml-1" />
      <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)} data-testid="theme-toggle">
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative" data-testid="notifications-btn">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-[#c8210d]">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </Link>
      </div>
    </header>
  );
}
