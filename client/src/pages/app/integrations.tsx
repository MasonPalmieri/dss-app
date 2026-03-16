import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Cloud, Database, Mail, Key, Copy, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const INTEGRATIONS = [
  { id: "google-drive", name: "Google Drive", description: "Import documents directly from Google Drive", icon: Cloud, category: "Storage", connected: false },
  { id: "dropbox", name: "Dropbox", description: "Sync documents with your Dropbox account", icon: Cloud, category: "Storage", connected: false },
  { id: "onedrive", name: "OneDrive", description: "Connect to Microsoft OneDrive for file access", icon: Cloud, category: "Storage", connected: false },
  { id: "salesforce", name: "Salesforce", description: "Send documents from Salesforce workflows", icon: Database, category: "CRM", connected: true },
  { id: "hubspot", name: "HubSpot", description: "Integrate with HubSpot deal pipeline", icon: Database, category: "CRM", connected: false },
  { id: "slack", name: "Slack", description: "Get notifications in your Slack channels", icon: Mail, category: "Communication", connected: true },
  { id: "zapier", name: "Zapier", description: "Connect to 5000+ apps via Zapier", icon: RefreshCw, category: "Automation", connected: false },
  { id: "webhook", name: "Webhooks", description: "Send events to custom webhook endpoints", icon: RefreshCw, category: "Automation", connected: false },
];

export default function Integrations() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const apiKey = "dss_live_sk_a1b2c3d4e5f6g7h8i9j0";
  const webhookSecret = "whsec_x9y8z7w6v5u4t3s2r1q0";

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i))
    );
    const integration = integrations.find((i) => i.id === id);
    toast({
      title: integration?.connected ? "Disconnected" : "Connected",
      description: `${integration?.name} ${integration?.connected ? "disconnected" : "connected"} successfully`,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const categories = [...new Set(integrations.map((i) => i.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-sm text-muted-foreground">Connect DraftSendSign with your favorite tools</p>
        </div>
        <Button variant="outline" onClick={() => setShowApiKeys(true)} data-testid="api-keys-btn">
          <Key className="h-4 w-4 mr-2" />
          API Keys
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{integrations.filter((i) => i.connected).length}</p>
              <p className="text-xs text-muted-foreground">Active Connections</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{integrations.length}</p>
              <p className="text-xs text-muted-foreground">Available Integrations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration cards by category */}
      {categories.map((cat) => (
        <div key={cat} className="space-y-3">
          <h2 className="text-lg font-semibold">{cat}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {integrations
              .filter((i) => i.category === cat)
              .map((integration) => (
                <Card key={integration.id} data-testid={`integration-${integration.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <integration.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{integration.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.connected && (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-[10px]">
                            Connected
                          </Badge>
                        )}
                        <Switch
                          checked={integration.connected}
                          onCheckedChange={() => toggleIntegration(integration.id)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      {/* API Keys Dialog */}
      <Dialog open={showApiKeys} onOpenChange={setShowApiKeys}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>API Keys</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Live API Key</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  readOnly
                  value={showKey ? apiKey : "dss_live_sk_••••••••••••••••"}
                  className="font-mono text-sm"
                  data-testid="api-key-input"
                />
                <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(apiKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-xs text-muted-foreground">Webhook Signing Secret</Label>
              <div className="flex gap-2 mt-1">
                <Input readOnly value={webhookSecret} className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookSecret)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep your API keys secure. Do not share them publicly or commit them to version control.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiKeys(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
