import { useState } from "react";
import { mockApi } from "@/lib/mockApi";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { sendSigningRequestEmail, sendCompletionEmail } from "@/lib/resend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send, Save, Loader2, FileText, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { WizardFile, WizardRecipient, PlacedField } from "./index";

interface Props {
  file: WizardFile | null;
  recipients: WizardRecipient[];
  fields: PlacedField[];
  documentId: number | null;
  setDocumentId: (id: number | null) => void;
  onBack: () => void;
  onDone: () => void;
}

export default function Step4Send({ file, recipients, fields, documentId, setDocumentId, onBack, onDone }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState(file?.name?.replace(/\.pdf$/i, "") || "Please sign this document");
  const [message, setMessage] = useState("Please review and sign this document at your earliest convenience.");
  const [reminderFrequency, setReminderFrequency] = useState("none");
  const [expiresAt, setExpiresAt] = useState("");
  const [sending, setSending] = useState(false);

  const createAndSend = async (asDraft: boolean) => {
    setSending(true);
    try {
      // Create document
      const doc = await mockApi.createDocument({
        title: subject,
        senderId: user?.id || 1,
        fileName: file?.name || "document.pdf",
        fileSize: file?.size || "0KB",
        subject,
        message,
        reminderFrequency,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        status: "draft",
        tags: [],
      });
      setDocumentId(doc.id);

      // Add recipients
      for (const r of recipients) {
        await mockApi.createRecipient({
          documentId: doc.id,
          name: r.name,
          email: r.email,
          role: r.role,
          signingOrder: r.order,
          authMethod: r.authMethod,
          color: r.color,
        });
      }

      // Add fields
      for (const f of fields) {
        await mockApi.createField({
          documentId: doc.id,
          type: f.type,
          page: f.page,
          x: Math.round(f.x),
          y: Math.round(f.y),
          width: f.width,
          height: f.height,
          required: f.required,
          label: f.label,
        });
      }

      if (!asDraft) {
        await mockApi.sendDocument(doc.id);

        // Fetch the created recipients to get their signing tokens
        const createdRecipients = await mockApi.getRecipients(doc.id);

        // Send real signing request emails via Resend
        const senderName = user?.fullName || "DraftSendSign";
        const emailPromises = createdRecipients.map((r) =>
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
          description: `Signing request emailed to ${recipients.length} recipient(s)`,
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
                  <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} data-testid="send-expiry" />
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
            {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Send Document
          </Button>
        </div>
      </div>
    </div>
  );
}
