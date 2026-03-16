import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Shield,
  Lock,
  FileCheck,
  Eye,
  Server,
  Key,
  UserCheck,
  Globe,
  ArrowRight,
} from "lucide-react";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

const securityFeatures = [
  { icon: Lock, title: "256-bit AES Encryption", desc: "All documents are encrypted with AES-256 at rest and TLS 1.3 in transit. Your data is protected with the same standards used by banks and government agencies." },
  { icon: Eye, title: "Tamper-Proof Audit Trails", desc: "Every action is recorded with timestamps, IP addresses, and user agent strings. Our audit trails are cryptographically sealed and cannot be modified." },
  { icon: FileCheck, title: "ESIGN & UETA Compliance", desc: "DraftSendSign is fully compliant with the Electronic Signatures in Global and National Commerce Act (ESIGN) and the Uniform Electronic Transactions Act (UETA)." },
  { icon: Server, title: "SOC 2 Type II", desc: "Our infrastructure undergoes annual SOC 2 Type II audits. We maintain rigorous security controls across all aspects of our platform." },
  { icon: Key, title: "Multi-Factor Authentication", desc: "Require SMS or email verification before signing. Add an extra layer of identity verification for sensitive documents." },
  { icon: UserCheck, title: "Identity Verification", desc: "Verify signer identity through knowledge-based authentication, ID verification, and email/phone confirmation." },
  { icon: Globe, title: "Global Data Centers", desc: "Your data is stored in SOC 2 compliant data centers with 99.99% uptime guarantees. Choose data residency in US, EU, or APAC." },
  { icon: Shield, title: "Role-Based Access Control", desc: "Define granular permissions for team members. Control who can create, send, and manage documents at every level." },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
          <span className="font-bold">Draft<span className="text-[#c8210d]">Send</span>Sign</span>
          <div className="ml-auto flex gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link href="/signup"><Button size="sm" className="bg-[#c8210d] hover:bg-[#a61b0b] text-white">Start Free Trial</Button></Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Security & Trust</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your documents contain sensitive information. We protect them with enterprise-grade security at every layer.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {securityFeatures.map((f) => (
            <Card key={f.title} className="border">
              <CardContent className="p-6 flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center bg-muted/30 rounded-2xl p-12">
          <h2 className="text-2xl font-bold mb-4">Have security questions?</h2>
          <p className="text-muted-foreground mb-6">Our security team is available to discuss your specific compliance and security requirements.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-[#c8210d] hover:bg-[#a61b0b] text-white">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline">Contact Security Team</Button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">2026 DraftSendSign. All rights reserved.</p>
          <PerplexityAttribution />
        </div>
      </footer>
    </div>
  );
}
