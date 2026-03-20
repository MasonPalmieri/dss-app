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
  Bell,
  FolderOpen,
  Lock,
  FileCheck,
  ArrowRight,
  Check,
  Star,
  Building2,
  Scale,
  Home,
  Briefcase,
} from "lucide-react";

const steps = [
  { icon: Upload, title: "Upload", desc: "Drag & drop your PDF documents" },
  { icon: Users, title: "Add Recipients", desc: "Add signers, set signing order" },
  { icon: PenTool, title: "Sign", desc: "Recipients sign from any device" },
];

const features = [
  { icon: PenTool, title: "Drag & Drop Fields", desc: "Place signature, date, and text fields anywhere on your documents with an intuitive editor." },
  { icon: Clock, title: "Real-Time Tracking", desc: "Know exactly when documents are viewed, signed, or declined with live status updates." },
  { icon: Bell, title: "Smart Reminders", desc: "Automated reminders ensure documents get signed on time, every time." },
  { icon: FolderOpen, title: "Template Library", desc: "Save time with reusable templates for your most common agreements." },
  { icon: Shield, title: "Bank-Grade Security", desc: "256-bit encryption, SOC 2 compliance, and comprehensive audit trails." },
  { icon: FileCheck, title: "Legal Compliance", desc: "Fully compliant with ESIGN Act and UETA for legally binding signatures." },
];

const useCases = [
  { icon: Scale, title: "Law Firms", desc: "Streamline client agreements, retainers, and court filings." },
  { icon: Home, title: "Real Estate", desc: "Close deals faster with instant lease and purchase agreements." },
  { icon: Briefcase, title: "HR Teams", desc: "Onboard employees with offer letters and policy acknowledgments." },
  { icon: Building2, title: "Startups", desc: "Move fast with investor agreements, NDAs, and contractor terms." },
];

const plans = [
  { name: "Starter", price: "Free", docs: "3 docs/mo", users: "1 user" },
  { name: "Professional", price: "$15", docs: "50 docs/mo", users: "3 users", popular: true },
  { name: "Business", price: "$35", docs: "Unlimited", users: "10 users" },
];

