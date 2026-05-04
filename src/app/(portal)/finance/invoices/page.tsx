"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Filter, Mail, DollarSign, AlertCircle, Plus, CheckCircle, Clock, X } from "lucide-react";

type InvoiceRow = {
  invoice_id: number;
  invoice_number: string;
  description: string | null;
  amount: number;
  amount_paid: number;
  balance: number;
  due_date: string;
  issued_at: string;
  status: string;
  parent_name: string;
  parent_email: string;
  child_name: string;
  parent_user_id: number;
};

type Parent = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
};

type EnrollmentChild = {
  child_id: number;
  child_name: string;
  programs: string;
  monthly_total: number;
};

const STATUS_BADGE: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  unpaid: "bg-gray-100 text-gray-800",
  overdue: "bg-red-100 text-red-800",
  partial: "bg-yellow-100 text-yellow-800",
};

const STATUS_FILTERS = ["All", "paid", "unpaid", "overdue", "partial"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function FinanceInvoices() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  // Generate Invoice dialog state
  const [genOpen, setGenOpen] = useState(false);
  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [children, setChildren] = useState<EnrollmentChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDesc, setInvoiceDesc] = useState("");
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  function loadInvoices() {
    fetch("/api/finance/invoices")
      .then((r) => r.json())
      .then((data) => {
        setInvoices(data);
        setLoading(false);
      });
  }

  function openGenDialog() {
    setGenOpen(true);
    setSelectedParentId("");
    setChildren([]);
    setSelectedChildId("");
    setInvoiceAmount("");
    setInvoiceDesc("");
    const nextMonth = new Date();
    nextMonth.setDate(1);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setInvoiceDueDate(nextMonth.toISOString().split("T")[0]);

    fetch("/api/users?role=parent")
      .then((r) => r.json())
      .then(setParents);
  }

  async function handleParentSelect(parentId: string) {
    setSelectedParentId(parentId);
    setSelectedChildId("");
    setInvoiceAmount("");
    setInvoiceDesc("");
    if (!parentId) { setChildren([]); return; }

    const data = await fetch(`/api/finance/enrollment-summary?parentId=${parentId}`).then((r) => r.json());
    setChildren(data);
  }

  function handleChildSelect(childId: string) {
    setSelectedChildId(childId);
    const child = children.find((c) => String(c.child_id) === childId);
    if (child) {
      setInvoiceAmount(Number(child.monthly_total).toFixed(2));
      const now = new Date();
      setInvoiceDesc(`Monthly tuition — ${child.programs} (${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()})`);
    }
  }

  async function handleGenerate() {
    if (!selectedParentId || !selectedChildId || !invoiceAmount || !invoiceDueDate) return;
    setGenLoading(true);
    await fetch("/api/finance/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentUserId: Number(selectedParentId),
        childId: Number(selectedChildId),
        amount: parseFloat(invoiceAmount),
        description: invoiceDesc || null,
        dueDate: invoiceDueDate,
      }),
    });
    setGenLoading(false);
    setGenOpen(false);
    loadInvoices();
  }

  async function markPaid(inv: InvoiceRow) {
    await fetch(`/api/finance/invoices/${inv.invoice_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", amountPaid: inv.amount }),
    });
    loadInvoices();
  }

  async function markOverdue(inv: InvoiceRow) {
    await fetch(`/api/finance/invoices/${inv.invoice_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "overdue" }),
    });
    loadInvoices();
  }

  function exportCSV() {
    const headers = ["Invoice #", "Parent", "Child", "Issued", "Due Date", "Status", "Total", "Paid", "Balance"];
    const rows = filtered.map((i) => [
      i.invoice_number,
      i.parent_name,
      i.child_name,
      new Date(i.issued_at).toLocaleDateString(),
      new Date(i.due_date).toLocaleDateString(),
      i.status,
      `$${Number(i.amount).toFixed(2)}`,
      `$${Number(i.amount_paid).toFixed(2)}`,
      `$${Number(i.balance).toFixed(2)}`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gbd-invoices-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch =
      inv.parent_name.toLowerCase().includes(q) ||
      inv.child_name.toLowerCase().includes(q) ||
      inv.invoice_number.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totals = {
    billed: invoices.reduce((s, i) => s + Number(i.amount), 0),
    collected: invoices.reduce((s, i) => s + Number(i.amount_paid), 0),
    outstanding: invoices.reduce((s, i) => s + Number(i.balance), 0),
    overdue: invoices.filter((i) => i.status === "overdue").length,
  };

  const countByStatus = (s: string) => invoices.filter((i) => i.status === s).length;

  if (loading) {
    return <div className="flex items-center justify-center p-12"><p className="text-gray-500">Loading invoices...</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#002040] mb-2">Invoices</h1>
          <p className="text-gray-600">Manage all parent invoices and payments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2" size={16} />Export CSV
          </Button>
          <Button className="bg-[#2888B8] hover:bg-[#1078A8]" onClick={openGenDialog}>
            <Plus className="mr-2" size={16} />Generate Invoice
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Total Billed</span>
              <DollarSign className="text-[#2888B8]" size={18} />
            </div>
            <p className="text-2xl font-bold text-[#002040]">${totals.billed.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-500">{invoices.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Collected</span>
              <CheckCircle className="text-green-600" size={18} />
            </div>
            <p className="text-2xl font-bold text-green-600">${totals.collected.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-500">{countByStatus("paid")} paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Outstanding</span>
              <Clock className="text-orange-600" size={18} />
            </div>
            <p className="text-2xl font-bold text-orange-600">${totals.outstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-500">{invoices.filter((i) => i.balance > 0).length} with balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Overdue</span>
              <AlertCircle className="text-red-600" size={18} />
            </div>
            <p className="text-2xl font-bold text-red-600">{totals.overdue}</p>
            <p className="text-xs text-gray-500">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by parent, child, or invoice number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={statusFilter === s ? "default" : "outline"}
                  onClick={() => setStatusFilter(s)}
                  className={statusFilter === s ? "bg-[#2888B8] hover:bg-[#1078A8]" : ""}
                >
                  <Filter className="mr-1" size={13} />
                  {s === "All" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                  {s !== "All" && (
                    <Badge variant="secondary" className="ml-1.5 text-xs">{countByStatus(s)}</Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              {invoices.length === 0 ? "No invoices yet. Generate one to get started." : "No invoices match your search."}
            </CardContent>
          </Card>
        ) : (
          filtered.map((inv) => (
            <Card key={inv.invoice_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-lg font-bold text-[#002040]">{inv.invoice_number}</p>
                      <Badge className={STATUS_BADGE[inv.status]}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-x-6 gap-y-0.5 text-sm text-gray-600">
                      <span><strong className="text-gray-700">Parent:</strong> {inv.parent_name}</span>
                      <span><strong className="text-gray-700">Child:</strong> {inv.child_name}</span>
                      <span><strong className="text-gray-700">Issued:</strong> {new Date(inv.issued_at).toLocaleDateString()}</span>
                      <span className={inv.status === "overdue" ? "text-red-600 font-medium" : ""}>
                        <strong className="text-gray-700">Due:</strong> {new Date(inv.due_date).toLocaleDateString()}
                      </span>
                    </div>
                    {inv.description && <p className="text-xs text-gray-400 mt-1">{inv.description}</p>}
                  </div>

                  <div className="flex gap-6 lg:gap-8 text-center">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Total</p>
                      <p className="text-lg font-bold text-[#002040]">${Number(inv.amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Paid</p>
                      <p className="text-lg font-semibold text-green-600">${Number(inv.amount_paid).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Balance</p>
                      <p className={`text-lg font-semibold ${Number(inv.balance) > 0 ? "text-orange-600" : "text-gray-400"}`}>
                        ${Number(inv.balance).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[130px]">
                    {inv.status !== "paid" && (
                      <Button size="sm" className="bg-[#489858] hover:bg-[#378848]" onClick={() => markPaid(inv)}>
                        <CheckCircle className="mr-1.5" size={14} />Mark Paid
                      </Button>
                    )}
                    {inv.status === "unpaid" && (
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => markOverdue(inv)}>
                        <AlertCircle className="mr-1.5" size={14} />Mark Overdue
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a href={`mailto:${inv.parent_email}?subject=Invoice ${inv.invoice_number} — GBD&body=Hi ${inv.parent_name.split(" ")[0]},%0A%0AThis is a reminder regarding invoice ${inv.invoice_number} for $${Number(inv.amount).toFixed(2)} due on ${new Date(inv.due_date).toLocaleDateString()}.%0A%0APlease reach out if you have any questions.%0A%0AThank you!`}>
                        <Mail className="mr-1.5" size={14} />Contact
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Generate Invoice Dialog */}
      {genOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-[#002040]">Generate Invoice</h2>
              <button onClick={() => setGenOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Parent</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2888B8]"
                  value={selectedParentId}
                  onChange={(e) => handleParentSelect(e.target.value)}
                >
                  <option value="">— Choose a parent —</option>
                  {parents.map((p) => (
                    <option key={p.user_id} value={p.user_id}>
                      {p.first_name} {p.last_name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              {children.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Child</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2888B8]"
                    value={selectedChildId}
                    onChange={(e) => handleChildSelect(e.target.value)}
                  >
                    <option value="">— Choose a child —</option>
                    {children.map((c) => (
                      <option key={c.child_id} value={c.child_id}>
                        {c.child_name} — ${Number(c.monthly_total).toFixed(2)}/mo ({c.programs})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedParentId && children.length === 0 && (
                <p className="text-sm text-gray-500 italic">No enrolled children found for this parent.</p>
              )}

              {selectedChildId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Input
                      value={invoiceDesc}
                      onChange={(e) => setInvoiceDesc(e.target.value)}
                      placeholder="e.g. Monthly tuition — May 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <Input
                      type="date"
                      value={invoiceDueDate}
                      onChange={(e) => setInvoiceDueDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <Button variant="outline" onClick={() => setGenOpen(false)}>Cancel</Button>
              <Button
                className="bg-[#2888B8] hover:bg-[#1078A8]"
                onClick={handleGenerate}
                disabled={!selectedParentId || !selectedChildId || !invoiceAmount || !invoiceDueDate || genLoading}
              >
                {genLoading ? "Generating..." : "Generate Invoice"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
