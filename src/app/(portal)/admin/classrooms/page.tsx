"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, TrendingUp, Edit } from "lucide-react";
import { toast } from "sonner";

type Classroom = {
  classroom_id: number;
  classroom_name: string;
  age_group: string;
  capacity: number;
  room_location: string | null;
  is_active: boolean;
  enrolled: number;
  staff: string[];
};

type RosterChild = {
  child_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
};

type StaffUser = {
  user_id: number;
  first_name: string;
  last_name: string;
};

export default function AdminClassrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  const [rosterOpen, setRosterOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [rosterChildren, setRosterChildren] = useState<RosterChild[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const [editName, setEditName] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [allStaff, setAllStaff] = useState<StaffUser[]>([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/admin/classrooms")
      .then((r) => r.json())
      .then((data) => {
        setClassrooms(data);
        setLoading(false);
      });
  }, []);

  const totalEnrolled = useMemo(() => classrooms.reduce((sum, c) => sum + Number(c.enrolled), 0), [classrooms]);
  const totalCapacity = useMemo(() => classrooms.reduce((sum, c) => sum + c.capacity, 0), [classrooms]);
  const availableSpots = useMemo(() => classrooms.reduce((sum, c) => sum + Math.max(0, c.capacity - Number(c.enrolled)), 0), [classrooms]);
  const overallCapacityPercent = useMemo(
    () => (totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0),
    [totalEnrolled, totalCapacity]
  );

  const openRoster = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setRosterChildren([]);
    setRosterLoading(true);
    setRosterOpen(true);
    fetch(`/api/admin/classrooms/${classroom.classroom_id}`)
      .then((r) => r.json())
      .then((data) => {
        setRosterChildren(data);
        setRosterLoading(false);
      });
  };

  const openManage = async (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setEditName(classroom.classroom_name);
    setEditCapacity(String(classroom.capacity));
    setEditLocation(classroom.room_location ?? "");
    setManageOpen(true);
    const staffList: StaffUser[] = allStaff.length > 0
      ? allStaff
      : await fetch("/api/users?role=staff").then((r) => r.json()).then((data) => { setAllStaff(data); return data; });
    const currentIds = new Set<number>(
      classroom.staff
        .map((name) => staffList.find((s) => `${s.first_name} ${s.last_name}` === name)?.user_id)
        .filter((id): id is number => id !== undefined)
    );
    setSelectedStaffIds(currentIds);
  };

  const saveManage = async () => {
    if (!selectedClassroom) return;

    const trimmedName = editName.trim();
    const newCapacity = Number(editCapacity);

    if (!trimmedName) {
      toast.error("Please enter a classroom name.");
      return;
    }

    if (!Number.isFinite(newCapacity) || newCapacity < 1) {
      toast.error("Please enter a valid capacity.");
      return;
    }

    if (newCapacity < Number(selectedClassroom.enrolled)) {
      toast.error("Capacity cannot be lower than the number currently enrolled.");
      return;
    }

    await fetch(`/api/admin/classrooms/${selectedClassroom.classroom_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classroom_name: trimmedName,
        capacity: newCapacity,
        room_location: editLocation.trim() || null,
        staff_ids: Array.from(selectedStaffIds),
      }),
    });

    const newStaffNames = allStaff
      .filter((s) => selectedStaffIds.has(s.user_id))
      .map((s) => `${s.first_name} ${s.last_name}`);

    setClassrooms((prev) =>
      prev.map((c) =>
        c.classroom_id === selectedClassroom.classroom_id
          ? { ...c, classroom_name: trimmedName, capacity: newCapacity, room_location: editLocation.trim() || null, staff: newStaffNames }
          : c
      )
    );

    toast.success(`${trimmedName} updated successfully.`);
    setManageOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading classrooms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-[#002040]">Classrooms & Capacity</h1>
        <p className="text-gray-600">Manage classroom rosters and capacity</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classrooms.map((classroom) => {
          const enrolled = Number(classroom.enrolled);
          const percentage = classroom.capacity > 0 ? (enrolled / classroom.capacity) * 100 : 0;
          const clampedPercentage = Math.min(100, Math.max(0, Math.round(percentage)));
          const spotsLeft = Math.max(0, classroom.capacity - enrolled);

          return (
            <Card key={classroom.classroom_id} className="transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 text-xl font-bold text-[#002040]">{classroom.classroom_name}</h3>
                    <Badge variant="outline" className="text-xs">{classroom.age_group}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#2888B8]">{enrolled}</p>
                    <p className="text-xs text-gray-600">/ {classroom.capacity}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Capacity</span>
                    <span className="font-medium">{clampedPercentage}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        percentage >= 90 ? "bg-[#E05830]" : percentage >= 70 ? "bg-[#E8A018]" : "bg-[#489858]"
                      }`}
                      style={{ width: `${clampedPercentage}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} remaining
                  </p>
                </div>

                <div className="mb-4 space-y-3">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Staff:</p>
                    <div className="flex flex-wrap gap-1">
                      {classroom.staff.length > 0 ? (
                        classroom.staff.map((name, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{name}</Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No staff assigned</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600">Location:</p>
                    <p className="font-medium">{classroom.room_location ?? "—"}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openRoster(classroom)}>
                    <Users className="mr-1" size={14} />
                    View Roster
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openManage(classroom)}>
                    <Edit className="mr-1" size={14} />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-xl font-bold text-[#002040]">Overall Statistics</h3>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <Users className="mx-auto mb-2 text-[#2888B8]" size={32} />
              <p className="text-2xl font-bold text-[#002040]">{totalEnrolled}</p>
              <p className="text-sm text-gray-600">Total Children</p>
            </div>
            <div className="text-center">
              <TrendingUp className="mx-auto mb-2 text-[#489858]" size={32} />
              <p className="text-2xl font-bold text-[#489858]">{overallCapacityPercent}%</p>
              <p className="text-sm text-gray-600">Overall Capacity</p>
            </div>
            <div className="text-center">
              <Users className="mx-auto mb-2 text-[#E8A018]" size={32} />
              <p className="text-2xl font-bold text-[#E8A018]">{availableSpots}</p>
              <p className="text-sm text-gray-600">Available Spots</p>
            </div>
            <div className="text-center">
              <Users className="mx-auto mb-2 text-[#E05830]" size={32} />
              <p className="text-2xl font-bold text-[#E05830]">{classrooms.length}</p>
              <p className="text-sm text-gray-600">Total Classrooms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={rosterOpen} onOpenChange={setRosterOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#002040]">{selectedClassroom?.classroom_name} Roster</DialogTitle>
          </DialogHeader>

          {selectedClassroom && (
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{Number(selectedClassroom.enrolled)} children enrolled</span>
                <Badge variant="outline">{selectedClassroom.age_group}</Badge>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-500">Staff:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedClassroom.staff.length > 0 ? (
                    selectedClassroom.staff.map((name, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">{name}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No staff assigned</span>
                  )}
                </div>
              </div>
              <div className="space-y-2 border-t pt-3">
                {rosterLoading ? (
                  <p className="text-center text-sm text-gray-500">Loading roster...</p>
                ) : rosterChildren.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">No children enrolled.</p>
                ) : (
                  rosterChildren.map((child, index) => (
                    <div key={child.child_id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2888B8]/10 text-sm font-medium text-[#2888B8]">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#002040]">{child.first_name} {child.last_name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        DOB: {new Date(child.date_of_birth).toLocaleDateString()}
                      </Badge>
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

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#002040]">Manage {selectedClassroom?.classroom_name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="classroom-name">Classroom Name</Label>
              <Input id="classroom-name" className="mt-1" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="classroom-capacity">Capacity</Label>
              <Input id="classroom-capacity" type="number" min="1" className="mt-1" value={editCapacity} onChange={(e) => setEditCapacity(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="classroom-location">Location</Label>
              <Input id="classroom-location" className="mt-1" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="e.g. Building A, Room 101" />
            </div>
            <div>
              <Label>Assigned Staff</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                {allStaff.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-2">Loading staff...</p>
                ) : (
                  allStaff.map((s) => (
                    <label key={s.user_id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-1">
                      <input
                        type="checkbox"
                        checked={selectedStaffIds.has(s.user_id)}
                        onChange={(e) => {
                          setSelectedStaffIds((prev) => {
                            const next = new Set(prev);
                            e.target.checked ? next.add(s.user_id) : next.delete(s.user_id);
                            return next;
                          });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-[#002040]">{s.first_name} {s.last_name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManageOpen(false)}>Cancel</Button>
            <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={saveManage}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
