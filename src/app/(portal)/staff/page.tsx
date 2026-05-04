"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, AlertCircle, ClipboardList, Pencil, Plus, Trash2, Check, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ChangePasswordCard } from "@/components/ChangePasswordCard";

type DashboardData = {
  classroom: { classroom_id: number | null; classroom_name: string } | null;
  enrolled: number;
  checkedIn: number;
  notYetArrived: number;
  incidentsToday: number;
  allergicChildren: { first_name: string; last_name: string; allergies: string }[];
  announcement: { title: string; body: string; publish_date: string; author: string } | null;
};

type ScheduleItem = {
  schedule_id?: number;
  time_label: string;
  activity: string;
  sort_order: number;
};

type QuickAction = { label: string; href: string; icon: LucideIcon; variant: "primary" | "outline" };

const quickActions: QuickAction[] = [
  { label: "Check-In/Out Children", href: "/staff/check-in", icon: Calendar, variant: "primary" },
  { label: "View My Roster", href: "/staff/roster", icon: Users, variant: "outline" },
  { label: "Report Incident", href: "/staff/incidents", icon: AlertCircle, variant: "outline" },
];

const formattedToday = new Intl.DateTimeFormat("en-US", {
  weekday: "long", month: "long", day: "numeric", year: "numeric",
}).format(new Date());

