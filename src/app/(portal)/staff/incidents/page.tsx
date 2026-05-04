"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type Child = { child_id: number; first_name: string; last_name: string; classroom_name: string };
type Incident = {
  incident_id: number;
  child_id: number;
  child_name: string;
  incident_date: string;
  incident_type: string;
  description: string;
  action_taken: string | null;
  parent_notified: boolean;
  incident_status: string;
  reported_by: string;
};

export default function StaffIncidents() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({ childId: "", type: "", description: "", actionTaken: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/staff/incidents")
      .then((r) => r.json())
      .then(({ children, incidents }) => {
        setChildren(children);
        setIncidents(incidents);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.childId || !formData.type || !formData.description.trim() || !formData.actionTaken.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await fetch("/api/staff/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: Number(formData.childId),
          staff_user_id: user?.id,
          incident_type: formData.type,
          description: formData.description,
          action_taken: formData.actionTaken,
        }),
      });

      const child = children.find((c) => String(c.child_id) === formData.childId);
      const newIncident: Incident = {
        incident_id: Date.now(),
        child_id: Number(formData.childId),
        child_name: child ? `${child.first_name} ${child.last_name}` : "Unknown",
        incident_date: new Date().toISOString(),
        incident_type: formData.type,
        description: formData.description,
        action_taken: formData.actionTaken,
        parent_notified: false,
        incident_status: "open",
        reported_by: "You",
      };
      setIncidents((prev) => [newIncident, ...prev]);

      toast.success("Incident report submitted and parent notified");
      setFormData({ childId: "", type: "", description: "", actionTaken: "" });
    } catch {
      toast.error("Failed to submit incident report");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-[#002040]">Incident Reports</h1>
        <p className="text-gray-600">Document and manage incident reports</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#002040]">
              <AlertCircle className="text-[#E05830]" size={24} />
              Report New Incident
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Child *</Label>
                <Select value={formData.childId} onValueChange={(v) => setFormData({ ...formData, childId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select child..." />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.child_id} value={String(child.child_id)}>
                        {child.first_name} {child.last_name} | {child.classroom_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Incident Type *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor_injury">Minor Injury</SelectItem>
                    <SelectItem value="illness">Illness</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="allergic_reaction">Allergic Reaction</SelectItem>
                    <SelectItem value="accident">Accident</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  rows={4}
                  placeholder="Describe what happened in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <Label>Action Taken *</Label>
                <Textarea
                  rows={3}
                  placeholder="Describe the action taken..."
                  value={formData.actionTaken}
                  onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                />
              </div>

              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
                <strong>Note:</strong> Parents will be automatically notified once you submit this report.
              </div>

              <Button type="submit" className="w-full bg-[#E05830] hover:bg-[#c74a26]" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Incident Report"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#002040]">
              <FileText className="text-[#2888B8]" size={24} />
              Recent Incidents
            </h3>
            <div className="space-y-4">
              {incidents.length === 0 ? (
                <p className="text-center text-sm text-gray-500">No incidents on record.</p>
              ) : (
                incidents.map((incident) => (
                  <div key={incident.incident_id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-semibold text-[#002040]">{incident.child_name}</h4>
                      <Badge variant="outline" className="bg-orange-100 text-orange-700">
                        {incident.incident_type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="text-gray-600">
                        <span className="font-medium">Date: </span>
                        {new Date(incident.incident_date).toLocaleString()}
                      </div>
                      <div>
                        <p className="mb-1 font-medium text-gray-700">Description:</p>
                        <p className="text-gray-600">{incident.description}</p>
                      </div>
                      {incident.action_taken && (
                        <div>
                          <p className="mb-1 font-medium text-gray-700">Action Taken:</p>
                          <p className="text-gray-600">{incident.action_taken}</p>
                        </div>
                      )}
                      <div className="border-t pt-2">
                        <span className="text-gray-600">Reported by: </span>
                        <span className="font-medium">{incident.reported_by}</span>
                        {incident.parent_notified && (
                          <Badge className="ml-2 border-green-200 bg-green-100 text-green-700">
                            Parent Notified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
