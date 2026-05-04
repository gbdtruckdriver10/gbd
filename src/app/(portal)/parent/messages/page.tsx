"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, User, Inbox } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type Message = {
  message_id: number;
  subject: string;
  body: string;
  sent_at: string;
  is_read: boolean;
  sender_user_id: number;
  receiver_user_id: number;
  sender_name: string;
  sender_role: string;
  receiver_name: string;
  receiver_role: string;
};

type StaffMember = {
  user_id: number;
  first_name: string;
  last_name: string;
  role: string;
};

type Announcement = {
  announcement_id: number;
  title: string;
  body: string;
  publish_date: string;
  author: string;
  priority: string;
  audience: string;
};

function MessageCard({ msg, onRead }: { msg: Message; onRead: (id: number) => void }) {
  const [open, setOpen] = useState(false);

  const handleOpen = async () => {
    setOpen((v) => !v);
    if (!msg.is_read) {
      onRead(msg.message_id);
      await fetch(`/api/messages/${msg.message_id}`, { method: "PATCH" });
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-gray-50 ${!msg.is_read ? "border-l-4 border-l-[#2888B8]" : ""}`}
      onClick={handleOpen}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#2888B8]/10 flex items-center justify-center shrink-0">
              <User size={16} className="text-[#2888B8]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#002040] text-sm">
                {msg.sender_name}
                <Badge variant="outline" className="ml-2 text-[10px]">{msg.sender_role}</Badge>
              </p>
              <p className={`text-sm mt-0.5 ${!msg.is_read ? "font-semibold text-[#002040]" : "text-gray-700"}`}>
                {msg.subject}
              </p>
              {open ? (
                <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{msg.body}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{msg.body}</p>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-400 shrink-0">{timeAgo(msg.sent_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function timeAgo(ts: string) {
  const normalized = ts.endsWith("Z") || ts.includes("+") ? ts : ts + "Z";
  const diff = Date.now() - new Date(normalized).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function ParentMessages() {
  const { user } = useAuth();

  // --- data sources kept separate per partner's note ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    Promise.all([
      fetch(`/api/messages?userId=${user.id}`).then((r) => r.json()),
      fetch("/api/admin/announcements").then((r) => r.json()),
      fetch("/api/users?role=staff").then((r) => r.json()),
      fetch("/api/users?role=admin").then((r) => r.json()),
      fetch("/api/users?role=cfo").then((r) => r.json()),
    ]).then(([msgs, anns, staffList, adminList, cfoList]) => {
      setMessages(msgs);
      setAnnouncements(
        (anns as Announcement[])
          .filter((a) => a.audience === "parents" || a.audience === "all")
          .slice(0, 5)
      );
      setStaff([...staffList, ...adminList, ...cfoList]);
      setLoading(false);
    });
  }, [user?.id]);

  const inbox = messages.filter((m) => m.receiver_user_id === Number(user?.id));
  const sent = messages.filter((m) => m.sender_user_id === Number(user?.id));
  const unreadCount = inbox.filter((m) => !m.is_read).length;

  const handleSend = async () => {
    if (isSending) return;
    if (!receiverId) { toast.error("Please select a recipient"); return; }
    if (!body.trim()) { toast.error("Please enter a message"); return; }

    setIsSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: Number(user?.id),
        receiverId: Number(receiverId),
        subject: subject.trim() || "(no subject)",
        body: body.trim(),
      }),
    });

    if (res.ok) {
      const newMsg = await res.json();
      const selected = staff.find((s) => s.user_id === Number(receiverId));
      setMessages((prev) => [
        {
          ...newMsg,
          subject: subject.trim() || "(no subject)",
          body: body.trim(),
          is_read: false,
          sender_user_id: Number(user?.id),
          receiver_user_id: Number(receiverId),
          sender_name: user?.name ?? "",
          sender_role: "parent",
          receiver_name: selected ? `${selected.first_name} ${selected.last_name}` : "",
          receiver_role: selected?.role ?? "staff",
        },
        ...prev,
      ]);
      toast.success("Message sent!");
      setSubject("");
      setBody("");
      setReceiverId("");
    } else {
      toast.error("Failed to send message. Please try again.");
    }
    setIsSending(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002040] mb-2">Messages & Announcements</h1>
        <p className="text-gray-600">Stay connected with teachers and center updates</p>
      </div>

      {/* Compose — data source: /api/messages POST */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-[#002040] flex items-center gap-2">
            <Send className="text-[#2888B8]" size={22} />
            Send a Message
          </h2>

          <div>
            <Label>To</Label>
            <Select value={receiverId} onValueChange={setReceiverId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.user_id} value={String(s.user_id)}>
                    {s.first_name} {s.last_name} ({s.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Subject</Label>
            <Input
              className="mt-1"
              placeholder="e.g. Question about pickup"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
            />
          </div>

          <div>
            <Label>Message</Label>
            <Textarea
              className="mt-1"
              placeholder="Type your message to the center staff..."
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isSending}
            />
          </div>

          <Button
            onClick={handleSend}
            className="bg-[#2888B8] hover:bg-[#1078A8]"
            disabled={isSending || !body.trim()}
          >
            <Send className="mr-2" size={16} />
            {isSending ? "Sending..." : "Send Message"}
          </Button>
        </CardContent>
      </Card>

      {/* Inbox — data source: /api/messages GET */}
      <div>
        <h2 className="text-2xl font-bold text-[#002040] mb-4 flex items-center gap-2">
          <Inbox size={22} />
          Inbox
          {unreadCount > 0 && (
            <Badge className="bg-[#E05830] ml-1">{unreadCount} unread</Badge>
          )}
        </h2>

        {loading ? (
          <p className="text-sm text-gray-500">Loading messages...</p>
        ) : inbox.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500 text-sm">
              No messages received yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {inbox.map((msg) => (
              <MessageCard
                key={msg.message_id}
                msg={msg}
                onRead={(id) =>
                  setMessages((prev) =>
                    prev.map((m) => (m.message_id === id ? { ...m, is_read: true } : m))
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Sent — data source: /api/messages GET */}
      {sent.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-[#002040] mb-4">Sent Messages</h2>
          <div className="space-y-3">
            {sent.map((msg) => (
              <Card key={msg.message_id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">
                        To: <span className="font-medium text-[#002040]">{msg.receiver_name}</span>
                      </p>
                      <p className="text-sm font-semibold text-[#002040] mt-0.5">{msg.subject}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{msg.body}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{timeAgo(msg.sent_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Announcements — data source: /api/admin/announcements GET */}
      <div>
        <h2 className="text-2xl font-bold text-[#002040] mb-4">Announcements</h2>
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500 text-sm">
              No announcements right now.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <Card key={ann.announcement_id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#2888B8]/10 rounded-full flex items-center justify-center shrink-0">
                      <MessageSquare className="text-[#2888B8]" size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <h3 className="text-base font-bold text-[#002040]">{ann.title}</h3>
                        {ann.priority === "high" && (
                          <Badge variant="destructive">Important</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{ann.body}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User size={12} />
                        <span>{ann.author}</span>
                        <span>•</span>
                        <span>{new Date(ann.publish_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
