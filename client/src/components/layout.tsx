import React from "react";
import { Link } from "wouter";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import { useAuth } from "@/contexts/auth-context";

function FreePlanBanner() {
  const { user } = useAuth();

  // Show a nudge banner when user is on the free/starter plan
  if (!user || user.plan !== "starter") return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-between gap-4 text-sm">
      <span className="text-amber-800 dark:text-amber-300">
        You're on the free plan. Upgrade to send unlimited documents.
      </span>
      <Link href="/billing">
        <span className="font-medium text-[#c8210d] hover:underline cursor-pointer whitespace-nowrap">
          Upgrade now →
        </span>
      </Link>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNav />
        <FreePlanBanner />
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
