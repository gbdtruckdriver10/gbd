"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

type Member = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  cfo: "CFO",
  staff: "Staff",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  cfo: "bg-blue-100 text-blue-700",
  staff: "bg-green-100 text-green-700",
};

export default function AdminTeam() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then((data) => { setMembers(data); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading team...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#002040] mb-2">Team</h1>
          <p className="text-gray-600">{members.length} staff, admin, and CFO accounts</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center gap-4 rounded-xl bg-gray-50 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2888B8]/10">
                  <Users size={18} className="text-[#2888B8]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#002040]">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                <Badge className={ROLE_COLORS[member.role] ?? "bg-gray-100 text-gray-700"}>
                  {ROLE_LABELS[member.role] ?? member.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
