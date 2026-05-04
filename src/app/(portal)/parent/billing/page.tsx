"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, CheckCircle, Clock, AlertCircle, Calendar } from "lucide-react";

type Invoice = {
  invoice_id: number;
  invoice_number: string;
  description: string | null;
  amount: number;
  amount_paid: number;
  balance: number;
  due_date: string;
  status: string;
  issued_at: string;
  child_name: string;
};

type EnrollmentChild = {
  child_id: number;
  child_name: string;
  programs: string;
  monthly_total: number;
};

const STATUS_COLOR: Record<string, string> = {
  paid: "bg-green-100 text-green-700 border-green-200",
  unpaid: "bg-blue-100 text-blue-700 border-blue-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  partial: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  paid: <CheckCircle className="text-green-600" size={18} />,
  unpaid: <Clock className="text-blue-600" size={18} />,
  overdue: <AlertCircle className="text-red-600" size={18} />,
  partial: <Clock className="text-yellow-600" size={18} />,
};

export default function ParentBillingPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      fetch(`/api/parent/billing?parentId=${user.id}`).then((r) => r.json()),
      fetch(`/api/finance/enrollment-summary?parentId=${user.id}`).then((r) => r.json()),
    ]).then(([billingData, enrollmentData]: [Invoice[], EnrollmentChild[]]) => {
      setInvoices(billingData);
      const total = enrollmentData.reduce((s, c) => s + Number(c.monthly_total), 0);
      setMonthlyTotal(total);
      setLoading(false);
    });
  }, [user?.id]);

  const totalPaid = invoices.reduce((s, i) => s + Number(i.amount_paid), 0);
  const totalOwed = invoices.reduce((s, i) => s + Number(i.balance), 0);

  // Unpaid invoice = real next due
  const nextDue = invoices
    .filter((i) => i.balance > 0)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

  // Projected next due: last invoice's due_date + 1 month
  const projectedNextDue = (() => {
    if (nextDue || monthlyTotal === 0) return null;
    const lastInvoice = invoices
      .filter((i) => i.status === "paid")
      .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0];
    if (!lastInvoice) return null;
    const d = new Date(lastInvoice.due_date);
    d.setMonth(d.getMonth() + 1);
    return { amount: monthlyTotal, date: d };
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Loading billing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#002040]">Billing &amp; Payments</h1>
        <p className="text-gray-600">View invoices, make payments, and download receipts</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
              <p className="text-xs text-gray-400">Across {invoices.filter(i => i.status === 'paid').length} invoices</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Balance Due</p>
              <p className={`text-2xl font-bold ${totalOwed > 0 ? "text-orange-600" : "text-green-600"}`}>
                ${totalOwed.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">{totalOwed > 0 ? "Outstanding balance" : "All caught up!"}</p>
            </div>
            <DollarSign className="text-orange-500" size={32} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Next Due</p>
              {nextDue ? (
                <>
                  <p className="text-2xl font-bold text-[#002040]">${Number(nextDue.balance).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{new Date(nextDue.due_date).toLocaleDateString()}</p>
                </>
              ) : projectedNextDue ? (
                <>
                  <p className="text-2xl font-bold text-[#002040]">${projectedNextDue.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">~{projectedNextDue.date.toLocaleDateString()} (est.)</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-gray-400">—</p>
                  <p className="text-xs text-gray-400">No upcoming balance</p>
                </>
              )}
            </div>
            <Calendar className="text-blue-500" size={32} />
          </CardContent>
        </Card>
      </div>

      {/* Invoice list */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="font-medium text-gray-600">No invoices found</p>
            <p className="text-sm text-gray-400">Billing details will appear here when invoices are available.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Card key={invoice.invoice_id} className="border-l-4 border-[#2888B8]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {STATUS_ICON[invoice.status]}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-[#002040]">{invoice.invoice_number}</p>
                        <Badge variant="outline" className={STATUS_COLOR[invoice.status]}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{invoice.child_name}</p>
                      {invoice.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{invoice.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Issued: {new Date(invoice.issued_at).toLocaleDateString()}</span>
                        <span className={invoice.status === "overdue" ? "text-red-600 font-medium" : ""}>
                          Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="font-bold text-[#002040]">${Number(invoice.amount).toFixed(2)}</p>
                    {Number(invoice.amount_paid) > 0 && (
                      <p className="text-xs text-green-600">Paid: ${Number(invoice.amount_paid).toFixed(2)}</p>
                    )}
                    {Number(invoice.balance) > 0 && (
                      <p className="text-xs text-red-600 font-medium">Due: ${Number(invoice.balance).toFixed(2)}</p>
                    )}
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
