import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  QrCode, Plus, Users, TrendingUp, FileSignature, MoreVertical,
  Copy, Pause, Play, Trash2, ExternalLink, X, ChevronLeft, CheckCircle2,
  Download,
} from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import type { MassCampaign, MassSigner } from "@/lib/mockApi";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

// ─── QR Code generator (inline, no external dep) ────────────────────────────
// Simple URL display QR placeholder — renders the link prominently
function QRDisplay({ url, size = 200 }: { url: string; size?: number }) {
  // We generate a QR code via a free API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&margin=10&color=0d1117&bgcolor=ffffff`;
  return (
    <img
      src={qrUrl}
      alt="QR Code"
      width={size}
      height={size}
      className="rounded-lg border"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: MassCampaign["status"] }) {
  const map = {
    active: { label: "Active", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
    paused: { label: "Paused", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
    closed: { label: "Closed", className: "bg-slate-500/10 text-slate-500 border-slate-200" },
  };
  const { label, className } = map[status];
  return <Badge variant="outline" className={`text-xs ${className}`}>{label}</Badge>;
}

// ─── Create Campaign Dialog ───────────────────────────────────────────────────
function CreateCampaignDialog({ open, onClose, userId }: { open: boolean; onClose: () => void; userId: number }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [docName, setDocName] = useState("Liability Waiver.pdf");
  const qc = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: () => mockApi.createMassCampaign(userId, { title, description, documentName: docName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/mass-campaigns"] });
      toast({ title: "Campaign created", description: "Your Mass Signature campaign is now active." });
      onClose();
      setTitle(""); setDescription(""); setDocName("Liability Waiver.pdf");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-[#c8210d]/10 flex items-center justify-center">
              <FileSignature className="h-4 w-4 text-[#c8210d]" />
            </div>
            New Mass Signature Campaign
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="camp-title">Campaign Name *</Label>
            <Input
              id="camp-title"
              placeholder="e.g. Annual Gym Liability Waiver"
              value={title}
              onChange={e => setTitle(e.target.value)}
              data-testid="camp-title-input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="camp-desc">Description</Label>
            <Textarea
              id="camp-desc"
              placeholder="Brief description of what signers are agreeing to…"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              data-testid="camp-desc-input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="camp-doc">Document Name</Label>
            <Input
              id="camp-doc"
              placeholder="Liability Waiver.pdf"
              value={docName}
              onChange={e => setDocName(e.target.value)}
              data-testid="camp-doc-input"
            />
            <p className="text-xs text-muted-foreground">
              The agreement text is embedded in the signing page. You can customize the document name shown to signers.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-[#c8210d] hover:bg-[#a61b0b] text-white"
            onClick={() => mutation.mutate()}
            disabled={!title.trim() || mutation.isPending}
            data-testid="create-campaign-btn"
          >
            {mutation.isPending ? "Creating…" : "Create Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── QR Modal ────────────────────────────────────────────────────────────────
function QRModal({ campaign, onClose }: { campaign: MassCampaign; onClose: () => void }) {
  const { toast } = useToast();
  const signingUrl = `${window.location.origin}${window.location.pathname}#/mass-sign/${campaign.publicToken}`;

  const copyLink = () => {
    navigator.clipboard.writeText(signingUrl);
    toast({ title: "Link copied", description: "Signing link copied to clipboard." });
  };

  const downloadQR = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(signingUrl)}&margin=20&color=0d1117&bgcolor=ffffff`;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `${campaign.title.replace(/\s+/g, "-")}-QR.png`;
    a.target = "_blank";
    a.click();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-[#c8210d]" />
            QR Code — {campaign.title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-5 py-2">
          <QRDisplay url={signingUrl} size={220} />
          <div className="w-full space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              Signers scan this code or visit the link below. No login required.
            </p>
            <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
              <span className="text-xs font-mono truncate flex-1">{signingUrl}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={downloadQR} className="gap-2">
            <Download className="h-4 w-4" />
            Download QR
          </Button>
          <Button variant="outline" onClick={copyLink} className="gap-2">
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Campaign Detail Panel ────────────────────────────────────────────────────
function CampaignDetail({ campaign, onBack }: { campaign: MassCampaign; onBack: () => void }) {
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: signers = [], isLoading } = useQuery({
    queryKey: ["/api/mass-signers", campaign.id],
    queryFn: () => mockApi.getMassSigners(campaign.id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: MassCampaign["status"]) => mockApi.updateMassCampaignStatus(campaign.id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/mass-campaigns"] });
      toast({ title: "Status updated" });
    },
  });

  const signingUrl = `${window.location.origin}${window.location.pathname}#/mass-sign/${campaign.publicToken}`;

  const copyLink = () => {
    navigator.clipboard.writeText(signingUrl);
    toast({ title: "Link copied" });
  };

  return (
    <div className="space-y-6">
      {showQR && <QRModal campaign={campaign} onClose={() => setShowQR(false)} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{campaign.title}</h2>
            <p className="text-sm text-muted-foreground">{campaign.description || "No description"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={campaign.status} />
          {campaign.status === "active" && (
            <Button variant="outline" size="sm" onClick={() => statusMutation.mutate("paused")}>
              <Pause className="h-3.5 w-3.5 mr-1.5" />Pause
            </Button>
          )}
          {campaign.status === "paused" && (
            <Button variant="outline" size="sm" onClick={() => statusMutation.mutate("active")}>
              <Play className="h-3.5 w-3.5 mr-1.5" />Resume
            </Button>
          )}
        </div>
      </div>

      {/* Stats + QR row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#c8210d]/10 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-[#c8210d]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{campaign.signerCount}</p>
              <p className="text-xs text-muted-foreground">Total Signers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <QrCode className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Signing Link</p>
              <p className="text-xs text-muted-foreground truncate">{campaign.publicToken}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowQR(true)}>
                <QrCode className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
              <FileSignature className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">{campaign.documentName}</p>
              <p className="text-xs text-muted-foreground">Agreement document</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR + link panel */}
      <Card className="border-dashed">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <QRDisplay url={signingUrl} size={140} />
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm font-semibold mb-1">Share this campaign</p>
                <p className="text-xs text-muted-foreground">
                  Print the QR code at your front desk, add it to a check-in kiosk, or send the link directly. Signers need no account — they just enter their name and sign.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowQR(true)} className="gap-2">
                  <QrCode className="h-3.5 w-3.5" />
                  View Full QR
                </Button>
                <Button size="sm" variant="outline" onClick={copyLink} className="gap-2">
                  <Copy className="h-3.5 w-3.5" />
                  Copy Link
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => window.open(signingUrl, "_blank")}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signers table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Signers ({campaign.signerCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : signers.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No signatures yet</p>
              <p className="text-xs text-muted-foreground mt-1">Share the QR code or link to start collecting signatures.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Signed</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signers.map((s: MassSigner) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.fullName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(s.signedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-200 gap-1">
                        <CheckCircle2 className="h-3 w-3" />Signed
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MassSignature() {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<MassCampaign | null>(null);
  const [qrCampaign, setQrCampaign] = useState<MassCampaign | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery<MassCampaign[]>({
    queryKey: ["/api/mass-campaigns"],
    queryFn: () => mockApi.getMassCampaigns(user!.id),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mockApi.deleteMassCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/mass-campaigns"] });
      toast({ title: "Campaign deleted" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: MassCampaign["status"] }) =>
      mockApi.updateMassCampaignStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/mass-campaigns"] }),
  });

  const totalSigners = campaigns.reduce((acc, c) => acc + c.signerCount, 0);
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;

  if (selectedCampaign) {
    // Refresh from store in case it was updated
    const fresh = campaigns.find(c => c.id === selectedCampaign.id) || selectedCampaign;
    return <CampaignDetail campaign={fresh} onBack={() => setSelectedCampaign(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Mass Signature</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Collect unlimited signatures via QR code or link — no accounts needed.
          </p>
        </div>
        <Button
          className="bg-[#c8210d] hover:bg-[#a61b0b] text-white gap-2"
          onClick={() => setShowCreate(true)}
          data-testid="new-campaign-btn"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#c8210d]/10 flex items-center justify-center shrink-0">
              <FileSignature className="h-4 w-4 text-[#c8210d]" />
            </div>
            <div>
              <p className="text-xl font-bold">{campaigns.length}</p>
              <p className="text-xs text-muted-foreground">Campaigns</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{activeCampaigns}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{totalSigners}</p>
              <p className="text-xs text-muted-foreground">Total Signers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns list */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : campaigns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-[#c8210d]/10 flex items-center justify-center">
              <QrCode className="h-8 w-8 text-[#c8210d]" />
            </div>
            <div className="text-center">
              <p className="font-semibold">No campaigns yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Create a campaign to generate a QR code. Share it at your front desk, kiosk, or event — guests sign instantly with no account needed.
              </p>
            </div>
            <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white gap-2" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Create First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {campaigns.map(campaign => (
            <Card
              key={campaign.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setSelectedCampaign(campaign)}
              data-testid={`campaign-card-${campaign.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#c8210d]/10 flex items-center justify-center shrink-0">
                    <FileSignature className="h-5 w-5 text-[#c8210d]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{campaign.title}</span>
                      <StatusBadge status={campaign.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {campaign.description || campaign.documentName}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold">{campaign.signerCount}</p>
                      <p className="text-xs text-muted-foreground">signers</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => { e.stopPropagation(); setQrCampaign(campaign); }}
                      data-testid={`qr-btn-${campaign.id}`}
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      QR
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); setQrCampaign(campaign); }}>
                          <QrCode className="h-4 w-4 mr-2" />View QR Code
                        </DropdownMenuItem>
                        {campaign.status === "active" && (
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); statusMutation.mutate({ id: campaign.id, status: "paused" }); }}>
                            <Pause className="h-4 w-4 mr-2" />Pause Campaign
                          </DropdownMenuItem>
                        )}
                        {campaign.status === "paused" && (
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); statusMutation.mutate({ id: campaign.id, status: "active" }); }}>
                            <Play className="h-4 w-4 mr-2" />Resume Campaign
                          </DropdownMenuItem>
                        )}
                        {campaign.status !== "closed" && (
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); statusMutation.mutate({ id: campaign.id, status: "closed" }); }}>
                            <X className="h-4 w-4 mr-2" />Close Campaign
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={e => { e.stopPropagation(); deleteMutation.mutate(campaign.id); }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {user && (
        <CreateCampaignDialog open={showCreate} onClose={() => setShowCreate(false)} userId={user.id} />
      )}
      {qrCampaign && <QRModal campaign={qrCampaign} onClose={() => setQrCampaign(null)} />}
    </div>
  );
}
