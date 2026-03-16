import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup({ fullName, email, password, company: company || undefined });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start your free trial — no credit card required</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="Mason Palmieri" value={fullName} onChange={(e) => setFullName(e.target.value)} required data-testid="signup-name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="mason@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="signup-email" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} data-testid="signup-password" />
              </div>
              <div>
                <Label htmlFor="company">Company (optional)</Label>
                <Input id="company" placeholder="Your company name" value={company} onChange={(e) => setCompany(e.target.value)} data-testid="signup-company" />
              </div>
              <Button type="submit" className="w-full bg-[#c8210d] hover:bg-[#a61b0b] text-white" disabled={loading} data-testid="signup-submit">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Account
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-4">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#c8210d] hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
