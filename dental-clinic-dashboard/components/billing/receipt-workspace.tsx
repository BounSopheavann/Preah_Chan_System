'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  FileText,
  Printer,
  Download,
  LogOut,
  AlertCircle,
  Receipt as ReceiptIcon,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { type Receipt, formatCurrency } from './billing-data';
import { loadSavedReceipt, loadSavedInvoice, buildReceiptFromInvoice } from './billing-store';

export function ReceiptWorkspace() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try loading an existing receipt first
    const existing = loadSavedReceipt();
    if (existing) {
      setReceipt(existing);
      setHydrated(true);
      return;
    }

    // If no receipt exists, try building one from a finalized invoice
    const invoice = loadSavedInvoice();
    if (invoice && invoice.status !== 'Draft' && invoice.finalizedAt) {
      const built = buildReceiptFromInvoice(invoice);
      setReceipt(built);
      setHydrated(true);
      return;
    }

    setHydrated(true);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleFinishVisit = useCallback(() => {
    router.push('/treatment-execution');
  }, [router]);

  const handleReturnToBilling = useCallback(() => {
    router.push('/billing');
  }, [router]);

  const paymentConfirmationMessage = useMemo(() => {
    if (!receipt) return null;
    switch (receipt.paymentStatus) {
      case 'Paid':
        return {
          icon: CheckCircle2,
          title: 'Payment Confirmed',
          message: 'Payment has been successfully recorded.',
          className:
            'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
          iconClassName: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'Partially Paid':
        return {
          icon: AlertCircle,
          title: 'Partial Payment Recorded',
          message: `Outstanding balance: ${formatCurrency(receipt.balanceDue)}`,
          className:
            'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10 text-amber-800 dark:text-amber-200',
          iconClassName: 'text-amber-600 dark:text-amber-400',
        };
      case 'Unpaid':
      default:
        return {
          icon: FileText,
          title: 'Invoice Finalized',
          message: 'No payment has been recorded.',
          className:
            'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
          iconClassName: 'text-slate-500 dark:text-slate-400',
        };
    }
  }, [receipt]);

  const getStatusBadgeClass = (status: string) => {
    const map: Record<string, string> = {
      Draft: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
      Unpaid: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
      'Partially Paid': 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
      Paid: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    };
    return map[status] || map.Draft;
  };

  // ── Loading state ──
  if (!hydrated) {
    return (
      <div className="space-y-4 mx-[100px]">
        <div className="rounded-xl border border-border bg-card/90 p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Loading receipt...</p>
        </div>
      </div>
    );
  }

  // ── Empty / Invalid state ──
  if (!receipt) {
    return (
      <div className="space-y-4 mx-[100px]">
        <div className="rounded-2xl border border-border bg-card/90 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
            <ReceiptIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">No Finalized Invoice Available</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A receipt can only be generated after an invoice has been finalized.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={handleReturnToBilling}>
              <ArrowLeft className="size-4 mr-1.5" />
              Return to Billing
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="space-y-4 mx-[100px]">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-500/20">
            <XCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
          </div>
          <h1 className="text-xl font-bold text-rose-800 dark:text-rose-200">Error</h1>
          <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={handleReturnToBilling}>
              <ArrowLeft className="size-4 mr-1.5" />
              Return to Billing
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mx-[100px] receipt-page">
      {/* ── Non-printable actions ── */}
      <div className="no-print flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/billing')}
          className="group -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Billing
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 size-4" />
            Print Receipt
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Download className="mr-1.5 size-4" />
            Save as PDF
          </Button>
          <Button variant="default" size="sm" onClick={handleFinishVisit}>
            <LogOut className="mr-1.5 size-4" />
            Finish Visit
          </Button>
        </div>
      </div>

      {/* ── Receipt Container ── */}
      <div className="rounded-2xl border border-border bg-card/90 p-6 sm:p-8 theme-surface-shadow receipt-container">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ReceiptIcon className="size-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Receipt / Payment Confirmation</h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Receipt #{receipt.receiptNumber}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex shrink-0 items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${getStatusBadgeClass(receipt.paymentStatus)}`}
            >
              {receipt.paymentStatus}
            </span>
            <span className="inline-flex shrink-0 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="mr-1 size-3" />
              Finalized
            </span>
          </div>
        </div>

        {/* Patient / Visit Information */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 mb-5 dark:bg-background/10">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Patient</p>
              <p className="text-sm font-semibold text-foreground">{receipt.patientName}</p>
              <p className="text-xs text-muted-foreground">ID: {receipt.patientId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Visit</p>
              <p className="text-sm font-semibold text-foreground">{receipt.appointmentDate}</p>
              <p className="text-xs text-muted-foreground">Dentist: {receipt.dentist}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Invoice</p>
              <p className="text-sm font-semibold text-foreground">{receipt.invoiceNumber}</p>
              <p className="text-xs text-muted-foreground">
                Payment: {new Date(receipt.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Receipt Items Table */}
        <div className="mb-5">
          <h3 className="text-sm font-bold text-foreground mb-3">Receipt Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-1 font-bold text-muted-foreground uppercase tracking-wider">#</th>
                  <th className="text-left py-2 px-1 font-bold text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="text-center py-2 px-1 font-bold text-muted-foreground uppercase tracking-wider">Qty</th>
                  <th className="text-right py-2 px-1 font-bold text-muted-foreground uppercase tracking-wider">Unit Price</th>
                  <th className="text-right py-2 px-1 font-bold text-muted-foreground uppercase tracking-wider">Discount</th>
                  <th className="text-right py-2 px-1 font-bold text-muted-foreground uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-border/50">
                    <td className="py-2.5 px-1 text-muted-foreground">{index + 1}</td>
                    <td className="py-2.5 px-1">
                      <p className="font-semibold text-foreground">{item.description}</p>
                      {item.isManualCharge && (
                        <span className="text-[10px] text-muted-foreground/60">Manual charge</span>
                      )}
                    </td>
                    <td className="py-2.5 px-1 text-center text-foreground">{item.quantity}</td>
                    <td className="py-2.5 px-1 text-right text-foreground">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-2.5 px-1 text-right text-rose-600 dark:text-rose-400">
                      {item.discount > 0 ? `-${formatCurrency(item.discount)}` : formatCurrency(0)}
                    </td>
                    <td className="py-2.5 px-1 text-right font-bold text-foreground">{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Totals */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 dark:bg-background/10">
            <h3 className="text-sm font-bold text-foreground mb-3">Invoice Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{formatCurrency(receipt.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Discount</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  -{formatCurrency(receipt.totalDiscount)}
                </span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-foreground">Grand Total</span>
                  <span className="text-lg font-bold text-foreground">{formatCurrency(receipt.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 dark:bg-background/10">
            <h3 className="text-sm font-bold text-foreground mb-3">Payment Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Amount Received</span>
                <span className="font-semibold text-foreground">{formatCurrency(receipt.amountReceived)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-semibold text-foreground">{formatCurrency(receipt.amountPaid)}</span>
              </div>
              {receipt.changeDue > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Change Due</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(receipt.changeDue)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-bold text-foreground">Balance Due</span>
                <span
                  className={`text-base font-bold ${
                    receipt.balanceDue > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatCurrency(receipt.balanceDue)}
                </span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-semibold text-foreground">{receipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span
                    className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(receipt.paymentStatus)}`}
                  >
                    {receipt.paymentStatus}
                  </span>
                </div>
                {receipt.paymentNote && (
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-muted-foreground">Note</span>
                    <span className="font-semibold text-foreground text-right max-w-[180px] truncate" title={receipt.paymentNote}>
                      {receipt.paymentNote}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Confirmation Section */}
        {paymentConfirmationMessage && (
          <div
            className={`mt-5 flex items-start gap-3 rounded-2xl border px-5 py-4 ${paymentConfirmationMessage.className}`}
          >
            <paymentConfirmationMessage.icon className={`mt-0.5 h-6 w-6 shrink-0 ${paymentConfirmationMessage.iconClassName}`} />
            <div>
              <h3 className="text-sm font-bold">{paymentConfirmationMessage.title}</h3>
              <p className="mt-0.5 text-xs opacity-80">{paymentConfirmationMessage.message}</p>
              {receipt.finalizedAt && (
                <p className="mt-1 text-[10px] opacity-60">
                  Finalized on{' '}
                  {new Date(receipt.finalizedAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-[10px] text-muted-foreground">
            Receipt #{receipt.receiptNumber} · Invoice #{receipt.invoiceNumber}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Generated on{' '}
            {new Date(receipt.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Preah Chan Dental Clinic</p>
        </div>
      </div>

      {/* ── Bottom actions (non-printable) ── */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-2 pb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/billing')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Billing
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 size-4" />
            Print Receipt
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Download className="mr-1.5 size-4" />
            Save as PDF
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