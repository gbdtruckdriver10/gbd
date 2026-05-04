"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Eye, Calendar, Users, ArrowRight } from "lucide-react";
import { ChangePasswordCard } from "@/components/ChangePasswordCard";

type Summary = {
  total_billed: number;
  total_collected: number;
  total_outstanding: number;
  total_invoices: number;
  overdue_count: number;
  paid_count: number;
  active_families: number;
};

type InvoiceRow = {
  invoice_id: number;
  invoice_number: string;
  amount: number;
  amount_paid: number;
  balance: number;
  due_date: string;
  issued_at: string;
  status: string;
  parent_name: string;
  child_name: string;
};

const STATUS_BADGE: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  unpaid: "bg-gray-100 text-gray-800",
  overdue: "bg-red-100 text-red-800",
  partial: "bg-yellow-100 text-yellow-800",
};

export default function FinanceDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [needsAttention, setNeedsAttention] = useState<InvoiceRow[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setSummary(data.summary);
        setNeedsAttention(data.needsAttention);
        setRecentInvoices(data.recentInvoices);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center p-12"><p className="text-gray-500">Loading dashboard...</p></div>;
  }

  const collectionRate = summary && Number(summary.total_billed) > 0
    ? ((Number(summary.total_collected) / Number(summary.total_billed)) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#002040] mb-2">Finance Dashboard</h1>
          <p className="text-gray-600">Financial overview and invoice management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/finance/reports"><TrendingUp className="mr-2" size={16} />View Reports</Link>
          </Button>
          <Button className="bg-[#2888B8] hover:bg-[#1078A8]" asChild>
            <Link href="/finance/invoices"><Eye className="mr-2" size={16} />All Invoices</Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-[#2888B8]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Billed</span>
              <DollarSign className="text-[#2888B8]" size={24} />
            </div>
            <p className="text-3xl font-bold text-[#002040]">${Number(summary?.total_billed ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-500">{summary?.total_invoices ?? 0} total invoices</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#489858]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Collected</span>
              <CheckCircle className="text-[#489858]" size={24} />
            </div>
            <p className="text-3xl font-bold text-[#489858]">${Number(summary?.total_collected ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-500">{collectionRate}% collection rate</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#E8A018]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Outstanding</span>
              <TrendingUp className="text-[#E8A018]" size={24} />
            </div>
            <p className="text-3xl font-bold text-[#E8A018]">${Number(summary?.total_outstanding ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-500">{Number(summary?.total_invoices ?? 0) - Number(summary?.paid_count ?? 0)} invoices</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#E05830]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Overdue</span>
              <AlertCircle className="text-[#E05830]" size={24} />
            </div>
            <p className="text-3xl font-bold text-[#E05830]">{summary?.overdue_count ?? 0}</p>
            <p className="text-xs text-gray-500">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="text-[#2888B8]" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#002040]">{summary?.active_families ?? 0}</p>
              <p className="text-sm text-gray-600">Active Families</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Calendar className="text-[#489858]" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#002040]">{summary?.paid_count ?? 0}</p>
              <p className="text-sm text-gray-600">Paid Invoices</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Needs Attention */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#002040]">Needs Attention</h3>
              {needsAttention.length > 0 && <Badge variant="destructive">{needsAttention.length}</Badge>}
            </div>
            {needsAttention.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto mb-2 text-green-600" size={48} />
                <p className="text-gray-600">All invoices are up to date!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {needsAttention.map((inv) => (
                  <div key={inv.invoice_id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-[#002040]">{inv.parent_name}</p>
                        <Badge className={STATUS_BADGE[inv.status]}>{inv.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{inv.child_name} • {inv.invoice_number}</p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(inv.due_date).toLocaleDateString()} • Balance: ${Number(inv.balance).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="link" className="w-full" asChild>
                  <Link href="/finance/invoices">View All Invoices <ArrowRight className="ml-2" size={16} /></Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#002040]">Recent Invoices</h3>
              <Button variant="link" size="sm" asChild><Link href="/finance/invoices">View All</Link></Button>
            </div>
            {recentInvoices.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No invoices yet</p>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((inv) => (
                  <div key={inv.invoice_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-[#002040]">{inv.invoice_number}</p>
                        <Badge className={STATUS_BADGE[inv.status]}>{inv.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{inv.parent_name}</p>
                      <p className="text-xs text-gray-500">{new Date(inv.issued_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#002040]">${Number(inv.amount).toFixed(2)}</p>
                      {Number(inv.balance) > 0 && <p className="text-xs text-orange-600">${Number(inv.balance).toFixed(2)} due</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-[#2888B8] to-[#1078A8] border-none">
        <CardContent className="p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Button size="lg" variant="secondary" asChild className="w-full">
              <Link href="/finance/invoices"><Eye className="mr-2" size={20} />View All Invoices</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild className="w-full">
              <Link href="/finance/reports"><TrendingUp className="mr-2" size={20} />Generate Reports</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full bg-white/10 hover:bg-white/20 border-white text-white" asChild>
              <Link href="/finance/invoices?filter=overdue"><AlertCircle className="mr-2" size={20} />Overdue Invoices</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordCard />
    </div>
  );
}
