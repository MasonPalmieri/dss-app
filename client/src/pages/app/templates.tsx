import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Copy,
  Trash2,
  Edit,
  LayoutGrid,
  List,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function Templates() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const { data: templates = [] } = useQuery<any[]>({
    queryKey: ["/api/templates"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/templates", {
        name: newName,
        description: newDesc,
        createdBy: user?.id || 1,
        category: "general",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setShowCreate(false);
      setNewName("");
      setNewDesc("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
  });

  const filtered = templates.filter(
    (t: any) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-sm text-muted-foreground">Reusable document templates for faster workflows</p>
        </div>
        <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={() => setShowCreate(true)} data-testid="create-template">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="template-search" />
        </div>
        <div className="flex border rounded-md">
          <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-9 w-9" onClick={() => setViewMode("grid")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-9 w-9" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-1">No templates yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first template to speed up document creation</p>
            <Button variant="outline" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1" /> Create Template
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t: any) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow" data-testid={`template-card-${t.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c8210d]/10 text-[#c8210d]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{t.name}</CardTitle>
                      {t.category && <Badge variant="outline" className="text-[10px] mt-0.5">{t.category}</Badge>}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                      <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(t.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2">{t.description || "No description"}</p>
                <p className="text-[10px] text-muted-foreground mt-3">
                  Created {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-left">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t: any) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{t.category || "general"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(t.id)}>
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

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. NDA Agreement" data-testid="template-name-input" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Brief description..." rows={3} data-testid="template-desc-input" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="bg-[#c8210d] hover:bg-[#a61b0b] text-white" onClick={() => createMutation.mutate()} disabled={!newName} data-testid="template-save">
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
