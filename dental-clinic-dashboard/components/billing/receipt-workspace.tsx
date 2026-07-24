'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  FileText,
  Printer,
  Download,
  LogOut,
  Receipt as ReceiptIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatCurrency } from './billing-data';

/* ── Mock Data ── */

const MOCK_DATE = new Date().toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const mockReceipt = {
  receiptNumber: 'REC-2026-00124',
  invoiceNumber: 'INV-2026-00124',
  paymentId: 'PAY-2026-00124',
  date: MOCK_DATE,
  status: 'Paid' as const,
  patientName: 'Sok Dara',
  patientId: 'PT000124',
  patientPhone: '012 345 678',
  appointmentId: 'APT-2026-0124',
  dentist: 'Dr. Chan Vireak',
  appointmentType: 'Restorative Treatment',
  items: [
    {
      id: 'item-1',
      description: 'Composite Filling',
      tooth: '#16',
      quantity: 1,
      unitPrice: 35.00,
      discount: 0,
      lineTotal: 35.00,
      isManualCharge: false,
    },
    {
      id: 'item-2',
      description: 'Scaling',
      tooth: 'Full Mouth',
      quantity: 1,
      unitPrice: 25.00,
      discount: 0,
      lineTotal: 25.00,
      isManualCharge: false,
    },
  ],
  subtotal: 60.00,
  totalDiscount: 5.00,
  grandTotal: 55.00,
  amountPaid: 55.00,
  paymentMethod: 'Cash',
  changeDue: 5.00,
  balanceDue: 0.00,
  paymentStatus: 'Completed' as const,
};

