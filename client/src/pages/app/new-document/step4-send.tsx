import { useState } from "react";
import { mockApi } from "@/lib/mockApi";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { sendSigningRequestEmail } from "@/lib/resend";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send, Save, Loader2, FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { WizardFile, WizardRecipient, PlacedField } from "./index";

interface Props {
  file: WizardFile | null;
  recipients: WizardRecipient[];
  fields: PlacedField[];
  documentId: number | null;
  setDocumentId: (id: number | null) => void;
  enforceOrder?: boolean;
  onBack: () => void;
  onDone: () => void;
}

export default function Step4Send({ file, recipients, fields, documentId, setDocumentId, enforceOrder = false, onBack, onDone }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState(file?.name?.replace(/\.pdf$/i, "") || "Please sign this document");
  const [message, setMessage] = useState("Please review and sign this document at your earliest convenience.");
  const [reminderFrequency, setReminderFrequency] = useState("none");
  const [expiresAt, setExpiresAt] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Plan limits
  const PLAN_LIMITS: Record<string, number> = {
    starter: 3,
    pro: Infinity,
    team: Infinity,
    business: Infinity,
    enterprise: Infinity,
  };

  const checkUsageLimit = async (): Promise<{ allowed: boolean; used: number; limit: number }> => {
    const plan = user?.plan || "starter";
    const limit = PLAN_LIMITS[plan] ?? 3;
    if (limit === Infinity) return { allowed: true, used: 0, limit };

    // Count docs sent this calendar month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("sender_id", user?.id)
      .neq("status", "draft")
      .gte("created_at", startOfMonth.toISOString());

    const used = count || 0;
    return { allowed: used < limit, used, limit };
  };

  const createAndSend = async (asDraft: boolean) => {
    setSending(true);
    try {
      // Check usage limit before sending (not for drafts)
      if (!asDraft) {
        const { allowed, used, limit } = await checkUsageLimit();
        if (!allowed) {
          toast({
            title: "Document limit reached",
            description: `Your ${user?.plan || "starter"} plan allows ${limit} documents per month. You've used ${used}. Upgrade to send more.`,
            variant: "destructive",
          });
          setSending(false);
          return;
        }
      }

      // Step 1 — Upload PDF to Supabase Storage (with 30s timeout)
      let filePath: string | null = null;
      if (file?.fileObject && user?.id) {
        setUploadProgress("Uploading document...");
        try {
          const safeName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
          const path = `${user.id}/${Date.now()}-${safeName}`;
          const uploadPromise = supabase.storage
            .from("documents")
            .upload(path, file.fileObject, {
              contentType: "application/pdf",
              upsert: false,
            });
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Upload timed out after 30s")), 30000)
          );
          const result = await Promise.race([uploadPromise, timeoutPromise]) as any;
          if (result?.error) {
            console.warn("PDF upload failed:", result.error.message);
            toast({ title: "Storage upload failed", description: "Document will be sent without cloud storage. " + result.error.message, variant: "destructive" });
          } else if (result?.data) {
            filePath = result.data.path;
          }
        } catch (uploadErr: any) {
          console.warn("PDF upload error:", uploadErr.message);
          // Non-blocking — continue sending even if storage fails
          toast({ title: "Upload warning", description: "Could not upload to storage: " + uploadErr.message + ". Continuing without storage.", variant: "destructive" });
        }
        setUploadProgress(null);
      }

      // Step 2 — Create document record with filePath
      const doc = await mockApi.createDocument({
        title: subject,
        senderId: user?.id || "1",
        fileName: file?.name || "document.pdf",
        fileSize: file?.size || "0KB",
        filePath,
        subject,
        message,
        reminderFrequency,
        // Set expiry to end of day (23:59:59) in the user's local timezone
        expiresAt: expiresAt ? (() => {
          const d = new Date(expiresAt);
          d.setHours(23, 59, 59, 999);
          return d;
        })() : undefined,
        status: "draft",
        tags: [],
      });
      setDocumentId(doc.id);

      // Step 3 — Add recipients, build wizard ID → DB ID map
      const recipientIdMap: Record<string, number> = {};
      for (const r of recipients) {
        const created = await mockApi.createRecipient({
          documentId: doc.id,
          name: r.name,
          email: r.email,
          role: r.role,
          signingOrder: r.order,
          authMethod: r.authMethod,
          color: r.color,
        });
        recipientIdMap[r.id] = created.id; // map wizard temp ID → real DB ID
      }

      // Step 4 — Add fields with correct recipient_id
      for (const f of fields) {
        await mockApi.createField({
          documentId: doc.id,
          recipientId: recipientIdMap[f.recipientId] ?? null,
          type: f.type,
          page: f.page,
          x: f.x,   // stored as percentage
          y: f.y,
          width: f.width,
          height: f.height,
          required: f.required,
          label: f.label,
        });
      }

      // Step 5 — Send or save as draft
      if (!asDraft) {
        await mockApi.sendDocument(doc.id);

        const createdRecipients = await mockApi.getRecipients(doc.id);
        const senderName = user?.fullName || "DraftSendSign";

        // If signing order is enforced, only email the first signer (order=1)
        // Subsequent signers get emailed automatically when the previous signer completes
        const sortedRecipients = [...createdRecipients].sort((a, b) => a.signingOrder - b.signingOrder);
        const recipientsToEmail = enforceOrder
          ? sortedRecipients.slice(0, 1)  // only the first signer
          : sortedRecipients;             // everyone at once

        const emailPromises = recipientsToEmail.map((r) =>
          sendSigningRequestEmail({
            recipientName: r.name,
            recipientEmail: r.email,
            senderName,
            documentTitle: subject,
            subject: `${senderName} has sent you a document to sign: ${subject}`,
            message,
            signingToken: r.signingToken,
          }).catch((err) => {
            console.warn(`Failed to send email to ${r.email}:`, err);
          })
        );
        await Promise.all(emailPromises);

        toast({
          title: "Document sent!",
          description: enforceOrder
            ? `Signing request sent to ${recipientsToEmail[0]?.name || "recipient 1"}. Others will be notified in order.`
            : `Signing request emailed to ${recipients.length} recipient(s)`,
        });
      } else {
        toast({ title: "Draft saved" });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onDone();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subject Line</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} data-testid="send-subject" />
              </div>
              <div>
                <Label>Message to Recipients</Label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} data-testid="send-message" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reminder Frequency</Label>
                  <Select value={reminderFrequency} onValueChange={setReminderFrequency}>
                    <SelectTrigger data-testid="send-reminder"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="3days">Every 3 days</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} data-testid="send-expiry"
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c8210d]/10 text-[#c8210d]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{file?.name || "Document"}</p>
                <p className="text-xs text-muted-foreground">{file?.size} · {file?.pages} page(s)</p>
                {file?.fileObject && (
                  <p className="text-[10px] text-green-600 mt-0.5 flex items-center gap-1">
                    <Upload className="h-2.5 w-2.5" /> Will upload to secure storage
                  </p>
                )}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-2">Recipients ({recipients.length})</p>
              <div className="space-y-2">
                {recipients.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: r.color }}>
                      {r.name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{r.email}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 capitalize">{r.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
              <p>{fields.length} field(s) placed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} data-testid="step4-back">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => createAndSend(true)} disabled={sending} data-testid="save-draft">
            {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save as Draft
          </Button>
          <Button
            className="bg-[#c8210d] hover:bg-[#a61b0b] text-white"
            onClick={() => createAndSend(false)}
            disabled={sending || recipients.length === 0}
            data-testid="send-document"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploadProgress || "Sending..."}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Document
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
