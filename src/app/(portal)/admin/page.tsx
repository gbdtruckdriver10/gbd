"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, ClipboardList, GraduationCap, TrendingUp } from "lucide-react";
import { ChangePasswordCard } from "@/components/ChangePasswordCard";
import { Badge } from "@/components/ui/badge";

const STATUS_DISPLAY: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  accepted: "Accepted",
  waitlisted: "Waitlist",
  rejected: "Rejected",
  more_info_required: "More Info Needed",
};

const STATUS_CLASSES: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700 border-blue-200",
  under_review: "bg-purple-100 text-purple-700 border-purple-200",
  accepted: "bg-green-100 text-green-700 border-green-200",
  waitlisted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  more_info_required: "bg-orange-100 text-orange-700 border-orange-200",
};

type DashboardData = {
  totalEnrolled: number;
  totalCapacity: number;
  capacityPercent: number;
  pendingApplications: number;
  activePrograms: number;
  recentApplications: {
    application_id: number;
    child_name: string;
    parent_name: string;
    application_status: string;
    submitted_at: string;
    program_interest: string | null;
  }[];
  classrooms: {
    classroom_id: number;
    classroom_name: string;
    capacity: number;
    enrolled: number;
  }[];
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return <div className="flex items-center justify-center p-12"><p className="text-gray-500">Loading dashboard...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002040] mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your daycare operations</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-[#2888B8] bg-gradient-to-br from-[#2888B8]/5 to-transparent">
          <CardContent className="p-6 text-center">
            <Users className="mx-auto mb-2 text-[#2888B8]" size={32} />
            <p className="text-2xl font-bold text-[#002040] mb-1">{data.totalEnrolled}/{data.totalCapacity}</p>
            <p className="text-sm text-gray-600">Total Enrollment</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-[#E8A018] bg-gradient-to-br from-[#E8A018]/5 to-transparent">
          <CardContent className="p-6 text-center">
            <ClipboardList className="mx-auto mb-2 text-[#E8A018]" size={32} />
            <p className="text-2xl font-bold text-[#E8A018] mb-1">{data.pendingApplications}</p>
            <p className="text-sm text-gray-600">Pending Applications</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-[#489858] bg-gradient-to-br from-[#489858]/5 to-transparent">
          <CardContent className="p-6 text-center">
            <GraduationCap className="mx-auto mb-2 text-[#489858]" size={32} />
            <p className="text-2xl font-bold text-[#489858] mb-1">{data.activePrograms}</p>
            <p className="text-sm text-gray-600">Active Programs</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-[#E05830] bg-gradient-to-br from-[#E05830]/5 to-transparent">
          <CardContent className="p-6 text-center">
            <TrendingUp className="mx-auto mb-2 text-[#E05830]" size={32} />
            <p className="text-2xl font-bold text-[#E05830] mb-1">{data.capacityPercent}%</p>
            <p className="text-sm text-gray-600">Capacity</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-[#002040] mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <Button asChild className="h-auto py-6 flex-col gap-3 bg-gradient-to-br from-[#2888B8] to-[#1078A8] hover:shadow-lg transition-all">
              <Link href="/admin/admissions"><ClipboardList size={28} /><span className="font-semibold">Review Applications</span></Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-6 flex-col gap-3 bg-gradient-to-br from-[#489858]/5 to-transparent border-2 border-[#489858]/20 hover:border-[#489858] hover:shadow-lg transition-all">
              <Link href="/admin/classrooms"><Users size={28} className="text-[#489858]" /><span className="font-semibold">Manage Classrooms</span></Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-6 flex-col gap-3 bg-gradient-to-br from-[#E8A018]/5 to-transparent border-2 border-[#E8A018]/20 hover:border-[#E8A018] hover:shadow-lg transition-all">
              <Link href="/admin/programs"><GraduationCap size={28} className="text-[#E8A018]" /><span className="font-semibold">Manage Programs</span></Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#002040]">Recent Applications</h3>
              <Button variant="link" asChild className="h-auto p-0"><Link href="/admin/admissions">View All</Link></Button>
            </div>
            <div className="space-y-3">
              {data.recentApplications.map((app) => (
                <div key={app.application_id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-[#002040]">{app.child_name}</p>
                      <p className="text-sm text-gray-600">{app.parent_name}</p>
                    </div>
                    <Badge variant="outline" className={STATUS_CLASSES[app.application_status] ?? ""}>
                      {STATUS_DISPLAY[app.application_status] ?? app.application_status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Submitted {new Date(app.submitted_at).toLocaleDateString()} • Program: {app.program_interest ?? "N/A"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-[#002040] mb-4">Classroom Capacity</h3>
            <div className="space-y-4">
              {data.classrooms.map((classroom) => {
                const enrolled = Number(classroom.enrolled);
                const percentage = classroom.capacity > 0 ? (enrolled / classroom.capacity) * 100 : 0;
                const clamped = Math.min(100, Math.max(0, Math.round(percentage)));
                return (
                  <div key={classroom.classroom_id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[#002040]">{classroom.classroom_name}</span>
                      <span className="text-sm text-gray-600">{enrolled}/{classroom.capacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${percentage >= 90 ? "bg-[#E05830]" : percentage >= 70 ? "bg-[#E8A018]" : "bg-[#489858]"}`}
                        style={{ width: `${clamped}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordCard />
    </div>
  );
}
