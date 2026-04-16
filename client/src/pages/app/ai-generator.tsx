import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { mockApi } from "@/lib/mockApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  Lock,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Loader2,
  RefreshCw,
  FileText,
  Send,
  FolderOpen,
  Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Party {
  name: string;
  role: string;
}

interface FormData {
  documentType: string;
  customDocumentType: string;
  parties: Party[];
  purpose: string;
  terms: string;
  effectiveDate: string;
  jurisdiction: string;
  additionalDetails: string;
}

const DOCUMENT_TYPES = [
  {
    id: "Non-Disclosure Agreement",
    label: "Non-Disclosure Agreement (NDA)",
    description: "Protect confidential information between parties",
    icon: "🔒",
  },
  {
    id: "Service Agreement",
    label: "Service Agreement",
    description: "Define services, deliverables, and payment terms",
    icon: "🤝",
  },
  {
    id: "Employment Agreement",
    label: "Employment Agreement",
    description: "Formalize a working relationship",
    icon: "👔",
  },
  {
    id: "Vendor Agreement",
    label: "Vendor Agreement",
    description: "Set terms with a supplier or vendor",
    icon: "📦",
  },
  {
    id: "Partnership Agreement",
    label: "Partnership Agreement",
    description: "Structure a business partnership",
    icon: "🏢",
  },
  {
    id: "Liability Waiver",
    label: "Liability Waiver",
    description: "Release parties from liability",
    icon: "⚖️",
  },
  {
    id: "Other",
    label: "Other",
    description: "Describe a custom document type",
    icon: "📄",
  },
];

const DEFAULT_FORM: FormData = {
  documentType: "",
  customDocumentType: "",
  parties: [
    { name: "", role: "Client" },
    { name: "", role: "Contractor" },
  ],
  purpose: "",
  terms: "",
  effectiveDate: "",
  jurisdiction: "",
  additionalDetails: "",
};

// ─── Plan gate ────────────────────────────────────────────────────────────────

