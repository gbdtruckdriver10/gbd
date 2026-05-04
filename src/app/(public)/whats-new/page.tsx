"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, AlertCircle, Info, CheckCircle } from "lucide-react";

type Announcement = {
  announcement_id: number;
  title: string;
  body: string;
  audience: string;
  priority: string;
  publish_date: string;
  author: string;
};

export default function WhatsNewPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/admin/announcements")
      .then((r) => r.json())
      .then((data) => { setAnnouncements(data); setLoading(false); });
  }, []);

  const filteredAnnouncements = announcements.filter(
    (ann) => filter === "all" || ann.audience === filter || ann.audience === "all"
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertCircle className="text-[#E05830]" size={20} />;
      case "normal": return <Info className="text-[#2888B8]" size={20} />;
      default: return <CheckCircle className="text-[#489858]" size={20} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-[#E05830]/10 text-[#E05830] border-[#E05830]/20";
      case "normal": return "bg-[#2888B8]/10 text-[#2888B8] border-[#2888B8]/20";
      default: return "bg-[#489858]/10 text-[#489858] border-[#489858]/20";
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-[#2888B8] to-[#1078A8] text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">What&apos;s New at GBD</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Stay updated with the latest news, announcements, and updates from our center
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="flex flex-wrap gap-3 mb-8">
            <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} className={filter === "all" ? "bg-[#2888B8]" : ""}>Everyone</Button>
            <Button variant={filter === "parents" ? "default" : "outline"} onClick={() => setFilter("parents")} className={filter === "parents" ? "bg-[#489858]" : ""}>For Parents</Button>
            <Button variant={filter === "staff" ? "default" : "outline"} onClick={() => setFilter("staff")} className={filter === "staff" ? "bg-[#E8A018]" : ""}>For Staff</Button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading announcements...</p>
          ) : (
            <div className="space-y-6">
              {filteredAnnouncements.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Info className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600">No announcements in this category</p>
                  </CardContent>
                </Card>
              ) : (
                filteredAnnouncements.map((a) => (
                  <Card key={a.announcement_id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">{getPriorityIcon(a.priority)}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h3 className="text-xl font-bold text-[#002040]">{a.title}</h3>
                            <Badge variant="outline" className={getPriorityColor(a.priority)}>
                              {a.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-4 leading-relaxed">{a.body}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} />
                              <span>{formatDate(a.publish_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User size={16} />
                              <span>{a.author}</span>
                            </div>
                            <Badge variant="secondary" className="capitalize">
                              {a.audience === "all" ? "Everyone" : a.audience}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
