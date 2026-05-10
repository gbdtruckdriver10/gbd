"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogIn, LogOut, StickyNote, CheckCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type Child = { child_id: number; first_name: string; last_name: string };
type AttendanceRecord = {
  attendance_id: number;
  child_id: number;
  check_in_time: string;
  check_out_time: string | null;
  first_name: string;
  last_name: string;
};

function formatTime(ts: string | null) {
  if (!ts) return null;
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
  return (
    <div className="w-10 h-10 rounded-full bg-[#2888B8]/10 flex items-center justify-center text-[#2888B8] text-sm font-bold shrink-0">
      {letters.toUpperCase()}
    </div>
  );
}

export default function StaffCheckIn() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [classroomId, setClassroomId] = useState<number | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(true);

  const [selectedChildIds, setSelectedChildIds] = useState<Set<number>>(new Set());
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [selectedNoteChild, setSelectedNoteChild] = useState("");
  const [dailyNote, setDailyNote] = useState("");
  const [mealsTaken, setMealsTaken] = useState({ breakfast: false, lunch: false, snack: false });
  const [savingNote, setSavingNote] = useState(false);

  const refreshAttendance = useCallback(() => {
    if (!user?.id) return;
    fetch(`/api/staff/attendance?staffId=${user.id}`)
      .then((r) => r.json())
      .then(setAttendance);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      fetch(`/api/staff/roster?staffId=${user.id}`).then((r) => r.json()),
      fetch(`/api/staff/attendance?staffId=${user.id}`).then((r) => r.json()),
    ]).then(([rosterData, attendanceData]) => {
      setChildren(rosterData.children ?? []);
      setClassroomId(rosterData.classroom?.classroom_id ?? null);
      setAttendance(attendanceData);
      setLoadingRoster(false);
    });
  }, [user?.id]);

  const toggleChild = (childId: number) => {
    setSelectedChildIds((prev) => {
      const next = new Set(prev);
      if (next.has(childId)) next.delete(childId);
      else next.add(childId);
      return next;
    });
  };

  const handleCheckIn = async () => {
    if (selectedChildIds.size === 0 || !user?.id) { toast.error("Select at least one child"); return; }
    const eligible = [...selectedChildIds].filter((id) => !attendance.some((a) => a.child_id === id));
    if (eligible.length === 0) { toast.error("All selected children are already checked in"); return; }
    setCheckingIn(true);
    await Promise.all(
      eligible.map((childId) =>
        fetch("/api/staff/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffId: user.id, childId, classroomId, action: "checkin" }),
        })
      )
    );
    toast.success(`${eligible.length} ${eligible.length === 1 ? "child" : "children"} checked in`);
    setSelectedChildIds(new Set());
    refreshAttendance();
    setCheckingIn(false);
  };

  const handleCheckOut = async () => {
    if (selectedChildIds.size === 0 || !user?.id) { toast.error("Select at least one child"); return; }
    const eligible = [...selectedChildIds].filter((id) => {
      const rec = attendance.find((a) => a.child_id === id);
      return rec && !rec.check_out_time;
    });
    if (eligible.length === 0) { toast.error("None of the selected children are currently checked in"); return; }
    setCheckingOut(true);
    await Promise.all(
      eligible.map((childId) =>
        fetch("/api/staff/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffId: user.id, childId, classroomId, action: "checkout" }),
        })
      )
    );
    toast.success(`${eligible.length} ${eligible.length === 1 ? "child" : "children"} checked out`);
    setSelectedChildIds(new Set());
    refreshAttendance();
    setCheckingOut(false);
  };

  const handleSaveNote = async () => {
    if (!selectedNoteChild || !dailyNote.trim() || !user?.id) {
      toast.error("Please select a child and enter a note");
      return;
    }
    setSavingNote(true);
    const meals = [mealsTaken.breakfast && "Breakfast", mealsTaken.lunch && "Lunch", mealsTaken.snack && "Snack"]
      .filter(Boolean)
      .join(", ") || null;
    await fetch("/api/staff/daily-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffId: user.id,
        childId: Number(selectedNoteChild),
        meals,
        activities: dailyNote,
      }),
    });
    toast.success("Daily note saved");
    setDailyNote("");
    setSelectedNoteChild("");
    setMealsTaken({ breakfast: false, lunch: false, snack: false });
    setSavingNote(false);
  };

  if (loadingRoster) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002040] mb-2">Check-In/Out & Daily Notes</h1>
        <p className="text-gray-600">Manage attendance and record daily activities</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#002040]">Check-In / Check-Out</h3>
              {selectedChildIds.size > 0 && (
                <button className="text-xs text-gray-400 hover:text-gray-600 underline" onClick={() => setSelectedChildIds(new Set())}>
                  Clear ({selectedChildIds.size})
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Select Children</label>
                  <div className="flex gap-2">
                    <button
                      className="text-xs text-[#2888B8] hover:underline"
                      onClick={() => setSelectedChildIds(new Set(children.filter((c) => !attendance.some((a) => a.child_id === c.child_id)).map((c) => c.child_id)))}
                    >
                      All not checked in
                    </button>
                    <span className="text-xs text-gray-300">·</span>
                    <button
                      className="text-xs text-[#2888B8] hover:underline"
                      onClick={() => setSelectedChildIds(new Set(children.filter((c) => { const a = attendance.find((a) => a.child_id === c.child_id); return a && !a.check_out_time; }).map((c) => c.child_id)))}
                    >
                      All checked in
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {children.map((child) => {
                    const att = attendance.find((a) => a.child_id === child.child_id);
                    const isPresent = !!att && !att.check_out_time;
                    const isCheckedOut = !!att?.check_out_time;
                    const isSelected = selectedChildIds.has(child.child_id);
                    return (
                      <button
                        key={child.child_id}
                        onClick={() => toggleChild(child.child_id)}
                        className={`flex items-center gap-2 rounded-lg border p-2.5 text-left transition-all ${
                          isSelected
                            ? "border-[#2888B8] bg-[#2888B8]/10 ring-1 ring-[#2888B8]"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? "bg-[#2888B8] text-white" : "bg-[#2888B8]/10 text-[#2888B8]"}`}>
                          {child.first_name[0]}{child.last_name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#002040] truncate">{child.first_name} {child.last_name}</p>
                          <p className={`text-[10px] font-medium ${isPresent ? "text-green-600" : isCheckedOut ? "text-gray-500" : "text-yellow-600"}`}>
                            {isPresent ? `In ${formatTime(att!.check_in_time)}` : isCheckedOut ? "Checked out" : "Not arrived"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleCheckIn} className="bg-[#489858] hover:bg-[#3a7846]" disabled={checkingIn || selectedChildIds.size === 0}>
                  <LogIn className="mr-2" size={18} />
                  {checkingIn ? "Checking in..." : `Check In${selectedChildIds.size > 0 ? ` (${selectedChildIds.size})` : ""}`}
                </Button>
                <Button onClick={handleCheckOut} className="bg-[#E05830] hover:bg-[#c74a26]" disabled={checkingOut || selectedChildIds.size === 0}>
                  <LogOut className="mr-2" size={18} />
                  {checkingOut ? "Checking out..." : `Check Out${selectedChildIds.size > 0 ? ` (${selectedChildIds.size})` : ""}`}
                </Button>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                <strong>Tip:</strong> Always verify the person dropping off or picking up is on the authorized list.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-[#002040] mb-4 flex items-center gap-2">
              <StickyNote className="text-[#E8A018]" size={24} />
              Daily Notes
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Child</label>
                <Select value={selectedNoteChild} onValueChange={setSelectedNoteChild}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a child..." />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.child_id} value={String(child.child_id)}>
                        {child.first_name} {child.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Daily Note</label>
                <Textarea
                  rows={4}
                  placeholder="Describe activities, mood, meals, naps, etc..."
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

              <Button
                onClick={handleSaveNote}
                className="w-full bg-[#2888B8] hover:bg-[#1078A8]"
                disabled={!selectedNoteChild || !dailyNote.trim() || savingNote}
              >
                Save Daily Note
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-[#002040] mb-4">Today&apos;s Attendance</h3>
          {children.length === 0 ? (
            <p className="text-gray-500 text-sm">No children assigned to this classroom.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => {
                const att = attendance.find((a) => a.child_id === child.child_id);
                const isPresent = !!att && !att.check_out_time;
                const isCheckedOut = !!att?.check_out_time;
                return (
                  <div key={child.child_id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Initials name={`${child.first_name} ${child.last_name}`} />
                      <div className="flex-1">
                        <p className="font-semibold text-[#002040]">{child.first_name} {child.last_name}</p>
                        {isCheckedOut ? (
                          <div className="space-y-1 mt-1">
                            <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
                              Checked Out
                            </Badge>
                            <p className="text-xs text-gray-500">
                              In: {formatTime(att!.check_in_time)} → Out: {formatTime(att!.check_out_time)}
                            </p>
                          </div>
                        ) : isPresent ? (
                          <div className="space-y-1 mt-1">
                            <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
                              Present
                            </Badge>
                            <p className="text-xs text-gray-500">In: {formatTime(att!.check_in_time)}</p>
                          </div>
                        ) : (
                          <Badge variant="outline" className="mt-1 bg-yellow-50 text-yellow-700 text-xs">
                            Not Arrived
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