const testimonials = [
  { quote: "DraftSendSign cut our contract turnaround time from 5 days to under 4 hours. Our legal team can't imagine going back.", name: "Sarah Chen", role: "General Counsel, TechCorp" },
  { quote: "The template library alone saves us 10 hours a week. The signing experience is so smooth our clients actually comment on it.", name: "Marcus Rodriguez", role: "Managing Partner, Rodriguez & Associates" },
  { quote: "We switched from DocuSign and saved 60% on costs while getting a better product. The audit trail features are incredible.", name: "Emily Watson", role: "VP Operations, GrowthCo" },
];

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8210d]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="white" opacity="0.9"/><path d="M14 2v6h6" fill="white" opacity="0.6"/><path d="M9 15l2 2 4-4" stroke="#c8210d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className="text-lg font-bold">Draft<span className="text-[#c8210d]">Send</span>Sign</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" data-testid="nav-login">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" data-testid="nav-signup">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Badge className="mb-6 bg-[#c8210d]/10 text-[#c8210d] border-[#c8210d]/20 hover:bg-[#c8210d]/15">
            Trusted by 10,000+ businesses
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Draft. Send. <span className="text-[#c8210d]">Sign.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Send legally binding agreements and collect signatures in minutes — not days.
            The modern e-signature platform built for speed and security.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-[#c8210d] hover:bg-[#a61b0b] text-white px-8 h-12 text-base glow-red" data-testid="hero-cta-trial">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base border-gray-600 text-gray-300 hover:bg-gray-800" data-testid="hero-cta-demo">
                Request Demo
              </Button>
            </Link>
          </div>
          {/* Mock Dashboard Preview */}
          <div className="mt-16 max-w-4xl mx-auto rounded-xl border border-gray-700 bg-gray-900/50 shadow-2xl overflow-hidden">
            <div className="h-8 bg-gray-800 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-xs text-gray-500">app.draftsendsign.com</span>
            </div>
            <div className="p-6 grid grid-cols-4 gap-4">
              {[{ label: "Sent", value: "127" }, { label: "Pending", value: "23" }, { label: "Completed", value: "89" }, { label: "Drafts", value: "15" }].map(s => (
                <div key={s.label} className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3">
                {["Non-Disclosure Agreement", "Employment Contract", "Service Agreement"].map((d, i) => (
                  <div key={d} className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0">
                    <span className="text-sm text-gray-300">{d}</span>
                    <Badge className={i === 0 ? "status-completed" : i === 1 ? "status-pending" : "status-draft"}>
                      {i === 0 ? "Completed" : i === 1 ? "Pending" : "Draft"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Three simple steps</h2>
            <p className="text-muted-foreground text-lg">Get documents signed in minutes, not days</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center group">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c8210d]/10 text-[#c8210d] group-hover:bg-[#c8210d] group-hover:text-white transition-colors">
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="text-sm font-bold text-[#c8210d] mb-2">Step {i + 1}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground text-lg">Powerful features for modern document workflows</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c8210d]/10 text-[#c8210d] mb-4">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for your industry</h2>
            <p className="text-muted-foreground text-lg">Trusted by teams across every sector</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc) => (
              <Card key={uc.title} className="text-center border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#c8210d]/10 text-[#c8210d]">
                    <uc.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{uc.title}</h3>
                  <p className="text-muted-foreground text-sm">{uc.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-grade security</h2>
            <p className="text-muted-foreground text-lg">Your documents are protected at every step</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Lock, title: "256-bit Encryption", desc: "All documents encrypted in transit and at rest" },
              { icon: Shield, title: "Audit Trails", desc: "Complete, tamper-proof record of every action" },
              { icon: FileCheck, title: "ESIGN & UETA", desc: "Fully compliant with US electronic signature laws" },
            ].map((s) => (
              <div key={s.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">Start free, upgrade as you grow</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? "border-[#c8210d] shadow-lg" : "border-border"}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c8210d] text-white">Most Popular</Badge>
                )}
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                  <p className="text-3xl font-extrabold mb-1">{plan.price}</p>
                  {plan.price !== "Free" && <p className="text-xs text-muted-foreground mb-4">/month</p>}
                  {plan.price === "Free" && <p className="text-xs text-muted-foreground mb-4">forever</p>}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>{plan.docs}</p>
                    <p>{plan.users}</p>
                  </div>
                  <Link href="/signup">
                    <Button className={`w-full mt-6 ${plan.popular ? "bg-[#c8210d] hover:bg-[#a61b0b] text-white" : ""}`} variant={plan.popular ? "default" : "outline"}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing" className="text-[#c8210d] hover:underline text-sm font-medium">
              View full pricing comparison <ArrowRight className="inline h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by teams everywhere</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{t.quote}"</p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 hero-gradient">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-gray-400 text-lg mb-8">Join thousands of businesses that trust DraftSendSign for their document workflows.</p>
          <Link href="/signup">
            <Button size="lg" className="bg-[#c8210d] hover:bg-[#a61b0b] text-white px-8 h-12 glow-red">
              Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-[#c8210d]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="white" opacity="0.9"/></svg>
                </div>
                <span className="font-bold">Draft<span className="text-[#c8210d]">Send</span>Sign</span>
              </div>
              <p className="text-sm text-muted-foreground">The modern e-signature platform for fast-moving teams.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/features" className="block hover:text-foreground">Features</Link>
                <Link href="/pricing" className="block hover:text-foreground">Pricing</Link>
                <Link href="/security" className="block hover:text-foreground">Security</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/about" className="block hover:text-foreground">About</Link>
                <span className="block">Careers</span>
                <span className="block">Contact</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Legal</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <span className="block">Privacy Policy</span>
                <span className="block">Terms of Service</span>
                <span className="block">Cookie Policy</span>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">2026 DraftSendSign. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
