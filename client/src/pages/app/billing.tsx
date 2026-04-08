import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard, Check, Zap, FileText, Users, ExternalLink, AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

// ---------------------------------------------------------------------------
// Plan definitions
// ---------------------------------------------------------------------------
const PLANS = [
  {
    key: "starter",
    name: "Starter",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "3 documents/month",
      "1 user",
      "Basic templates",
      "Email support",
    ],
    hasTrial: false,
  },
  {
    key: "pro",
    name: "Pro",
    monthlyPrice: 12,
    annualPrice: 10,
    features: [
      "Unlimited documents",
      "1 user",
      "Custom branding",
      "Priority support",
      "14-day free trial",
    ],
    hasTrial: true,
  },
  {
    key: "team",
    name: "Team",
    monthlyPrice: 29,
    annualPrice: 23,
    features: [
      "Unlimited documents",
      "5 users",
      "Custom branding",
      "Priority support",
      "14-day free trial",
    ],
    hasTrial: true,
  },
  {
    key: "business",
    name: "Business",
    monthlyPrice: 59,
    annualPrice: 47,
    features: [
      "Unlimited documents",
      "15 users",
      "Mass signature",
      "API access",
      "Priority support",
      "14-day free trial",
    ],
    hasTrial: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    monthlyPrice: null,
    annualPrice: null,
    features: [
      "Unlimited everything",
      "Unlimited users",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option",
      "24/7 phone support",
    ],
    hasTrial: false,
  },
] as const;

type PlanKey = typeof PLANS[number]["key"];