export default function StaffDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [draftSchedule, setDraftSchedule] = useState<ScheduleItem[]>([]);
  const [savingSchedule, setSavingSchedule] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      fetch(`/api/staff/dashboard?staffId=${user.id}`).then((r) => r.json()),
      fetch(`/api/staff/schedule?staffId=${user.id}`).then((r) => r.json()),
    ]).then(([dashData, scheduleData]) => {
      setData(dashData);
      setSchedule(scheduleData);
    });
  }, [user?.id]);

  const startEditing = () => {
    setDraftSchedule(schedule.map((s) => ({ ...s })));
    setEditingSchedule(true);
  };

  const cancelEditing = () => {
    setDraftSchedule([]);
    setEditingSchedule(false);
  };

  const addRow = () => {
    setDraftSchedule((prev) => [
      ...prev,
      { time_label: "", activity: "", sort_order: prev.length + 1 },
    ]);
  };

  const removeRow = (index: number) => {
    setDraftSchedule((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: "time_label" | "activity", value: string) => {
    setDraftSchedule((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const saveSchedule = async () => {
    if (!user?.id) return;
    const items = draftSchedule
      .filter((s) => s.time_label.trim() && s.activity.trim())
      .map((s, i) => ({ time_label: s.time_label.trim(), activity: s.activity.trim(), sort_order: i + 1 }));

    setSavingSchedule(true);
    const res = await fetch(`/api/staff/schedule?staffId=${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    if (res.ok) {
      setSchedule(items);
      setEditingSchedule(false);
      toast.success("Schedule saved.");
    } else {
      toast.error("Failed to save schedule.");
    }
    setSavingSchedule(false);
  };

  const classroomLabel = data?.classroom?.classroom_name ?? "Loading...";
  const enrolled = data?.enrolled ?? 0;
  const checkedIn = data?.checkedIn ?? 0;
  const notYetArrived = data?.notYetArrived ?? 0;
  const incidentsToday = data?.incidentsToday ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002040] mb-2">Staff Dashboard</h1>
        <p className="text-gray-600">{classroomLabel} • {formattedToday}</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-[#2888B8] bg-gradient-to-br from-[#2888B8]/5 to-transparent">
          <CardContent className="p-6 text-center">
            <Users className="mx-auto mb-2 text-[#2888B8]" size={32} />
            <p className="text-2xl font-bold text-[#002040] mb-1">{enrolled}</p>
            <p className="text-sm text-gray-600">Total Enrolled</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-[#489858] bg-gradient-to-br from-[#489858]/5 to-transparent">
          <CardContent className="p-6 text-center">
            <Calendar className="mx-auto mb-2 text-[#489858]" size={32} />
            <p className="text-2xl font-bold text-[#489858] mb-1">{checkedIn}</p>
            <p className="text-sm text-gray-600">Checked In</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-[#E8A018] bg-gradient-to-br from-[#E8A018]/5 to-transparent">
          <CardContent className="p-6 text-center">
            <ClipboardList className="mx-auto mb-2 text-[#E8A018]" size={32} />
            <p className="text-2xl font-bold text-[#E8A018] mb-1">{notYetArrived}</p>
            <p className="text-sm text-gray-600">Not Yet Arrived</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-[#E05830] bg-gradient-to-br from-[#E05830]/5 to-transparent">
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto mb-2 text-[#E05830]" size={32} />
            <p className="text-2xl font-bold text-[#E05830] mb-1">{incidentsToday}</p>
            <p className="text-sm text-gray-600">Incidents Today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-[#002040] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.href}
                    asChild
                    variant={action.variant === "primary" ? "default" : "outline"}
                    className={action.variant === "primary" ? "w-full justify-start bg-[#2888B8] hover:bg-[#1078A8]" : "w-full justify-start"}
                  >
                    <Link href={action.href}>
                      <Icon className="mr-2" size={20} />
                      {action.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#002040]">Today&apos;s Schedule</h3>
              {!editingSchedule ? (
                <Button variant="ghost" size="sm" onClick={startEditing} className="text-gray-500 hover:text-[#2888B8]">
                  <Pencil size={14} className="mr-1" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-[#489858] hover:bg-[#3a7846] h-7 px-3 text-xs" onClick={saveSchedule} disabled={savingSchedule}>
                    <Check size={13} className="mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-3 text-xs text-gray-500" onClick={cancelEditing}>
                    <X size={13} className="mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {!editingSchedule ? (
              schedule.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-3">No schedule set yet.</p>
                  <Button size="sm" variant="outline" onClick={startEditing}>
                    <Plus size={14} className="mr-1" />
                    Add Schedule
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {schedule.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <span className="text-xs font-mono border rounded px-2 py-1 text-gray-600 whitespace-nowrap bg-white">
                        {item.time_label}
                      </span>
                      <span className="text-sm font-medium text-[#002040]">{item.activity}</span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-2">
                {draftSchedule.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      className="w-24 text-xs h-8 font-mono"
                      placeholder="9:00 AM"
                      value={item.time_label}
                      onChange={(e) => updateRow(i, "time_label", e.target.value)}
                    />
                    <Input
                      className="flex-1 text-xs h-8"
                      placeholder="Activity"
                      value={item.activity}
                      onChange={(e) => updateRow(i, "activity", e.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                      onClick={() => removeRow(i)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full mt-2 text-xs h-8" onClick={addRow}>
                  <Plus size={13} className="mr-1" />
                  Add Row
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-[#002040] mb-4">Reminders</h3>
          <div className="space-y-3">
            {data?.allergicChildren.map((child) => (
              <div key={`${child.first_name}-${child.last_name}`} className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-900">
                <p className="text-sm">
                  <strong>{child.first_name} {child.last_name}</strong> has a reported allergy:{" "}
                  <strong>{child.allergies}</strong>. Please review meal ingredients carefully.
                </p>
              </div>
            ))}
            {data?.announcement && (
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200 text-orange-900">
                <p className="text-sm">
                  <strong>{data.announcement.title}</strong> — {data.announcement.body}
                </p>
                <p className="text-xs mt-1 text-orange-700">
                  {new Date(data.announcement.publish_date).toLocaleDateString()} • {data.announcement.author}
                </p>
              </div>
            )}
            {data && data.allergicChildren.length === 0 && !data.announcement && (
              <p className="text-sm text-gray-500">No reminders at this time.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <ChangePasswordCard />
    </div>
  );
}
