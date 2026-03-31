import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Users,
  PenTool,
  Shield,
  Clock,
  FileText,
  Lock,
  FileCheck,
  ArrowRight,
  Check,
  X,
  BarChart2,
  Mail,
  Menu,
  Zap,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Features", href: "/#/features" },
  { label: "Pricing", href: "/#/pricing" },
  { label: "Security", href: "/#/security" },
];

const TRUST_BADGES = [
  "NDA",
  "Employment Contract",
  "Vendor Agreement",
  "Real Estate",
  "Partnership Agreement",
];

const STEPS = [
  {
    icon: Upload,
    title: "Upload",
    desc: "Upload any PDF document from your computer or cloud storage.",
  },
  {
    icon: Mail,
    title: "Send",
    desc: "Add recipients and place signature fields exactly where you need them.",
  },
  {
    icon: PenTool,
    title: "Sign",
    desc: "Recipients sign from any device — legally binding under the ESIGN Act.",
  },
];

const FEATURES = [
  {
    icon: Upload,
    title: "Upload & Send PDFs",
    desc: "Drag and drop any PDF. Place signature, date, and text fields with a visual editor.",
  },
  {
    icon: Clock,
    title: "Real-time tracking",
    desc: "Know instantly when documents are viewed, signed, or declined with live status updates.",
  },
  {
    icon: Shield,
    title: "Legally binding (ESIGN Act)",
    desc: "All signatures are fully compliant with the US ESIGN Act and UETA regulations.",
  },
  {
    icon: FileCheck,
    title: "Audit trail",
    desc: "Tamper-proof, timestamped records of every view, click, and signature event.",
  },
  {
    icon: BarChart2,
    title: "Mass signature campaigns",
    desc: "Send a document to hundreds of recipients at once — each gets their own unique link.",
  },
  {
    icon: Users,
    title: "Team management",
    desc: "Invite team members, set roles, share templates, and manage documents together.",
  },
];