// ---------------------------------------------------------------------------
// Trial helper
// ---------------------------------------------------------------------------
function getTrialDaysLeft(createdAt: Date): number {
  const trialEnd = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const msLeft = trialEnd.getTime() - now.getTime();
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Billing() {
  const [annual, setAnnual] = useState(false);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", company: "", message: "" });
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Detect ?success=true / ?canceled=true on return from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
    if (params.get("success") === "true") {
      toast({
        title: "Subscription activated!",
        description: "Your trial has started. Welcome to DraftSendSign.",
      });
      // Clean the URL
      window.history.replaceState(null, "", window.location.pathname);
    } else if (params.get("canceled") === "true") {
      toast({
        title: "Checkout canceled",
        description: "You can upgrade anytime from this page.",
        variant: "destructive",
      });
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [toast]);

  const userPlan: PlanKey = (user?.plan as PlanKey) || "starter";
  const subscriptionStatus = (user as any)?.subscriptionStatus || "trial";

  // Trial info
  const createdAt = user?.createdAt || new Date();
  const trialEnd = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
  const daysLeft = getTrialDaysLeft(createdAt);
  const isTrialing = subscriptionStatus === "trialing" || subscriptionStatus === "trial";
  const showTrialBanner = (userPlan === "starter" || isTrialing) && daysLeft >= 0;

  const currentPlanDef = PLANS.find((p) => p.key === userPlan) || PLANS[0];

  // Usage this month (for Starter plan)
  const [docsUsed, setDocsUsed] = useState<number | null>(null);
  const DOC_LIMIT = userPlan === "starter" ? 3 : null;

  useEffect(() => {
    if (!user?.id || userPlan !== "starter") return;
    const startOfMonth = new Date();
    startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("sender_id", user.id)
      .neq("status", "draft")
      .gte("created_at", startOfMonth.toISOString())
      .then(({ count }) => setDocsUsed(count || 0));
  }, [user?.id, userPlan]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const handleUpgrade = async (planKey: PlanKey, isAnnual: boolean) => {
    if (!user) return;
    setUpgrading(planKey);

    try {
      const res = await fetch("/api/stripe-create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planKey,
          userId: user.id,
          userEmail: user.email,
          annual: isAnnual,
        }),
      });

      const data = await res.json();

      if (data.error === "stripe_not_configured") {
        toast({
          title: "Billing is being set up",
          description: "Contact help@draftsendsign.com to upgrade.",
        });
        return;
      }

      if (!res.ok || !data.url) {
        toast({
          title: "Error",
          description: data.error || "Could not start checkout. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      toast({
        title: "Network error",
        description: "Could not reach the billing server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpgrading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    setOpeningPortal(true);

    try {
      const res = await fetch("/api/stripe-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (data.error === "stripe_not_configured") {
        toast({
          title: "Billing portal not available",
          description: "Contact help@draftsendsign.com to manage your subscription.",
        });
        return;
      }

      if (!res.ok || !data.url) {
        toast({
          title: "Error",
          description: data.error || "Could not open billing portal.",
          variant: "destructive",
        });
        return;
      }

      window.location.href = data.url;
    } catch {
      toast({
        title: "Network error",
        description: "Could not reach the billing server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOpeningPortal(false);
    }
  };

  const handleEnterpriseContact = () => {
    if (!contactForm.email) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    toast({
      title: "Request submitted",
      description: "Our sales team will contact you within 1 business day.",
    });
    setShowEnterpriseModal(false);
    setContactForm({ name: "", email: "", company: "", message: "" });
  };

  const planButtonLabel = (planKey: PlanKey, hasTrial: boolean): string => {
    if (planKey === userPlan) return "Current Plan";
    if (planKey === "starter") return "Downgrade";
    if (planKey === "enterprise") return "Contact Sales";
    if (userPlan === "starter") return hasTrial ? "Start Free Trial" : "Upgrade";
    return "Upgrade";
  };

  const isPaidPlan = userPlan !== "starter";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and payment details</p>
      </div>

      {/* Trial / upgrade banner */}
      {showTrialBanner && (
        <Alert className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-300">
            {daysLeft > 0
              ? <>You have <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong> left in your free trial. Upgrade to continue after {formatDate(trialEnd)}.</>
              : <>Your free trial has ended. Upgrade to continue sending documents.</>
            }
            {" "}
            <button
              className="underline font-medium"
              onClick={() => {
                const el = document.getElementById("plans-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              View plans →
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c8210d]/10 text-[#c8210d]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{currentPlanDef.name} Plan</p>
                <p className="text-sm text-muted-foreground">
                  {currentPlanDef.monthlyPrice === 0
                    ? "Free"
                    : `$${currentPlanDef.monthlyPrice}/month`}
                  {isTrialing && daysLeft > 0 && ` · Trial ends ${formatDate(trialEnd)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isTrialing ? (
                <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-300">
                  Trial — {daysLeft}d left
                </Badge>
              ) : subscriptionStatus === "active" ? (
                <Badge className="bg-green-500/10 text-green-600 border-green-200">Active</Badge>
              ) : subscriptionStatus === "past_due" ? (
                <Badge className="bg-red-500/10 text-red-600 border-red-200">Past Due</Badge>
              ) : subscriptionStatus === "canceled" ? (
                <Badge variant="secondary">Canceled</Badge>
              ) : (
                <Badge className="bg-green-500/10 text-green-600 border-green-200">Active</Badge>
              )}
              {isPaidPlan && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleManageSubscription}
                  disabled={openingPortal}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {openingPortal ? "Opening…" : "Manage / Cancel"}
                </Button>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Documents</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {userPlan === "starter" ? "3 / month" : "Unlimited"}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Users</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {userPlan === "starter" ? "1 seat" : userPlan === "pro" ? "1 seat" : userPlan === "team" ? "5 seats" : userPlan === "business" ? "15 seats" : "Unlimited"}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Payment</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isPaidPlan ? "Managed via Stripe" : "No payment on file"}
              </p>
            </div>
          </div>

          {/* Usage meter — Starter plan only */}
          {DOC_LIMIT !== null && docsUsed !== null && (
            <div className="space-y-2 mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Documents sent this month</span>
                <span className={`font-semibold ${docsUsed >= DOC_LIMIT ? "text-red-600" : ""}`}>
                  {docsUsed} / {DOC_LIMIT}
                </span>
              </div>
              <Progress value={Math.min((docsUsed / DOC_LIMIT) * 100, 100)} className="h-2" />
              {docsUsed >= DOC_LIMIT ? (
                <p className="text-xs text-red-600 font-medium">Limit reached — upgrade to send more documents this month.</p>
              ) : docsUsed >= DOC_LIMIT - 1 ? (
                <p className="text-xs text-yellow-600">1 document remaining this month.</p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <div id="plans-section">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-semibold">Available Plans</h2>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Monthly</Label>
            <Switch
              checked={annual}
              onCheckedChange={setAnnual}
              data-testid="billing-toggle"
            />
            <Label className="text-sm">Annual</Label>
            {annual && (
              <Badge variant="secondary" className="text-xs">Save 20%</Badge>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = plan.key === userPlan;
            const isLoading = upgrading === plan.key;
            const btnLabel = planButtonLabel(plan.key, plan.hasTrial);

            return (
              <Card
                key={plan.key}
                className={isCurrent ? "border-[#c8210d] border-2 relative" : ""}
                data-testid={`plan-${plan.key}`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#c8210d] text-white text-xs">Current Plan</Badge>
                  </div>
                )}
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    {plan.monthlyPrice !== null ? (
                      <p className="text-2xl font-bold mt-1">
                        ${annual ? plan.annualPrice : plan.monthlyPrice}
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </p>
                    ) : (
                      <p className="text-2xl font-bold mt-1">Custom</p>
                    )}
                    {annual && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                      <p className="text-xs text-green-600 mt-0.5">
                        Save ${(plan.monthlyPrice - (plan.annualPrice ?? 0)) * 12}/yr
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={
                      isCurrent
                        ? "w-full"
                        : "w-full bg-[#c8210d] hover:bg-[#a61b0b] text-white"
                    }
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent || isLoading}
                    onClick={() => {
                      if (plan.key === "enterprise") {
                        setShowEnterpriseModal(true);
                      } else if (plan.key !== "starter" && plan.key !== "enterprise") {
                        handleUpgrade(plan.key, annual);
                      }
                    }}
                    data-testid={`select-plan-${plan.key}`}
                  >
                    {isLoading ? "Redirecting…" : btnLabel}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Invoice history placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Invoice history will appear here once you subscribe.
          </p>
        </CardContent>
      </Card>

      {/* Enterprise Contact Modal */}
      <Dialog open={showEnterpriseModal} onOpenChange={setShowEnterpriseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Sales — Enterprise</DialogTitle>
            <DialogDescription>
              Tell us about your organization and we'll get back to you within 1 business day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Your Name</Label>
              <Input
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="Mason Palmieri"
              />
            </div>
            <div>
              <Label>Work Email</Label>
              <Input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="mason@company.com"
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={contactForm.company}
                onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <Label>What are you looking for? (optional)</Label>
              <Input
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="e.g., custom SSO, on-premise, volume pricing…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnterpriseModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#c8210d] hover:bg-[#a61b0b] text-white"
              onClick={handleEnterpriseContact}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