export function ReceiptWorkspace() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPDF = useCallback(() => {
    setToast('Receipt PDF download will be available when backend functionality is implemented.');
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleFinishVisit = useCallback(() => {
    router.push('/visit-completion');
  }, [router]);

  const handleBackToPayment = useCallback(() => {
    router.push('/payment');
  }, [router]);

  const getStatusBadgeClass = (status: string) => {
    const map: Record<string, string> = {
      Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
      Paid: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
      'Partially Paid': 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
      Unpaid: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    };
    return map[status] || 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';
  };

  return (
    <div className="space-y-4 mx-[100px] receipt-page">
      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-xl border border-border bg-card px-5 py-3 shadow-lg">
          <p className="text-sm text-foreground">{toast}</p>
        </div>
      )}

      {/* ── Non-printable actions ── */}
      <div className="no-print flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToPayment}
          className="group -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Payment
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 size-4" />
            Print Receipt
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="mr-1.5 size-4" />
            Download PDF
          </Button>
          <Button variant="default" size="sm" onClick={handleFinishVisit}>
            <LogOut className="mr-1.5 size-4" />
            Finish Visit
          </Button>
        </div>
      </div>

      {/* ── Receipt Container ── */}
      <div className="rounded-2xl border border-border bg-card/90 p-6 sm:p-8 theme-surface-shadow receipt-container">
        {/* Clinic Header */}
        <div className="text-center border-b border-border pb-5 mb-5">
          <h1 className="text-2xl font-bold text-foreground">Preah Chan Dental Clinic</h1>
          <p className="text-xs text-muted-foreground mt-1">Professional Dental Care</p>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ReceiptIcon className="size-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Receipt / Payment Confirmation</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Receipt #{mockReceipt.receiptNumber}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex shrink-0 items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${getStatusBadgeClass(mockReceipt.status)}`}
            >
              <CheckCircle2 className="mr-1 size-3" />
              {mockReceipt.status}
            </span>
          </div>
        </div>

        {/* Patient / Appointment Information */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 mb-5 dark:bg-background/10">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Patient</p>
              <p className="text-sm font-semibold text-foreground">{mockReceipt.patientName}</p>
              <p className="text-xs text-muted-foreground">ID: {mockReceipt.patientId}</p>
              <p className="text-xs text-muted-foreground">Phone: {mockReceipt.patientPhone}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Appointment</p>
              <p className="text-sm font-semibold text-foreground">{mockReceipt.appointmentId}</p>
              <p className="text-xs text-muted-foreground">Dentist: {mockReceipt.dentist}</p>
              <p className="text-xs text-muted-foreground">Type: {mockReceipt.appointmentType}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Invoice</p>
              <p className="text-sm font-semibold text-foreground">{mockReceipt.invoiceNumber}</p>
              <p className="text-xs text-muted-foreground">Payment ID: {mockReceipt.paymentId}</p>
              <p className="text-xs text-muted-foreground">Date: {mockReceipt.date}</p>
            </div>
          </div>
        </div>

        {/* Procedure Items Table */}
        <div className="mb-5">
          <h3 className="text-sm font-bold text-foreground mb-3">Procedures</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-1 font-bold text-muted-foreground uppercase tracking-wider">#</th>
                  <th className="text-left py-2 px-1 font-bold text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="text-left py-2 px-1 font-bold text-muted-foreground uppercase tracking-wider">Tooth</th>
                  <th className="text-center py-2 px-1 font-bold text-muted-foreground uppercase tracking-wider">Qty</th>
                  <th className="text-right py-2 px-1 font-bold text-muted-foreground uppercase tracking-wider">Unit Price</th>
                  <th className="text-right py-2 px-1 font-bold text-muted-foreground uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {mockReceipt.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-border/50">
                    <td className="py-2.5 px-1 text-muted-foreground">{index + 1}</td>
                    <td className="py-2.5 px-1">
                      <p className="font-semibold text-foreground">{item.description}</p>
                    </td>
                    <td className="py-2.5 px-1 text-foreground">{item.tooth}</td>
                    <td className="py-2.5 px-1 text-center text-foreground">{item.quantity}</td>
                    <td className="py-2.5 px-1 text-right text-foreground">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-2.5 px-1 text-right font-bold text-foreground">{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Totals */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 dark:bg-background/10">
            <h3 className="text-sm font-bold text-foreground mb-3">Invoice Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{formatCurrency(mockReceipt.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  -{formatCurrency(mockReceipt.totalDiscount)}
                </span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-foreground">Grand Total</span>
                  <span className="text-lg font-bold text-foreground">{formatCurrency(mockReceipt.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 dark:bg-background/10">
            <h3 className="text-sm font-bold text-foreground mb-3">Payment Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-semibold text-foreground">{formatCurrency(mockReceipt.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-semibold text-foreground">{mockReceipt.paymentMethod}</span>
              </div>
              {mockReceipt.changeDue > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Change</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(mockReceipt.changeDue)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-bold text-foreground">Remaining Balance</span>
                <span
                  className={`text-base font-bold ${
                    mockReceipt.balanceDue > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatCurrency(mockReceipt.balanceDue)}
                </span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span
                    className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(mockReceipt.paymentStatus)}`}
                  >
                    {mockReceipt.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Confirmation */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Payment Confirmed</h3>
            <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-300 opacity-80">
              Payment has been successfully recorded.
            </p>
            <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 opacity-60">
              Payment ID: {mockReceipt.paymentId} · {mockReceipt.date}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-[10px] text-muted-foreground">
            Receipt #{mockReceipt.receiptNumber} · Invoice #{mockReceipt.invoiceNumber}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Generated on {mockReceipt.date}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Preah Chan Dental Clinic</p>
        </div>
      </div>

      {/* ── Bottom actions (non-printable) ── */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-2 pb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToPayment}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Payment
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 size-4" />
            Print Receipt
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="mr-1.5 size-4" />
            Download PDF
          </Button>
          <Button variant="default" size="sm" onClick={handleFinishVisit}>
            <LogOut className="mr-1.5 size-4" />
            Finish Visit
          </Button>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .receipt-container {
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            padding: 0.5in !important;
          }
          .receipt-page {
            margin: 0 !important;
            padding: 0 !important;
          }
          .mx-\\[100px\\] {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .theme-surface-shadow {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}