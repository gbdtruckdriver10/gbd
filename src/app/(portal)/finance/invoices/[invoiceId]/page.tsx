"use client";

import { useState } from 'react';
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { mockInvoices, PaymentRecord } from "@/data/mockData";
import { ArrowLeft, DollarSign, User, Phone, Mail, CreditCard, Download, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function FinanceInvoiceDetail() {
  const params = useParams();
  const invoiceId = Array.isArray(params.invoiceId)
    ? params.invoiceId[0]
    : params.invoiceId;

  const invoice = mockInvoices.find((inv) => inv.id === invoiceId);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'Credit Card' as PaymentRecord['method'],
    notes: ''
  });
  const [messageData, setMessageData] = useState({
    subject: '',
    message: ''
  });
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Invoice not found</p>
        <Button asChild className="mt-4">
          <Link href="/finance/invoices">Back to Invoices</Link>
        </Button>
      </div>
    );
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecordingPayment) return;

    const amount = parseFloat(paymentData.amount);

    if (Number.isNaN(amount) || amount <= 0 || amount > invoice.balance) {
      toast.error("Invalid payment amount");
      return;
    }

    try {
      setIsRecordingPayment(true);

      await new Promise((resolve) => setTimeout(resolve, 700));

      toast.success(`Payment of $${amount.toFixed(2)} recorded successfully`);
      setShowPaymentForm(false);
      setPaymentData({ amount: "", method: "Credit Card", notes: "" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to record payment");
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSendingMessage) return;

    if (!messageData.subject.trim() || !messageData.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSendingMessage(true);

      await new Promise((resolve) => setTimeout(resolve, 700));

      toast.success(`Message sent to ${invoice.parentName}`);
      setShowMessageForm(false);
      setMessageData({ subject: "", message: "" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSendReminder = (type: 'friendly' | 'overdue' | 'final') => {
    const messages = {
      friendly: 'Friendly payment reminder sent',
      overdue: 'Overdue payment notice sent',
      final: 'Final notice sent'
    };
    toast.success(messages[type]);
  };

  const getStatusColor = (status: typeof invoice.status) => {
    const colors = {
      Paid: 'bg-green-100 text-green-800',
      Unpaid: 'bg-gray-100 text-gray-800',
      Overdue: 'bg-red-100 text-red-800',
      Partial: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/finance/invoices">
              <ArrowLeft className="mr-2" size={16} />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#002040]">{invoice.invoiceNumber}</h1>
            <p className="text-gray-600">Invoice Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="mr-2" size={16} />
            Print / Save PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowMessageForm(!showMessageForm)}
            disabled={isSendingMessage}
          >
            <Send className="mr-2" size={16} />
            Message Parent
          </Button>
        </div>
      </div>

      {/* Status and Quick Actions */}
      <Card className="border-l-4 border-[#2888B8]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Status</p>
                <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
              </div>
              {invoice.balance > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ${invoice.balance.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {invoice.balance > 0 && (
                <Button 
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className="bg-[#2888B8] hover:bg-[#1078A8]"
                >
                  <DollarSign className="mr-2" size={16} />
                  Record Payment
                </Button>
              )}
              {invoice.status === "Overdue" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleSendReminder("overdue")}
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                  >
                    Send Overdue Notice
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSendReminder("final")}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Send Final Notice
                  </Button>
                </>
              )}

              {(invoice.status === "Unpaid" || invoice.status === "Partial") && (
                <Button
                  variant="outline"
                  onClick={() => handleSendReminder("friendly")}
                >
                  Send Reminder
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Record Payment Form */}
      {showPaymentForm && (
        <Card className="border-l-4 border-green-500">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-[#002040] mb-4">Record Payment</h3>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Payment Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={invoice.balance}
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                    disabled={isRecordingPayment}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max: ${invoice.balance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label htmlFor="method">Payment Method *</Label>
                  <select
                    id="method"
                    value={paymentData.method}
                    onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value as PaymentRecord['method'] })}
                    className="w-full h-10 rounded-md border border-gray-300 px-3"
                    required
                    disabled={isRecordingPayment}
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Stripe">Stripe</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="paymentNotes">Notes</Label>
                <Textarea
                  id="paymentNotes"
                  rows={2}
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  placeholder="Optional payment notes..."
                  disabled={isRecordingPayment}
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isRecordingPayment}>
                  <CheckCircle className="mr-2" size={16} />
                  Record Payment
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowPaymentForm(false)} disabled={isRecordingPayment}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Message Form */}
      {showMessageForm && (
        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-[#002040] mb-4">Send Message to Parent</h3>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={messageData.subject}
                  onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                  placeholder="Invoice Payment Reminder"
                  required
                  disabled={isSendingMessage}
                />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={messageData.message}
                  onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                  placeholder="Dear parent, this is a reminder about invoice..."
                  required
                  disabled={isSendingMessage}
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-[#2888B8] hover:bg-[#1078A8]" disabled={isSendingMessage}>
                  <Send className="mr-2" size={16} />
                  Send Message
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowMessageForm(false)} disabled={isSendingMessage}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-[#002040] mb-4">Invoice Details</h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="font-semibold">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Issue Date:</span>
                  <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Due Date:</span>
                  <span className={invoice.status === 'Overdue' ? 'text-red-600 font-semibold' : ''}>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold mb-3">Line Items</h4>
                <div className="space-y-2">
                  {invoice.lineItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.discountPercent && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({invoice.discountPercent}%):</span>
                      <span>-${invoice.discountAmount?.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.discountAmount && !invoice.discountPercent && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-${invoice.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.lateFee && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Late Fee:</span>
                      <span>+${invoice.lateFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span>${invoice.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Amount Paid:</span>
                    <span>${invoice.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-orange-600 text-lg">
                    <span>Balance Due:</span>
                    <span>${invoice.balance.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm">
                    <strong>Notes:</strong> {invoice.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-[#002040] mb-4">Payment History</h3>
              {invoice.payments.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No payments recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div key={payment.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard size={16} className="text-[#2888B8]" />
                          <span className="font-semibold">${payment.amount.toFixed(2)}</span>
                          <Badge variant="outline" className="text-xs">{payment.method}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.date).toLocaleDateString()} • Recorded by {payment.recordedBy}
                        </p>
                        {payment.notes && (
                          <p className="text-sm text-gray-600 mt-1">{payment.notes}</p>
                        )}
                        {payment.stripePaymentIntentId && (
                          <p className="text-xs text-gray-500 mt-1 font-mono">
                            Stripe ID: {payment.stripePaymentIntentId}
                          </p>
                        )}
                      </div>
                      <CheckCircle className="text-green-600" size={20} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Parent Contact Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-[#002040] mb-4">Parent Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="text-[#2888B8] mt-1" size={18} />
                  <div>
                    <p className="font-semibold">{invoice.parentName}</p>
                    <p className="text-sm text-gray-600">Parent of {invoice.childName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="text-[#2888B8] mt-1" size={18} />
                  <div>
                    <a href={`mailto:${invoice.parentEmail}`} className="text-sm text-blue-600 hover:underline">
                      {invoice.parentEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-[#2888B8] mt-1" size={18} />
                  <div>
                    <a href={`tel:${invoice.parentPhone}`} className="text-sm">
                      {invoice.parentPhone}
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Plan (if applicable) */}
          {invoice.paymentPlan && (
            <Card className="border-l-4 border-[#E8A018]">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#002040] mb-3">Payment Plan</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequency:</span>
                    <span className="font-semibold">{invoice.paymentPlan.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Installments:</span>
                    <span className="font-semibold">{invoice.paymentPlan.installments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Per Installment:</span>
                    <span className="font-semibold">${invoice.paymentPlan.installmentAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reminder History */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-[#002040] mb-3">Reminder History</h3>
              {invoice.remindersSent.length === 0 ? (
                <p className="text-sm text-gray-600">No reminders sent yet</p>
              ) : (
                <div className="space-y-2">
                  {invoice.remindersSent.map((reminder, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <AlertCircle size={14} className="text-[#2888B8] mt-0.5" />
                      <div>
                        <p className="font-medium">{reminder.type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(reminder.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
