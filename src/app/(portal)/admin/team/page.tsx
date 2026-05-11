"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { UserPlus, Trash2, Pencil, Eye, EyeOff, Upload } from "lucide-react";
import { toast } from "sonner";

type Member = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  show_on_website: boolean;
  bio: string | null;
  job_title: string | null;
  profile_image: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  display_order: number;
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

const BLANK_EDIT = {
  bio: "",
  job_title: "",
  profile_image: "",
  facebook_url: "",
  linkedin_url: "",
  twitter_url: "",
  display_order: 99,
  show_on_website: false,
};

export default function AdminTeam() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState(BLANK_EDIT);
  const [editSaving, setEditSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", role: "staff", password: "",
  });

  useEffect(() => {
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then((data) => { setMembers(data); setLoading(false); });
  }, []);

  const openEdit = (member: Member) => {
    setEditTarget(member);
    setEditForm({
      bio: member.bio ?? "",
      job_title: member.job_title ?? "",
      profile_image: member.profile_image ?? "",
      facebook_url: member.facebook_url ?? "",
      linkedin_url: member.linkedin_url ?? "",
      twitter_url: member.twitter_url ?? "",
      display_order: member.display_order ?? 99,
      show_on_website: member.show_on_website,
    });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/team/${editTarget.user_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: editForm.bio || null,
          job_title: editForm.job_title || null,
          profile_image: editForm.profile_image || null,
          facebook_url: editForm.facebook_url || null,
          linkedin_url: editForm.linkedin_url || null,
          twitter_url: editForm.twitter_url || null,
          display_order: editForm.display_order,
          show_on_website: editForm.show_on_website,
        }),
      });
      if (!res.ok) { toast.error("Failed to save"); return; }
      setMembers((prev) =>
        prev.map((m) =>
          m.user_id === editTarget.user_id
            ? { ...m, ...editForm }
            : m
        )
      );
      toast.success("Profile updated");
      setEditTarget(null);
    } finally {
      setEditSaving(false);
    }
  };

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
      setMembers((prev) => [...prev, { ...data, show_on_website: false, bio: null, job_title: null, profile_image: null, facebook_url: null, linkedin_url: null, twitter_url: null, display_order: 99 }]);
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
          <h1 className="text-3xl font-bold text-[#002040] mb-1">Team Manager</h1>
          <p className="text-gray-500 text-sm">Manage team members displayed on the About page</p>
        </div>
        <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={() => setAddOpen(true)}>
          <UserPlus className="mr-2" size={16} />
          Add Team Member
        </Button>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#002040] mb-3">Current Team Members</h2>
        <div className="space-y-4">
          {members.map((member) => (
            <Card key={member.user_id} className="border shadow-sm">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="shrink-0">
                    {member.profile_image ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#2888B8]/20">
                        <Image src={member.profile_image} alt={`${member.first_name} ${member.last_name}`} fill className="object-cover" sizes="64px" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#2888B8]/10 flex items-center justify-center border-2 border-[#2888B8]/20">
                        <span className="text-lg font-bold text-[#2888B8]">
                          {member.first_name[0]}{member.last_name[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-[#002040]">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-[#2888B8] text-sm font-medium">
                          {member.job_title || ROLE_LABELS[member.role] || member.role}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 bg-gray-100 px-2 py-1 rounded">
                        Order: {member.display_order}
                      </span>
                    </div>

                    {member.bio && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{member.bio}</p>
                    )}

                    {(member.facebook_url || member.linkedin_url || member.twitter_url) && (
                      <div className="flex gap-2 mt-2">
                        {member.facebook_url && (
                          <span className="text-xs border rounded px-2 py-0.5 text-gray-500">Facebook</span>
                        )}
                        {member.linkedin_url && (
                          <span className="text-xs border rounded px-2 py-0.5 text-gray-500">LinkedIn</span>
                        )}
                        {member.twitter_url && (
                          <span className="text-xs border rounded px-2 py-0.5 text-gray-500">Twitter</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => openEdit(member)}>
                        <Pencil size={12} /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        onClick={() => handleTogglePublic(member, !member.show_on_website)}
                      >
                        {member.show_on_website ? <><EyeOff size={12} /> Hide</> : <><Eye size={12} /> Show</>}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1 text-red-500 hover:text-red-600 hover:border-red-300"
                        onClick={() => setDeleteTarget(member)}
                      >
                        <Trash2 size={12} /> Delete
                      </Button>
                      <Badge className={`ml-auto ${ROLE_COLORS[member.role] ?? "bg-gray-100 text-gray-700"}`}>
                        {ROLE_LABELS[member.role] ?? member.role}
                      </Badge>
                      <span className={`text-xs font-medium ${member.show_on_website ? "text-green-600" : "text-gray-400"}`}>
                        {member.show_on_website ? "Visible" : "Hidden"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How it works info box */}
      <Card className="border-[#2888B8]/20 bg-blue-50/50">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-[#002040] mb-2">💡 How Team Members Work</p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Team members appear on the <strong>About</strong> page in the "Meet Our Team" section</li>
            <li>Use <strong>Display Order</strong> to control the sequence (1 = first, 2 = second, etc.)</li>
            <li>Toggle <strong>Show/Hide</strong> to control visibility without deleting</li>
            <li>Social links are optional but add credibility</li>
            <li>For photos, upload images to <code className="bg-white px-1 rounded">/public/team/</code> and reference as <code className="bg-white px-1 rounded">/team/name.jpg</code></li>
          </ul>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#002040]">Edit Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Full Name</Label>
                <Input className="mt-1" value={`${editTarget?.first_name} ${editTarget?.last_name}`} disabled />
                <p className="text-xs text-gray-400 mt-1">Name is set from the account</p>
              </div>
              <div>
                <Label>Job Title</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g. Director & Founder"
                  value={editForm.job_title}
                  onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                  disabled={editSaving}
                />
              </div>
            </div>
            <div>
              <Label>Biography</Label>
              <Textarea
                className="mt-1"
                rows={4}
                placeholder="A short bio that appears on the About page..."
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                disabled={editSaving}
              />
            </div>
            <div>
              <Label>Profile Photo</Label>
              <div className="mt-1 flex items-center gap-3">
                {editForm.profile_image && (
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#2888B8]/20 shrink-0">
                    <Image src={editForm.profile_image} alt="Preview" fill className="object-cover" sizes="56px" />
                  </div>
                )}
                <label className={`flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${photoUploading ? "opacity-50 pointer-events-none" : ""}`}>
                  <Upload size={14} />
                  {photoUploading ? "Uploading..." : editForm.profile_image ? "Change Photo" : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={photoUploading || editSaving}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !editTarget) return;
                      setPhotoUploading(true);
                      try {
                        const fd = new FormData();
                        fd.append("file", file);
                        fd.append("userId", String(editTarget.user_id));
                        const res = await fetch("/api/admin/team/photo", { method: "POST", body: fd });
                        const data = await res.json();
                        if (!res.ok) { toast.error(data.error ?? "Upload failed"); return; }
                        setEditForm((f) => ({ ...f, profile_image: data.url }));
                        setMembers((prev) => prev.map((m) => m.user_id === editTarget.user_id ? { ...m, profile_image: data.url } : m));
                        toast.success("Photo uploaded");
                      } finally {
                        setPhotoUploading(false);
                      }
                    }}
                  />
                </label>
                {editForm.profile_image && (
                  <button
                    type="button"
                    className="text-xs text-red-400 hover:text-red-600"
                    onClick={() => setEditForm((f) => ({ ...f, profile_image: "" }))}
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Recommended: square, at least 400×400px</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Facebook URL</Label>
                <Input
                  className="mt-1"
                  placeholder="https://facebook.com/..."
                  value={editForm.facebook_url}
                  onChange={(e) => setEditForm({ ...editForm, facebook_url: e.target.value })}
                  disabled={editSaving}
                />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input
                  className="mt-1"
                  placeholder="https://linkedin.com/in/..."
                  value={editForm.linkedin_url}
                  onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                  disabled={editSaving}
                />
              </div>
              <div>
                <Label>Twitter URL</Label>
                <Input
                  className="mt-1"
                  placeholder="https://twitter.com/..."
                  value={editForm.twitter_url}
                  onChange={(e) => setEditForm({ ...editForm, twitter_url: e.target.value })}
                  disabled={editSaving}
                />
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label>Display Order</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min={1}
                  value={editForm.display_order}
                  onChange={(e) => setEditForm({ ...editForm, display_order: Number(e.target.value) })}
                  disabled={editSaving}
                />
                <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <Switch
                  checked={editForm.show_on_website}
                  onCheckedChange={(v) => setEditForm({ ...editForm, show_on_website: v })}
                  disabled={editSaving}
                />
                <Label>Display on About page</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={editSaving}>Cancel</Button>
            <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={handleSaveEdit} disabled={editSaving}>
              {editSaving ? "Saving..." : "Update Team Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
