"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";

type AgingRow = {
  invoice_id: number;
  invoice_number: string;
  due_date: string;
  balance: number;
  days_overdue: number;
  parent_name: string;
};

type ReportData = {
  summary: {
    total_billed: number;
    total_collected: number;
    total_outstanding: number;
    invoice_count: number;
    paid_count: number;
    unpaid_count: number;
  };
  aging: {
    current: AgingRow[];
    days30: AgingRow[];
    days60: AgingRow[];
    days61Plus: AgingRow[];
  };
};

function buildMonthOptions() {
  const opts: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "long", year: "numeric" });
    opts.push({ value, label });
  }
  return opts;
}

const monthOptions = buildMonthOptions();

export default function FinanceReports() {
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback((month: string) => {
    setLoading(true);
    fetch(`/api/finance/reports?month=${month}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchReport(selectedMonth);
  }, [selectedMonth, fetchReport]);

  const summary = data?.summary ?? {
    total_billed: 0,
    total_collected: 0,
    total_outstanding: 0,
    invoice_count: 0,
    paid_count: 0,
    unpaid_count: 0,
  };

  const aging = data?.aging ?? { current: [], days30: [], days60: [], days61Plus: [] };

  const collectionRate =
    summary.total_billed > 0
      ? ((summary.total_collected / summary.total_billed) * 100).toFixed(1)
      : "0.0";

  const avgInvoice =
    summary.invoice_count > 0
      ? (summary.total_billed / summary.invoice_count).toFixed(2)
      : "0.00";

  const avgPayment =
    summary.paid_count > 0
      ? (summary.total_collected / summary.paid_count).toFixed(2)
      : "0.00";

  const agingTotals = {
    current: aging.current.reduce((s, r) => s + Number(r.balance), 0),
    days30: aging.days30.reduce((s, r) => s + Number(r.balance), 0),
    days60: aging.days60.reduce((s, r) => s + Number(r.balance), 0),
    days61Plus: aging.days61Plus.reduce((s, r) => s + Number(r.balance), 0),
  };

  const exportAgingReport = () => {
    const headers = ["Parent", "Invoice #", "Due Date", "Days Overdue", "Balance", "Category"];
    const rows: string[][] = [];
    const addRows = (cat: string, list: AgingRow[]) =>
      list.forEach((r) =>
        rows.push([
          r.parent_name,
          r.invoice_number,
          r.due_date,
          Math.max(0, r.days_overdue).toString(),
          `$${Number(r.balance).toFixed(2)}`,
          cat,
        ])
      );
    addRows("Current", aging.current);
    addRows("1-30 Days", aging.days30);
    addRows("31-60 Days", aging.days60);
    addRows("61+ Days", aging.days61Plus);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aging-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Aging report exported");
  };

  const exportMonthlySummary = () => {
    const headers = ["Metric", "Value"];
    const rows = [
      ["Total Billed", `$${summary.total_billed.toFixed(2)}`],
      ["Total Collected", `$${summary.total_collected.toFixed(2)}`],
      ["Total Outstanding", `$${summary.total_outstanding.toFixed(2)}`],
      ["Invoice Count", summary.invoice_count.toString()],
      ["Paid Invoices", summary.paid_count.toString()],
      ["Unpaid Invoices", summary.unpaid_count.toString()],
      ["Collection Rate", `${collectionRate}%`],
      ["Average Invoice Value", `$${avgInvoice}`],
      ["Average Payment Value", `$${avgPayment}`],
    ];
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monthly-summary-${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Monthly summary exported");
  };

  const agingCategories = [
    { title: "Current (Not Yet Due)", data: aging.current, headerClass: "bg-blue-50", color: "blue" },
    { title: "1-30 Days Overdue", data: aging.days30, headerClass: "bg-yellow-50", color: "yellow" },
    { title: "31-60 Days Overdue", data: aging.days60, headerClass: "bg-orange-50", color: "orange" },
    { title: "61+ Days Overdue", data: aging.days61Plus, headerClass: "bg-red-50", color: "red" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002040] mb-2">Financial Reports</h1>
        <p className="text-gray-600">Detailed financial analytics and exports</p>
      </div>

      {/* Monthly Summary */}
      <Card className="border-l-4 border-[#2888B8]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Calendar className="text-[#2888B8]" size={24} />
              <div>
                <h3 className="text-xl font-bold text-[#002040]">Monthly Summary</h3>
                <p className="text-sm text-gray-600">Select a month to view details</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                {monthOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <Button variant="outline" onClick={exportMonthlySummary} disabled={loading}>
                <Download className="mr-2" size={16} />
                Export
              </Button>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm py-4">Loading...</p>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="text-[#2888B8]" size={20} />
                    <span className="text-sm text-gray-600">Total Billed</span>
                  </div>
                  <p className="text-2xl font-bold text-[#002040]">
                    ${summary.total_billed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{summary.invoice_count} invoices</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-green-600" size={20} />
                    <span className="text-sm text-gray-600">Collected</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ${summary.total_collected.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{collectionRate}% collection rate</p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="text-orange-600" size={20} />
                    <span className="text-sm text-gray-600">Outstanding</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    ${summary.total_outstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{summary.unpaid_count} unpaid</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold mb-2 text-[#002040]">Payment Status Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Paid</span>
                      <Badge className="bg-green-100 text-green-800">{summary.paid_count}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Unpaid / Partial</span>
                      <Badge className="bg-orange-100 text-orange-800">{summary.unpaid_count}</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold mb-2 text-[#002040]">Average Values</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Invoice</span>
                      <span className="font-semibold">${avgInvoice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Payment</span>
                      <span className="font-semibold text-green-600">${avgPayment}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Aging Report */}
      <Card className="border-l-4 border-[#E05830]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#002040]">Accounts Receivable Aging</h3>
              <p className="text-sm text-gray-600">Track overdue invoices by aging category</p>
            </div>
            <Button variant="outline" onClick={exportAgingReport} disabled={loading}>
              <Download className="mr-2" size={16} />
              Export Aging Report
            </Button>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Current</h4>
              <p className="text-2xl font-bold text-[#002040]">${agingTotals.current.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{aging.current.length} invoices</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">1-30 Days</h4>
              <p className="text-2xl font-bold text-[#E8A018]">${agingTotals.days30.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{aging.days30.length} invoices</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">31-60 Days</h4>
              <p className="text-2xl font-bold text-orange-600">${agingTotals.days60.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{aging.days60.length} invoices</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">61+ Days</h4>
              <p className="text-2xl font-bold text-red-600">${agingTotals.days61Plus.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{aging.days61Plus.length} invoices</p>
            </div>
          </div>

          <div className="space-y-4">
            {agingCategories.map(
              (cat) =>
                cat.data.length > 0 && (
                  <div key={cat.title} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className={`${cat.headerClass} px-4 py-2 border-b border-gray-200`}>
                      <h4 className="font-semibold text-sm">{cat.title}</h4>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {cat.data.map((row) => (
                        <div key={row.invoice_id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-[#002040]">{row.parent_name}</p>
                              <p className="text-sm text-gray-600">
                                {row.invoice_number} • Due:{" "}
                                {new Date(row.due_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#002040]">
                                ${Number(row.balance).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {cat.color === "blue"
                                  ? "Not yet due"
                                  : `${Math.max(0, row.days_overdue)} days`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}
            {!loading &&
              aging.current.length === 0 &&
              aging.days30.length === 0 &&
              aging.days60.length === 0 &&
              aging.days61Plus.length === 0 && (
                <p className="text-center text-gray-500 py-6">No outstanding invoices.</p>
              )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-[#002040] mb-2">About These Reports</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• <strong>Monthly Summary:</strong> Total billed, collected, and outstanding for the selected month</li>
            <li>• <strong>Aging Report:</strong> All unpaid invoices bucketed by overdue age (Current, 1-30, 31-60, 61+ days)</li>
            <li>• <strong>CSV Export:</strong> Download either report for accounting software or spreadsheet analysis</li>
            <li>• <strong>Collection Rate:</strong> Percentage of billed amount successfully collected in the month</li>
            <li>• <strong>Real-time Data:</strong> All figures reflect current invoice and payment status in the database</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
