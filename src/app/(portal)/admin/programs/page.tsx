"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Clock, DollarSign, Settings, Edit, Calendar } from "lucide-react";
import { toast } from "sonner";

type Program = {
  program_id: number;
  program_name: string;
  program_type: string;
  description: string | null;
  age_min: number;
  age_max: number;
  is_active: boolean;
  days_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  capacity: number | null;
  price: number | null;
  price_unit: string | null;
  instructor_user_id: number | null;
  instructor_name: string | null;
  enrolled: number;
  session_start_date: string | null;
  session_end_date: string | null;
};

type StaffUser = { user_id: number; first_name: string; last_name: string };

type RosterChild = { child_id: number; first_name: string; last_name: string };

const PROGRAM_IMAGES: Record<string, string> = {
  childcare: "/programs/childcare.png",
  basketball: "/programs/basketball.png",
  tutoring: "/programs/tutoring.png",
  summer_camp: "/programs/summercamp.png",
};

const formatSchedule = (days: string | null, start: string | null, end: string | null) => {
  if (!days && !start) return "Schedule TBD";
  const time = start && end ? ` ${start.slice(0, 5)}–${end.slice(0, 5)}` : "";
  return `${days ?? ""}${time}`;
};

const formatCost = (price: number | null, unit: string | null) => {
  if (!price || !unit) return "Contact for pricing";
  return `$${Number(price).toLocaleString()}/${unit}`;
};

