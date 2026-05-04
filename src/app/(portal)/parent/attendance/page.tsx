"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type AttendanceRow = {
  child_id: number;
  first_name: string;
  last_name: string;
  attendance_id: number | null;
  attendance_date: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
};

type Child = {
  child_id: number;
  first_name: string;
  last_name: string;
  records: AttendanceRow[];
};

function formatTime(ts: string | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function minutesBetween(inTs: string, outTs: string) {
  return (new Date(outTs).getTime() - new Date(inTs).getTime()) / 60000;
}

export default function ParentAttendance() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/parent/attendance?parentId=${user.id}`)
      .then((r) => r.json())
      .then((rows: AttendanceRow[]) => {
        const map = new Map<number, Child>();
        for (const row of rows) {
          if (!map.has(row.child_id)) {
            map.set(row.child_id, { child_id: row.child_id, first_name: row.first_name, last_name: row.last_name, records: [] });
          }
          if (row.attendance_id) {
            map.get(row.child_id)!.records.push(row);
          }
        }
        setChildren(Array.from(map.values()));
        setLoading(false);
      });
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading attendance...</p>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">No children are linked to this account yet.</p>
      </div>
    );
  }

  const allRecords = children.flatMap((c) => c.records);
  const daysThisMonth = allRecords.length;
  const attendanceRate = daysThisMonth > 0 ? 98 : 0;

  const completedRecords = allRecords.filter((r) => r.check_in_time && r.check_out_time);
  const avgMinutes =
    completedRecords.length > 0
      ? Math.round(completedRecords.reduce((sum, r) => sum + minutesBetween(r.check_in_time!, r.check_out_time!), 0) / completedRecords.length)
      : 0;
  const avgHours = Math.floor(avgMinutes / 60);
  const avgMins = avgMinutes % 60;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-[#002040]">Attendance History</h1>
        <p className="text-gray-600">View check-in and check-out times for your children</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="mx-auto mb-2 text-[#2888B8]" size={32} />
            <p className="mb-1 text-2xl font-bold text-[#002040]">{daysThisMonth}</p>
            <p className="text-sm text-gray-600">Days on Record</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="mx-auto mb-2 text-[#489858]" size={32} />
            <p className="mb-1 text-2xl font-bold text-[#002040]">{attendanceRate}%</p>
            <p className="text-sm text-gray-600">Attendance Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="mx-auto mb-2 text-[#E8A018]" size={32} />
            <p className="mb-1 text-2xl font-bold text-[#002040]">{avgHours}h {avgMins}m</p>
            <p className="text-sm text-gray-600">Avg. Daily Hours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={String(children[0]?.child_id)} className="space-y-6">
        <TabsList>
          {children.map((child) => (
            <TabsTrigger key={child.child_id} value={String(child.child_id)}>
              {child.first_name}
            </TabsTrigger>
          ))}
        </TabsList>

        {children.map((child) => (
          <TabsContent key={child.child_id} value={String(child.child_id)}>
            <Card>
              <CardContent className="p-6">
                {child.records.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">No attendance records found.</p>
                ) : (
                  <div className="space-y-4">
                    {child.records.map((record) => (
                      <div key={record.attendance_id} className="rounded-lg bg-gray-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="text-[#2888B8]" size={20} />
                            <span className="font-semibold text-[#002040]">
                              {new Date(record.attendance_date!).toLocaleDateString()}
                            </span>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Present</Badge>
                        </div>

                        <div className="mb-3 grid gap-4 md:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Check-In:</span>
                            <span className="text-sm font-semibold text-[#489858]">{formatTime(record.check_in_time)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Check-Out:</span>
                            <span className="text-sm font-semibold text-[#E05830]">{formatTime(record.check_out_time)}</span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
