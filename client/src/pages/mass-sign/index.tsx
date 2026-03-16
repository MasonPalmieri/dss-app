import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockApi } from "@/lib/mockApi";
import type { MassCampaign } from "@/lib/mockApi";
import {
  CheckCircle2, PenLine, RotateCcw, ArrowRight, FileSignature, Shield,
} from "lucide-react";

// ─── Signature canvas ─────────────────────────────────────────────────────────
function SignatureCanvas({
  onSign,
  onClear,
  hasSignature,
}: {
  onSign: (dataUrl: string) => void;
  onClear: () => void;
  hasSignature: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as MouseEvent).clientX - rect.left, y: (e as MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: MouseEvent | TouchEvent) => {
    drawing.current = true;
    const canvas = canvasRef.current!;
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!drawing.current || !canvasRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#0d1117";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPos.current = null;
    // Emit signature data
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasData = Array.from(imageData.data).some((v, i) => i % 4 === 3 && v > 0);
    if (hasData) onSign(canvas.toDataURL("image/png"));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endDraw);
    canvas.addEventListener("mouseleave", endDraw);
    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", endDraw);
    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", endDraw);
      canvas.removeEventListener("mouseleave", endDraw);
      canvas.removeEventListener("touchstart", startDraw);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", endDraw);
    };
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    onClear();
  };

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden" style={{ height: 140 }}>
        <canvas
          ref={canvasRef}
          width={560}
          height={140}
          className="w-full h-full touch-none cursor-crosshair"
          style={{ display: "block" }}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 text-slate-400">
              <PenLine className="h-5 w-5" />
              <span className="text-sm">Draw your signature here</span>
            </div>
          </div>
        )}
      </div>
      {hasSignature && (
        <button
          onClick={clearCanvas}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Clear and redo
        </button>
      )}
    </div>
  );
}