export default function AdminPrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const [rosterOpen, setRosterOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [rosterChildren, setRosterChildren] = useState<RosterChild[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAgeMin, setEditAgeMin] = useState("");
  const [editAgeMax, setEditAgeMax] = useState("");
  const [settingsActive, setSettingsActive] = useState(true);
  const [settingsStartDate, setSettingsStartDate] = useState("");
  const [settingsEndDate, setSettingsEndDate] = useState("");
  const [settingsInstructorId, setSettingsInstructorId] = useState<number | "">("");
  const [allStaff, setAllStaff] = useState<StaffUser[]>([]);

  useEffect(() => {
    fetch("/api/programs")
      .then((r) => r.json())
      .then((data) => { setPrograms(data); setLoading(false); });
  }, []);

  const openRoster = (program: Program) => {
    setSelectedProgram(program);
    setRosterChildren([]);
    setRosterLoading(true);
    setRosterOpen(true);
    fetch(`/api/programs/${program.program_id}`)
      .then((r) => r.json())
      .then((data) => { setRosterChildren(data); setRosterLoading(false); });
  };

  const openEdit = (program: Program) => {
    setSelectedProgram(program);
    setEditName(program.program_name);
    setEditDescription(program.description ?? "");
    setEditAgeMin(String(program.age_min));
    setEditAgeMax(String(program.age_max));
    setEditOpen(true);
  };

  const openSettings = async (program: Program) => {
    setSelectedProgram(program);
    setSettingsActive(program.is_active);
    setSettingsStartDate(program.session_start_date ?? "");
    setSettingsEndDate(program.session_end_date ?? "");
    setSettingsInstructorId(program.instructor_user_id ?? "");
    setSettingsOpen(true);
    if (allStaff.length === 0) {
      const staff: StaffUser[] = await fetch("/api/users?role=staff").then((r) => r.json());
      setAllStaff(staff);
    }
  };

  const saveEdit = async () => {
    if (!selectedProgram || !editName.trim()) {
      toast.error("Program name is required.");
      return;
    }
    await fetch(`/api/programs/${selectedProgram.program_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        program_name: editName.trim(),
        description: editDescription.trim(),
        age_min: Number(editAgeMin),
        age_max: Number(editAgeMax),
        is_active: selectedProgram.is_active,
      }),
    });
    setPrograms((prev) =>
      prev.map((p) =>
        p.program_id === selectedProgram.program_id
          ? { ...p, program_name: editName.trim(), description: editDescription.trim(), age_min: Number(editAgeMin), age_max: Number(editAgeMax) }
          : p
      )
    );
    toast.success(`${editName.trim()} updated successfully.`);
    setEditOpen(false);
  };

  const saveSettings = async () => {
    if (!selectedProgram) return;
    const instructorId = settingsInstructorId === "" ? null : settingsInstructorId;
    const instructorName = instructorId
      ? allStaff.find((s) => s.user_id === instructorId)?.first_name + " " + allStaff.find((s) => s.user_id === instructorId)?.last_name
      : null;

    await fetch(`/api/programs/${selectedProgram.program_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        program_name: selectedProgram.program_name,
        description: selectedProgram.description,
        age_min: selectedProgram.age_min,
        age_max: selectedProgram.age_max,
        is_active: settingsActive,
        session_start_date: settingsStartDate || null,
        session_end_date: settingsEndDate || null,
        instructor_user_id: instructorId,
      }),
    });
    setPrograms((prev) =>
      prev.map((p) =>
        p.program_id === selectedProgram.program_id
          ? {
              ...p,
              is_active: settingsActive,
              session_start_date: settingsStartDate || null,
              session_end_date: settingsEndDate || null,
              instructor_user_id: instructorId,
              instructor_name: instructorName ?? null,
            }
          : p
      )
    );
    toast.success(`Settings saved for ${selectedProgram.program_name}.`);
    setSettingsOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading programs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[#002040]">Programs Management</h1>
          <p className="text-gray-600">Manage programs, sessions, and enrollments</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {programs.map((program) => {
          const enrolled = Number(program.enrolled);
          const capacity = program.capacity ?? 0;
          const enrollmentPercent = capacity > 0 ? (enrolled / capacity) * 100 : 0;
          const clampedPercent = Math.min(100, Math.max(0, Math.round(enrollmentPercent)));
          const image = PROGRAM_IMAGES[program.program_type] ?? "/programs/childcare.png";

          return (
            <Card
              key={program.program_id}
              className={`overflow-hidden transition-shadow hover:shadow-lg ${!program.is_active ? "opacity-60" : ""}`}
            >
              <div className="relative h-48 w-full">
                <Image src={image} alt={program.program_name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>

              <CardContent className="p-6">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-xl font-bold text-[#002040]">{program.program_name}</h3>
                  <div className="flex gap-1">
                    {!program.is_active && (
                      <Badge variant="outline" className="border-red-200 text-red-600">Inactive</Badge>
                    )}
                    <Badge variant="outline">Ages {program.age_min}–{program.age_max}</Badge>
                  </div>
                </div>

                <p className="mb-4 text-sm text-gray-600">{program.description}</p>

                <div className="mb-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="text-[#2888B8]" size={16} />
                    <span className="text-gray-700">{formatSchedule(program.days_of_week, program.start_time, program.end_time)}</span>
                  </div>
                  {program.session_start_date && program.session_end_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="text-purple-500" size={16} />
                      <span className="text-gray-700">
                        {new Date(program.session_start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
                        {new Date(program.session_end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="text-[#489858]" size={16} />
                    <span className="text-gray-700">{formatCost(program.price, program.price_unit)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="text-[#E8A018]" size={16} />
                    <span className="text-gray-700">Instructor: {program.instructor_name ?? "TBD"}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Enrollment</span>
                    <span className="font-medium">{enrolled} / {capacity} ({clampedPercent}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-[#489858]" style={{ width: `${clampedPercent}%` }} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openRoster(program)}>
                    <Users className="mr-1" size={14} />
                    View Roster
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(program)}>
                    <Edit className="mr-1" size={14} />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openSettings(program)}>
                    <Settings className="mr-1" size={14} />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Roster Dialog */}
      <Dialog open={rosterOpen} onOpenChange={setRosterOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#002040]">{selectedProgram?.program_name} Roster</DialogTitle>
          </DialogHeader>
          {selectedProgram && (
            <div className="py-2">
              <p className="mb-3 text-sm text-gray-500">
                {Number(selectedProgram.enrolled)} of {selectedProgram.capacity ?? "?"} enrolled
                {selectedProgram.instructor_name ? ` • ${selectedProgram.instructor_name}` : ""}
              </p>
              <div className="space-y-2">
                {rosterLoading ? (
                  <p className="text-center text-sm text-gray-500">Loading...</p>
                ) : rosterChildren.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">No children enrolled.</p>
                ) : (
                  rosterChildren.map((child, i) => (
                    <div key={child.child_id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2888B8]/10 text-sm font-medium text-[#2888B8]">
                        {i + 1}
                      </div>
                      <span className="font-medium text-[#002040]">{child.first_name} {child.last_name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRosterOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#002040]">Edit {selectedProgram?.program_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Program Name</Label>
              <Input className="mt-1" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min Age</Label>
                <Input className="mt-1" type="number" min="0" value={editAgeMin} onChange={(e) => setEditAgeMin(e.target.value)} />
              </div>
              <div>
                <Label>Max Age</Label>
                <Input className="mt-1" type="number" min="0" value={editAgeMax} onChange={(e) => setEditAgeMax(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#002040]">{selectedProgram?.program_name} Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#002040]">Active</p>
                <p className="text-sm text-gray-500">Show program to parents</p>
              </div>
              <Switch checked={settingsActive} onCheckedChange={setSettingsActive} />
            </div>
            <div className="border-t pt-4 space-y-3">
              <div>
                <Label>Instructor</Label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={settingsInstructorId}
                  onChange={(e) => setSettingsInstructorId(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">— No instructor assigned —</option>
                  {allStaff.map((s) => (
                    <option key={s.user_id} value={s.user_id}>
                      {s.first_name} {s.last_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Staff assigned here can view program children in their staff portal.</p>
              </div>
            </div>
            <div className="border-t pt-4 space-y-3">
              <div>
                <p className="font-medium text-[#002040] mb-1">Session Dates</p>
                <p className="text-xs text-gray-500 mb-3">Leave blank for year-round programs. Only enrolled children within this window will be billed.</p>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={settingsStartDate}
                  onChange={(e) => setSettingsStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={settingsEndDate}
                  onChange={(e) => setSettingsEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={saveSettings}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
