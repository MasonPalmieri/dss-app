import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search, MoreHorizontal, Trash2, Edit, Mail, User } from "lucide-react";

export default function Contacts() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "" });

  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ["/api/contacts"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/contacts", { ...form, userId: user?.id || 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setShowAdd(false);
      setForm({ name: "", email: "", company: "", phone: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/contacts/${editId}`, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setEditId(null);
      setForm({ name: "", email: "", company: "", phone: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
  });

  const filtered = contacts.filter(
    (c: any) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (c: any) => {
    setForm({ name: c.name || "", email: c.email || "", company: c.company || "", phone: c.phone || "" });
    setEditId(c.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-sm text-muted-foreground">Manage your frequently used recipients</p>
        </div>
        <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={() => { setForm({ name: "", email: "", company: "", phone: "" }); setShowAdd(true); }} data-testid="add-contact">
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search contacts..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="contact-search" />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-1">No contacts yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add contacts for quick recipient selection</p>
            <Button variant="outline" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-left">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: any) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50" data-testid={`contact-row-${c.id}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#c8210d]/10 text-[#c8210d] flex items-center justify-center text-xs font-bold">
                          {c.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.company || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(c)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem><Mail className="h-4 w-4 mr-2" /> Send Document</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(c.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" data-testid="contact-name-input" /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" data-testid="contact-email-input" /></div>
            <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={() => createMutation.mutate()} disabled={!form.name || !form.email} data-testid="contact-save">Save Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editId !== null} onOpenChange={() => setEditId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Contact</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
            <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={() => updateMutation.mutate()} disabled={!form.name || !form.email}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
