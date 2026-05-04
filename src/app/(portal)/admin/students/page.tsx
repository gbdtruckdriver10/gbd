"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, MoveRight, UserMinus, Mail, Phone, GraduationCap, Plus, Minus, ShieldAlert } from "lucide-react";

import { toast } from "sonner";

type Student = {
  child_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  enrollment_status: string;
  classroom_id: number | null;
  classroom_name: string | null;
  assigned_from: string | null;
  parent_user_id: number | null;
  parent_first_name: string | null;
  parent_last_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
};

type Classroom = {
  classroom_id: number;
  classroom_name: string;
  age_group: string | null;
  enrolled: number;
  capacity: number;
};

type EmergencyContact = {
  contact_id: number;
  full_name: string;
  relationship_to_child: string;
  phone: string;
  email: string | null;
  is_authorized_pickup: boolean;
};

type ProgramOption = {
  program_id: number;
  program_name: string;
  program_type: string;
  description: string | null;
  session_id: number;
  days_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  price: number | null;
  price_unit: string | null;
  capacity: number;
  enrolled: number;
  is_enrolled: boolean;
  session_start_date: string | null;
  session_end_date: string | null;
};

function calcAge(dob: string | null): string {
  if (!dob) return "N/A";
  const diff = Date.now() - new Date(dob).getTime();
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 24) return `${months}mo`;
  return `${Math.floor(months / 12)}yr`;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [moveOpen, setMoveOpen] = useState(false);
  const [unenrollOpen, setUnenrollOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newClassroomId, setNewClassroomId] = useState("");
  const [saving, setSaving] = useState(false);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/students").then((r) => r.json()),
      fetch("/api/admin/classrooms").then((r) => r.json()),
    ]).then(([s, c]) => {
      setStudents(s);
      setClassrooms(c);
      setLoading(false);
    });
  }, []);

  const filtered = students.filter((s) => {
    const name = `${s.first_name} ${s.last_name}`.toLowerCase();
    const parent = `${s.parent_first_name ?? ""} ${s.parent_last_name ?? ""}`.toLowerCase();
    const classroom = (s.classroom_name ?? "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || parent.includes(q) || classroom.includes(q);
  });

  const openContacts = async (student: Student) => {
    setSelectedStudent(student);
    setContactsOpen(true);
    setContactsLoading(true);
    const data = await fetch(`/api/admin/students/${student.child_id}/contacts`).then((r) => r.json());
    setContacts(data);
    setContactsLoading(false);
  };

  const openPrograms = async (student: Student) => {
    setSelectedStudent(student);
    setProgramsOpen(true);
    setProgramsLoading(true);
    const data = await fetch(`/api/admin/students/${student.child_id}/programs`).then((r) => r.json());
    setPrograms(data);
    setProgramsLoading(false);
  };

  const handleEnrollProgram = async (sessionId: number, programName: string, programType: string) => {
    if (!selectedStudent) return;
    const isConflict =
      (programType === "summer_camp" && programs.some((p) => p.program_type === "childcare" && p.is_enrolled)) ||
      (programType === "childcare" && programs.some((p) => p.program_type === "summer_camp" && p.is_enrolled));
    if (isConflict) {
      const other = programType === "summer_camp" ? "Full-Day Childcare" : "Summer Camp";
      toast.warning(`${selectedStudent.first_name} is already enrolled in ${other}. Summer Camp replaces childcare during summer months.`);
    }
    const res = await fetch(`/api/admin/students/${selectedStudent.child_id}/programs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    if (!res.ok) { toast.error("Failed to enroll"); return; }
    setPrograms((prev) => prev.map((p) => p.session_id === sessionId ? { ...p, is_enrolled: true, enrolled: p.enrolled + 1 } : p));
    toast.success(`${selectedStudent.first_name} enrolled in ${programName}`);
  };

  const handleUnenrollProgram = async (sessionId: number, programName: string) => {
    if (!selectedStudent) return;
    const res = await fetch(`/api/admin/students/${selectedStudent.child_id}/programs/${sessionId}`, {
      method: "DELETE",
    });
    if (!res.ok) { toast.error("Failed to unenroll"); return; }
    setPrograms((prev) => prev.map((p) => p.session_id === sessionId ? { ...p, is_enrolled: false, enrolled: p.enrolled - 1 } : p));
    toast.success(`${selectedStudent.first_name} removed from ${programName}`);
  };

  const openMove = (student: Student) => {
    setSelectedStudent(student);
    setNewClassroomId(student.classroom_id ? String(student.classroom_id) : "");
    setMoveOpen(true);
  };

  const openUnenroll = (student: Student) => {
    setSelectedStudent(student);
    setUnenrollOpen(true);
  };

  const handleMove = async () => {
    if (!selectedStudent || !newClassroomId) return;
    if (Number(newClassroomId) === selectedStudent.classroom_id) {
      toast.error("Student is already in that classroom");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/students/${selectedStudent.child_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classroomId: Number(newClassroomId) }),
      });
      if (!res.ok) {
        toast.error("Failed to move student");
        return;
      }
      const newClassroom = classrooms.find((c) => c.classroom_id === Number(newClassroomId));
      setStudents((prev) =>
        prev.map((s) =>
          s.child_id === selectedStudent.child_id
            ? { ...s, classroom_id: Number(newClassroomId), classroom_name: newClassroom?.classroom_name ?? null }
            : s
        )
      );
      toast.success(`${selectedStudent.first_name} moved to ${newClassroom?.classroom_name}`);
      setMoveOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUnenroll = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/students/${selectedStudent.child_id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to unenroll student");
        return;
      }
      setStudents((prev) => prev.filter((s) => s.child_id !== selectedStudent.child_id));
      toast.success(`${selectedStudent.first_name} ${selectedStudent.last_name} has been unenrolled`);
      setUnenrollOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#002040]">Students</h1>
          <p className="text-gray-600">{students.length} enrolled students</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <Input
          className="pl-9"
          placeholder="Search by name, parent, or classroom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              No students found
            </CardContent>
          </Card>
        ) : (
          filtered.map((student) => {
            const age = calcAge(student.date_of_birth);
            const parentName = student.parent_first_name
              ? `${student.parent_first_name} ${student.parent_last_name}`
              : "No parent linked";

            return (
              <Card key={student.child_id} className="border-l-4 border-[#2888B8]">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#2888B8]/10 text-sm font-bold text-[#2888B8]">
                      {student.first_name[0]}{student.last_name[0]}
                    </div>

                    <div className="flex-1 grid grid-cols-1 gap-1 md:grid-cols-3">
                      <div>
                        <p className="font-semibold text-[#002040]">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-sm text-gray-500">Age: {age}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {student.classroom_name ?? (
                            <span className="text-orange-500">No classroom</span>
                          )}
                        </p>
                        {student.assigned_from && (
                          <p className="text-xs text-gray-400">
                            Since {new Date(student.assigned_from).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">{parentName}</p>
                        {student.parent_email && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Mail size={11} />
                            {student.parent_email}
                          </div>
                        )}
                        {student.parent_phone && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Phone size={11} />
                            {student.parent_phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 gap-2">
                      <Button variant="outline" size="sm" onClick={() => openContacts(student)}>
                        <ShieldAlert className="mr-1" size={14} />
                        Emergency
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openPrograms(student)}>
                        <GraduationCap className="mr-1" size={14} />
                        Programs
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openMove(student)}>
                        <MoveRight className="mr-1" size={14} />
                        Move
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => openUnenroll(student)}
                      >
                        <UserMinus className="mr-1" size={14} />
                        Unenroll
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Emergency Contacts Dialog */}
      <Dialog open={contactsOpen} onOpenChange={setContactsOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#002040]">
              {selectedStudent?.first_name} {selectedStudent?.last_name} — Emergency Contacts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {contactsLoading ? (
              <p className="text-center text-sm text-gray-500 py-6">Loading contacts...</p>
            ) : contacts.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-6">No emergency contacts on file.</p>
            ) : (
              contacts.map((c) => (
                <div key={c.contact_id} className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-[#002040]">{c.full_name}</p>
                    {c.is_authorized_pickup && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Authorized Pickup</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 capitalize">{c.relationship_to_child}</p>
                  <div className="flex gap-4 text-xs text-gray-600 mt-1">
                    <span className="flex items-center gap-1"><Phone size={11} />{c.phone}</span>
                    {c.email && <span className="flex items-center gap-1"><Mail size={11} />{c.email}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Programs Dialog */}
      <Dialog open={programsOpen} onOpenChange={setProgramsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#002040]">
              {selectedStudent?.first_name} {selectedStudent?.last_name} — Programs
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {programsLoading ? (
              <p className="text-center text-sm text-gray-500 py-6">Loading programs...</p>
            ) : programs.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-6">No active programs available</p>
            ) : (
              programs.map((p) => (
                <div key={p.session_id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-[#002040]">{p.program_name}</p>
                    {p.days_of_week && (
                      <p className="text-xs text-gray-500">
                        {p.days_of_week} {p.start_time?.slice(0, 5)}–{p.end_time?.slice(0, 5)}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {p.enrolled}/{p.capacity} enrolled
                      {p.price ? ` · $${p.price}/${p.price_unit}` : ""}
                    </p>
                  </div>
                  {p.is_enrolled ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleUnenrollProgram(p.session_id, p.program_name)}
                    >
                      <Minus className="mr-1" size={13} />
                      Remove
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-[#489858] hover:bg-[#3a7846]"
                      onClick={() => handleEnrollProgram(p.session_id, p.program_name, p.program_type)}
                    >
                      <Plus className="mr-1" size={13} />
                      Enroll
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgramsOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Classroom Dialog */}
      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#002040]">Move Student</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-gray-600">
                Moving <span className="font-semibold">{selectedStudent.first_name} {selectedStudent.last_name}</span> from{" "}
                <span className="font-semibold">{selectedStudent.classroom_name ?? "no classroom"}</span>.
              </p>
              <div>
                <Label>New Classroom</Label>
                <Select value={newClassroomId} onValueChange={setNewClassroomId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select classroom" />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms.map((c) => (
                      <SelectItem key={c.classroom_id} value={String(c.classroom_id)}>
                        {c.classroom_name}
                        {c.age_group ? ` — ${c.age_group}` : ""}
                        {" "}({c.enrolled}/{c.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveOpen(false)} disabled={saving}>Cancel</Button>
            <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={handleMove} disabled={saving}>
              <MoveRight className="mr-2" size={16} />
              {saving ? "Moving..." : "Confirm Move"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unenroll Confirmation Dialog */}
      <Dialog open={unenrollOpen} onOpenChange={setUnenrollOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700">Unenroll Student</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-3 py-2">
              <p className="text-sm text-gray-700">
                Are you sure you want to unenroll{" "}
                <span className="font-semibold">{selectedStudent.first_name} {selectedStudent.last_name}</span>?
                They will be removed from{" "}
                <span className="font-semibold">{selectedStudent.classroom_name ?? "their classroom"}</span>.
              </p>
              <p className="text-xs text-gray-400">
                This does not delete the student record — it can be reversed by re-enrolling them through admissions.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnenrollOpen(false)} disabled={saving}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleUnenroll}
              disabled={saving}
            >
              <UserMinus className="mr-2" size={16} />
              {saving ? "Unenrolling..." : "Unenroll"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
