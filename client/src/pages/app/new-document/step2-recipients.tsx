import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import type { WizardRecipient } from "./index";

interface Props {
  recipients: WizardRecipient[];
  addRecipient: () => void;
  removeRecipient: (id: string) => void;
  updateRecipient: (id: string, updates: Partial<WizardRecipient>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Recipients({ recipients, addRecipient, removeRecipient, updateRecipient, onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recipients</CardTitle>
          <Button variant="outline" size="sm" onClick={addRecipient} data-testid="add-recipient">
            <Plus className="h-4 w-4 mr-1" />
            Add Recipient
          </Button>
        </CardHeader>
        <CardContent>
          {recipients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">No recipients added yet</p>
              <Button variant="outline" onClick={addRecipient}>
                <Plus className="h-4 w-4 mr-1" />
                Add your first recipient
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recipients.map((r, idx) => (
                <div key={r.id} className="flex gap-3 items-start p-4 border rounded-lg" style={{ borderLeftColor: r.color, borderLeftWidth: 3 }}>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        placeholder="Full name"
                        value={r.name}
                        onChange={(e) => updateRecipient(r.id, { name: e.target.value })}
                        data-testid={`recipient-name-${idx}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Email</Label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={r.email}
                        onChange={(e) => updateRecipient(r.id, { email: e.target.value })}
                        data-testid={`recipient-email-${idx}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Role</Label>
                      <Select value={r.role} onValueChange={(v) => updateRecipient(r.id, { role: v })}>
                        <SelectTrigger data-testid={`recipient-role-${idx}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="signer">Signer</SelectItem>
                          <SelectItem value="cc">CC</SelectItem>
                          <SelectItem value="approver">Approver</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Authentication</Label>
                      <Select value={r.authMethod} onValueChange={(v) => updateRecipient(r.id, { authMethod: v })}>
                        <SelectTrigger data-testid={`recipient-auth-${idx}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 pt-5">
                    <span className="text-xs text-muted-foreground font-mono">#{r.order}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeRecipient(r.id)} data-testid={`remove-recipient-${idx}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
