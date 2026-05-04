export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // "7:00 AM - 6:00 PM"
  type: "Closure" | "Event" | "Trip" | "Reminder";
  audience: "Public" | "Parents" | "Staff";
  location?: string;
  description?: string;
};
/*Alex and Alexis when you add Supabase/DB:
Replace mockCalendarEvents with getCalendarEvents() that fetches from DB
Keep the UI the same, just swap out the data source or something. The CalendarEvent type should match the DB schema for events. */
export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "ev-1",
    title: "Daycare Closed — Staff Training",
    date: "2026-06-05",
    time: "All Day",
    type: "Closure",
    audience: "Public",
    description: "GBD will be closed for staff training and classroom setup.",
  },
  {
    id: "ev-2",
    title: "Summer Camp Orientation",
    date: "2026-06-12",
    time: "5:30 PM - 6:30 PM",
    type: "Event",
    audience: "Parents",
    location: "GBD Main Room",
    description: "Meet the camp team, review schedule, and ask questions.",
  },
  {
    id: "ev-3",
    title: "Basketball Skills Day",
    date: "2026-06-18",
    time: "3:30 PM - 4:30 PM",
    type: "Event",
    audience: "Parents",
    location: "Indoor Gym Area",
    description: "A fun skills showcase for our Basketball program.",
  },
  {
    id: "ev-4",
    title: "Field Trip — Local Children’s Museum",
    date: "2026-06-25",
    time: "9:30 AM - 2:00 PM",
    type: "Trip",
    audience: "Parents",
    description: "Permission slips required. Drop-off/pick-up times will be confirmed.",
  },
  {
    id: "ev-5",
    title: "Reminder: Immunization Form Due",
    date: "2026-06-30",
    type: "Reminder",
    audience: "Parents",
    description: "Please upload or bring the latest immunization form.",
  },
];