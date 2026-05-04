import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockCalendarEvents, type CalendarEvent } from "@/data/calendar";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function typeStyles(type: CalendarEvent["type"]) {
  switch (type) {
    case "Closure":
      return "bg-red-100 text-red-800";
    case "Event":
      return "bg-blue-100 text-blue-800";
    case "Trip":
      return "bg-green-100 text-green-800";
    case "Reminder":
      return "bg-yellow-100 text-yellow-900";
  }
}

export default function CalendarPage() {
  const eventsSorted = [...mockCalendarEvents].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#2888B8] to-[#1078A8] text-white py-14">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">Calendar</h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Closures, events, trips, and reminders. This page is currently powered by mock data and will be connected to the database later by Alex and Alexis.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-white text-[#2888B8] hover:bg-white/90">
              <Link href="/contact">Contact to Schedule</Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-[#2888B8] hover:bg-white/10">
              <Link href="/parent-resources">Parent Resources</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Filters (visual only for now until Alex and Alexis get around to implementing them) */}
      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {["All", "Closures", "Events", "Trips", "Reminders"].map((x,index) => (
              <Button
                key={x}
                type="button"
                variant={index === 0 ? "default" : "outline"}
                className={
                index === 0
                ? "bg-[#2888B8] hover:bg-[#1078A8]"
                : "text-gray-700"
                }
                disabled>
              {x}
              </Button>
            ))}
          </div>

          {/* Event List,*/}
          <div className="mt-6 grid gap-4">
            {eventsSorted.map((ev) => (
              <Card key={ev.id} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={typeStyles(ev.type)}>{ev.type}</Badge>
                        <Badge variant="outline" className="text-xs">{ev.audience}</Badge>
                      </div>

                      <h3 className="text-xl font-semibold mt-2 text-[#002040]">
                        {ev.title}
                      </h3>

                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(ev.date)}
                        {ev.time ? ` • ${ev.time}` : ""}
                        {ev.location ? ` • ${ev.location}` : ""}
                      </p>

                      {ev.description ? (
                        <p className="text-sm text-gray-700 mt-3">{ev.description}</p>
                      ) : null}
                    </div>

                    <div className="flex gap-2">
                      <Button asChild variant="outline">
                        <Link href="/contact">Ask about this</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom CTA */} {/* this is duplicated from the parent resources page, but we can decide later if we want to make it a shared component or just keep it duplicated since it's pretty simple */}
          <div className="mt-10 bg-white rounded-2xl p-8 shadow-sm border">
            <h2 className="text-2xl font-bold text-[#002040] mb-2">Want to schedule a tour?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl">
              Submit an inquiry and we’ll follow up to confirm a tour time, answer questions, and discuss next steps.
            </p>
            <Button asChild className="bg-[#E8A018] hover:bg-[#E08028] text-white">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}