// ─── NDA / Waiver document text ───────────────────────────────────────────────
function AgreementText({ campaign }: { campaign: MassCampaign }) {
  return (
    <div
      className="bg-white border rounded-xl p-6 text-sm leading-relaxed max-h-64 overflow-y-auto"
      style={{ fontFamily: "Georgia, serif", color: "#1a1a1a" }}
    >
      <p className="font-bold text-center text-base mb-4 uppercase tracking-wide" style={{ fontFamily: "Arial, sans-serif" }}>
        {campaign.documentName.replace(".pdf", "")}
      </p>
      <p className="mb-3">
        By signing below, I acknowledge and agree to the terms set forth in this agreement. I understand that this document constitutes a legally binding agreement between myself and <strong>{campaign.title.replace("Liability Waiver", "").replace("Agreement", "").trim() || "the organization"}</strong>.
      </p>
      <p className="mb-3">
        I agree to hold harmless and release from liability the organization, its officers, directors, employees, agents, and volunteers from any and all claims, demands, actions, or causes of action arising from my participation in activities on the premises.
      </p>
      <p className="mb-3">
        I certify that I am of legal age and have the authority to enter into this agreement. I have read and understand the terms outlined above and agree to be bound by them.
      </p>
      <p className="text-xs text-slate-500 mt-4 border-t pt-4">
        This agreement is executed electronically. Electronic signatures are legally binding under the ESIGN Act and UETA.
      </p>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
type Step = "form" | "sign" | "done";

export default function MassSignPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [signatureData, setSignatureData] = useState("");
  const [hasSignature, setHasSignature] = useState(false);

  const { data: campaign, isLoading, error } = useQuery<MassCampaign>({
    queryKey: ["/api/mass-campaigns/token", token],
    queryFn: () => mockApi.getMassCampaignByToken(token!),
    enabled: !!token,
  });

  const submitMutation = useMutation({
    mutationFn: () => mockApi.submitMassSignature(token!, fullName.trim(), signatureData),
    onSuccess: () => setStep("done"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <FileSignature className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Link not found</h2>
          <p className="text-sm text-muted-foreground">This signing link is invalid or has expired. Contact the sender for a new link.</p>
        </div>
      </div>
    );
  }

  if (campaign.status !== "active") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <FileSignature className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Campaign closed</h2>
          <p className="text-sm text-muted-foreground">This signing campaign is no longer accepting new signatures.</p>
        </div>
      </div>
    );
  }

  // ── Done screen ──
  if (step === "done") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-5">
            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">You're all signed!</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Thanks, <strong>{fullName}</strong>. Your signature has been recorded.
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agreement</p>
              <p className="text-sm font-medium">{campaign.title}</p>
              <p className="text-xs text-muted-foreground">{campaign.documentName}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              A record of your signature has been securely stored.{" "}
              <span className="inline-flex items-center gap-1">
                <Shield className="h-3 w-3" />
                ESIGN Act compliant
              </span>
            </p>
            <div className="pt-2">
              <p className="text-xs text-slate-400">
                Powered by{" "}
                <span className="font-semibold" style={{ color: "#c8210d" }}>Draft</span>
                <span className="font-semibold">Send</span>
                <span className="font-semibold">Sign</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="w-full max-w-lg mx-auto space-y-5">

        {/* Branding header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#c8210d" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="white" opacity="0.9"/>
                <path d="M14 2v6h6" fill="white" opacity="0.6"/>
                <path d="M9 15l2 2 4-4" stroke="#c8210d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-bold">
              Draft<span style={{ color: "#c8210d" }}>Send</span>Sign
            </span>
          </div>
          <h1 className="text-xl font-bold">{campaign.title}</h1>
          {campaign.description && (
            <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3">
          {["Your Info", "Sign"].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                style={{
                  backgroundColor: step === "form" && i === 0 || step === "sign" && i === 1 ? "#c8210d" : (
                    (step === "sign" && i === 0) ? "#10b981" : "#e5e7eb"
                  ),
                  color: step === "form" && i === 0 || step === "sign" && i === 1 || (step === "sign" && i === 0) ? "white" : "#6b7280",
                }}
              >
                {step === "sign" && i === 0 ? "✓" : i + 1}
              </div>
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              {i < 1 && <div className="w-8 h-px bg-slate-200" />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">

          {step === "form" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="full-name" className="text-sm font-semibold">Full Legal Name *</Label>
                <Input
                  id="full-name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="text-base h-12"
                  autoFocus
                  data-testid="mass-sign-name-input"
                />
                <p className="text-xs text-muted-foreground">This name will appear on the signed agreement.</p>
              </div>

              <AgreementText campaign={campaign} />

              <Button
                className="w-full h-12 text-base font-semibold gap-2"
                style={{ backgroundColor: "#c8210d" }}
                disabled={!fullName.trim()}
                onClick={() => setStep("sign")}
                data-testid="mass-sign-continue-btn"
              >
                Continue to Signature
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {step === "sign" && (
            <>
              <div>
                <p className="font-semibold text-sm mb-0.5">Signing as: <span className="text-[#c8210d]">{fullName}</span></p>
                <p className="text-xs text-muted-foreground">Draw your signature in the box below to execute the agreement.</p>
              </div>

              <SignatureCanvas
                hasSignature={hasSignature}
                onSign={(data) => { setSignatureData(data); setHasSignature(true); }}
                onClear={() => { setSignatureData(""); setHasSignature(false); }}
              />

              <div className="flex items-start gap-2.5 bg-slate-50 rounded-lg p-3">
                <Shield className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  By signing, you agree to the terms of <strong>{campaign.documentName.replace(".pdf", "")}</strong>. Your signature is legally binding under the ESIGN Act.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("form")}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 h-11 font-semibold gap-2"
                  style={{ backgroundColor: "#c8210d" }}
                  disabled={!hasSignature || submitMutation.isPending}
                  onClick={() => submitMutation.mutate()}
                  data-testid="mass-sign-submit-btn"
                >
                  {submitMutation.isPending ? "Submitting…" : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Submit Signature
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400">
          Secured by DraftSendSign · ESIGN Act compliant
        </p>
      </div>
    </div>
  );
}
