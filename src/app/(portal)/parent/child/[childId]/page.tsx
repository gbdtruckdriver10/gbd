"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockChildren } from "@/data/mockData";
import { ArrowLeft, User, Phone, Heart, ShieldCheck, FileText } from 'lucide-react';
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function ChildProfile() {
 const { user } = useAuth();
  const params = useParams();
  const childId = Array.isArray(params.childId) ? params.childId[0] : params.childId;

  const linkedChildIds =
    user?.childrenIds && user.childrenIds.length > 0
      ? user.childrenIds
      : ["child-1", "child-2"];

  const child = mockChildren.find(
    (c) => c.id === childId && linkedChildIds.includes(c.id)
  );
  
  if (!child) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Child not found</p>
        <Button asChild className="mt-4">
          <Link href="/parent">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild size="sm">
          <Link href="/parent">
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative w-32 h-32">
              <Image
                src={child.image}
                alt={child.firstName}
                fill
                className="rounded-full object-cover"
                sizes="128px"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#002040] mb-2">
                {child.firstName} {child.lastName}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <span>Age: {child.age}</span>
                <span>•</span>
                <span>DOB: {child.dateOfBirth}</span>
                <span>•</span>
                <span>Classroom: {child.classroom}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {child.programs.map((program) => (
                  <Badge key={program} className="bg-[#2888B8]">
                    {program}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-[#002040] mb-4 flex items-center gap-2">
                <User className="text-[#2888B8]" size={24} />
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{child.firstName} {child.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium">{child.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-medium">{child.age} years old</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Classroom</p>
                  <p className="font-medium">{child.classroom}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-[#002040] mb-4 flex items-center gap-2">
                <ShieldCheck className="text-[#489858]" size={24} />
                Authorized Pickup
              </h3>
              <div className="space-y-2">
                {child.authorizedPickup.map((person, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User size={20} className="text-gray-400" />
                    <span className="font-medium">{person}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-[#002040] mb-4 flex items-center gap-2">
                <Phone className="text-[#2888B8]" size={24} />
                Emergency Contacts
              </h3>
              <div className="space-y-4">
                {child.emergencyContacts.map((contact, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-[#002040]">{contact.name}</h4>
                      <Badge variant="outline">{contact.relationship}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} />
                      <span>{contact.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-[#002040] mb-4 flex items-center gap-2">
                <Heart className="text-[#E05830]" size={24} />
                Medical Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Allergies</p>
                  {child.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {child.allergies.map((allergy) => (
                        <Badge key={allergy} variant="destructive">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No known allergies</p>
                  )}
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-900">
                    <strong>Important:</strong> All staff members are aware of your child's allergies.
                    Please notify us immediately of any changes to medical information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-[#002040] mb-4 flex items-center gap-2">
                <FileText className="text-[#E8A018]" size={24} />
                Documents
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Immunization Records', status: 'Complete', date: '2025-08-15' },
                  { name: 'Medical Authorization', status: 'Complete', date: '2025-08-10' },
                  { name: 'Emergency Contact Form', status: 'Complete', date: '2025-08-10' },
                  { name: 'Photo Release Form', status: 'Complete', date: '2025-08-10' }
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="text-[#2888B8]" size={20} />
                      <div>
                        <p className="font-medium text-[#002040]">{doc.name}</p>
                        <p className="text-xs text-gray-500">Updated: {doc.date}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-[#2888B8] hover:bg-[#1078A8]">
                Upload New Document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
