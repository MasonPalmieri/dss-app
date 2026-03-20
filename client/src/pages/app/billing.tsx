import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CreditCard, Check, Download, Zap, FileText, Users, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PLANS = [
  {
    name: "Starter",
    monthlyPrice: 0,
    annualPrice: 0,
    features: ["5 documents/month", "1 user", "Basic templates", "Email support"],
    current: false,
  },
  {
    name: "Professional",
    monthlyPrice: 25,
    annualPrice: 20,
    features: ["50 documents/month", "5 users", "Custom branding", "API access", "Priority support"],
    current: true,
  },
  {
    name: "Business",
    monthlyPrice: 65,
    annualPrice: 52,
    features: ["Unlimited documents", "25 users", "Advanced workflows", "SSO", "Dedicated support", "Audit logs"],
    current: false,
  },
  {
    name: "Enterprise",
    monthlyPrice: null,
    annualPrice: null,
    features: ["Unlimited everything", "Unlimited users", "Custom integrations", "SLA guarantee", "On-premise option", "24/7 phone support"],
    current: false,
  },
];

const INVOICES = [
  { id: "INV-001", date: "Mar 1, 2026", amount: "$25.00", status: "paid" },
  { id: "INV-002", date: "Feb 1, 2026", amount: "$25.00", status: "paid" },
  { id: "INV-003", date: "Jan 1, 2026", amount: "$25.00", status: "paid" },
];

export default function Billing() {
  const [annual, setAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [plans, setPlans] = useState(PLANS);
  const [contactForm, setContactForm] = useState({ name: "", email: "", company: "", message: "" });
  const { toast } = useToast();

  const currentPlan = plans.find((p) => p.current);

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    if (plan.current) return;
    if (plan.monthlyPrice === null) {
      setShowEnterpriseModal(true);
      return;
    }
    setSelectedPlan(plan);
  };

  const handleUpgrade = () => {
    if (!selectedPlan) return;
    setPlans((prev) => prev.map((p) => ({ ...p, current: p.name === selectedPlan.name })));
    toast({
      title: `Upgraded to ${selectedPlan.name}`,
      description: "Your plan has been updated. (Demo — no payment charged)",
    });
    setSelectedPlan(null);
  };

  const handleEnterpriseContact = () => {
    if (!contactForm.email) { toast({ title: "Please enter your email", variant: "destructive" }); return; }
    toast({
      title: "Request submitted",
      description: "Our sales team will contact you within 1 business day",
    });
    setShowEnterpriseModal(false);
    setContactForm({ name: "", email: "", company: "", message: "" });
  };

  const handleInvoiceDownload = (inv: typeof INVOICES[0]) => {
    const content = `INVOICE\n\nInvoice #: ${inv.id}\nDate: ${inv.date}\nAmount: ${inv.amount}\nStatus: ${inv.status}\n\nDraftSendSign — Professional Plan\n\nNote: This is a demo invoice export.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and payment details</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c8210d]/10 text-[#c8210d]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{currentPlan?.name} Plan</p>
                <p className="text-sm text-muted-foreground">
                  {currentPlan?.monthlyPrice === 0 ? "Free" : `$${currentPlan?.monthlyPrice}/month`} · Renews Apr 1, 2026
                </p>
              </div>
            </div>
            <Badge className="bg-green-500/10 text-green-600 border-green-200">Active</Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Documents</span>
              </div>
              <Progress value={60} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">30 / 50 used this month</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Users</span>
              </div>
              <Progress value={40} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">2 / 5 seats used</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Payment Method</span>
              </div>
              <p className="text-sm">Visa ending in 4242</p>
              <Button
                variant="link"
                className="h-auto p-0 text-xs text-[#c8210d]"
                onClick={() => toast({ title: "Payment update", description: "Stripe payment portal would open here in production" })}
              >
                Update card
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Available Plans</h2>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Monthly</Label>
            <Switch checked={annual} onCheckedChange={setAnnual} data-testid="billing-toggle" />
            <Label className="text-sm">Annual</Label>
            {annual && <Badge variant="secondary" className="text-xs">Save 20%</Badge>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.current ? "border-[#c8210d] border-2 relative" : ""}
              data-testid={`plan-${plan.name.toLowerCase()}`}
            >
              {plan.current && (
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
                  className={plan.current ? "w-full" : "w-full bg-[#c8210d] hover:bg-[#a61b0b] text-white"}
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current}
                  onClick={() => handleSelectPlan(plan)}
                  data-testid={`select-plan-${plan.name.toLowerCase()}`}
                >
                  {plan.current ? "Current Plan" : plan.monthlyPrice === null ? "Contact Sales" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-left">
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{inv.id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                  <td className="px-4 py-3">{inv.amount}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize text-green-600">{inv.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleInvoiceDownload(inv)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Upgrade Confirmation Modal */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              You'll be charged ${annual ? selectedPlan?.annualPrice : selectedPlan?.monthlyPrice}/month.
              This is a demo — no actual charge will occur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {selectedPlan?.features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" /> {f}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPlan(null)}>Cancel</Button>
            <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={handleUpgrade}>
              Confirm Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} placeholder="Mason Palmieri" />
            </div>
            <div>
              <Label>Work Email</Label>
              <Input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} placeholder="mason@company.com" />
            </div>
            <div>
              <Label>Company</Label>
              <Input value={contactForm.company} onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })} placeholder="Acme Inc." />
            </div>
            <div>
              <Label>What are you looking for? (optional)</Label>
              <Input value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} placeholder="e.g., custom SSO, on-premise, volume pricing…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnterpriseModal(false)}>Cancel</Button>
            <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={handleEnterpriseContact}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
