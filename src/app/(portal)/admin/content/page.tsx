"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Announcement = {
  announcement_id: number;
  title: string;
  body: string;
  audience: string;
  priority: string;
  publish_date: string;
  is_active: boolean;
  author: string;
};

export default function AdminContent() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", audience: "all", priority: "normal" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ title: "", body: "", audience: "all", priority: "normal" });

  useEffect(() => {
    fetch("/api/admin/announcements")
      .then((r) => r.json())
      .then((data) => { setAnnouncements(data); setLoading(false); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.title.trim() || !formData.content.trim()) { toast.error("Please fill in all required fields"); return; }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formData.title, body: formData.content, audience: formData.audience, priority: formData.priority }),
      });
      const newAnnouncement = await res.json();
      setAnnouncements([{ ...newAnnouncement, author: "Admin" }, ...announcements]);
      toast.success("Announcement published successfully");
      setShowNewForm(false);
      setFormData({ title: "", content: "", audience: "all", priority: "normal" });
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    setAnnouncements(announcements.filter((a) => a.announcement_id !== id));
    toast.success("Announcement deleted");
  };

  const startEdit = (a: Announcement) => {
    setEditingId(a.announcement_id);
    setEditData({ title: a.title, body: a.body, audience: a.audience, priority: a.priority });
  };

  const cancelEdit = () => { setEditingId(null); };

  const saveEdit = async (id: number) => {
    await fetch(`/api/admin/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    setAnnouncements(announcements.map((a) =>
      a.announcement_id === id ? { ...a, ...editData } : a
    ));
    setEditingId(null);
    toast.success("Announcement updated");
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><p className="text-gray-500">Loading announcements...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#002040] mb-2">Content Manager</h1>
          <p className="text-gray-600">Manage announcements and updates</p>
        </div>
        <Button onClick={() => setShowNewForm(!showNewForm)} className="bg-[#2888B8] hover:bg-[#1078A8]">
          <Plus className="mr-2" size={20} />
          {showNewForm ? "Cancel" : "New Announcement"}
        </Button>
      </div>

      {showNewForm && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-[#002040] mb-4">Create New Announcement</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea id="content" rows={4} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Audience</Label>
                  <div className="flex gap-2 mt-2">
                    {["all", "parents", "staff"].map((aud) => (
                      <Button key={aud} type="button" variant={formData.audience === aud ? "default" : "outline"} size="sm" onClick={() => setFormData({ ...formData, audience: aud })}>
                        {aud.charAt(0).toUpperCase() + aud.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Priority</Label>
                  <div className="flex gap-2 mt-2">
                    {["normal", "high"].map((pri) => (
                      <Button key={pri} type="button" variant={formData.priority === pri ? "default" : "outline"} size="sm" onClick={() => setFormData({ ...formData, priority: pri })}>
                        {pri.charAt(0).toUpperCase() + pri.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <Button type="submit" className="bg-[#2888B8] hover:bg-[#1078A8]" disabled={isSubmitting}>
                {isSubmitting ? "Publishing..." : "Publish Announcement"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#002040]">Recent Announcements</h3>
        {announcements.length === 0 && <p className="text-sm text-gray-500">No announcements yet.</p>}
        {announcements.map((a) => (
          <Card key={a.announcement_id}>
            <CardContent className="p-6">
              {editingId === a.announcement_id ? (
                <div className="space-y-3">
                  <Input value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
                  <Textarea rows={3} value={editData.body} onChange={(e) => setEditData({ ...editData, body: e.target.value })} />
                  <div className="flex gap-2">
                    {["all", "parents", "staff"].map((aud) => (
                      <Button key={aud} type="button" size="sm" variant={editData.audience === aud ? "default" : "outline"} onClick={() => setEditData({ ...editData, audience: aud })}>
                        {aud.charAt(0).toUpperCase() + aud.slice(1)}
                      </Button>
                    ))}
                    <span className="mx-2 text-gray-300">|</span>
                    {["normal", "high"].map((pri) => (
                      <Button key={pri} type="button" size="sm" variant={editData.priority === pri ? "default" : "outline"} onClick={() => setEditData({ ...editData, priority: pri })}>
                        {pri.charAt(0).toUpperCase() + pri.slice(1)}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={() => saveEdit(a.announcement_id)}>Save</Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-[#002040]">{a.title}</h4>
                      {a.priority === "high" && <Badge variant="destructive">High Priority</Badge>}
                    </div>
                    <p className="text-gray-700 mb-3">{a.body}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(a.publish_date).toLocaleDateString()}</span>
                      <span>•</span>
                      <Badge variant="secondary" className="capitalize">{a.audience === "all" ? "Everyone" : a.audience}</Badge>
                      <span>•</span>
                      <span>By {a.author}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(a)}><Edit size={16} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(a.announcement_id)}><Trash2 size={16} className="text-red-600" /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
