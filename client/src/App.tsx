import { Switch, Route, Router, useLocation, Redirect } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { GateProvider, GateScreen, useGate } from "@/components/app-gate";
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

// Mass Signature
import MassSignature from "@/pages/app/mass-signature";
import MassSignPage from "@/pages/mass-sign";

import NotFound from "@/pages/not-found";

// Routes that are always public — no gate required
const PUBLIC_ROUTES = ["/", "/pricing", "/features", "/security", "/about", "/login", "/signup", "/forgot-password", "/reset-password"];

function isPublicPath(path: string): boolean {
  if (PUBLIC_ROUTES.includes(path)) return true;
  // Signer links are public (/sign/...)
  if (path.startsWith("/sign/")) return true;
  // Mass signature public signing page
  if (path.startsWith("/mass-sign/")) return true;
  return false;
}

// Determines if the current path needs the app shell (sidebar + topnav)
function isAppPath(path: string): boolean {
  const appPaths = [
    "/dashboard", "/documents", "/new-document", "/templates",
    "/contacts", "/teams", "/audit-logs", "/integrations",
    "/billing", "/settings", "/notifications", "/mass-signature",
  ];
  return appPaths.some(p => path === p || path.startsWith(p + "/"));
}

function AppRoutes() {
  return (
    <Switch>
      {/* App pages — rendered inside AppLayout shell */}
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
    </Switch>
  );
}

function GatedAppRouter() {
  const { isUnlocked } = useGate();
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Supabase is checking for an existing session — show nothing to avoid
  // flashing the gate screen at users who are already logged in
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-[#c8210d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Public routes (sign, mass-sign, marketing, auth) bypass the gate entirely
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
        <Route path="/sign/:token" component={SigningPage} />
        <Route path="/mass-sign/:token" component={MassSignPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Not unlocked and not authenticated → show gate
  if (!isUnlocked && !isAuthenticated) {
    return <GateScreen />;
  }

  // Authenticated but on root/login/signup → go straight to dashboard
  if (isAuthenticated && (location === "/" || location === "/login" || location === "/signup")) {
    return <Redirect to="/dashboard" />;
  }

  // App routes get the persistent layout shell
  if (isAppPath(location)) {
    return (
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    );
  }

  return (
    <Switch>
      {/* Auth pages — behind gate */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password">{() => <ForgotPassword initialStep="reset" />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// Bridge: sits inside AuthProvider so it can call useAuth(),
// then passes an auto-login callback into GateProvider.
function AuthenticatedGate({ children }: { children: React.ReactNode }) {
  const { login } = useAuth();

  const handleUnlock = () => {
    // Log in as demo account, then navigate to dashboard once auth resolves
    login("help@draftsendsign.com", "demo")
      .then(() => {
        // Use hash navigation so wouter picks it up
        window.location.hash = "/dashboard";
      })
      .catch(() => {
        // Login failed — gate is still unlocked, user sees login page
        window.location.hash = "/login";
      });
  };

  return (
    <GateProvider onUnlock={handleUnlock}>
      {children}
    </GateProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AuthenticatedGate>
            <Toaster />
            <Router hook={useHashLocation}>
              <GatedAppRouter />
            </Router>
          </AuthenticatedGate>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
