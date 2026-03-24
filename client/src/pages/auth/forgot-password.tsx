import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, KeyRound, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Step = "email" | "code" | "reset" | "done";

interface ForgotPasswordPageProps {
  initialStep?: Step;
  [key: string]: any;
}

export default function ForgotPasswordPage({ initialStep = "email" }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<Step>(initialStep);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://app.draftsendsign.com/#/reset-password",
      });
      if (error) throw error;
      setStep("code"); // repurposed: now shows "check your email" message
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStep("done");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 cursor-pointer mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c8210d]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="white" opacity="0.9"/><path d="M14 2v6h6" fill="white" opacity="0.6"/><path d="M9 15l2 2 4-4" stroke="#c8210d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className="text-xl font-bold">Draft<span className="text-[#c8210d]">Send</span>Sign</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold">
            {step === "email" && "Reset your password"}
            {step === "code" && "Check your email"}
            {step === "reset" && "Set new password"}
            {step === "done" && "Password reset!"}
          </h1>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["email", "code", "reset", "done"].map((s, i) => {
            const steps = ["email", "code", "reset", "done"];
            const currentIdx = steps.indexOf(step);
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < currentIdx ? "step-done" : i === currentIdx ? "step-active" : "step-pending"
                }`}>
                  {i < currentIdx ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < 3 && <div className={`w-8 h-0.5 ${i < currentIdx ? "bg-green-600" : "bg-muted"}`} />}
              </div>
            );
          })}
        </div>

        <Card>
          <CardContent className="pt-6">
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="forgot-email" />
                </div>
                <Button type="submit" className="w-full bg-[#c8210d] hover:bg-[#a61b0b] text-white" disabled={loading} data-testid="forgot-submit-email">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Send Reset Link
                </Button>
              </form>
            )}

            {step === "code" && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <Mail className="h-8 w-8" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We sent a password reset link to <strong>{email}</strong>. Click the link in your email to set a new password.
                  </p>
                </div>
                <Button
                  className="w-full bg-[#c8210d] hover:bg-[#a61b0b] text-white"
                  onClick={() => setStep("reset")}
                  data-testid="forgot-submit-code"
                >
                  I already clicked the link
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep("email")}
                >
                  Resend email
                </Button>
              </div>
            )}

            {step === "reset" && (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <KeyRound className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>
                </div>
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} data-testid="forgot-password" />
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required data-testid="forgot-confirm" />
                </div>
                <Button type="submit" className="w-full bg-[#c8210d] hover:bg-[#a61b0b] text-white" disabled={loading || password !== confirm} data-testid="forgot-submit-reset">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Reset Password
                </Button>
              </form>
            )}

            {step === "done" && (
              <div className="text-center py-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <Check className="h-8 w-8" />
                </div>
                <p className="text-sm text-muted-foreground mb-6">Your password has been successfully reset.</p>
                <Link href="/login">
                  <Button className="w-full bg-[#c8210d] hover:bg-[#a61b0b] text-white" data-testid="forgot-back-login">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/login" className="text-[#c8210d] hover:underline">
            <ArrowLeft className="inline h-3 w-3 mr-1" />
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
