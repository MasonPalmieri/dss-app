import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  PenTool, Type, Upload, Check, CheckCircle2, FileText,
  X, AlertCircle, Clock, ChevronRight, ChevronLeft, ArrowDown,
} from "lucide-react";
import { useHashLocation } from "wouter/use-hash-location";

// ── PDF page renderer ────────────────────────────────────────────────────────
function PdfPageViewer({
  signedUrl,
  pageNum,
  onPageCount,
}: {
  signedUrl: string;
  pageNum: number;
  onPageCount?: (n: number) => void;
}) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(false); setImgSrc(null);
    (async () => {
      try {
        const response = await fetch(signedUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buf = await response.arrayBuffer();
        const pdfjsLib = await import("pdfjs-dist");
        const workerUrl = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).href;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        // Report total pages on first page load
        if (pageNum === 1 && onPageCount) onPageCount(pdf.numPages);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
        if (!cancelled) setImgSrc(canvas.toDataURL("image/jpeg", 0.92));
      } catch { if (!cancelled) setError(true); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [signedUrl, pageNum]);

  if (loading) return (
    <div className="flex items-center justify-center w-full min-h-[400px]">
      <div className="animate-spin h-6 w-6 border-2 border-[#c8210d] border-t-transparent rounded-full" />
    </div>
  );
  if (error || !imgSrc) return (
    <div className="flex flex-col items-center justify-center w-full min-h-[400px] text-muted-foreground">
      <FileText className="h-10 w-10 mb-2 opacity-30" />
      <p className="text-sm">Could not load page {pageNum}</p>
    </div>
  );
  return <img src={imgSrc} alt={`Page ${pageNum}`} className="w-full h-auto block" />;
}

// ── Main signing page ────────────────────────────────────────────────────────
export default function SigningPage() {
  const [location] = useHashLocation();
  const tokenMatch = location.match(/\/sign\/([^/]+)/);
  const token = tokenMatch?.[1] || "";

  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signatureTab, setSignatureTab] = useState("type");
  const [typedName, setTypedName] = useState("");
  const [completed, setCompleted] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentScreen, setShowConsentScreen] = useState(true);
  const [signerIp, setSignerIp] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [signedAt] = useState(new Date().toISOString());

  // Field refs for auto-scroll
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(r => r.json()).then(d => setSignerIp(d.ip || "")).catch(() => setSignerIp("unknown"));
  }, []);

  const { data: signingData, isLoading } = useQuery<any>({
    queryKey: [`/api/sign/${token}`],
    enabled: !!token,
  });

  const document = signingData?.document;
  const recipient = signingData?.recipient;
  const allFields = signingData?.fields || [];
  const fields = allFields.filter((f: any) => !f.recipientId || f.recipientId === recipient?.id);
  const currentField = fields[currentFieldIndex];

  const isExpired = document?.expiresAt && new Date(document.expiresAt) < new Date();
  const isVoided = document?.status === "voided";
  const alreadySigned = recipient?.status === "signed";

  const filledCount = fields.filter((f: any) => !!fieldValues[f.id]).length;
  const progress = fields.length > 0 ? Math.round((filledCount / fields.length) * 100) : 0;
  const allFilled = filledCount >= fields.filter((f: any) => f.required).length;

  const submitMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/sign/${token}/complete`, {
        fields: fieldValues, signature: signatureData, ipAddress: signerIp, signedAt,
      });
    },
    onSuccess: () => setCompleted(true),
  });

  // Auto-scroll to current field
  const scrollToField = useCallback((idx: number) => {
    const f = fields[idx];
    if (!f) return;
    const el = fieldRefs.current[f.id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [fields]);

  // Advance to next unfilled field after completing one
  const advanceToNext = useCallback((fromIdx: number) => {
    const next = fields.findIndex((f: any, i: number) => i > fromIdx && !fieldValues[f.id]);
    if (next !== -1) {
      setCurrentFieldIndex(next);
      setTimeout(() => scrollToField(next), 100);
    }
  }, [fields, fieldValues, scrollToField]);

  // Handle clicking a field on the document
  const handleFieldClick = (f: any, idx: number) => {
    setCurrentFieldIndex(idx);
    if (f.type === "signature" || f.type === "initials") {
      setShowSignModal(true);
    } else if (f.type === "date") {
      const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      setFieldValues(prev => ({ ...prev, [f.id]: today }));
      setTimeout(() => advanceToNext(idx), 300);
    } else if (f.type === "name") {
      setFieldValues(prev => ({ ...prev, [f.id]: recipient?.name || "" }));
      setTimeout(() => advanceToNext(idx), 300);
    } else if (f.type === "company") {
      // Leave for user to fill — open a quick inline input? For now auto-fill empty
      setFieldValues(prev => ({ ...prev, [f.id]: "" }));
    }
  };

  const applySignature = () => {
    if (!currentField) return;
    const value = signatureTab === "type" ? (typedName ? `typed:${typedName}` : "") : (signatureData || "");
    if (!value) return;
    setFieldValues(prev => ({ ...prev, [currentField.id]: value }));
    setShowSignModal(false);
    const idx = currentFieldIndex;
    setTimeout(() => advanceToNext(idx), 300);
  };

  // Canvas drawing — mouse
  const getPos = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    return { x: (clientX - rect.left) * canvas.width / rect.width, y: (clientY - rect.top) * canvas.height / rect.height };
  };
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    setIsDrawing(true);
    const { x, y } = getPos(canvas, e.clientX, e.clientY);
    ctx.beginPath(); ctx.moveTo(x, y);
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const { x, y } = getPos(canvas, e.clientX, e.clientY);
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#1a1a1a";
    ctx.lineTo(x, y); ctx.stroke();
  };
  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) setSignatureData(canvas.toDataURL());
  };
  const startTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    setIsDrawing(true);
    const touch = e.touches[0];
    const { x, y } = getPos(canvas, touch.clientX, touch.clientY);
    ctx.beginPath(); ctx.moveTo(x, y);
  };
  const touchDraw = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const touch = e.touches[0];
    const { x, y } = getPos(canvas, touch.clientX, touch.clientY);
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#1a1a1a";
    ctx.lineTo(x, y); ctx.stroke();
  };
  const stopTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => { e.preventDefault(); stopDrawing(); };
  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  // ── Loading ──
  if (isLoading || (!signingData && !completed)) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-2 border-[#c8210d] border-t-transparent rounded-full" />
          <p className="text-sm text-white/40">Loading document...</p>
        </div>
      </div>
    );
  }

  // ── Done ──
  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-8 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">Document Signed</h1>
            <p className="text-muted-foreground">Thank you for signing. All parties will receive a copy once the document is fully executed.</p>
            <Separator />
            <div className="text-sm text-muted-foreground">
              <p>Signed by: {recipient?.name || "You"}</p>
              <p>Date: {new Date().toLocaleDateString()}</p>
            </div>
            <p className="text-xs text-muted-foreground">You may close this window.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Status screens ──
  if (alreadySigned) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center"><CardContent className="pt-12 pb-8 space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500 mx-auto"><CheckCircle2 className="h-8 w-8" /></div>
        <h1 className="text-2xl font-bold">Already Signed</h1>
        <p className="text-muted-foreground">You have already signed this document. Thank you.</p>
      </CardContent></Card>
    </div>
  );
  if (isExpired) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center"><CardContent className="pt-12 pb-8 space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 mx-auto"><Clock className="h-8 w-8" /></div>
        <h1 className="text-2xl font-bold">Link Expired</h1>
        <p className="text-muted-foreground">This signing link has expired. Please contact the sender to request a new link.</p>
      </CardContent></Card>
    </div>
  );
  if (isVoided) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center"><CardContent className="pt-12 pb-8 space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500 mx-auto"><AlertCircle className="h-8 w-8" /></div>
        <h1 className="text-2xl font-bold">Document Voided</h1>
        <p className="text-muted-foreground">This document has been voided. Please contact the sender for more information.</p>
      </CardContent></Card>
    </div>
  );

  // ── Consent screen ──
  if (showConsentScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="flex items-center gap-3 justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c8210d]">
                <PenTool className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">Draft<span className="text-[#c8210d]">Send</span>Sign</span>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold mb-1">Review &amp; Sign</h1>
              <p className="text-sm text-muted-foreground">
                <strong>{recipient?.name}</strong>, you've been asked to sign
              </p>
              <p className="text-sm font-medium mt-1">{document?.title}</p>
            </div>
            <Separator />
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p className="font-medium text-sm text-foreground">Before you sign, please understand:</p>
              <p>• Your electronic signature is legally binding under the ESIGN Act and eIDAS Regulation.</p>
              <p>• Your IP address and timestamp will be recorded as part of the audit trail.</p>
              <p>• By signing, you agree to conduct this transaction electronically.</p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consentGiven} onChange={e => setConsentGiven(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 cursor-pointer" />
              <span className="text-sm text-muted-foreground leading-relaxed">
                I agree to use electronic signatures and understand this is legally binding.
              </span>
            </label>
            <Button
              className="w-full bg-[#c8210d] hover:bg-[#a61b0b] text-white font-semibold h-11"
              disabled={!consentGiven}
              onClick={() => { setShowConsentScreen(false); setTimeout(() => scrollToField(0), 300); }}
            >
              Continue to Sign <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              Sent via DraftSendSign &middot; app.draftsendsign.com
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main signing UI ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sticky header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo + title — hide title on mobile */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#c8210d] text-white shrink-0">
              <PenTool className="h-3.5 w-3.5" />
            </div>
            <span className="hidden sm:block font-semibold text-sm truncate">{document?.title || "Document"}</span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{filledCount}/{fields.length}</span>
          </div>

          <Button
            className="bg-[#c8210d] hover:bg-[#a61b0b] text-white shrink-0"
            size="sm"
            disabled={!allFilled || submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
            data-testid="finish-signing"
          >
            <Check className="h-4 w-4 mr-1" />
            {submitMutation.isPending ? "Submitting..." : "Finish & Sign"}
          </Button>
        </div>

        {/* Guided prompt bar — shows current task */}
        {currentField && !fieldValues[currentField.id] && (
          <div className="bg-[#c8210d] text-white text-sm px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4 animate-bounce shrink-0" />
              <span>
                Step {currentFieldIndex + 1} of {fields.length}:&nbsp;
                <strong>
                  {currentField.type === "signature" ? "Add your signature" :
                   currentField.type === "initials" ? "Add your initials" :
                   currentField.type === "date" ? "Click the date field to fill today's date" :
                   currentField.type === "name" ? "Click to fill your name" :
                   `Fill in: ${currentField.label}`}
                </strong>
              </span>
            </div>
            <button
              className="text-white/70 hover:text-white text-xs underline whitespace-nowrap ml-4"
              onClick={() => scrollToField(currentFieldIndex)}
            >
              Show me
            </button>
          </div>
        )}
        {currentField && fieldValues[currentField.id] && filledCount < fields.length && (
          <div className="bg-green-600 text-white text-sm px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Done! {fields.length - filledCount} field{fields.length - filledCount !== 1 ? "s" : ""} remaining.</span>
            </div>
            <button
              className="text-white/80 hover:text-white text-xs underline whitespace-nowrap ml-4"
              onClick={() => {
                const next = fields.findIndex((f: any) => !fieldValues[f.id]);
                if (next !== -1) { setCurrentFieldIndex(next); scrollToField(next); }
              }}
            >
              Next field →
            </button>
          </div>
        )}
        {allFilled && (
          <div className="bg-green-700 text-white text-sm px-4 py-2 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>All fields complete — click <strong>Finish &amp; Sign</strong> above to submit.</span>
          </div>
        )}
      </header>

      {/* Document */}
      <div className="max-w-4xl mx-auto sm:p-4 pb-24">
        {/* Field progress chips — horizontally scrollable on mobile */}
        {fields.length > 0 && (
          <div className="flex gap-2 mb-4 sm:flex-wrap overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {fields.map((f: any, idx: number) => {
              const isFilled = !!fieldValues[f.id];
              const isCurrent = idx === currentFieldIndex;
              return (
                <button
                  key={f.id}
                  onClick={() => { setCurrentFieldIndex(idx); scrollToField(idx); }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    isFilled ? "bg-green-500/10 border-green-300 text-green-700" :
                    isCurrent ? "bg-[#c8210d]/10 border-[#c8210d]/40 text-[#c8210d]" :
                    "bg-white border-gray-200 text-muted-foreground hover:border-gray-400"
                  }`}
                >
                  {isFilled ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-current" />}
                  {f.label || f.type}
                </button>
              );
            })}
          </div>
        )}

        {/* PDF with fields overlaid — all pages stacked */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="relative w-full" style={{ aspectRatio: document?.pdfSignedUrl ? undefined : "8.5/11" }}>
            {document?.pdfSignedUrl ? (
              <div className="relative w-full">
                {/* Render all pages stacked */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <div key={pageNum} className="relative w-full">
                    {pageNum > 1 && (
                      <div className="text-xs text-center text-muted-foreground py-2 bg-gray-100 border-y">
                        Page {pageNum} of {totalPages}
                      </div>
                    )}
                    <PdfPageViewer
                      signedUrl={document.pdfSignedUrl}
                      pageNum={pageNum}
                      onPageCount={pageNum === 1 ? setTotalPages : undefined}
                    />
                  </div>
                ))}
                {fields.map((f: any, idx: number) => {
                  const isFilled = !!fieldValues[f.id];
                  const isCurrent = idx === currentFieldIndex;
                  return (
                    <div
                      key={f.id}
                      ref={el => { fieldRefs.current[f.id] = el; }}
                      className={`absolute border-2 rounded cursor-pointer flex items-center justify-center transition-all ${
                        isCurrent && !isFilled ? "border-[#c8210d] bg-[#c8210d]/10 ring-2 ring-[#c8210d]/30 animate-pulse" :
                        isFilled ? "border-green-500 bg-green-500/10" :
                        "border-amber-400 bg-amber-50/80 hover:border-amber-500"
                      }`}
                      style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.width || 24}%`, height: `${f.height || 6}%` }}
                      onClick={() => handleFieldClick(f, idx)}
                    >
                      {isFilled ? (
                        <span className="text-xs font-medium text-green-700 truncate px-2">
                          {fieldValues[f.id]?.startsWith("typed:") ? fieldValues[f.id].replace("typed:", "") :
                           fieldValues[f.id]?.startsWith("data:") ? "✓ Signed" : fieldValues[f.id]}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-amber-700 flex items-center gap-1">
                          {f.type === "signature" ? <PenTool className="h-3 w-3" /> : null}
                          {f.label || f.type}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Mock document for no-PDF case */
              <div className="relative w-full" style={{ aspectRatio: "8.5/11" }}>
                <div className="absolute inset-0 p-12 space-y-3 pointer-events-none opacity-20">
                  {[...Array(25)].map((_, i) => (
                    <div key={i} className="h-2 bg-gray-400 rounded" style={{ width: `${60 + Math.random() * 35}%` }} />
                  ))}
                </div>
                {fields.map((f: any, idx: number) => {
                  const isFilled = !!fieldValues[f.id];
                  const isCurrent = idx === currentFieldIndex;
                  return (
                    <div
                      key={f.id}
                      ref={el => { fieldRefs.current[f.id] = el; }}
                      className={`absolute border-2 rounded cursor-pointer flex items-center justify-center transition-all ${
                        isCurrent && !isFilled ? "border-[#c8210d] bg-[#c8210d]/10 ring-2 ring-[#c8210d]/30 animate-pulse" :
                        isFilled ? "border-green-500 bg-green-500/10" :
                        "border-amber-400 bg-amber-50/80 hover:border-amber-500"
                      }`}
                      style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.width || 24}%`, height: `${f.height || 6}%` }}
                      onClick={() => handleFieldClick(f, idx)}
                    >
                      {isFilled ? (
                        <span className="text-xs font-medium text-green-700 truncate px-2">
                          {fieldValues[f.id]?.startsWith("typed:") ? fieldValues[f.id].replace("typed:", "") :
                           fieldValues[f.id]?.startsWith("data:") ? "✓ Signed" : fieldValues[f.id]}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-amber-700">{f.label || f.type}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Previous / Next navigation — full-width on mobile */}
        {fields.length > 1 && (
          <div className="flex items-center justify-between mt-4 gap-2 px-4 sm:px-0">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none"
              disabled={currentFieldIndex <= 0}
              onClick={() => { const i = currentFieldIndex - 1; setCurrentFieldIndex(i); scrollToField(i); }}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous field
            </Button>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{currentFieldIndex + 1} of {fields.length}</span>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none"
              disabled={currentFieldIndex >= fields.length - 1}
              onClick={() => { const i = currentFieldIndex + 1; setCurrentFieldIndex(i); scrollToField(i); }}
            >
              Next field <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Signature modal */}
      <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentField?.type === "initials" ? "Add Your Initials" : "Add Your Signature"}
            </DialogTitle>
          </DialogHeader>
          <Tabs value={signatureTab} onValueChange={setSignatureTab}>
            <TabsList className="w-full">
              <TabsTrigger value="type" className="flex-1 gap-1.5"><Type className="h-4 w-4" /> Type</TabsTrigger>
              <TabsTrigger value="draw" className="flex-1 gap-1.5"><PenTool className="h-4 w-4" /> Draw</TabsTrigger>
              <TabsTrigger value="upload" className="flex-1 gap-1.5"><Upload className="h-4 w-4" /> Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="type" className="mt-4">
              <Input placeholder="Type your full name" value={typedName}
                onChange={e => setTypedName(e.target.value)} className="text-center" autoFocus
                data-testid="signature-typed-input" />
              {typedName && (
                <div className="mt-3 p-4 border rounded-lg text-center bg-white">
                  <p className="text-2xl italic text-gray-800" style={{ fontFamily: "cursive" }}>{typedName}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="draw" className="mt-4">
              <div className="border rounded-lg p-1 relative">
                <canvas ref={canvasRef} width={360} height={150}
                  className="w-full cursor-crosshair bg-white rounded touch-none"
                  style={{ touchAction: "none" }}
                  onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                  onTouchStart={startTouchDrawing} onTouchMove={touchDraw} onTouchEnd={stopTouchDrawing}
                  data-testid="signature-canvas" />
                <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={clearCanvas}>
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">Draw your signature above</p>
            </TabsContent>

            <TabsContent value="upload" className="mt-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-[#c8210d]/50 transition-colors"
                onClick={() => {
                  const input = window.document.createElement("input");
                  input.type = "file"; input.accept = "image/*";
                  input.onchange = e => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) { const reader = new FileReader(); reader.onload = () => setSignatureData(reader.result as string); reader.readAsDataURL(file); }
                  };
                  input.click();
                }}>
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload a signature image</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
              </div>
              {signatureData?.startsWith("data:image") && (
                <div className="mt-3 p-2 border rounded-lg text-center">
                  <img src={signatureData} alt="Uploaded signature" className="max-h-20 mx-auto" />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignModal(false)}>Cancel</Button>
            <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={applySignature}
              disabled={signatureTab === "type" ? !typedName : !signatureData}
              data-testid="apply-signature">
              Apply {currentField?.type === "initials" ? "Initials" : "Signature"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
