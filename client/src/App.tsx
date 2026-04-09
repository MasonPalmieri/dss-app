import { Switch, Route, Router, useLocation, Redirect } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import AppLayout from "@/components/layout";

// Marketing pages
import MarketingHome from "@/pages/marketing/home";
import Pricing from "@/pages/marketing/pricing";
import Features from "@/pages/marketing/features";
import Security from "@/pages/marketing/security";
import About from "@/pages/marketing/about";

// Auth pages
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import ForgotPassword from "@/pages/auth/forgot-password";

// App pages
import Dashboard from "@/pages/app/dashboard";
import Documents from "@/pages/app/documents";
import DocumentDetail from "@/pages/app/document-detail";
import NewDocumentWizard from "@/pages/app/new-document";
import Templates from "@/pages/app/templates";
import Contacts from "@/pages/app/contacts";
import Teams from "@/pages/app/teams";
import AuditLogs from "@/pages/app/audit-logs";
import Integrations from "@/pages/app/integrations";
import Billing from "@/pages/app/billing";
import Settings from "@/pages/app/settings";
import Notifications from "@/pages/app/notifications";

// Signer experience
import SigningPage from "@/pages/signer/signing";

// Legal pages
import TermsPage from "@/pages/legal/terms";
import PrivacyPage from "@/pages/legal/privacy";

// Mass Signature
import MassSignature from "@/pages/app/mass-signature";
import MassSignPage from "@/pages/mass-sign";

// AI Generator
import AiGenerator from "@/pages/app/ai-generator";

import NotFound from "@/pages/not-found";

const PUBLIC_PATHS = ["/", "/pricing", "/features", "/security", "/about", "/login", "/signup", "/forgot-password", "/reset-password", "/terms", "/privacy"];

function isPublicPath(path: string): boolean {
  if (PUBLIC_PATHS.includes(path)) return true;
  if (path.startsWith("/sign/")) return true;
  if (path.startsWith("/mass-sign/")) return true;
  return false;
}

function isAppPath(path: string): boolean {
  const appPaths = [
    "/dashboard", "/documents", "/new-document", "/templates",
    "/contacts", "/teams", "/audit-logs", "/integrations",
    "/billing", "/settings", "/notifications", "/mass-signature",
    "/ai-generator",
  ];
  return appPaths.some(p => path === p || path.startsWith(p + "/"));
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/documents" component={Documents} />
      <Route path="/documents/:id" component={DocumentDetail} />
      <Route path="/new-document" component={NewDocumentWizard} />
      <Route path="/templates" component={Templates} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/teams" component={Teams} />
      <Route path="/audit-logs" component={AuditLogs} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/billing" component={Billing} />
      <Route path="/settings" component={Settings} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/mass-signature" component={MassSignature} />
      <Route path="/ai-generator" component={AiGenerator} />
    </Switch>
  );
}

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Wait for Supabase session check — prevents flash of login screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-[#c8210d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Always-public routes — no auth needed
  if (isPublicPath(location)) {
    return (
      <Switch>
        <Route path="/" component={MarketingHome} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/features" component={Features} />
        <Route path="/security" component={Security} />
        <Route path="/about" component={About} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password">{() => <ForgotPassword initialStep="reset" />}</Route>
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/sign/:token" component={SigningPage} />
        <Route path="/mass-sign/:token" component={MassSignPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Unauthenticated users trying to reach app → send to login
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Authenticated user on marketing/auth pages → go to dashboard
  if (isAuthenticated && (location === "/" || location === "/login" || location === "/signup")) {
    return <Redirect to="/dashboard" />;
  }

  // App routes with sidebar shell
  if (isAppPath(location)) {
    return (
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password">{() => <ForgotPassword initialStep="reset" />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
