"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, MessageSquare, Bell, User, Clock } from "lucide-react";
import { ChangePasswordCard } from "@/components/ChangePasswordCard";
import { useAuth } from "@/contexts/AuthContext";

type Child = {
  child_id: number;
  first_name: string;
  last_name: string;
  age: number;
  classroom_name: string | null;
  classroom_teachers: string[];
  programs: string[];
  recentAttendance: {
    attendance_date: string;
    check_in_time: string | null;
    check_out_time: string | null;
    meal_notes: string | null;
    general_notes: string | null;
  } | null;
};

type Announcement = {
  title: string;
  body: string;
  publish_date: string;
  author: string;
  priority: string;
};

function formatTime(ts: string | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
  return (
    <div className="w-20 h-20 rounded-full bg-[#2888B8]/10 flex items-center justify-center text-[#2888B8] text-2xl font-bold shrink-0">
      {letters.toUpperCase()}
    </div>
  );
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/parent/dashboard?parentId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setChildren(data.children ?? []);
        setAnnouncement(data.announcement ?? null);
        setLoading(false);
      });
  }, [user?.id]);

  const firstChild = children[0] ?? null;
  const recentAtt = firstChild?.recentAttendance ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002040] mb-2">Parent Dashboard</h1>
        <p className="text-gray-600">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! Here&apos;s what&apos;s happening with your children.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <Button variant="outline" asChild className="h-auto py-6 flex-col gap-3 bg-gradient-to-br from-[#2888B8]/5 to-transparent border-2 border-[#2888B8]/20 hover:border-[#2888B8] hover:shadow-lg transition-all">
          <Link href="/parent/documents">
            <FileText size={28} className="text-[#2888B8]" />
            <span className="font-semibold">Documents</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto py-6 flex-col gap-3 bg-gradient-to-br from-[#489858]/5 to-transparent border-2 border-[#489858]/20 hover:border-[#489858] hover:shadow-lg transition-all">
          <Link href="/parent/attendance">
            <Calendar size={28} className="text-[#489858]" />
            <span className="font-semibold">Attendance</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto py-6 flex-col gap-3 bg-gradient-to-br from-[#E8A018]/5 to-transparent border-2 border-[#E8A018]/20 hover:border-[#E8A018] hover:shadow-lg transition-all">
          <Link href="/parent/messages">
            <MessageSquare size={28} className="text-[#E8A018]" />
            <span className="font-semibold">Messages</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto py-6 flex-col gap-3 bg-gradient-to-br from-[#E05830]/5 to-transparent border-2 border-[#E05830]/20 hover:border-[#E05830] hover:shadow-lg transition-all">
          <Link href="/parent/programs">
            <User size={28} className="text-[#E05830]" />
            <span className="font-semibold">Programs</span>
          </Link>
        </Button>
      </div>

      {/* Children Cards */}
      <div>
        <h2 className="text-2xl font-bold text-[#002040] mb-4">My Children</h2>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : children.length === 0 ? (
          <p className="text-gray-500 text-sm">No children linked to this account yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {children.map((child) => (
              <Card key={child.child_id} className="hover:shadow-lg transition-all border-l-4 border-[#2888B8]">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Initials name={`${child.first_name} ${child.last_name}`} />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#002040] mb-1">
                        {child.first_name} {child.last_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        Age {child.age} • {child.classroom_name ?? "No classroom"}
                      </p>
                      {child.classroom_teachers.length > 0 && (
                        <p className="text-xs text-gray-400 mb-2">
                          Teacher{child.classroom_teachers.length > 1 ? "s" : ""}: {child.classroom_teachers.join(", ")}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {child.programs.length > 0 ? (
                          child.programs.map((program) => (
                            <Badge key={program} variant="secondary" className="text-xs">
                              {program}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No active programs</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Activity */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-[#2888B8]" size={24} />
              <h3 className="text-xl font-bold text-[#002040]">
                Recent Activity{firstChild ? ` — ${firstChild.first_name}` : ""}
              </h3>
            </div>
            {!loading && recentAtt ? (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 -mt-2">
                  {new Date(recentAtt.attendance_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Check-In</span>
                  <span className="font-semibold text-[#489858]">{formatTime(recentAtt.check_in_time)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Check-Out</span>
                  <span className="font-semibold text-[#E05830]">{formatTime(recentAtt.check_out_time)}</span>
                </div>
                {recentAtt.general_notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Teacher&apos;s Note:</p>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{recentAtt.general_notes}</p>
                  </div>
                )}
                {recentAtt.meal_notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Meals</p>
                    <p className="text-sm text-gray-600">{recentAtt.meal_notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No recent activity on record.</p>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="text-[#E8A018]" size={24} />
              <h3 className="text-xl font-bold text-[#002040]">Latest Update</h3>
            </div>
            {announcement ? (
              <div>
                <h4 className="font-semibold text-[#002040] mb-2">{announcement.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{announcement.body}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(announcement.publish_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} • {announcement.author}</span>
                  <Button variant="link" asChild className="h-auto p-0 text-[#2888B8]">
                    <Link href="/whats-new">View all updates</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No new announcements.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <ChangePasswordCard />
    </div>
  );
}
