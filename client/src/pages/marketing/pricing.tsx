import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const INDIVIDUAL_FEATURES = [
  "Unlimited e-signature requests",
  "Secure document storage up to 10 GB",
  "Document upload and sending tools",
  "Signature, date, initials, and text fields",
  "Signed document tracking",
  "Audit trail",
  "Downloadable completed documents",
  "Secure cloud-based access",
  "Cancel anytime",
];

const BUSINESS_FEATURES = [
  "Everything in Individual",
  "Shared company workspace",
  "100 GB of shared secure document storage",
  "User management and team access controls",
  "Centralized document visibility",
  "Scalable pricing as your team grows",
  "Cancel anytime",
  "No long-term commitments",
];

const INCLUDED_ALWAYS = [
  "Secure document handling on every plan",
  "Audit-backed signing records",
  "Cloud-based access from any device",
  "Streamlined signing experience for senders and recipients",
  "No setup fees or onboarding fees",
  "No forced annual commitments",
];

const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes. Both Individual and Business plans are month-to-month unless you choose annual billing for the Individual plan. You can cancel anytime with no long-term commitments." },
  { q: "Are there setup fees?", a: "No. There are no setup fees or onboarding fees." },
  { q: "How does Business pricing work?", a: "The Business plan starts at $19.99/month for the admin account. Each additional user is $2.99/month." },
  { q: "What happens if I run out of storage?", a: "If your account exceeds the included storage, additional storage is added in simple billing blocks. Individual accounts add 50 GB blocks for $3.99/month. Business accounts add 250 GB blocks for $9.99/month." },
  { q: "Do I have to sign a long-term contract?", a: "No. DraftSendSign is designed to be flexible. There are no forced long-term contracts." },
  { q: "Is DraftSendSign built for individuals and companies?", a: "Yes. The platform is built to work for solo users, small businesses, and growing organizations that need a practical and affordable document signing solution." },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-sm">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && <p className="text-sm text-muted-foreground pb-4 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          </Link>
          <span className="font-bold">Draft<span className="text-[#c8210d]">Send</span>Sign</span>
          <div className="ml-auto flex gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link href="/signup"><Button size="sm" className="bg-[#c8210d] hover:bg-[#a61b0b] text-white">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">

        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold">Simple, transparent pricing</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            For individuals and teams. No hidden fees. No long-term contracts. Just a secure, affordable way to draft, send, and sign documents.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Individual */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <CardTitle className="text-xl">Individual</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">For solo professionals, founders, independent contractors, and personal use.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">$4.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">or <strong>$49.99/year</strong> when billed annually</p>
                <p className="text-xs text-muted-foreground mt-0.5">Additional storage: $3.99/month per 50 GB block</p>
              </div>

              <Link href="/signup">
                <Button className="w-full bg-[#c8210d] hover:bg-[#a61b0b] text-white font-semibold">Get Started</Button>
              </Link>

              <ul className="space-y-2.5">
                {INDIVIDUAL_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-muted-foreground leading-relaxed border-t pt-4">
                This plan is built for users who need a reliable, low-cost e-signature platform without paying for bloated enterprise features they do not need.
              </p>
            </CardContent>
          </Card>

          {/* Business */}
          <Card className="relative border-[#c8210d] shadow-lg">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c8210d] text-white px-4">Best for Teams</Badge>
            <CardHeader>
              <CardTitle className="text-xl">Business</CardTitle>
              <p className="text-sm text-muted-foreground">For companies, teams, and organizations that need multiple users under one account.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">$19.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">for the admin account</p>
                <p className="text-sm font-medium mt-1">+ <strong>$2.99/month</strong> per additional user</p>
                <p className="text-xs text-muted-foreground mt-0.5">Additional storage: $9.99/month per 250 GB block</p>
              </div>

              <Link href="/signup">
                <Button className="w-full bg-[#c8210d] hover:bg-[#a61b0b] text-white font-semibold">Get Started</Button>
              </Link>

              <ul className="space-y-2.5">
                {BUSINESS_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-muted-foreground leading-relaxed border-t pt-4">
                This plan is designed for businesses that want affordable team-based e-signature functionality without being locked into expensive contracts or per-seat pricing that gets out of control.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Included with every plan */}
        <div className="bg-muted/40 rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl font-bold mb-2">What is included with every plan</h2>
          <p className="text-muted-foreground text-sm mb-6">Every DraftSendSign subscription includes the core tools needed to send and sign documents with confidence.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {INCLUDED_ALWAYS.map(f => (
              <div key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Storage section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Storage made simple</h2>
          <p className="text-muted-foreground leading-relaxed">
            Most users will never need to think about storage. Each plan includes a generous amount of secure document storage from the start. If your account grows beyond the included amount, additional storage is added in simple blocks so pricing remains predictable and easy to understand.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border rounded-xl p-5">
              <p className="font-semibold mb-1">Individual</p>
              <p className="text-sm text-muted-foreground">10 GB included · Additional 50 GB blocks at $3.99/month</p>
            </div>
            <div className="border rounded-xl p-5">
              <p className="font-semibold mb-1">Business</p>
              <p className="text-sm text-muted-foreground">100 GB shared storage · Additional 250 GB blocks at $9.99/month</p>
            </div>
          </div>
        </div>

        {/* Why DSS */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Why DraftSendSign</h2>
          <p className="text-muted-foreground leading-relaxed">
            DraftSendSign is built for users and businesses that want the core functionality of a modern e-signature platform without paying inflated enterprise pricing. It is simple, secure, cost-effective, and built to scale with your needs.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Whether you are sending one agreement a month or managing a growing team, DraftSendSign gives you a straightforward pricing model and the tools you actually need.
          </p>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="border rounded-xl px-6 divide-y">
            {FAQS.map(({ q, a }) => <FAQ key={q} q={q} a={a} />)}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-[#0d1117] rounded-2xl p-10 md:p-14 text-center space-y-4">
          <h2 className="text-3xl font-extrabold text-white">Start signing smarter with DraftSendSign.</h2>
          <p className="text-white/60">Affordable pricing. Secure document workflows. No nonsense.</p>
          <p className="text-white/50 text-sm">Choose the plan that fits your needs and get started today.</p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/signup">
              <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white font-semibold px-8">Get Started</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8">Sign In</Button>
            </Link>
          </div>
        </div>

      </div>

      <footer className="border-t py-8 mt-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">© 2026 DraftSendSign. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
