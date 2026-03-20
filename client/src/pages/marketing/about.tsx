import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Target, Heart, Zap } from "lucide-react";

const values = [
  { icon: Target, title: "Speed", desc: "We believe document workflows should take minutes, not days. Every feature we build is designed to save time." },
  { icon: Heart, title: "Trust", desc: "Security isn't an afterthought — it's our foundation. We earn trust through transparency and rigorous protection." },
  { icon: Zap, title: "Simplicity", desc: "Powerful doesn't mean complicated. Our platform is intuitive enough for anyone to use on day one." },
];

const team = [
  { name: "Alex Chen", role: "CEO & Co-Founder", initials: "AC" },
  { name: "Sarah Park", role: "CTO & Co-Founder", initials: "SP" },
  { name: "Marcus Thompson", role: "VP Engineering", initials: "MT" },
  { name: "Elena Rodriguez", role: "VP Product", initials: "ER" },
];

export default function AboutPage() {
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
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About DraftSendSign</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to make document signing fast, secure, and accessible for every business.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              DraftSendSign was born from a simple frustration: why does it still take days to get a document signed?
              In an era of instant communication, the document signing process felt stuck in the past.
            </p>
            <p>
              Founded in 2024, we set out to build the fastest, most intuitive e-signature platform on the market.
              We combined enterprise-grade security with a consumer-grade user experience, making it possible
              for anyone — from solo freelancers to Fortune 500 companies — to send and sign documents in minutes.
            </p>
            <p>
              Today, over 10,000 businesses trust DraftSendSign to power their document workflows. We process
              millions of signatures every month and we're just getting started.
            </p>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v) => (
              <Card key={v.title} className="text-center border-0 shadow-sm">
                <CardContent className="p-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#c8210d]/10 text-[#c8210d]">
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Leadership</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {team.map((t) => (
              <div key={t.name} className="text-center">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#c8210d]/10 text-[#c8210d] text-xl font-bold">
                  {t.initials}
                </div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center bg-muted/30 rounded-2xl p-12">
          <h2 className="text-2xl font-bold mb-4">Join us on our mission</h2>
          <p className="text-muted-foreground mb-6">We're always looking for talented people who share our vision.</p>
          <Link href="/signup">
            <Button size="lg" className="bg-[#c8210d] hover:bg-[#a61b0b] text-white">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
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
