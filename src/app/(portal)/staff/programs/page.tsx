"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, CheckCircle, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type Child = { child_id: number; first_name: string; last_name: string; has_report_today: boolean; report_staff_id: number | null; report_staff_name: string | null };

type Program = {
  program_id: number;
  program_name: string;
  description: string | null;
  days_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  session_id: number;
  session_start_date: string | null;
  session_end_date: string | null;
  children: Child[];
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
  return (
    <div className="w-9 h-9 rounded-full bg-[#2888B8]/10 flex items-center justify-center text-[#2888B8] text-sm font-bold shrink-0">
      {letters.toUpperCase()}
    </div>
  );
}

export default function StaffProgramsPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [dailyNote, setDailyNote] = useState("");
  const [mealsTaken, setMealsTaken] = useState({ breakfast: false, lunch: false, snack: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/staff/programs?staffId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setPrograms(data);
        if (data.length > 0) setSelectedProgramId(data[0].program_id);
        setLoading(false);
      });
  }, [user?.id]);

  const activeProgram = programs.find((p) => p.program_id === selectedProgramId) ?? null;

  const handleSaveNote = async () => {
    if (!selectedChildId || !dailyNote.trim() || !user?.id) {
      toast.error("Please select a child and enter a note");
      return;
    }
    setSaving(true);
    const meals = [mealsTaken.breakfast && "Breakfast", mealsTaken.lunch && "Lunch", mealsTaken.snack && "Snack"]
      .filter(Boolean)
      .join(", ") || null;

    const res = await fetch("/api/staff/daily-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffId: user.id,
        childId: Number(selectedChildId),
        meals,
        activities: dailyNote,
      }),
    });

    if (res.ok) {
      toast.success("Daily note saved and sent to parent");
      setPrograms((prev) =>
        prev.map((p) => ({
          ...p,
          children: p.children.map((c) =>
            c.child_id === Number(selectedChildId)
              ? { ...c, has_report_today: true, report_staff_id: Number(user?.id), report_staff_name: user?.name ?? null }
              : c
          ),
        }))
      );
      setDailyNote("");
      setSelectedChildId("");
      setMealsTaken({ breakfast: false, lunch: false, snack: false });
    } else {
      toast.error("Failed to save note");
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

  if (programs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#002040] mb-2">My Programs</h1>
          <p className="text-gray-600">Programs you are assigned to as instructor</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <GraduationCap className="mx-auto mb-3 text-gray-300" size={48} />
            <p className="text-gray-500">You are not currently assigned to any programs.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002040] mb-2">My Programs</h1>
        <p className="text-gray-600">Programs you are assigned to as instructor</p>
      </div>

      {programs.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {programs.map((p) => (
            <Button
              key={p.program_id}
              variant={selectedProgramId === p.program_id ? "default" : "outline"}
              className={selectedProgramId === p.program_id ? "bg-[#2888B8] hover:bg-[#1078A8]" : ""}
              onClick={() => {
                setSelectedProgramId(p.program_id);
                setSelectedChildId("");
                setDailyNote("");
              }}
            >
              {p.program_name}
            </Button>
          ))}
        </div>
      )}

      {activeProgram && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Program info + roster */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#2888B8]/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="text-[#2888B8]" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#002040]">{activeProgram.program_name}</h2>
                    {activeProgram.description && (
                      <p className="text-sm text-gray-600 mt-1">{activeProgram.description}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {activeProgram.days_of_week && (
                    <div>
                      <p className="text-gray-500">Days</p>
                      <p className="font-medium text-[#002040]">{activeProgram.days_of_week}</p>
                    </div>
                  )}
                  {activeProgram.start_time && (
                    <div>
                      <p className="text-gray-500">Time</p>
                      <p className="font-medium text-[#002040]">{activeProgram.start_time} – {activeProgram.end_time}</p>
                    </div>
                  )}
                  {(activeProgram.session_start_date || activeProgram.session_end_date) && (
                    <div>
                      <p className="text-gray-500">Session</p>
                      <p className="font-medium text-[#002040]">
                        {formatDate(activeProgram.session_start_date)} – {formatDate(activeProgram.session_end_date)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Enrolled</p>
                    <p className="font-medium text-[#002040]">{activeProgram.children.length} students</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#002040] mb-3 flex items-center gap-2">
                  <Users size={18} className="text-[#2888B8]" />
                  Enrolled Students
                </h3>
                {activeProgram.children.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Daily notes today</span>
                      <span>{activeProgram.children.filter((c) => c.has_report_today).length} / {activeProgram.children.length}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-[#489858] transition-all"
                        style={{ width: `${Math.round((activeProgram.children.filter((c) => c.has_report_today).length / activeProgram.children.length) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {activeProgram.children.length === 0 ? (
                  <p className="text-sm text-gray-500">No students enrolled.</p>
                ) : (
                  <div className="space-y-2">
                    {activeProgram.children.map((child) => {
                      const byOther = child.has_report_today && child.report_staff_id !== Number(user?.id);
                      return (
                        <div key={child.child_id} className={`flex items-center gap-3 p-3 rounded-lg ${child.has_report_today ? "bg-green-50" : "bg-gray-50"}`}>
                          <Initials name={`${child.first_name} ${child.last_name}`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[#002040]">{child.first_name} {child.last_name}</p>
                            {byOther && (
                              <p className="text-xs text-amber-600 mt-0.5">Note submitted by {child.report_staff_name}</p>
                            )}
                          </div>
                          {child.has_report_today && (
                            <CheckCircle size={16} className={`shrink-0 ${byOther ? "text-amber-400" : "text-[#489858]"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily note */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-[#002040] mb-4 flex items-center gap-2">
                <StickyNote className="text-[#E8A018]" size={24} />
                Daily Note
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Student</label>
                  <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeProgram.children.map((child) => (
                        <SelectItem key={child.child_id} value={String(child.child_id)}>
                          {child.first_name} {child.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Note</label>
                  <Textarea
                    rows={4}
                    placeholder="Describe activities, progress, behavior..."
                    value={dailyNote}
                    onChange={(e) => setDailyNote(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Meals Taken</label>
                  <div className="flex gap-3">
                    {(["breakfast", "lunch", "snack"] as const).map((meal) => (
                      <Button
                        key={meal}
                        variant={mealsTaken[meal] ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMealsTaken({ ...mealsTaken, [meal]: !mealsTaken[meal] })}
                      >
                        {mealsTaken[meal] && <CheckCircle size={16} className="mr-1" />}
                        {meal.charAt(0).toUpperCase() + meal.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-1">
                  <Badge variant="outline" className="text-xs text-gray-500 mb-3 block w-fit">
                    Note will be sent to parent&apos;s inbox
                  </Badge>
                  <Button
                    onClick={handleSaveNote}
                    className="w-full bg-[#2888B8] hover:bg-[#1078A8]"
                    disabled={!selectedChildId || !dailyNote.trim() || saving}
                  >
                    Save Daily Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
