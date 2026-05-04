"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Heart, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Contact = {
  full_name: string;
  relationship_to_child: string;
  phone: string | null;
  email: string | null;
  is_authorized_pickup: boolean;
};

type Child = {
  child_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  allergies: string | null;
  medical_notes: string | null;
  contacts: Contact[];
};

type RosterData = {
  classroom: { classroom_id: number; classroom_name: string } | null;
  children: Child[];
};

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
  return (
    <div className="w-20 h-20 rounded-full bg-[#2888B8]/10 flex items-center justify-center text-[#2888B8] text-2xl font-bold shrink-0">
      {letters.toUpperCase()}
    </div>
  );
}

export default function StaffRoster() {
  const { user } = useAuth();
  const [data, setData] = useState<RosterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/staff/roster?staffId=${user.id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [user?.id]);

  const classroomName = data?.classroom?.classroom_name ?? "My Classroom";
  const children = data?.children ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading roster...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002040] mb-2">My Roster</h1>
        <p className="text-gray-600">{classroomName} • {children.length} Children</p>
      </div>

      <div className="grid gap-6">
        {children.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No students are currently assigned to this classroom.
            </CardContent>
          </Card>
        ) : (
          children.map((child) => {
            const age = Math.floor((Date.now() - new Date(child.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
            const authorizedPickup = child.contacts.filter((c) => c.is_authorized_pickup);
            const emergencyContacts = child.contacts;

            return (
              <Card key={child.child_id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <Initials name={`${child.first_name} ${child.last_name}`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold text-[#002040] mb-1">
                            {child.first_name} {child.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Age {age} • DOB: {new Date(child.date_of_birth).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-[#2888B8]">{classroomName}</Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Heart className="text-[#E05830]" size={20} />
                            <h4 className="font-semibold text-[#002040]">Allergies</h4>
                          </div>
                          {child.allergies ? (
                            <div className="flex flex-wrap gap-2">
                              {child.allergies.split(",").map((a) => (
                                <Badge key={a.trim()} variant="destructive">{a.trim()}</Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No known allergies</p>
                          )}
                          {child.medical_notes && (
                            <p className="text-xs text-gray-500 mt-2">Note: {child.medical_notes}</p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Phone className="text-[#2888B8]" size={20} />
                            <h4 className="font-semibold text-[#002040]">Emergency Contacts</h4>
                          </div>
                          {emergencyContacts.length === 0 ? (
                            <p className="text-sm text-gray-500">No contacts on file</p>
                          ) : (
                            <div className="space-y-2">
                              {emergencyContacts.map((contact, i) => (
                                <div key={i} className="text-sm">
                                  <p className="font-medium">{contact.full_name}</p>
                                  <p className="text-gray-600">
                                    {contact.relationship_to_child}
                                    {contact.phone ? ` • ${contact.phone}` : ""}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {authorizedPickup.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="text-[#489858]" size={20} />
                            <h4 className="font-semibold text-[#002040]">Authorized Pickup</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {authorizedPickup.map((person, i) => (
                              <Badge key={i} variant="outline" className="bg-green-50">
                                {person.full_name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
