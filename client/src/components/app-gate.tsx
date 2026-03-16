import { useState, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff } from "lucide-react";

// The gate password — single source of truth
const GATE_PASSWORD = "DSS2026";

interface GateContextType {
  isUnlocked: boolean;
  unlock: (password: string) => boolean;
  lock: () => void;
}

const GateContext = createContext<GateContextType>({
  isUnlocked: false,
  unlock: () => false,
  lock: () => {},
});

export function useGate() {
  return useContext(GateContext);
}

export function GateProvider({ children }: { children: React.ReactNode }) {
  // Pure in-memory state — persists for the lifetime of the React app instance
  const [isUnlocked, setIsUnlocked] = useState(false);

  const unlock = (password: string): boolean => {
    if (password === GATE_PASSWORD) {
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  const lock = () => {
    setIsUnlocked(false);
  };

  return (
    <GateContext.Provider value={{ isUnlocked, unlock, lock }}>
      {children}
    </GateContext.Provider>
  );
}

// The password screen shown to blocked visitors
export function GateScreen() {
  const { unlock } = useGate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = unlock(password);
    if (!ok) {
      setError(true);
      setShaking(true);
      setPassword("");
      setTimeout(() => setShaking(false), 600);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
      {/* Subtle red glow behind the card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,33,13,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="relative w-full max-w-sm mx-4"
        style={{
          animation: shaking ? "shake 0.5s ease" : undefined,
        }}
      >
        <style>{`
          @keyframes shake {
            0%,100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
        `}</style>

        {/* Card */}
        <div
          className="rounded-xl p-8 border"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: error ? "rgba(200,33,13,0.5)" : "rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
            transition: "border-color 0.3s",
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: "#c8210d" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="white" opacity="0.9"/>
                <path d="M14 2v6h6" fill="white" opacity="0.6"/>
                <path d="M9 15l2 2 4-4" stroke="#c8210d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-white">
                Draft<span style={{ color: "#c8210d" }}>Send</span>Sign
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                Private beta
              </p>
            </div>
          </div>

          {/* Lock icon */}
          <div className="flex justify-center mb-6">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "rgba(200,33,13,0.12)", border: "1px solid rgba(200,33,13,0.25)" }}
            >
              <Lock className="h-4 w-4" style={{ color: "#c8210d" }} />
            </div>
          </div>

          <p className="text-center text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
            Enter your access code to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Access code"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                autoFocus
                data-testid="gate-password-input"
                className="pr-10 text-center tracking-widest text-white placeholder:tracking-normal placeholder:text-center"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: error ? "1px solid rgba(200,33,13,0.7)" : "1px solid rgba(255,255,255,0.1)",
                  outline: "none",
                  fontSize: 15,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <p className="text-center text-xs" style={{ color: "#ef4444" }}>
                Incorrect access code. Try again.
              </p>
            )}

            <Button
              type="submit"
              className="w-full font-semibold"
              data-testid="gate-submit"
              style={{ background: "#c8210d", color: "white" }}
              disabled={!password}
            >
              Enter
            </Button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
            Contact{" "}
            <a href="mailto:help@draftsendsign.com" style={{ color: "rgba(200,33,13,0.7)" }}>
              help@draftsendsign.com
            </a>{" "}
            for access
          </p>
        </div>
      </div>
    </div>
  );
}
