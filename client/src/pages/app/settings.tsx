import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Shield, Bell, Palette, Building2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    fullName: user?.fullName || "Mason Palmieri",
    email: user?.email || "help@draftsendsign.com",
    company: user?.company || "PalmWeb",
    phone: "",
    timezone: "America/New_York",
  });

  const [notifications, setNotifications] = useState({
    emailOnSend: true,
    emailOnSign: true,
    emailOnComplete: true,
    emailOnDecline: true,
    emailDigest: false,
    pushEnabled: false,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "30",
  });

  const [branding, setBranding] = useState({
    companyName: "PalmWeb",
    tagline: "Professional Document Signing",
    primaryColor: "#c8210d",
    logoUrl: "",
  });

  const handleSave = (section: string) => {
    toast({ title: "Settings saved", description: `${section} settings updated successfully` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-1.5" data-testid="tab-profile"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5" data-testid="tab-security"><Shield className="h-4 w-4" /> Security</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5" data-testid="tab-notifications"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="branding" className="gap-1.5" data-testid="tab-branding"><Palette className="h-4 w-4" /> Branding</TabsTrigger>
          <TabsTrigger value="organization" className="gap-1.5" data-testid="tab-organization"><Building2 className="h-4 w-4" /> Organization</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle className="text-base">Profile Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} data-testid="settings-name" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} data-testid="settings-email" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company</Label>
                  <Input value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div>
                <Label>Timezone</Label>
                <Select value={profile.timezone} onValueChange={(v) => setProfile({ ...profile, timezone: v })}>
                  <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">GMT</SelectItem>
                    <SelectItem value="Europe/Berlin">CET</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={() => handleSave("Profile")} data-testid="save-profile">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle className="text-base">Security Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-sm mb-1">Change Password</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label className="text-xs">Current Password</Label><Input type="password" /></div>
                  <div><Label className="text-xs">New Password</Label><Input type="password" /></div>
                  <div><Label className="text-xs">Confirm Password</Label><Input type="password" /></div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch checked={security.twoFactor} onCheckedChange={(v) => setSecurity({ ...security, twoFactor: v })} data-testid="toggle-2fa" />
              </div>
              <Separator />
              <div>
                <Label>Session Timeout (minutes)</Label>
                <Select value={security.sessionTimeout} onValueChange={(v) => setSecurity({ ...security, sessionTimeout: v })}>
                  <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={() => handleSave("Security")} data-testid="save-security">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "emailOnSend", label: "Document Sent", desc: "When a document is sent for signing" },
                { key: "emailOnSign", label: "Document Signed", desc: "When a recipient signs a document" },
                { key: "emailOnComplete", label: "Document Completed", desc: "When all recipients have signed" },
                { key: "emailOnDecline", label: "Document Declined", desc: "When a recipient declines to sign" },
                { key: "emailDigest", label: "Daily Digest", desc: "Daily summary of all activity" },
                { key: "pushEnabled", label: "Push Notifications", desc: "Browser push notifications" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={(notifications as any)[item.key]}
                    onCheckedChange={(v) => setNotifications({ ...notifications, [item.key]: v })}
                    data-testid={`toggle-${item.key}`}
                  />
                </div>
              ))}
              <Separator />
              <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={() => handleSave("Notification")} data-testid="save-notifications">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding">
          <Card>
            <CardHeader><CardTitle className="text-base">Custom Branding</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input value={branding.companyName} onChange={(e) => setBranding({ ...branding, companyName: e.target.value })} />
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input value={branding.tagline} onChange={(e) => setBranding({ ...branding, tagline: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Primary Brand Color</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input type="color" value={branding.primaryColor} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} className="h-9 w-12 rounded cursor-pointer" />
                  <Input value={branding.primaryColor} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} className="max-w-32 font-mono" />
                </div>
              </div>
              <div>
                <Label>Logo URL</Label>
                <Input value={branding.logoUrl} onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" />
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Preview</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded" style={{ backgroundColor: branding.primaryColor }} />
                  <div>
                    <p className="font-semibold text-sm">{branding.companyName}</p>
                    <p className="text-xs text-muted-foreground">{branding.tagline}</p>
                  </div>
                </div>
              </div>
              <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={() => handleSave("Branding")} data-testid="save-branding">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization */}
        <TabsContent value="organization">
          <Card>
            <CardHeader><CardTitle className="text-base">Organization Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Organization Name</Label>
                <Input defaultValue="PalmWeb Inc." />
              </div>
              <div>
                <Label>Industry</Label>
                <Select defaultValue="technology">
                  <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="realestate">Real Estate</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Default Signing Workflow</Label>
                <Select defaultValue="sequential">
                  <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sequential">Sequential (in order)</SelectItem>
                    <SelectItem value="parallel">Parallel (any order)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Require Authentication</p>
                  <p className="text-xs text-muted-foreground">Require identity verification for all signers</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={() => handleSave("Organization")} data-testid="save-org">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
