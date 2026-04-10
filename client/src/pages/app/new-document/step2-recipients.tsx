import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft, ArrowUp, ArrowDown, GripVertical, Lock, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { WizardRecipient } from "./index";

interface Props {
  recipients: WizardRecipient[];
  addRecipient: () => void;
  addRecipientFromContact: (name: string, email: string) => void;
  removeRecipient: (id: string) => void;
  updateRecipient: (id: string, updates: Partial<WizardRecipient>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Recipients({ recipients, addRecipient, addRecipientFromContact, removeRecipient, updateRecipient, onNext, onBack }: Props) {
  const [enforceOrder, setEnforceOrder] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const { user } = useAuth();

  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ["/api/contacts", "userId", String(user?.id || 1)],
  });

  const addFromContact = (contact: any) => {
    if (recipients.some(r => r.email === contact.email)) return;
    addRecipientFromContact(contact.name, contact.email);
    setShowContacts(false);
  };

  const moveRecipient = (id: string, direction: "up" | "down") => {
    const sorted = [...recipients].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(r => r.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === sorted.length - 1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    // Swap positions in the sorted array
    const tmp = sorted[idx];
    sorted[idx] = sorted[newIdx];
    sorted[newIdx] = tmp;
    // Reassign clean sequential order values
    sorted.forEach((r, i) => updateRecipient(r.id, { order: i + 1 }));
  };

  const sorted = [...recipients].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Recipients</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Add everyone who needs to sign, approve, or receive a copy.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowContacts(true)} data-testid="import-contacts">
              <Users className="h-4 w-4 mr-1" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={addRecipient} data-testid="add-recipient">
              <Plus className="h-4 w-4 mr-1" />
              Add Recipient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recipients.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">No recipients added yet</p>
              <Button variant="outline" onClick={addRecipient}>
                <Plus className="h-4 w-4 mr-1" />
                Add your first recipient
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((r, idx) => (
                <div
                  key={r.id}
                  className="rounded-lg border bg-card transition-shadow hover:shadow-sm"
                  style={{ borderLeftColor: r.color, borderLeftWidth: 4 }}
                >
                  {/* Row header */}
                  <div className="flex items-center gap-2 px-3 pt-3 pb-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full text-white text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: r.color }}
                    >
                      {r.order}
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1">
                      Recipient {idx + 1}
                      {enforceOrder && <span className="ml-2 text-[#c8210d]">· Signs {r.order === 1 ? "first" : `after #${r.order - 1}`}</span>}
                    </span>
                    {/* Move up/down */}
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        disabled={idx === 0}
                        onClick={() => moveRecipient(r.id, "up")}
                        title="Move up in signing order"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        disabled={idx === sorted.length - 1}
                        onClick={() => moveRecipient(r.id, "down")}
                        title="Move down in signing order"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => removeRecipient(r.id)}
                      data-testid={`remove-recipient-${idx}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 px-3 pb-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Full Name</Label>
                      <Input
                        placeholder="Jane Doe"
                        value={r.name}
                        onChange={(e) => updateRecipient(r.id, { name: e.target.value })}
                        data-testid={`recipient-name-${idx}`}
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email Address</Label>
                      <Input
                        type="email"
                        placeholder="jane@example.com"
                        value={r.email}
                        onChange={(e) => updateRecipient(r.id, { email: e.target.value })}
                        data-testid={`recipient-email-${idx}`}
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Role</Label>
                      <Select value={r.role} onValueChange={(v) => updateRecipient(r.id, { role: v })}>
                        <SelectTrigger className="mt-1 h-8 text-sm" data-testid={`recipient-role-${idx}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="signer">Signer</SelectItem>
                          <SelectItem value="approver">Approver</SelectItem>
                          <SelectItem value="cc">CC (view only)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Authentication</Label>
                      <Select value={r.authMethod} onValueChange={(v) => updateRecipient(r.id, { authMethod: v })}>
                        <SelectTrigger className="mt-1 h-8 text-sm" data-testid={`recipient-auth-${idx}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="sms">SMS verification</SelectItem>
                          <SelectItem value="email">Email verification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Signing order toggle */}
          {recipients.length > 1 && (
            <div className="mt-4 flex items-center justify-between rounded-lg border p-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Enforce signing order</p>
                  <p className="text-xs text-muted-foreground">Recipients must sign in the numbered sequence above</p>
                </div>
              </div>
              <Switch
                checked={enforceOrder}
                onCheckedChange={setEnforceOrder}
                data-testid="enforce-order-toggle"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import from Contacts Dialog */}
      <Dialog open={showContacts} onOpenChange={setShowContacts}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import from Contacts</DialogTitle>
          </DialogHeader>
          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No contacts found.</p>
              <p className="text-xs text-muted-foreground mt-1">Add contacts in the Contacts section first.</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {contacts.map((c: any) => {
                const alreadyAdded = recipients.some(r => r.email === c.email);
                return (
                  <button
                    key={c.id}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                      alreadyAdded ? "opacity-50 cursor-not-allowed bg-muted" : "hover:bg-muted cursor-pointer"
                    }`}
                    onClick={() => !alreadyAdded && addFromContact(c)}
                    disabled={alreadyAdded}
                    data-testid={`contact-item-${c.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#0f1623] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {(c.name || c.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                    {alreadyAdded ? (
                      <Badge variant="secondary" className="text-[10px]">Added</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-[#c8210d] border-[#c8210d]/30">Add</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} data-testid="step2-back">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          className="bg-[#c8210d] hover:bg-[#a61b0b] text-white"
          disabled={recipients.length === 0 || recipients.some((r) => !r.name || !r.email)}
          onClick={onNext}
          data-testid="step2-next"
        >
          Next: Tag Document
        </Button>
      </div>
    </div>
  );
}
