"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Moon, Utensils, Baby, Smile, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type Child = { child_id: number; first_name: string; last_name: string; date_of_birth: string };
type CompletedLog = {
  child_id: number;
  meal_notes: string | null;
  nap_notes: string | null;
  behavior_notes: string | null;
  general_notes: string | null;
};
type FormState = { meals: string; napTime: string; diaperChanges: string; mood: string; activities: string; parentNotes: string };

const emptyForm: FormState = { meals: "", napTime: "", diaperChanges: "", mood: "", activities: "", parentNotes: "" };

export default function StaffDailyLogPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [classroomName, setClassroomName] = useState("My Classroom");
  const [completedLogs, setCompletedLogs] = useState<CompletedLog[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshLogs = useCallback(() => {
    if (!user?.id) return;
    fetch(`/api/staff/daily-log?staffId=${user.id}`)
      .then((r) => r.json())
      .then(setCompletedLogs);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      fetch(`/api/staff/roster?staffId=${user.id}`).then((r) => r.json()),
      fetch(`/api/staff/daily-log?staffId=${user.id}`).then((r) => r.json()),
    ]).then(([rosterData, logsData]) => {
      const kids: Child[] = rosterData.children ?? [];
      setChildren(kids);
      setClassroomName(rosterData.classroom?.classroom_name ?? "My Classroom");
      setCompletedLogs(logsData);
      if (kids.length > 0) setSelectedId(kids[0].child_id);
      setLoading(false);
    });
  }, [user?.id]);

  const completedIds = useMemo(() => new Set(completedLogs.map((l) => l.child_id)), [completedLogs]);
  const completionPercent = children.length > 0 ? Math.round((completedIds.size / children.length) * 100) : 0;
  const selectedChild = children.find((c) => c.child_id === selectedId) ?? null;

  const handleSelect = (childId: number) => {
    setSelectedId(childId);
    const existing = completedLogs.find((l) => l.child_id === childId);
    if (existing) {
      setForm({
        meals: existing.meal_notes ?? "",
        napTime: existing.nap_notes?.split("\n")[0] ?? "",
        diaperChanges: existing.nap_notes?.split("\n")[1]?.replace("Diaper/Bathroom: ", "") ?? "",
        mood: existing.behavior_notes ?? "",
        activities: existing.general_notes?.split("\n\nParent Notes: ")[0] ?? "",
        parentNotes: existing.general_notes?.split("\n\nParent Notes: ")[1] ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  };

  const handleSave = async () => {
    if (!selectedId || !user?.id) return;
    if (!form.meals || !form.mood || !form.activities) {
      toast.error("Meals, Mood, and Activities are required.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/staff/daily-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId: user.id, childId: selectedId, ...form }),
    });
    if (res.ok) {
      toast.success(`Daily log saved for ${selectedChild?.first_name}.`);
      refreshLogs();
      const next = children.find((c) => c.child_id !== selectedId && !completedIds.has(c.child_id));
      if (next) handleSelect(next.child_id);
    } else {
      toast.error("Failed to save log.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-[#002040]">Daily Log</h1>
        <p className="text-gray-600">Track each child&apos;s meals, rest, care, mood, activities, and parent notes</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#002040]">Daily Completion Progress</h2>
              <p className="text-sm text-gray-500">{completedIds.size} of {children.length} students completed</p>
            </div>
            <Badge variant="outline" className="w-fit">{children.length - completedIds.size} remaining</Badge>
          </div>
          <Progress value={completionPercent} className="h-3" />
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <span>{completionPercent}% complete</span>
            <span>{children.length - completedIds.size > 0 ? `${children.length - completedIds.size} still need logs` : "All logs completed"}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#002040]">Select Student</h2>
                <p className="text-sm text-gray-500">{classroomName} — choose a child to log</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {children.map((child) => {
                  const done = completedIds.has(child.child_id);
                  const active = selectedId === child.child_id;
                  const age = Math.floor((Date.now() - new Date(child.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
                  return (
                    <button
                      key={child.child_id}
                      type="button"
                      onClick={() => handleSelect(child.child_id)}
                      className={`rounded-xl border p-4 text-left transition-all ${active ? "border-[#2888B8] bg-[#2888B8]/5" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-medium text-[#002040]">{child.first_name} {child.last_name}</p>
                        {done ? <CheckCircle className="text-[#489858]" size={18} /> : <Clock className="text-gray-400" size={18} />}
                      </div>
                      <p className="text-sm text-gray-500">Age {age}</p>
                      <div className="mt-2">
                        <Badge variant="outline" className={done ? "border-green-200 bg-green-50 text-green-700" : "border-orange-200 bg-orange-50 text-orange-700"}>
                          {done ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#002040]">
                  {selectedChild ? `${selectedChild.first_name} Daily Log` : "Daily Log"}
                </h2>
                <p className="text-sm text-gray-500">Fill out the child&apos;s daily summary for parents</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meals">Meals *</Label>
                  <div className="relative mt-1">
                    <Utensils className="pointer-events-none absolute left-3 top-3 text-gray-400" size={16} />
                    <Input id="meals" value={form.meals} onChange={(e) => setForm({ ...form, meals: e.target.value })} className="pl-9" placeholder="e.g. Ate breakfast and lunch well" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="napTime">Nap Time</Label>
                  <div className="relative mt-1">
                    <Moon className="pointer-events-none absolute left-3 top-3 text-gray-400" size={16} />
                    <Input id="napTime" value={form.napTime} onChange={(e) => setForm({ ...form, napTime: e.target.value })} className="pl-9" placeholder="e.g. 12:30 PM - 2:00 PM" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="diaperChanges">Diaper Changes / Bathroom</Label>
                  <div className="relative mt-1">
                    <Baby className="pointer-events-none absolute left-3 top-3 text-gray-400" size={16} />
                    <Input id="diaperChanges" value={form.diaperChanges} onChange={(e) => setForm({ ...form, diaperChanges: e.target.value })} className="pl-9" placeholder="e.g. 2 diaper changes, bathroom twice" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="mood">Mood *</Label>
                  <div className="relative mt-1">
                    <Smile className="pointer-events-none absolute left-3 top-3 text-gray-400" size={16} />
                    <Input id="mood" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} className="pl-9" placeholder="e.g. Happy, energetic, and social" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="activities">Activities *</Label>
                  <Textarea id="activities" value={form.activities} onChange={(e) => setForm({ ...form, activities: e.target.value })} rows={4} placeholder="Describe key activities and participation..." className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="parentNotes">Parent Notes</Label>
                  <Textarea id="parentNotes" value={form.parentNotes} onChange={(e) => setForm({ ...form, parentNotes: e.target.value })} rows={3} placeholder="Optional notes for parents..." className="mt-1" />
                </div>
                <div className="flex gap-3">
                  <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={handleSave} disabled={saving || !selectedId}>
                    <ClipboardList className="mr-2" size={16} />
                    {saving ? "Saving..." : "Save Daily Log"}
                  </Button>
                  <Button variant="outline" onClick={() => setForm(emptyForm)}>Clear Form</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#002040]">Completed Logs</h2>
                <p className="text-sm text-gray-500">Review finished daily summaries</p>
              </div>
              <div className="space-y-4">
                {completedLogs.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                    <ClipboardList className="mx-auto mb-3 text-gray-300" size={28} />
                    <p className="font-medium text-[#002040]">No completed logs yet</p>
                    <p className="mt-1 text-sm text-gray-500">Saved daily logs will appear here.</p>
                  </div>
                ) : (
                  completedLogs.map((log) => {
                    const child = children.find((c) => c.child_id === log.child_id);
                    return (
                      <div key={log.child_id} className="rounded-xl border border-gray-200 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="font-semibold text-[#002040]">{child ? `${child.first_name} ${child.last_name}` : `Child #${log.child_id}`}</h3>
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="mr-1" size={14} />
                            Complete
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          {log.meal_notes && <p><span className="font-medium text-[#002040]">Meals:</span> <span className="text-gray-600">{log.meal_notes}</span></p>}
                          {log.nap_notes && <p><span className="font-medium text-[#002040]">Nap:</span> <span className="text-gray-600">{log.nap_notes}</span></p>}
                          {log.behavior_notes && <p><span className="font-medium text-[#002040]">Mood:</span> <span className="text-gray-600">{log.behavior_notes}</span></p>}
                          {log.general_notes && <p><span className="font-medium text-[#002040]">Activities:</span> <span className="text-gray-600">{log.general_notes}</span></p>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
