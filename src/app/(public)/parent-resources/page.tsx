"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, FileText, CheckSquare, Clock, ChevronLeft, ChevronRight, Download } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type DocumentItem = {
  name: string;
  icon: typeof FileText;
  status: "Available" | "Required";
  href: string;
};

type DbEvent = {
  event_id: number;
  title: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
};

const EVENT_COLORS = ["bg-[#2888B8]", "bg-[#489858]", "bg-[#E05830]", "bg-[#E8A018]"];

const documents: DocumentItem[] = [
  {
    name: "Parent Handbook 2026",
    icon: FileText,
    status: "Available",
    href: "/docs/parent-handbook.pdf",
  },
  {
    name: "Enrollment Forms",
    icon: FileText,
    status: "Required",
    href: "/docs/enrollment-forms.pdf",
  },
  {
    name: "Emergency Contact Form",
    icon: FileText,
    status: "Required",
    href: "/docs/emergency-contact.pdf",
  },
  {
    name: "Medical Authorization",
    icon: FileText,
    status: "Required",
    href: "/docs/medical-authorization.pdf",
  },
  {
    name: "Immunization Records",
    icon: FileText,
    status: "Required",
    href: "/docs/immunization-records.pdf",
  },
  {
    name: "Authorized Pickup List",
    icon: FileText,
    status: "Required",
    href: "/docs/authorized-pickup.pdf",
  },
];


const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function ParentResourcesPage() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [dbEvents, setDbEvents] = useState<DbEvent[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((rows: DbEvent[]) => setDbEvents(rows));
  }, []);

  const allEvents = useMemo(() => {
    const map: Record<string, { title: string; time: string; color: string }[]> = {};
    dbEvents.forEach((e, i) => {
      const key = e.event_date;
      if (!map[key]) map[key] = [];
      const time = e.start_time ? e.start_time.slice(0, 5) : "All Day";
      map[key].push({ title: e.title, time, color: EVENT_COLORS[i % EVENT_COLORS.length] });
    });
    return map;
  }, [dbEvents]);

  const events = useMemo(() =>
    dbEvents.slice(0, 5).map((e) => ({
      date: new Date(e.event_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      title: e.title,
      time: e.start_time ? e.start_time.slice(0, 5) : "All Day",
    })),
    [dbEvents]
  );

  const today = useMemo(() => new Date(), []);
  const currentDateKey = formatDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
  const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);

  const monthEventList = useMemo(() => {
    return Object.entries(allEvents)
      .filter(([dateKey]) => {
        const [year, month] = dateKey.split("-").map(Number);
        return year === calendarYear && month === calendarMonth + 1;
      })
      .sort(([a], [b]) => a.localeCompare(b));
  }, [allEvents, calendarMonth, calendarYear]);

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((prev) => prev - 1);
      return;
    }
    setCalendarMonth((prev) => prev - 1);
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((prev) => prev + 1);
      return;
    }
    setCalendarMonth((prev) => prev + 1);
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-[#2888B8] to-[#1078A8] py-16 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold lg:text-5xl">Parent Resources</h1>
          <p className="max-w-2xl text-xl text-white/90">
            Everything you need for enrollment and staying connected with GBD
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2888B8]/10">
                    <CheckSquare className="text-[#2888B8]" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#002040]">
                      Required Documents
                    </h2>
                    <p className="text-sm text-gray-600">
                      Complete these forms for enrollment
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <doc.icon className="text-[#2888B8]" size={20} />
                        <div>
                          <p className="font-medium text-[#002040]">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.status}</p>
                        </div>
                      </div>

                      <Button asChild variant="outline" size="sm">
                        <Link href={doc.href}>
                          <Download className="mr-1" size={14} />
                          Download
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> All forms must be completed before your
                    child&apos;s first day. Already enrolled?{" "}
                    <Link
                      href="/login"
                      className="font-medium text-[#2888B8] hover:underline"
                    >
                      Upload documents in your Parent Portal
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#489858]/10">
                    <Calendar className="text-[#489858]" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#002040]">
                      Upcoming Events
                    </h2>
                    <p className="text-sm text-gray-600">Mark your calendars</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={`${event.date}-${event.title}`}
                      className="flex gap-4 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                    >
                      <div className="w-16 flex-shrink-0 text-center">
                        <div className="rounded-lg bg-[#489858] p-2 text-white">
                          <p className="text-xs font-medium">{event.date}</p>
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-[#002040]">{event.title}</p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                          <Clock size={14} />
                          {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className="mt-6 w-full bg-[#489858] hover:bg-[#3a7846]"
                  onClick={() => setCalendarOpen(true)}
                >
                  <Calendar className="mr-2" size={16} />
                  View Full Calendar
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8 border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <h3 className="mb-4 text-2xl font-bold text-[#002040]">
                New to GBD?
              </h3>
              <p className="mx-auto mb-6 max-w-2xl text-gray-600">
                Schedule a tour to see our facility, meet our staff, and learn more
                about our programs. We&apos;d love to show you why GBD is the right
                choice for your family.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild className="bg-[#2888B8] hover:bg-[#1078A8]">
                  <Link href="/contact">Schedule a Tour</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">Apply for Enrollment</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#002040]">
              <Calendar className="text-[#489858]" size={24} />
              GBD Events Calendar
            </DialogTitle>
            <DialogDescription>
              Browse upcoming events, closures, and family activities.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="mb-4 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ChevronLeft size={16} />
              </Button>

              <h3 className="text-lg font-bold text-[#002040]">
                {monthNames[calendarMonth]} {calendarYear}
              </h3>

              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight size={16} />
              </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="grid grid-cols-7 bg-gray-200">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="bg-[#002040] py-2 text-center text-xs font-medium text-white"
                  >
                    {day}
                  </div>
                ))}

                {Array.from({ length: firstDay }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[84px] bg-gray-50 p-2"
                  />
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const dateKey = formatDateKey(calendarYear, calendarMonth, day);
                  const dayEvents = allEvents[dateKey] || [];
                  const isToday = dateKey === currentDateKey;

                  return (
                    <div
                      key={dateKey}
                      className={`min-h-[84px] bg-white p-2 ${
                        isToday ? "ring-2 ring-inset ring-[#2888B8]" : ""
                      }`}
                    >
                      <p
                        className={`mb-1 text-xs font-medium ${
                          isToday ? "font-bold text-[#2888B8]" : "text-gray-700"
                        }`}
                      >
                        {day}
                      </p>

                      <div className="space-y-1">
                        {dayEvents.map((event, eventIndex) => (
                          <div
                            key={`${dateKey}-${eventIndex}`}
                            className={`${event.color} truncate rounded px-1 py-0.5 text-[10px] text-white`}
                            title={`${event.title} — ${event.time}`}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Events This Month
              </h4>

              {monthEventList.length > 0 ? (
                <div className="space-y-3">
                  {monthEventList.map(([dateKey, eventList]) => {
                    const formattedDate = new Date(dateKey).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });

                    return eventList.map((event, index) => (
                      <div
                        key={`${dateKey}-${index}`}
                        className="flex items-start gap-3 rounded-lg border border-gray-200 p-3"
                      >
                        <div className={`mt-1 h-3 w-3 rounded-full ${event.color}`} />
                        <div>
                          <p className="font-medium text-[#002040]">{event.title}</p>
                          <p className="text-sm text-gray-600">
                            {formattedDate} · {event.time}
                          </p>
                        </div>
                      </div>
                    ));
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No events listed for this month yet.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}