function PremiumUpsell() {
  const [, navigate] = useLocation();
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-lg w-full border border-border">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c8210d]/10">
              <Lock className="h-8 w-8 text-[#c8210d]" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-[#c8210d]" />
              <h2 className="text-xl font-bold">AI Document Generator</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Available on Team plan and above
            </p>
          </div>

          <div className="text-left space-y-3 bg-muted/50 rounded-xl p-4">
            <p className="text-sm font-medium text-foreground mb-3">
              What you get with Team:
            </p>
            {[
              "Describe any agreement in plain English",
              "AI drafts a complete, professional legal document",
              "Send directly for signature or save as a template",
              "NDA, Service, Employment, Vendor agreements & more",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#c8210d] mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-[#c8210d] hover:bg-[#a61b0b] text-white font-semibold"
            onClick={() => navigate("/billing")}
          >
            Upgrade to Team
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <p className="text-xs text-muted-foreground">
            Team plan starts at $29/month. Cancel anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step, total }: { step: number; total: number }) {
  const labels = ["Document Type", "Parties", "Details", "Review & Generate"];
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">
          Step {step} of {total}
        </span>
        <span className="text-sm font-medium text-foreground">
          {labels[step - 1]}
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors duration-300"
            style={{
              backgroundColor:
                i < step ? "#c8210d" : "hsl(var(--muted))",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Step 1 — Document Type ───────────────────────────────────────────────────

function Step1({
  form,
  setForm,
  onNext,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
  onNext: () => void;
}) {
  const canProceed =
    form.documentType !== "" &&
    (form.documentType !== "Other" || form.customDocumentType.trim() !== "");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">
          What kind of agreement do you need?
        </h2>
        <p className="text-muted-foreground text-sm">
          Select a document type to get started
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DOCUMENT_TYPES.map((type) => {
          const isSelected = form.documentType === type.id;
          return (
            <button
              key={type.id}
              onClick={() =>
                setForm({ ...form, documentType: type.id })
              }
              className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                isSelected
                  ? "border-[#c8210d] bg-[#c8210d]/5"
                  : "border-border hover:border-[#c8210d]/40 hover:bg-muted/50"
              }`}
            >
              <span className="text-2xl mt-0.5">{type.icon}</span>
              <div className="min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    isSelected ? "text-[#c8210d]" : "text-foreground"
                  }`}
                >
                  {type.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {type.description}
                </p>
              </div>
              {isSelected && (
                <Check className="h-4 w-4 text-[#c8210d] ml-auto mt-0.5 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {form.documentType === "Other" && (
        <div className="space-y-2">
          <Label htmlFor="custom-type">Describe your document type</Label>
          <Input
            id="custom-type"
            placeholder="e.g. Lease Agreement, Software License Agreement"
            value={form.customDocumentType}
            onChange={(e) =>
              setForm({ ...form, customDocumentType: e.target.value })
            }
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button
          className="bg-[#c8210d] hover:bg-[#a61b0b] text-white"
          disabled={!canProceed}
          onClick={onNext}
        >
          Next: Parties
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 2 — Parties ─────────────────────────────────────────────────────────

function Step2({
  form,
  setForm,
  onNext,
  onBack,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const canProceed = form.parties.every((p) => p.name.trim() !== "");

  const updateParty = (index: number, field: keyof Party, value: string) => {
    const updated = form.parties.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    setForm({ ...form, parties: updated });
  };

  const addParty = () => {
    if (form.parties.length < 6) {
      setForm({
        ...form,
        parties: [...form.parties, { name: "", role: "Signatory" }],
      });
    }
  };

  const removeParty = (index: number) => {
    if (form.parties.length > 2) {
      setForm({
        ...form,
        parties: form.parties.filter((_, i) => i !== index),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Who are the parties involved?</h2>
        <p className="text-muted-foreground text-sm">
          Include full legal names of individuals or business entities
        </p>
      </div>

      <div className="space-y-3">
        {form.parties.map((party, index) => (
          <Card key={index} className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c8210d]/10 text-[#c8210d] text-xs font-bold shrink-0 mt-1">
                  {index + 1}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Party Name
                    </Label>
                    <Input
                      placeholder="e.g. Acme Corp or Jane Smith"
                      value={party.name}
                      onChange={(e) =>
                        updateParty(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Role
                    </Label>
                    <Input
                      placeholder="e.g. Client, Contractor, Employee"
                      value={party.role}
                      onChange={(e) =>
                        updateParty(index, "role", e.target.value)
                      }
                    />
                  </div>
                </div>
                {form.parties.length > 2 && (
                  <button
                    onClick={() => removeParty(index)}
                    className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors mt-1 shrink-0"
                    aria-label="Remove party"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {form.parties.length < 6 && (
          <button
            onClick={addParty}
            className="flex items-center gap-2 text-sm text-[#c8210d] hover:text-[#a61b0b] transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            Add another party
          </button>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          className="bg-[#c8210d] hover:bg-[#a61b0b] text-white"
          disabled={!canProceed}
          onClick={onNext}
        >
          Next: Details
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3 — Details ─────────────────────────────────────────────────────────

function Step3({
  form,
  setForm,
  onNext,
  onBack,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const canProceed = form.purpose.trim() !== "";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Tell us about the agreement</h2>
        <p className="text-muted-foreground text-sm">
          The more detail you provide, the better the document
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="purpose">
            Purpose / Description{" "}
            <span className="text-[#c8210d]">*</span>
          </Label>
          <Textarea
            id="purpose"
            rows={4}
            placeholder="Describe what this agreement is for. E.g. 'A freelance web development contract for a 3-month project to build a SaaS dashboard. The developer will deliver mockups, frontend code, and API integration.'"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Describe what this agreement is for. The more detail you provide,
            the better the document.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="terms">Key Terms (optional)</Label>
          <Textarea
            id="terms"
            rows={3}
            placeholder="e.g. Payment: $5,000 upon project completion. Deadline: March 31, 2025. Ownership of deliverables transfers to client on full payment."
            value={form.terms}
            onChange={(e) => setForm({ ...form, terms: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Any specific terms, payment amounts, deadlines, or conditions to
            include?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="effective-date">Effective Date</Label>
            <Input
              id="effective-date"
              type="date"
              value={form.effectiveDate}
              onChange={(e) =>
                setForm({ ...form, effectiveDate: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jurisdiction">Governing Law / Jurisdiction</Label>
            <Input
              id="jurisdiction"
              placeholder="e.g. State of New York"
              value={form.jurisdiction}
              onChange={(e) =>
                setForm({ ...form, jurisdiction: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional">Additional Details (optional)</Label>
          <Textarea
            id="additional"
            rows={2}
            placeholder="Anything else the AI should know about this agreement?"
            value={form.additionalDetails}
            onChange={(e) =>
              setForm({ ...form, additionalDetails: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          className="bg-[#c8210d] hover:bg-[#a61b0b] text-white"
          disabled={!canProceed}
          onClick={onNext}
        >
          Next: Review
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 4 — Review & Generate ───────────────────────────────────────────────

function Step4({
  form,
  onBack,
  onGenerate,
  isGenerating,
  error,
}: {
  form: FormData;
  onBack: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  error: string | null;
}) {
  const docType =
    form.documentType === "Other"
      ? form.customDocumentType
      : form.documentType;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Review & Generate</h2>
        <p className="text-muted-foreground text-sm">
          Here's what the AI will generate. Click Generate when you're ready.
        </p>
      </div>

      <Card className="border border-border">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c8210d]/10">
              <FileText className="h-5 w-5 text-[#c8210d]" />
            </div>
            <div>
              <p className="font-semibold text-sm">{docType}</p>
              <p className="text-xs text-muted-foreground">
                {form.parties.length} parties · AI-generated
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Parties
              </p>
              <div className="space-y-1">
                {form.parties.map((p, i) => (
                  <p key={i} className="text-foreground">
                    <span className="font-medium">{p.name || "(unnamed)"}</span>
                    {p.role && (
                      <span className="text-muted-foreground"> — {p.role}</span>
                    )}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Purpose
              </p>
              <p className="text-foreground line-clamp-3">{form.purpose}</p>
            </div>

            {form.jurisdiction && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Jurisdiction
                </p>
                <p className="text-foreground">{form.jurisdiction}</p>
              </div>
            )}

            {form.effectiveDate && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Effective Date
                </p>
                <p className="text-foreground">
                  {new Date(form.effectiveDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center gap-3 py-6">
          <div className="relative">
            <Loader2 className="h-10 w-10 text-[#c8210d] animate-spin" />
            <Sparkles className="h-4 w-4 text-[#c8210d] absolute -top-1 -right-1" />
          </div>
          <p className="text-sm font-medium text-foreground">
            AI is drafting your document...
          </p>
          <p className="text-xs text-muted-foreground">
            This usually takes 10–20 seconds
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isGenerating}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          className="bg-[#c8210d] hover:bg-[#a61b0b] text-white font-semibold px-8"
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Document
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Generated document view ──────────────────────────────────────────────────
function GeneratedDocument({
  documentText: initialText,
  documentType,
  form,
  onRegenerate,
  onReset,
}: {
  documentText: string;
  documentType: string;
  form: FormData;
  onRegenerate: () => void;
  onReset: () => void;
}) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(initialText);
  const [isPolishing, setIsPolishing] = useState(false);

  const wordCount = editedText.trim().split(/\s+/).filter(Boolean).length;

  const docName = form.documentType === "Other" ? form.customDocumentType : form.documentType;

  const handleSendForSignature = () => {
    const pages = Math.ceil(editedText.length / 3000);
    sessionStorage.setItem("ai-generated-doc", JSON.stringify({
      name: `${docName}.pdf`,
      content: editedText,
      pages: pages || 1,
    }));
    navigate("/new-document");
  };

  const handleSaveAsTemplate = async () => {
    if (!user) return;
    setSavingTemplate(true);
    try {
      await mockApi.createTemplate({
        name: docName,
        description: `AI-generated ${docName}`,
        creatorId: user.id,
        fileName: `${docName}.pdf`,
      });
      toast({ title: "Template saved", description: `"${docName}" has been saved to your templates.` });
    } catch {
      toast({ title: "Error saving template", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleAiPolish = async () => {
    setIsPolishing(true);
    try {
      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: form.documentType,
          parties: form.parties.map(p => `${p.name} (${p.role})`).join(", "),
          purpose: editedText, // Use the current edited text as context
          terms: form.terms,
          jurisdiction: form.jurisdiction,
          effectiveDate: form.effectiveDate,
          additionalDetails: `Please improve and clean up the following draft document while preserving all legal content and structure. Fix grammar, improve clarity, and make the language more professional:\n\n${editedText}`,
        }),
      });
      const data = await res.json();
      if (data.document) {
        setEditedText(data.document);
        toast({ title: "Document polished", description: "AI has improved the language and clarity." });
      }
    } catch {
      toast({ title: "Polish failed", description: "Could not reach AI. Try again.", variant: "destructive" });
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-[#c8210d]" />
            <Badge variant="outline" className="text-[10px] border-[#c8210d]/30 text-[#c8210d]">AI Generated</Badge>
          </div>
          <h2 className="text-2xl font-bold">{documentType}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{wordCount.toLocaleString()} words</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleAiPolish} disabled={isPolishing}>
            {isPolishing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
            {isPolishing ? "Polishing..." : "AI Polish"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(e => !e)}>
            {isEditing ? "Preview" : "Edit"}
          </Button>
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Document — editable or preview */}
      {isEditing ? (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Edit the document directly below. Click "Preview" to see the formatted version.</p>
          <Textarea
            value={editedText}
            onChange={e => setEditedText(e.target.value)}
            className="min-h-[60vh] font-mono text-sm"
            style={{ fontFamily: "Georgia, 'Times New Roman', Times, serif", fontSize: 13, lineHeight: 1.7 }}
          />
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-white dark:bg-zinc-50 overflow-auto" style={{ maxHeight: "60vh" }}>
          <div className="px-12 py-10 min-w-0">
            <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-gray-900"
              style={{ fontFamily: "Georgia, 'Times New Roman', Times, serif" }}>
              {editedText}
            </pre>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1 bg-[#c8210d] hover:bg-[#a61b0b] text-white font-semibold" onClick={handleSendForSignature}>
          <Send className="h-4 w-4 mr-2" />
          Send for Signature
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleSaveAsTemplate} disabled={savingTemplate}>
          {savingTemplate ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FolderOpen className="h-4 w-4 mr-2" />}
          Save as Template
        </Button>
      </div>

      <div className="text-center">
        <button onClick={onReset} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline">
          Start over with a new document
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AiGenerator() {
  const { user } = useAuth();

  // Plan gate: starter or pro users see upsell
  const lockedPlans = ["starter", "pro"];
  if (user && lockedPlans.includes(user.plan)) {
    return (
      <div className="max-w-2xl mx-auto">
        <PremiumUpsell />
      </div>
    );
  }

  return <AiGeneratorContent />;
}

function AiGeneratorContent() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatedDoc, setGeneratedDoc] = useState<{
    text: string;
    type: string;
  } | null>(null);

  const TOTAL_STEPS = 4;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateError(null);

    const docType =
      form.documentType === "Other"
        ? form.customDocumentType
        : form.documentType;

    const partiesText = form.parties
      .map((p) => `${p.name} (${p.role})`)
      .join("\n");

    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: docType,
          parties: partiesText,
          purpose: form.purpose,
          terms: form.terms || undefined,
          jurisdiction: form.jurisdiction || undefined,
          effectiveDate: form.effectiveDate || undefined,
          additionalDetails: form.additionalDetails || undefined,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        if (response.status === 429 && err.error === 'ai_limit_reached') {
          throw new Error(`Monthly limit reached: ${err.message}`);
        }
        throw new Error(err.message || err.error || `Request failed (${response.status})`);
      }

      const data = await response.json();
      setGeneratedDoc({ text: data.document, type: data.documentType || docType });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedDoc(null);
    setStep(4);
  };

  const handleReset = () => {
    setGeneratedDoc(null);
    setStep(1);
    setForm(DEFAULT_FORM);
    setGenerateError(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8210d]/10">
            <Sparkles className="h-4 w-4 text-[#c8210d]" />
          </div>
          <h1 className="text-3xl font-bold">AI Document Generator</h1>
        </div>
        <p className="text-muted-foreground">
          Describe an agreement in plain English and get a complete, professional
          legal document ready to sign.
        </p>
      </div>

      {generatedDoc ? (
        <GeneratedDocument
          documentText={generatedDoc.text}
          documentType={generatedDoc.type}
          form={form}
          onRegenerate={handleRegenerate}
          onReset={handleReset}
        />
      ) : (
        <>
          <StepIndicator step={step} total={TOTAL_STEPS} />

          {step === 1 && (
            <Step1
              form={form}
              setForm={setForm}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2
              form={form}
              setForm={setForm}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3
              form={form}
              setForm={setForm}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <Step4
              form={form}
              onBack={() => setStep(3)}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              error={generateError}
            />
          )}
        </>
      )}
    </div>
  );
}
