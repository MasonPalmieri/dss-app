import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { PenTool, Lock } from "lucide-react";

// ── Signup is currently disabled during private beta ──────────────────────────
// To re-enable: delete this file's contents and restore the full signup form,
// or set VITE_BETA_CLOSED=false in your environment.

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-10 pb-10 space-y-6 text-center">
          {/* Logo */}
          <div className="flex items-center gap-3 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c8210d]">
              <PenTool className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">
              Draft<span className="text-[#c8210d]">Send</span>Sign
            </span>
          </div>

          {/* Lock icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
            <Lock className="h-7 w-7 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold">Private Beta</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              DraftSendSign is currently in private beta and not open for new
              signups. We're working hard to get ready for everyone.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/40 px-5 py-4 text-sm text-muted-foreground leading-relaxed">
            Already have an account?{" "}
            <Link href="/login" className="text-[#c8210d] font-medium hover:underline">
              Sign in here
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Want early access?{" "}
            <a
              href="mailto:help@draftsendsign.com"
              className="text-[#c8210d] hover:underline"
            >
              Contact us
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
