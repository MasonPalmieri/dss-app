import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Trash2, Users, Shield, UserPlus, Building2, Crown, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Teams() {
  const { user } = useAuth();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const { data: members = [] } = useQuery<any[]>({
    queryKey: ["/api/team"],
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/team", {
        userId: user?.id || 1,
        email: inviteEmail,
        role: inviteRole,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      setShowInvite(false);
      setInviteEmail("");
      setInviteRole("member");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/team/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
    },
  });

  const roleColor = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "manager": return "default";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-sm text-muted-foreground">Manage team members and their roles</p>
        </div>
        <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={() => setShowInvite(true)} data-testid="invite-member">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.filter((m: any) => m.role === "admin").length}</p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.filter((m: any) => m.status === "pending").length}</p>
                <p className="text-xs text-muted-foreground">Pending Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-3">No team members yet</p>
              <Button variant="outline" onClick={() => setShowInvite(true)}>
                <UserPlus className="h-4 w-4 mr-1" /> Invite your first member
              </Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-left">
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m: any) => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-muted/50" data-testid={`team-member-${m.id}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#0f1623] text-white flex items-center justify-center text-xs font-bold">
                          {(m.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <span>{m.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={roleColor(m.role) as any} className="capitalize">{m.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={m.status === "active" ? "default" : "secondary"} className="capitalize">{m.status || "active"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => removeMutation.mutate(m.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Enterprise Sub-Accounts */}
      <Card className="border-[#c8210d]/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-[#c8210d]" />
              <CardTitle className="text-base">Enterprise Sub-Accounts</CardTitle>
              <Badge className="bg-[#c8210d]/10 text-[#c8210d] border-[#c8210d]/20 text-[10px]">Enterprise</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            As the master account holder, you can provision sub-accounts for your organization. Each sub-account has its own login, document workspace, and usage allocation.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">Sub-accounts used</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <p className="text-2xl font-bold">7</p>
              <p className="text-xs text-muted-foreground">Remaining seats</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <p className="text-2xl font-bold">10</p>
              <p className="text-xs text-muted-foreground">Total allocation</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            {[
              { name: "Charlton Boyd", email: "charlton@ndaexpress.com", status: "active", docs: 12, lastActive: "Today" },
              { name: "Josiah Namie",  email: "josiah@ndaexpress.ai",   status: "active", docs: 7,  lastActive: "Yesterday" },
              { name: "Matthew Knych", email: "matt@ndaexpress.com",    status: "active", docs: 21, lastActive: "Today" },
            ].map(account => (
              <div key={account.email} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#c8210d]/10 flex items-center justify-center text-xs font-bold text-[#c8210d]">
                    {account.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{account.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-medium">{account.docs} docs</p>
                    <p className="text-[10px] text-muted-foreground">{account.lastActive}</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-green-200 text-[10px]">Active</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Activity</DropdownMenuItem>
                      <DropdownMenuItem>Reset Password</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Lock className="h-3.5 w-3.5 mr-2" />Suspend Account</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full border-dashed">
            <Plus className="h-4 w-4 mr-2" />
            Provision New Sub-Account
          </Button>

          <p className="text-[11px] text-muted-foreground text-center">
            Sub-accounts receive a discounted rate as part of your Enterprise plan. <span className="text-[#c8210d] cursor-pointer">Manage allocation →</span>
          </p>
        </CardContent>
      </Card>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" data-testid="invite-email" />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger data-testid="invite-role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={() => inviteMutation.mutate()} disabled={!inviteEmail} data-testid="send-invite">
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
