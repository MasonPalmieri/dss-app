import { Link, useLocation } from "wouter";
import dssWordmark from "@assets/dss-wordmark.jpg";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  UserPlus,
  Shield,
  Puzzle,
  CreditCard,
  Settings,
  Plus,
  LogOut,
  ChevronUp,
  QrCode,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Documents", icon: FileText, href: "/documents" },
  { label: "Templates", icon: FolderOpen, href: "/templates" },
  { label: "Mass Signature", icon: QrCode, href: "/mass-signature", highlight: true },
  { label: "Contacts", icon: Users, href: "/contacts" },
  { label: "Teams", icon: UserPlus, href: "/teams" },
  { label: "Audit Logs", icon: Shield, href: "/audit-logs" },
  { label: "Integrations", icon: Puzzle, href: "/integrations" },
  { label: "Billing", icon: CreditCard, href: "/billing" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-3 pb-2">
        <Link href="/dashboard" data-testid="sidebar-logo">
          <img
            src={dssWordmark}
            alt="DraftSendSign"
            className="w-full rounded-md object-contain"
            style={{ maxHeight: 52, objectPosition: "left center" }}
          />
        </Link>
        <Link href="/new-document">
          <Button
            className="w-full mt-3 bg-[#c8210d] hover:bg-[#a61b0b] text-white font-semibold"
            data-testid="new-document-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.href || location.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link
                        href={item.href}
                        data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                        style={(item as any).highlight && !isActive ? { color: "#c8210d" } : {}}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {(item as any).highlight && !isActive && (
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#c8210d15", color: "#c8210d" }}>NEW</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors"
              data-testid="user-menu-trigger"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c8210d] text-white text-xs font-bold">
                {user?.avatarInitials || user?.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase() || "MP"}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-sidebar-primary-foreground truncate">
                  {user?.fullName || "Mason Palmieri"}
                </p>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] h-4 px-1 border-sidebar-border text-sidebar-foreground/60">
                    {user?.plan || "starter"}
                  </Badge>
                </div>
              </div>
              <ChevronUp className="h-4 w-4 text-sidebar-foreground/50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} data-testid="logout-btn">
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
