import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowLeft } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Starter",
    monthlyPrice: "Free",
    annualPrice: "Free",
    desc: "For individuals getting started",
    features: { docs: "3 docs/month", users: "1 user", templates: "3 templates", storage: "100 MB", support: "Community", api: false, branding: false, audit: false, sso: false },
  },
  {
    name: "Professional",
    monthlyPrice: "$15",
    annualPrice: "$12",
    desc: "For growing teams",
    popular: true,
    features: { docs: "50 docs/month", users: "3 users", templates: "Unlimited", storage: "5 GB", support: "Email", api: true, branding: false, audit: true, sso: false },
  },
  {
    name: "Business",
    monthlyPrice: "$35",
    annualPrice: "$28",
    desc: "For scaling organizations",
    features: { docs: "Unlimited", users: "10 users", templates: "Unlimited", storage: "50 GB", support: "Priority", api: true, branding: true, audit: true, sso: false },
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    desc: "For large organizations",
    features: { docs: "Unlimited", users: "Unlimited", templates: "Unlimited", storage: "Unlimited", support: "Dedicated", api: true, branding: true, audit: true, sso: true },
  },
];

const comparisonRows = [
  { label: "Documents per month", key: "docs" },
  { label: "Team members", key: "users" },
  { label: "Templates", key: "templates" },
  { label: "Storage", key: "storage" },
  { label: "Support", key: "support" },
  { label: "API Access", key: "api", boolean: true },
  { label: "Custom Branding", key: "branding", boolean: true },
  { label: "Audit Logs", key: "audit", boolean: true },
  { label: "SSO / SAML", key: "sso", boolean: true },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          </Link>
          <span className="font-bold">Draft<span className="text-[#c8210d]">Send</span>Sign</span>
          <div className="ml-auto flex gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link href="/signup"><Button size="sm" className="bg-[#c8210d] hover:bg-[#a61b0b] text-white">Start Free Trial</Button></Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-muted-foreground mb-8">Start free, upgrade as you grow. No hidden fees.</p>
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!annual ? "font-semibold" : "text-muted-foreground"}`}>Monthly</span>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${annual ? "bg-[#c8210d]" : "bg-muted"}`}
              onClick={() => setAnnual(!annual)}
              data-testid="billing-toggle"
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${annual ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm ${annual ? "font-semibold" : "text-muted-foreground"}`}>Annual</span>
            {annual && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Save 20%</Badge>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? "border-[#c8210d] shadow-lg scale-105" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c8210d] text-white">Most Popular</Badge>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.desc}</p>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-4xl font-extrabold mb-1">
                  {annual ? plan.annualPrice : plan.monthlyPrice}
                </p>
                {plan.monthlyPrice !== "Free" && plan.monthlyPrice !== "Custom" && (
                  <p className="text-sm text-muted-foreground">/user/month</p>
                )}
                <Link href="/signup">
                  <Button className={`w-full mt-6 ${plan.popular ? "bg-[#c8210d] hover:bg-[#a61b0b] text-white" : ""}`} variant={plan.popular ? "default" : "outline"}>
                    {plan.monthlyPrice === "Custom" ? "Contact Sales" : "Get Started"}
                  </Button>
                </Link>
                <div className="mt-6 text-left space-y-2">
                  {Object.entries(plan.features).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      {typeof val === "boolean" ? (
                        val ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-muted-foreground/40" />
                      ) : (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                      <span className={typeof val === "boolean" && !val ? "text-muted-foreground/40" : ""}>
                        {typeof val === "boolean" ? comparisonRows.find(r => r.key === key)?.label : val}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-8">Feature comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="comparison-table">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feature</th>
                  {plans.map(p => (
                    <th key={p.name} className="text-center py-3 px-4 font-semibold">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(row => (
                  <tr key={row.key} className="border-b">
                    <td className="py-3 px-4">{row.label}</td>
                    {plans.map(p => {
                      const val = (p.features as any)[row.key];
                      return (
                        <td key={p.name} className="text-center py-3 px-4">
                          {typeof val === "boolean" ? (
                            val ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                          ) : val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">2026 DraftSendSign. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
