import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  PenTool,
  Clock,
  Bell,
  FolderOpen,
  Shield,
  FileCheck,
  Users,
  Smartphone,
  Zap,
  Globe,
  Lock,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const features = [
  { icon: PenTool, title: "Drag & Drop Field Editor", desc: "Place signature, initials, date, text, and checkbox fields anywhere on your documents. Assign fields to specific recipients with color-coded identifiers." },
  { icon: Clock, title: "Real-Time Status Tracking", desc: "Monitor every document's progress with live status updates. Know instantly when a document is viewed, signed, or declined." },
  { icon: Bell, title: "Automated Reminders", desc: "Set up automatic email reminders for pending signatures. Choose from daily, every 3 days, or weekly frequency." },
  { icon: FolderOpen, title: "Template Library", desc: "Save frequently used documents as templates. Pre-configure recipients, fields, and messages to send documents in seconds." },
  { icon: Users, title: "Team Management", desc: "Invite team members, assign roles, and manage permissions. Collaborate on documents with your entire organization." },
  { icon: Shield, title: "Comprehensive Audit Trails", desc: "Every action is logged with timestamps, IP addresses, and user agents. Generate tamper-proof audit certificates." },
  { icon: Smartphone, title: "Mobile-First Signing", desc: "Recipients can sign from any device — phone, tablet, or desktop. No app downloads required." },
  { icon: Zap, title: "Bulk Send", desc: "Send the same document to hundreds of recipients at once. Perfect for company-wide policies and agreements." },
  { icon: Globe, title: "API & Integrations", desc: "Connect with Google Drive, Dropbox, Salesforce, Slack, and more. Full REST API for custom integrations." },
  { icon: Lock, title: "Advanced Authentication", desc: "Require SMS or email verification before signing. Add an extra layer of security to sensitive documents." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Track document completion rates, average signing times, and team productivity metrics at a glance." },
  { icon: FileCheck, title: "Legal Compliance", desc: "ESIGN Act and UETA compliant. Your electronically signed documents are legally binding in all 50 states." },
];

export default function FeaturesPage() {
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
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Powerful features for modern teams</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create, send, and manage electronic signatures at scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#c8210d]/10 text-[#c8210d] mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">Ready to streamline your document workflow?</h2>
          <Link href="/signup">
            <Button size="lg" className="bg-[#c8210d] hover:bg-[#a61b0b] text-white px-8">
              Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
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
