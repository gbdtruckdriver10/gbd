"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users, Clock, DollarSign, CheckCircle, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

type Child = { child_id: number; first_name: string; last_name: string };
type EnrolledProgram = {
  program_id: number; program_name: string; description: string | null;
  age_min: number; age_max: number; program_type: string;
  days_of_week: string | null; start_time: string | null; end_time: string | null;
  price: number | null; price_unit: string | null; instructor_name: string | null;
  instructor_user_id: number | null;
  child_id: number; child_first_name: string;
};
type AvailableProgram = {
  program_id: number; program_name: string; description: string | null;
  age_min: number; age_max: number; program_type: string;
  days_of_week: string | null; start_time: string | null; end_time: string | null;
  capacity: number | null; price: number | null; price_unit: string | null;
  instructor_name: string | null; instructor_user_id: number | null; enrolled: number;
};

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

export default function ParentPrograms() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [enrolled, setEnrolled] = useState<EnrolledProgram[]>([]);
  const [available, setAvailable] = useState<AvailableProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const [contactOpen, setContactOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<AvailableProgram | null>(null);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [enrollmentNotes, setEnrollmentNotes] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/parent/programs?parentId=${user.id}`)
      .then((r) => r.json())
      .then(({ children, enrolled, available }) => {
        setChildren(children);
        setEnrolled(enrolled);
        setAvailable(available);
        setLoading(false);
      });
  }, [user?.id]);

  const groupedEnrolled = enrolled.reduce<Record<number, { program: EnrolledProgram; childNames: string[] }>>((acc, row) => {
    if (!acc[row.program_id]) acc[row.program_id] = { program: row, childNames: [] };
    acc[row.program_id].childNames.push(row.child_first_name);
    return acc;
  }, {});

  const openContactDialog = (program: AvailableProgram) => {
    setSelectedProgram(program);
    setContactMessage("");
    setContactOpen(true);
  };

  const openEnrollmentDialog = (program: AvailableProgram) => {
    setSelectedProgram(program);
    setSelectedChildId("");
    setEnrollmentNotes("");
    setEnrollOpen(true);
  };

  const submitContact = async () => {
    if (!contactMessage.trim()) { toast.error("Please enter a message."); return; }
    if (!selectedProgram?.instructor_user_id) { toast.error("No instructor assigned to this program yet."); return; }
    const subject = `Question about ${selectedProgram.program_name}`;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: user?.id, receiverId: selectedProgram.instructor_user_id, subject, body: contactMessage }),
    });
    if (res.ok) {
      toast.success(`Message sent to the ${selectedProgram.program_name} coordinator.`);
      setContactOpen(false);
      setContactMessage("");
    } else {
      toast.error("Failed to send message.");
    }
  };

  const submitEnrollment = async () => {
    const child = children.find((c) => String(c.child_id) === selectedChildId);
    if (!child) { toast.error("Please select a child."); return; }
    if (!selectedProgram?.instructor_user_id) { toast.error("No instructor assigned to this program yet."); return; }
    const subject = `Enrollment Request: ${child.first_name} ${child.last_name} — ${selectedProgram.program_name}`;
    const body = `I would like to enroll ${child.first_name} ${child.last_name} in ${selectedProgram.program_name}.${enrollmentNotes ? `\n\nNotes: ${enrollmentNotes}` : ""}`;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: user?.id, receiverId: selectedProgram.instructor_user_id, subject, body }),
    });
    if (res.ok) {
      toast.success(`Enrollment request sent for ${child.first_name} in ${selectedProgram.program_name}.`);
      setEnrollOpen(false);
      setSelectedChildId("");
      setEnrollmentNotes("");
    } else {
      toast.error("Failed to send enrollment request.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><p className="text-gray-500">Loading programs...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-[#002040]">Programs</h1>
        <p className="text-gray-600">View and manage your children&apos;s program enrollments</p>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold text-[#002040]">Currently Enrolled</h2>
        {Object.keys(groupedEnrolled).length === 0 ? (
          <p className="text-sm text-gray-500">No active enrollments found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {Object.values(groupedEnrolled).map(({ program, childNames }) => {
              const image = PROGRAM_IMAGES[program.program_type] ?? "/programs/childcare.png";
              return (
                <Card key={program.program_id} className="overflow-hidden">
                  <Image src={image} alt={program.program_name} width={640} height={240} className="h-48 w-full object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#002040]">{program.program_name}</h3>
                      <Badge className="bg-green-100 text-green-700"><CheckCircle size={14} className="mr-1" />Enrolled</Badge>
                    </div>
                    <p className="mb-4 text-sm text-gray-600">{program.description}</p>
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm"><Clock className="text-[#2888B8]" size={16} /><span>{formatSchedule(program.days_of_week, program.start_time, program.end_time)}</span></div>
                      <div className="flex items-center gap-2 text-sm"><DollarSign className="text-[#489858]" size={16} /><span>{formatCost(program.price, program.price_unit)}</span></div>
                      <div className="flex items-center gap-2 text-sm"><Users className="text-[#E8A018]" size={16} /><span>Instructor: {program.instructor_name ?? "TBD"}</span></div>
                    </div>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {childNames.map((name) => <Badge key={name} variant="secondary">{name}</Badge>)}
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => openContactDialog(program as unknown as AvailableProgram)}>
                      <Mail className="mr-2" size={16} />Contact Coordinator
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold text-[#002040]">Available Programs</h2>
        {available.length === 0 ? (
          <p className="text-sm text-gray-500">No additional programs available at this time.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {available.map((program) => {
              const enrolledCount = Number(program.enrolled);
              const capacity = program.capacity ?? 0;
              const percent = capacity > 0 ? (enrolledCount / capacity) * 100 : 0;
              const percentClamped = Math.min(100, Math.max(0, Math.round(percent)));
              const spotsLeft = Math.max(0, capacity - enrolledCount);
              const image = PROGRAM_IMAGES[program.program_type] ?? "/programs/childcare.png";

              return (
                <Card key={program.program_id} className="overflow-hidden">
                  <Image src={image} alt={program.program_name} width={640} height={240} className="h-48 w-full object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#002040]">{program.program_name}</h3>
                      <Badge variant="outline">Ages {program.age_min}–{program.age_max}</Badge>
                    </div>
                    <p className="mb-4 text-sm text-gray-600">{program.description}</p>
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm"><Clock className="text-[#2888B8]" size={16} /><span>{formatSchedule(program.days_of_week, program.start_time, program.end_time)}</span></div>
                      <div className="flex items-center gap-2 text-sm"><DollarSign className="text-[#489858]" size={16} /><span>{formatCost(program.price, program.price_unit)}</span></div>
                      <div className="flex items-center gap-2 text-sm"><Users className="text-[#E8A018]" size={16} /><span>{enrolledCount} / {capacity} enrolled</span></div>
                    </div>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-gray-200">
                        <div className="h-2 rounded-full bg-[#489858]" style={{ width: `${percentClamped}%` }} />
                      </div>
                      <span className="text-xs text-gray-600">{spotsLeft} spots left</span>
                    </div>
                    <Button className="w-full bg-[#2888B8] hover:bg-[#1078A8]" onClick={() => openEnrollmentDialog(program)}>
                      Request Enrollment
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-[#002040]">Contact {selectedProgram?.program_name} Coordinator</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">Your message will be sent to the program coordinator.</div>
            <div>
              <Label>Message</Label>
              <Textarea className="mt-1" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Ask about schedule, activities, or upcoming sessions..." rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactOpen(false)}>Cancel</Button>
            <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={submitContact}><Send className="mr-2" size={16} />Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-[#002040]">Request Enrollment — {selectedProgram?.program_name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Submit a request and the coordinator will review availability and contact you.</div>
            <div>
              <Label>Select Child</Label>
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a child" /></SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.child_id} value={String(child.child_id)}>
                      {child.first_name} {child.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Additional Notes (optional)</Label>
              <Textarea className="mt-1" value={enrollmentNotes} onChange={(e) => setEnrollmentNotes(e.target.value)} placeholder="Any scheduling preferences or questions..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollOpen(false)}>Cancel</Button>
            <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={submitEnrollment}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
