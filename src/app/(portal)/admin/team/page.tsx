"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Users, UserPlus, Trash2, Globe } from "lucide-react";
import { toast } from "sonner";

type Member = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  show_on_website: boolean;
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  cfo: "CFO",
  staff: "Staff",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  cfo: "bg-blue-100 text-blue-700",
  staff: "bg-green-100 text-green-700",
};

export default function AdminTeam() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", role: "staff", password: "",
  });

  useEffect(() => {
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then((data) => { setMembers(data); setLoading(false); });
  }, []);

  const handleAdd = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to add member"); return; }
      setMembers((prev) => [...prev, { ...data, show_on_website: false }]);
      toast.success(`${form.firstName} ${form.lastName} added`);
      setForm({ firstName: "", lastName: "", email: "", role: "staff", password: "" });
      setAddOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/team/${deleteTarget.user_id}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((m) => m.user_id !== deleteTarget.user_id));
      toast.success(`${deleteTarget.first_name} ${deleteTarget.last_name} removed`);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublic = async (member: Member, value: boolean) => {
    setMembers((prev) =>
      prev.map((m) => m.user_id === member.user_id ? { ...m, show_on_website: value } : m)
    );
    const res = await fetch(`/api/admin/team/${member.user_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ show_on_website: value }),
    });
    if (!res.ok) {
      setMembers((prev) =>
        prev.map((m) => m.user_id === member.user_id ? { ...m, show_on_website: !value } : m)
      );
      toast.error("Failed to update visibility");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading team...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#002040] mb-2">Team</h1>
          <p className="text-gray-600">{members.length} staff, admin, and CFO accounts</p>
        </div>
        <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={() => setAddOpen(true)}>
          <UserPlus className="mr-2" size={16} />
          Add Member
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center gap-4 rounded-xl bg-gray-50 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2888B8]/10 text-sm font-bold text-[#2888B8]">
                  {member.first_name[0]}{member.last_name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#002040]">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Globe size={14} className="text-gray-400" />
                  <Switch
                    checked={member.show_on_website}
                    onCheckedChange={(v) => handleTogglePublic(member, v)}
                  />
                  <span className="text-xs text-gray-500 w-16">
                    {member.show_on_website ? "Public" : "Hidden"}
                  </span>
                </div>

                <Badge className={ROLE_COLORS[member.role] ?? "bg-gray-100 text-gray-700"}>
                  {ROLE_LABELS[member.role] ?? member.role}
                </Badge>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-red-500 shrink-0"
                  onClick={() => setDeleteTarget(member)}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#002040]">Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name</Label>
                <Input
                  className="mt-1"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  className="mt-1"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  disabled={saving}
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                className="mt-1"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={saving}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })} disabled={saving}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="cfo">CFO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Temporary Password</Label>
              <Input
                className="mt-1"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="They can change it after first login"
                disabled={saving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
            <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={handleAdd} disabled={saving}>
              <UserPlus className="mr-2" size={15} />
              {saving ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-700">Remove Team Member</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Are you sure you want to remove{" "}
            <span className="font-semibold">{deleteTarget?.first_name} {deleteTarget?.last_name}</span>?
            This will delete their portal account permanently.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="mr-2" size={15} />
              {deleting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
