import { useState } from "react";
import { useLocation } from "wouter";
import { Check } from "lucide-react";
import Step1Upload from "./step1-upload";
import Step2Recipients from "./step2-recipients";
import Step3Tag from "./step3-tag";
import Step4Send from "./step4-send";

export interface WizardFile {
  name: string;
  size: string;
  pages: number;
  fileObject?: File; // real uploaded file, absent for demo docs
}

export interface WizardRecipient {
  id: string;
  name: string;
  email: string;
  role: string;
  order: number;
  authMethod: string;
  color: string;
}

export interface PlacedField {
  id: string;
  type: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  recipientId: string;
  label: string;
  required: boolean;
}

const STEPS = ["Upload", "Recipients", "Tag", "Send"];
const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6"];

export default function NewDocumentWizard() {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<WizardFile | null>(null);
  const [recipients, setRecipients] = useState<WizardRecipient[]>([]);
  const [fields, setFields] = useState<PlacedField[]>([]);
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [, navigate] = useLocation();

  const addRecipient = () => {
    const id = `r-${Date.now()}`;
    setRecipients((prev) => [
      ...prev,
      { id, name: "", email: "", role: "signer", order: prev.length + 1, authMethod: "none", color: COLORS[prev.length % COLORS.length] },
    ]);
  };

  const addRecipientFromContact = (name: string, email: string) => {
    const id = `r-${Date.now()}`;
    setRecipients((prev) => [
      ...prev,
      { id, name, email, role: "signer", order: prev.length + 1, authMethod: "none", color: COLORS[prev.length % COLORS.length] },
    ]);
  };

  const removeRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
    setFields((prev) => prev.filter((f) => f.recipientId !== id));
  };

  const updateRecipient = (id: string, updates: Partial<WizardRecipient>) => {
    setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                  i < step ? "step-done" : i === step ? "step-active" : "step-pending"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs mt-1.5 ${i === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-16 md:w-24 h-0.5 mx-2 mt-[-14px] ${i < step ? "bg-green-600" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Steps */}
      {step === 0 && (
        <Step1Upload file={file} setFile={setFile} onNext={() => setStep(1)} />
      )}
      {step === 1 && (
        <Step2Recipients
          recipients={recipients}
          addRecipient={addRecipient}
          addRecipientFromContact={addRecipientFromContact}
          removeRecipient={removeRecipient}
          updateRecipient={updateRecipient}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && (
        <Step3Tag
          file={file}
          recipients={recipients}
          fields={fields}
          setFields={setFields}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step4Send
          file={file}
          recipients={recipients}
          fields={fields}
          documentId={documentId}
          setDocumentId={setDocumentId}
          onBack={() => setStep(2)}
          onDone={() => navigate("/documents")}
        />
      )}
    </div>
  );
}
