"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle, Clock, XCircle, AlertCircle, Calendar, Mail, Phone, User, FileText, Send } from "lucide-react";
import { toast } from "sonner";

type Application = {
  application_id: number;
  child_first_name: string;
  child_last_name: string;
  child_dob: string | null;
  desired_start_date: string | null;
  program_interest: string | null;
  tour_requested: boolean;
  tour_scheduled_at: string | null;
  application_status: string;
  submitted_at: string;
  review_notes: string | null;
  parent_first_name: string;
  parent_last_name: string;
  email: string;
  phone: string | null;
};

type Classroom = {
  classroom_id: number;
  classroom_name: string;
  age_group: string | null;
  capacity: number;
  enrolled: number;
};

const STATUS_DISPLAY: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  accepted: "Accepted",
  waitlisted: "Waitlist",
  rejected: "Rejected",
  more_info_required: "More Info Needed",
};

const STATUS_TO_DB: Record<string, string> = {
  "More Info Needed": "more_info_required",
  "Waitlist": "waitlisted",
  "Accepted": "accepted",
  "Rejected": "rejected",
};

export default function AdminAdmissions() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [tourSaving, setTourSaving] = useState(false);

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  const [viewAppOpen, setViewAppOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollClassroomId, setEnrollClassroomId] = useState("");
  const [enrollStartDate, setEnrollStartDate] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactSending, setContactSending] = useState(false);
  const [tourDate, setTourDate] = useState("");
  const [tourTime, setTourTime] = useState("10:00");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/admissions").then((r) => r.json()),
      fetch("/api/admin/classrooms").then((r) => r.json()),
    ]).then(([apps, rooms]) => {
      setApplications(apps);
      setClassrooms(rooms);
      setLoading(false);
    });
  }, []);

  const displayStatus = (app: Application) =>
    STATUS_DISPLAY[app.application_status] ?? app.application_status;

  const filteredApplications = (
    filter === "all"
      ? applications
      : applications.filter(
          (app) => displayStatus(app).toLowerCase().replace(/\s+/g, "-") === filter
        )
  ).sort(
    (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Submitted": return <Clock className="text-blue-600" size={20} />;
      case "More Info Needed": return <AlertCircle className="text-orange-600" size={20} />;
      case "Waitlist": return <Clock className="text-yellow-600" size={20} />;
      case "Accepted": return <CheckCircle className="text-green-600" size={20} />;
      case "Rejected": return <XCircle className="text-red-600" size={20} />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted": return "bg-blue-100 text-blue-700 border-blue-200";
      case "More Info Needed": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Waitlist": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Accepted": return "bg-green-100 text-green-700 border-green-200";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleStatusChange = async (appId: number, newDisplayStatus: string) => {
    const dbStatus = STATUS_TO_DB[newDisplayStatus] ?? newDisplayStatus.toLowerCase();
    await fetch(`/api/admin/admissions/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: dbStatus }),
    });
    setApplications((prev) =>
      prev.map((app) =>
        app.application_id === appId ? { ...app, application_status: dbStatus } : app
      )
    );
    toast.success(`Application status updated to: ${newDisplayStatus}`);
  };

  const openEnroll = (app: Application) => {
    setSelectedApp(app);
    setEnrollClassroomId("");
    setEnrollStartDate(app.desired_start_date?.slice(0, 10) ?? "");
    setEnrollOpen(true);
  };

  const handleAcceptEnroll = async () => {
    if (!selectedApp) return;
    if (!enrollClassroomId) {
      toast.error("Please select a classroom");
      return;
    }
    if (!enrollStartDate) {
      toast.error("Please enter a start date");
      return;
    }

    setEnrollLoading(true);
    try {
      const res = await fetch(
        `/api/admin/admissions/${selectedApp.application_id}/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classroomId: Number(enrollClassroomId), startDate: enrollStartDate }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Enrollment failed");
        return;
      }
      setApplications((prev) =>
        prev.map((app) =>
          app.application_id === selectedApp.application_id
            ? { ...app, application_status: "accepted" }
            : app
        )
      );
      toast.success(data.message ?? "Student enrolled successfully");
      setEnrollOpen(false);
    } finally {
      setEnrollLoading(false);
    }
  };

  const openViewApp = (app: Application) => {
    setSelectedApp(app);
    setViewAppOpen(true);
  };

  const openContact = (app: Application) => {
    setSelectedApp(app);
    setContactMessage("");
    setContactSubject(`Re: ${app.child_first_name} ${app.child_last_name}'s Application`);
    setContactOpen(true);
  };

  const openTour = (app: Application) => {
    setSelectedApp(app);
    setTourDate("");
    setTourTime("10:00");
    setTourOpen(true);
  };

  const sendContactMessage = async () => {
    if (!contactMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    if (!user?.id) {
      toast.error("Not logged in");
      return;
    }
    setContactSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: Number(user.id),
          receiverEmail: selectedApp?.email,
          subject: contactSubject,
          body: contactMessage,
        }),
      });
      const data = await res.json();
      if (res.status === 404) {
        // Parent has no portal account yet — fall back to mailto
        const mailto = `mailto:${selectedApp?.email}?subject=${encodeURIComponent(contactSubject)}&body=${encodeURIComponent(contactMessage)}`;
        window.location.href = mailto;
        toast.info("Opening your email client — this parent doesn't have a portal account yet.");
        setContactOpen(false);
        setContactMessage("");
        return;
      }
      if (!res.ok) {
        toast.error(data.error ?? "Failed to send message");
        return;
      }
      toast.success(`Message sent to ${selectedApp?.parent_first_name} ${selectedApp?.parent_last_name} via portal`);
      setContactOpen(false);
      setContactMessage("");
    } finally {
      setContactSending(false);
    }
  };

  const scheduleTour = async () => {
    if (!tourDate) {
      toast.error("Please select a date");
      return;
    }
    if (!selectedApp) return;

    const scheduledAt = `${tourDate}T${tourTime}:00`;
    setTourSaving(true);
    try {
      const res = await fetch(`/api/admin/admissions/${selectedApp.application_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedApp.application_status, tourScheduledAt: scheduledAt }),
      });
      if (!res.ok) {
        toast.error("Failed to save tour");
        return;
      }
      setApplications((prev) =>
        prev.map((app) =>
          app.application_id === selectedApp.application_id
            ? { ...app, tour_scheduled_at: scheduledAt }
            : app
        )
      );
      const childName = `${selectedApp.child_first_name} ${selectedApp.child_last_name}`;
      toast.success(`Tour scheduled for ${childName} on ${tourDate} at ${tourTime}`);
      setTourOpen(false);
      setTourDate("");
      setTourTime("10:00");
    } finally {
      setTourSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[#002040]">Admissions Queue</h1>
          <p className="text-gray-600">Review and manage enrollment applications</p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted ({applications.filter((a) => a.application_status === "submitted").length})
          </TabsTrigger>
          <TabsTrigger value="more-info-needed">
            More Info ({applications.filter((a) => a.application_status === "more_info_required").length})
          </TabsTrigger>
          <TabsTrigger value="waitlist">
            Waitlist ({applications.filter((a) => a.application_status === "waitlisted").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-600">No applications in this category</p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((app) => {
              const childName = `${app.child_first_name} ${app.child_last_name}`;
              const parentName = `${app.parent_first_name} ${app.parent_last_name}`;
              const status = displayStatus(app);
              const tourScheduled = !!app.tour_scheduled_at;
              const tourScheduledDate = app.tour_scheduled_at
                ? new Date(app.tour_scheduled_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
                : null;

              return (
                <Card
                  key={app.application_id}
                  className="border-l-4 border-[#2888B8] transition-all hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2888B8]/20 to-[#2888B8]/5">
                        {getStatusIcon(status)}
                      </div>

                      <div className="flex-1">
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <div>
                            <h3 className="mb-1 text-xl font-bold text-[#002040]">{childName}</h3>
                            <p className="text-sm text-gray-600">{parentName}</p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(status)}>
                            {status}
                          </Badge>
                        </div>

                        <div className="mb-4 grid gap-4 md:grid-cols-2">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="text-gray-400" size={16} />
                              <span className="text-gray-700">{app.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="text-gray-400" size={16} />
                              <span className="text-gray-700">{app.phone ?? "N/A"}</span>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Program:</span>
                              <span className="ml-2 font-medium">{app.program_interest ?? "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Tour Requested:</span>
                              <span className="ml-2 font-medium">{app.tour_requested ? "Yes" : "No"}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Submitted:</span>
                              <span className="ml-2 font-medium">
                                {new Date(app.submitted_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {tourScheduled && (
                          <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm">
                            <Calendar className="text-blue-600" size={16} />
                            <span className="text-blue-900">Tour scheduled for {tourScheduledDate}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                          {["accepted", "rejected"].includes(app.application_status) ? (
                            <div className="flex h-9 w-[200px] items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400">
                              No further actions
                            </div>
                          ) : (
                            <Select
                              onValueChange={(value) => {
                                if (value === "Accepted") {
                                  openEnroll(app);
                                } else {
                                  handleStatusChange(app.application_id, value);
                                }
                              }}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Change Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="More Info Needed">More Info Needed</SelectItem>
                                <SelectItem value="Waitlist">Move to Waitlist</SelectItem>
                                <SelectItem value="Accepted">Accept &amp; Enroll</SelectItem>
                                <SelectItem value="Rejected">Reject</SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                          <Button variant="outline" size="sm" onClick={() => openViewApp(app)}>
                            <FileText className="mr-1" size={14} />
                            View Full Application
                          </Button>

                          <Button variant="outline" size="sm" onClick={() => openContact(app)}>
                            <Mail className="mr-1" size={14} />
                            Contact Parent
                          </Button>

                          {!tourScheduled && (
                            <Button variant="outline" size="sm" onClick={() => openTour(app)}>
                              <Calendar className="mr-1" size={14} />
                              Schedule Tour
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={viewAppOpen} onOpenChange={setViewAppOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#002040]">Application Details</DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-5 py-2">
              <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2888B8]/10">
                  <User className="text-[#2888B8]" size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#002040]">
                    {selectedApp.child_first_name} {selectedApp.child_last_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Applied by {selectedApp.parent_first_name} {selectedApp.parent_last_name}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`ml-auto ${getStatusColor(displayStatus(selectedApp))}`}
                >
                  {displayStatus(selectedApp)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Parent Email</p>
                  <p className="font-medium">{selectedApp.email}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{selectedApp.phone ?? "N/A"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Desired Program</p>
                  <p className="font-medium">{selectedApp.program_interest ?? "N/A"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Tour Requested</p>
                  <p className="font-medium">{selectedApp.tour_requested ? "Yes" : "No"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Submitted</p>
                  <p className="font-medium">
                    {new Date(selectedApp.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Review Notes</p>
                  <p className="font-medium">{selectedApp.review_notes ?? "None"}</p>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 text-sm">
                <p className="mb-1 font-medium text-blue-900">Application Notes</p>
                <p className="text-blue-800">
                  Parent expressed interest in the {selectedApp.program_interest ?? "N/A"} program.
                  Review submitted records, availability, and next-step eligibility before final decision.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#002040]">Contact Parent</DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                Message will be sent to {selectedApp.parent_first_name} {selectedApp.parent_last_name} regarding{" "}
                {selectedApp.child_first_name} {selectedApp.child_last_name}&apos;s application.
              </div>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-gray-700">Email:</span> {selectedApp.email}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Phone:</span> {selectedApp.phone ?? "N/A"}
                </p>
              </div>

              <div>
                <Label htmlFor="contact-subject">Subject</Label>
                <Input
                  id="contact-subject"
                  className="mt-1"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  className="mt-1"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Request missing records, answer questions, or provide next steps..."
                  rows={5}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setContactOpen(false)} disabled={contactSending}>Cancel</Button>
            <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={sendContactMessage} disabled={contactSending}>
              <Send className="mr-2" size={16} />
              {contactSending ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#002040]">Accept &amp; Assign Classroom</DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
                Enrolling <span className="font-semibold">{selectedApp.child_first_name} {selectedApp.child_last_name}</span>.
                This will create their student record and assign them to a classroom.
              </div>

              <div>
                <Label htmlFor="enroll-classroom">Classroom</Label>
                <Select value={enrollClassroomId} onValueChange={setEnrollClassroomId}>
                  <SelectTrigger id="enroll-classroom" className="mt-1">
                    <SelectValue placeholder="Select a classroom" />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms.map((room) => (
                      <SelectItem key={room.classroom_id} value={String(room.classroom_id)}>
                        {room.classroom_name}
                        {room.age_group ? ` — ${room.age_group}` : ""}
                        {" "}({room.enrolled}/{room.capacity} enrolled)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="enroll-start">Start Date</Label>
                <Input
                  id="enroll-start"
                  type="date"
                  className="mt-1"
                  value={enrollStartDate}
                  onChange={(e) => setEnrollStartDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollOpen(false)} disabled={enrollLoading}>
              Cancel
            </Button>
            <Button
              className="bg-[#489858] hover:bg-[#3a7846]"
              onClick={handleAcceptEnroll}
              disabled={enrollLoading}
            >
              <CheckCircle className="mr-2" size={16} />
              {enrollLoading ? "Enrolling..." : "Confirm Enrollment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tourOpen} onOpenChange={setTourOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#002040]">Schedule Tour</DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
                Schedule an admissions tour for {selectedApp.child_first_name} {selectedApp.child_last_name}.
              </div>

              <div>
                <Label htmlFor="tour-date">Tour Date</Label>
                <Input
                  id="tour-date"
                  type="date"
                  className="mt-1"
                  value={tourDate}
                  onChange={(e) => setTourDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="tour-time">Tour Time</Label>
                <Select value={tourTime} onValueChange={setTourTime}>
                  <SelectTrigger id="tour-time" className="mt-1">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setTourOpen(false)}>Cancel</Button>
            <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={scheduleTour}>
              Schedule Tour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
