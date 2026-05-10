"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Trash2, Inbox } from "lucide-react";
import { toast } from "sonner";

type Inquiry = {
  inquiry_id: number;
  name: string;
  email: string;
  phone: string;
  inquiry_type: string;
  message: string;
  created_at: string;
};

const TYPE_LABELS: Record<string, string> = {
  tour: "Schedule a Tour",
  enrollment: "Enrollment Application",
  programs: "Program Information",
  general: "General Question",
};

function timeAgo(ts: string) {
  const normalized = ts.endsWith("Z") || ts.includes("+") ? ts : ts + "Z";
  const diff = Date.now() - new Date(normalized).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ContactInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/contact-inquiries")
      .then((r) => r.json())
      .then((data) => {
        setInquiries(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: number) => {
    await fetch("/api/admin/contact-inquiries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setInquiries((prev) => prev.filter((i) => i.inquiry_id !== id));
    toast.success("Inquiry deleted");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002040] mb-2">Contact Inquiries</h1>
        <p className="text-gray-600">Messages submitted through the public contact form</p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading inquiries...</p>
      ) : inquiries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Inbox className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="text-gray-500">No inquiries yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <Card
              key={inq.inquiry_id}
              className="cursor-pointer transition-colors hover:bg-gray-50"
              onClick={() => setExpanded(expanded === inq.inquiry_id ? null : inq.inquiry_id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="font-semibold text-[#002040]">{inq.name}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {TYPE_LABELS[inq.inquiry_type] ?? inq.inquiry_type}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Mail size={11} />{inq.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={11} />{inq.phone}
                      </span>
                    </div>

                    {expanded === inq.inquiry_id ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2" onClick={(e) => e.stopPropagation()}>
                        {inq.message}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 line-clamp-1">{inq.message}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {inq.created_at && (
                      <span className="text-xs text-gray-400">{timeAgo(inq.created_at)}</span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-red-500"
                      onClick={(e) => { e.stopPropagation(); handleDelete(inq.inquiry_id); }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