interface PricingPlan {
  name: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  label: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

const PLANS: PricingPlan[] = [
  {
    name: "Starter",
    monthlyPrice: null,
    annualPrice: null,
    label: "Free",
    features: [
      "3 documents/month",
      "1 user",
      "Basic audit trail",
      "Email support",
    ],
    cta: "Start Free",
  },
  {
    name: "Pro",
    monthlyPrice: 12,
    annualPrice: 10,
    label: "$12/mo",
    features: [
      "50 documents/month",
      "3 users",
      "Full audit trail",
      "Templates",
      "Priority support",
    ],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Team",
    monthlyPrice: 29,
    annualPrice: 23,
    label: "$29/mo",
    features: [
      "200 documents/month",
      "10 users",
      "Mass signature campaigns",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Business",
    monthlyPrice: 59,
    annualPrice: 47,
    label: "$59/mo",
    features: [
      "Unlimited documents",
      "Unlimited users",
      "SSO / SAML",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Start Free Trial",
  },
];

interface CompareRow {
  feature: string;
  dss: string | boolean;
  docusign: string | boolean;
}

const COMPARE_ROWS: CompareRow[] = [
  { feature: "Starting price", dss: "Free", docusign: "$15/mo" },
  { feature: "Documents/month (base)", dss: "3 free, 50 on Pro", docusign: "5 on Standard" },
  { feature: "Users included", dss: "Up to unlimited", docusign: "1 per plan" },
  { feature: "Free trial", dss: true, docusign: false },
  { feature: "Audit trail", dss: true, docusign: true },
  { feature: "Mass signature campaigns", dss: true, docusign: false },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Logo() {
  return (
    <span className="text-[17px] font-bold tracking-tight select-none">
      Draft<span className="text-[#c8210d]">Send</span>Sign
    </span>
  );
}

/** Pure CSS/SVG app UI mockup — no external images */
function HeroMockup() {
  return (
    <div className="mt-16 mx-auto max-w-3xl rounded-2xl overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 bg-[#161b22] px-4 py-3 border-b border-white/5">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-4 flex-1 bg-[#0d1117] rounded px-3 py-1 text-xs text-white/30 font-mono">
          app.draftsendsign.com
        </span>
      </div>

      {/* App content */}
      <div className="bg-[#0d1117] p-6 grid grid-cols-1 sm:grid-cols-5 gap-6">
        {/* Sidebar stub */}
        <div className="hidden sm:flex sm:col-span-1 flex-col gap-3">
          {["Documents", "Templates", "Team", "Settings"].map((item, i) => (
            <div
              key={item}
              className={`rounded-lg px-3 py-2 text-xs font-medium ${
                i === 0
                  ? "bg-[#c8210d]/20 text-[#c8210d]"
                  : "text-white/30"
              }`}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div className="sm:col-span-4 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pending", value: "4", color: "text-yellow-400" },
              { label: "Completed", value: "28", color: "text-green-400" },
              { label: "Drafts", value: "2", color: "text-white/50" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/5 border border-white/5 p-3 text-center"
              >
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Document list */}
          <div className="rounded-xl border border-white/5 overflow-hidden">
            {[
              { name: "NDA — Acme Corp", status: "Signed", color: "text-green-400 bg-green-900/30" },
              { name: "Employment Offer — J. Smith", status: "Pending", color: "text-yellow-400 bg-yellow-900/30" },
              { name: "Vendor Agreement", status: "Draft", color: "text-white/40 bg-white/5" },
            ].map((doc, i) => (
              <div
                key={doc.name}
                className={`flex items-center justify-between px-4 py-3 text-xs ${
                  i !== 2 ? "border-b border-white/5" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-white/30" />
                  <span className="text-white/70">{doc.name}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${doc.color}`}
                >
                  {doc.status}
                </span>
              </div>
            ))}
          </div>

          {/* Signature field highlight */}
          <div className="rounded-xl border border-[#c8210d]/40 bg-[#c8210d]/5 p-3 flex items-center gap-3">
            <div className="rounded-lg bg-[#c8210d]/20 p-2">
              <PenTool className="h-4 w-4 text-[#c8210d]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-white/80">
                Signature required
              </p>
              <p className="text-[10px] text-white/30">
                Click to sign · John Smith
              </p>
            </div>
            <div className="rounded-md bg-[#c8210d] px-3 py-1 text-[10px] font-bold text-white">
              Sign
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  plan,
  annual,
}: {
  plan: PricingPlan;
  annual: boolean;
}) {
  const price =
    plan.monthlyPrice === null
      ? "Free"
      : annual
      ? `$${plan.annualPrice}`
      : `$${plan.monthlyPrice}`;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 ${
        plan.popular
          ? "border-[#c8210d] shadow-[0_0_0_1px_#c8210d] bg-white"
          : "border-gray-200 bg-white"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-[#c8210d] px-3 py-1 text-[11px] font-bold text-white tracking-wide uppercase">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-500 mb-1">{plan.name}</p>
        <div className="flex items-end gap-1">
          <span className="text-4xl font-extrabold text-gray-900">{price}</span>
          {plan.monthlyPrice !== null && (
            <span className="text-sm text-gray-400 mb-1">/mo</span>
          )}
        </div>
        {annual && plan.annualPrice !== null && (
          <p className="text-xs text-green-600 font-medium mt-1">
            Save 20% with annual billing
          </p>
        )}
      </div>

      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-[#c8210d] mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <a href="https://app.draftsendsign.com/#/signup">
        <Button
          className={`w-full ${
            plan.popular
              ? "bg-[#c8210d] hover:bg-[#a61b0b] text-white"
              : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
          }`}
          variant={plan.popular ? "default" : "outline"}
        >
          {plan.cta}
        </Button>
      </a>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MarketingHome() {
  const [annual, setAnnual] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans antialiased">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="https://app.draftsendsign.com/#/login">
              <Button variant="ghost" size="sm" className="text-gray-600">
                Sign In
              </Button>
            </a>
            <a href="https://app.draftsendsign.com/#/signup">
              <Button
                size="sm"
                className="bg-[#c8210d] hover:bg-[#a61b0b] text-white shadow-sm"
              >
                Start Free Trial
              </Button>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-500 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-5 py-4 space-y-3">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="block text-sm text-gray-600 hover:text-gray-900 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <a href="https://app.draftsendsign.com/#/login">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </a>
              <a href="https://app.draftsendsign.com/#/signup">
                <Button
                  size="sm"
                  className="w-full bg-[#c8210d] hover:bg-[#a61b0b] text-white"
                >
                  Start Free Trial
                </Button>
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#0d1117] pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/60 mb-8">
            <Zap className="h-3.5 w-3.5 text-[#c8210d]" />
            The affordable DocuSign alternative for small teams
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
            Sign documents in{" "}
            <span className="text-[#c8210d]">minutes</span>,<br className="hidden sm:block" />
            {" "}not days
          </h1>

          <p className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed">
            DraftSendSign is the affordable alternative to DocuSign. Send documents
            for signature, track progress in real time, and get legally binding
            signatures — starting free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://app.draftsendsign.com/#/signup">
              <Button
                size="lg"
                className="bg-[#c8210d] hover:bg-[#a61b0b] text-white px-8 h-12 text-base font-semibold shadow-lg shadow-[#c8210d]/30"
              >
                Start Free Trial — No Credit Card
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href="/#/features">
              <Button
                size="lg"
                variant="outline"
                className="px-8 h-12 text-base border-white/20 text-white/80 bg-transparent hover:bg-white/5"
              >
                See How It Works
              </Button>
            </a>
          </div>

          <p className="mt-5 text-xs text-white/30 tracking-wide">
            14-day free trial · No credit card required · Cancel anytime
          </p>

          {/* App mockup */}
          <HeroMockup />
        </div>
      </section>

      {/* ── Trust bar ──────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-gray-50 py-6">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest mr-2">
              Trusted for signing:
            </span>
            {TRUST_BADGES.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-500 shadow-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[#c8210d] mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Three simple steps
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Get your documents signed in minutes, not days.
            </p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-10">
            {/* Connector line on desktop */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gray-200" />

            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0d1117] shadow-lg relative z-10">
                    <Icon className="h-8 w-8 text-white" />
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#c8210d] text-[11px] font-bold text-white shadow">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features grid ──────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[#c8210d] mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Everything you need
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Powerful tools to run your entire document signing workflow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Card
                  key={f.title}
                  className="border border-gray-200 shadow-none hover:shadow-md transition-shadow bg-white"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0d1117]">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1.5">
                      {f.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#c8210d] mb-3">
              Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              3x cheaper than DocuSign. No per-document fees.
            </p>

            {/* Annual toggle */}
            <div className="inline-flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-5 py-2">
              <span
                className={`text-sm font-medium cursor-pointer ${
                  !annual ? "text-gray-900" : "text-gray-400"
                }`}
                onClick={() => setAnnual(false)}
              >
                Monthly
              </span>
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  annual ? "bg-[#c8210d]" : "bg-gray-300"
                }`}
                aria-label="Toggle annual billing"
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    annual ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium cursor-pointer ${
                  annual ? "text-gray-900" : "text-gray-400"
                }`}
                onClick={() => setAnnual(true)}
              >
                Annual
                <span className="ml-1.5 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start pt-4">
            {PLANS.map((plan) => (
              <PricingCard key={plan.name} plan={plan} annual={annual} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison table ───────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#c8210d] mb-3">
              Comparison
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              DraftSendSign vs DocuSign
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-4 pl-6 text-left text-gray-400 font-medium w-1/2">
                    Feature
                  </th>
                  <th className="py-4 text-center font-bold text-gray-900">
                    DraftSendSign
                  </th>
                  <th className="py-4 pr-6 text-center font-medium text-gray-400">
                    DocuSign
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-gray-50 last:border-0 ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="py-4 pl-6 text-gray-600">{row.feature}</td>
                    <td className="py-4 text-center">
                      {typeof row.dss === "boolean" ? (
                        row.dss ? (
                          <Check className="mx-auto h-5 w-5 text-green-500" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-red-400" />
                        )
                      ) : (
                        <span className="font-semibold text-gray-900">
                          {row.dss}
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-6 text-center">
                      {typeof row.docusign === "boolean" ? (
                        row.docusign ? (
                          <Check className="mx-auto h-5 w-5 text-green-500" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-red-400" />
                        )
                      ) : (
                        <span className="text-gray-400">{row.docusign}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-[#0d1117] py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            Ready to ditch DocuSign?
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Start your 14-day free trial today. No credit card required.
          </p>
          <a href="https://app.draftsendsign.com/#/signup">
            <Button
              size="lg"
              className="bg-[#c8210d] hover:bg-[#a61b0b] text-white px-10 h-14 text-lg font-bold shadow-xl shadow-[#c8210d]/30"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
          <p className="mt-5 text-xs text-white/25 tracking-wide">
            14-day free trial · No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/">
                <Logo />
              </Link>
              <p className="mt-3 text-sm text-gray-400 leading-relaxed max-w-[200px]">
                Built for small teams. Priced for real businesses.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                Product
              </p>
              <div className="space-y-3 text-sm text-gray-500">
                <a href="/#/features" className="block hover:text-gray-900 transition-colors">
                  Features
                </a>
                <a href="/#/pricing" className="block hover:text-gray-900 transition-colors">
                  Pricing
                </a>
                <a href="/#/security" className="block hover:text-gray-900 transition-colors">
                  Security
                </a>
              </div>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                Company
              </p>
              <div className="space-y-3 text-sm text-gray-500">
                <Link href="/about" className="block hover:text-gray-900 transition-colors">
                  About
                </Link>
                <span className="block text-gray-300 cursor-default">
                  Terms
                </span>
                <span className="block text-gray-300 cursor-default">
                  Privacy
                </span>
              </div>
            </div>

            {/* Get started */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                Get Started
              </p>
              <div className="space-y-3">
                <a href="https://app.draftsendsign.com/#/signup">
                  <Button
                    size="sm"
                    className="w-full bg-[#c8210d] hover:bg-[#a61b0b] text-white"
                  >
                    Start Free Trial
                  </Button>
                </a>
                <a href="https://app.draftsendsign.com/#/login">
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    Sign In
                  </Button>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              © 2026 DraftSendSign. All rights reserved.
            </p>
            <p className="text-xs text-gray-300">
              Built for small teams. Priced for real businesses.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
