"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, TrendingUp, Users, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type Stats = {
  totalEnrolled: number;
  totalCapacity: number;
  capacityPercent: number;
  availableSpots: number;
  programEnrollment: { program_name: string; enrolled: number }[];
};

type ExportType = "enrollment" | "programs" | "full";

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminReports() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("current-year");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportType, setExportType] = useState<ExportType>("enrollment");

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); });
  }, []);

  const handleExport = () => {
    if (!stats) return;
    let csvContent = "";
    let filename = "";

    if (exportType === "enrollment") {
      csvContent = "Metric,Value\nTotal Enrolled," + stats.totalEnrolled + "\nTotal Capacity," + stats.totalCapacity + "\nCapacity %," + stats.capacityPercent + "%\nAvailable Spots," + stats.availableSpots;
      filename = "GBD_Enrollment_Report.csv";
    } else if (exportType === "programs") {
      csvContent = "Program,Enrolled\n" + stats.programEnrollment.map((p) => `${p.program_name},${p.enrolled}`).join("\n");
      filename = "GBD_Program_Enrollment.csv";
    } else {
      csvContent = [
        "Metric,Value",
        `Total Enrolled,${stats.totalEnrolled}`,
        `Capacity,${stats.capacityPercent}%`,
        `Available Spots,${stats.availableSpots}`,
        `Total Programs,${stats.programEnrollment.length}`,
        "",
        "Program,Enrolled",
        ...stats.programEnrollment.map((p) => `${p.program_name},${p.enrolled}`),
      ].join("\n");
      filename = "GBD_Full_Report.csv";
    }

    downloadCsv(filename, csvContent);
    toast.success(`${filename} downloaded successfully.`);
    setExportOpen(false);
  };

  if (loading || !stats) {
    return <div className="flex items-center justify-center p-12"><p className="text-gray-500">Loading reports...</p></div>;
  }

  const programChartData = stats.programEnrollment.map((p) => ({
    name: p.program_name.replace(" Childcare", "").replace(" Ballers", "").replace(" Explorers", ""),
    enrolled: Number(p.enrolled),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[#002040]">Reports & Analytics</h1>
          <p className="text-gray-600">View insights and generate reports</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="current-year">2025-2026</SelectItem>
              <SelectItem value="last-year">2024-2025</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setExportOpen(true)}>
            <Download className="mr-2" size={16} />Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="mx-auto mb-2 text-[#2888B8]" size={32} />
            <p className="mb-1 text-2xl font-bold text-[#002040]">{stats.totalEnrolled}</p>
            <p className="text-sm text-gray-600">Total Enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="mx-auto mb-2 text-[#489858]" size={32} />
            <p className="mb-1 text-2xl font-bold text-[#002040]">{stats.capacityPercent}%</p>
            <p className="text-sm text-gray-600">Capacity</p>
            <p className="mt-1 text-xs text-[#489858]">{stats.availableSpots} spots available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="mx-auto mb-2 text-[#E8A018]" size={32} />
            <p className="mb-1 text-2xl font-bold text-[#002040]">{stats.availableSpots}</p>
            <p className="text-sm text-gray-600">Available Spots</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="mx-auto mb-2 text-[#E05830]" size={32} />
            <p className="mb-1 text-2xl font-bold text-[#002040]">{stats.programEnrollment.length}</p>
            <p className="text-sm text-gray-600">Active Programs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-xl font-bold text-[#002040]">Program Enrollment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={programChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar dataKey="enrolled" fill="#489858" name="Enrolled" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="text-[#002040]">Export Report</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">Select the type of report to export as CSV.</p>
            <div className="space-y-2">
              {[
                { value: "enrollment", label: "Enrollment Summary", desc: "Total enrolled, capacity stats" },
                { value: "programs", label: "Program Enrollment", desc: "Per-program breakdown" },
                { value: "full", label: "Full Report", desc: "All data combined" },
              ].map((option) => (
                <div
                  key={option.value}
                  onClick={() => setExportType(option.value as ExportType)}
                  className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${exportType === option.value ? "border-[#2888B8] bg-[#2888B8]/5" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={exportType === option.value ? "text-[#2888B8]" : "text-gray-400"} size={20} />
                    <div>
                      <p className="font-medium text-[#002040]">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </div>
                    {exportType === option.value && <CheckCircle className="ml-auto text-[#2888B8]" size={18} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportOpen(false)}>Cancel</Button>
            <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={handleExport}>
              <Download className="mr-2" size={16} />Download CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
