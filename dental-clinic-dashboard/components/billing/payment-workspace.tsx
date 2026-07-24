'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  Hash,
  Landmark,
  Monitor,
  Printer,
  QrCode,
  Receipt,
  Smartphone,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from './billing-data';

/* ── MOCK DATA ──────────────────────────────────────────── */

const MOCK_PATIENT = {
  name: 'Sok Dara',
  patientId: 'PT000124',
  phone: '012 345 678',
};

const MOCK_INVOICE = {
  invoiceNumber: 'INV-2026-00124',
  status: 'Pending' as const,
  subtotal: 60.0,
  discount: 5.0,
  grandTotal: 55.0,
  amountPaid: 0.0,
  remainingBalance: 55.0,
};

const MOCK_PREVIOUS_BALANCE = 20.0;

type PaymentMethodType = 'Cash' | 'Credit Card' | 'Bank Transfer' | 'QR Payment' | 'Mobile Payment';

const PAYMENT_METHODS: { id: PaymentMethodType; label: string; icon: React.ElementType }[] = [
  { id: 'Cash', label: 'Cash', icon: Banknote },
  { id: 'Credit Card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'Bank Transfer', label: 'Bank Transfer', icon: Landmark },
  { id: 'QR Payment', label: 'QR Payment', icon: QrCode },
  { id: 'Mobile Payment', label: 'Mobile Payment', icon: Smartphone },
];

/* ── TOAST ───────────────────────────────────────────────── */

function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-border bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-2xl">
      {message}
    </div>
  );
}

/* ── SUCCESS MODAL ──────────────────────────────────────── */

function SuccessModal({
  open,
  onClose,
  onViewReceipt,
  amount,
  method,
}: {
  open: boolean;
  onClose: () => void;
  onViewReceipt: () => void;
  amount: number;
  method: PaymentMethodType;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
            <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Payment Successful</h3>
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Payment ID</span>
            <span className="text-sm font-bold text-foreground">PAY-2026-00124</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Invoice</span>
            <span className="text-sm font-bold text-foreground">{MOCK_INVOICE.invoiceNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-sm font-bold text-foreground">{formatCurrency(amount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Method</span>
            <span className="text-sm font-bold text-foreground">{method}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
              Completed
            </span>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="default" className="flex-1" onClick={onViewReceipt}>
            <Receipt className="size-4" />
            View Receipt
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ─────────────────────────────────────── */

export function PaymentWorkspace() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('Cash');
  const [paymentAmount, setPaymentAmount] = useState(MOCK_INVOICE.remainingBalance);
  const [cashReceived, setCashReceived] = useState(MOCK_INVOICE.remainingBalance + 5);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('Payment received at front desk.');
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    if (toastTimer) clearTimeout(toastTimer);
    const timer = setTimeout(() => setToastVisible(false), 2000);
    setToastTimer(timer);
  }, [toastTimer]);

  const isFullPayment = paymentAmount >= MOCK_INVOICE.remainingBalance;
  const changeDue = selectedMethod === 'Cash' ? Math.max(0, cashReceived - paymentAmount) : 0;
  const remainingAfterPayment = Math.max(0, MOCK_INVOICE.remainingBalance - paymentAmount);
  const resultingStatus = remainingAfterPayment <= 0 ? 'Paid' : 'Partially Paid';

  const handlePayFullBalance = useCallback(() => {
    setPaymentAmount(MOCK_INVOICE.remainingBalance);
    setCashReceived(MOCK_INVOICE.remainingBalance + 5);
  }, []);

  const handleCustomAmount = useCallback(() => {
    setPaymentAmount(0);
    setCashReceived(0);
  }, []);

  const handleAmountChange = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(value, MOCK_INVOICE.remainingBalance));
    setPaymentAmount(clamped);
    setCashReceived(clamped + 5);
  }, []);

  const handleCashReceivedChange = useCallback((value: number) => {
    setCashReceived(Math.max(0, value));
  }, []);

  const handleConfirmPayment = useCallback(() => {
    if (paymentAmount <= 0) {
      showToast('Please enter a payment amount.');
      return;
    }
    setSuccessModalOpen(true);
  }, [paymentAmount, showToast]);

  const handleViewReceipt = useCallback(() => {
    setSuccessModalOpen(false);
    router.push('/receipt');
  }, [router]);

  const handleBackToInvoice = useCallback(() => {
    router.push('/invoice');
  }, [router]);

  const handleCancel = useCallback(() => {
    router.push('/billing');
  }, [router]);

  return (
    <div className="relative mx-auto max-w-[1200px] space-y-5 px-4 pb-28 pt-4 lg:px-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
            onClick={handleBackToInvoice}
          >
            <ArrowLeft className="size-4" />
            Back to Invoice
          </Button>
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary/80">
              Payment Workspace
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Process Payment
            </h1>
          </div>
        </div>

        <div className="hidden flex-col items-end gap-2 md:flex">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-300">
              Invoice Status
            </p>
            <p className="text-lg font-black text-amber-700 dark:text-amber-200">{MOCK_INVOICE.status}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        {/* ── LEFT COLUMN: Patient & Invoice Summary ── */}
        <div className="space-y-4">
          {/* Patient Summary */}
          <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <User className="size-4 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                Patient Summary
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-bold text-foreground">{MOCK_PATIENT.name}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>ID: {MOCK_PATIENT.patientId}</span>
                <span>Phone: {MOCK_PATIENT.phone}</span>
              </div>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                Invoice Summary
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Invoice Number</span>
                <span className="text-sm font-bold text-foreground">{MOCK_INVOICE.invoiceNumber}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Invoice Total</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(MOCK_INVOICE.grandTotal)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="text-sm font-semibold text-emerald-600">{formatCurrency(MOCK_INVOICE.amountPaid)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/5">
                <span className="text-sm font-bold text-foreground">Remaining Balance</span>
                <span className="text-lg font-black text-amber-700 dark:text-amber-200">
                  {formatCurrency(MOCK_INVOICE.remainingBalance)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Invoice Status</span>
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                  {MOCK_INVOICE.status}
                </span>
              </div>
            </div>
          </div>

          {/* Previous Balance (separate) */}
          <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <Receipt className="size-4 text-muted-foreground" />
              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                Patient Financial Overview
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
              <span className="text-sm text-muted-foreground">Previous Outstanding Balance</span>
              <span className="text-sm font-semibold text-foreground">{formatCurrency(MOCK_PREVIOUS_BALANCE)}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              This is a separate outstanding balance from a previous visit and is not included in the current invoice total.
            </p>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Payment Form ── */}
        <div className="space-y-4">
          {/* Amount to Pay */}
          <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <DollarSign className="size-4 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                Amount to Pay
              </p>
            </div>

            <div className="mb-3 flex gap-2">
              <Button
                variant={isFullPayment ? 'default' : 'outline'}
                size="sm"
                onClick={handlePayFullBalance}
                className="flex-1"
              >
                <Wallet className="size-3.5 mr-1" />
                Pay Full Balance
              </Button>
              <Button
                variant={!isFullPayment && paymentAmount > 0 ? 'default' : 'outline'}
                size="sm"
                onClick={handleCustomAmount}
                className="flex-1"
              >
                <DollarSign className="size-3.5 mr-1" />
                Custom Amount
              </Button>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                min={0}
                max={MOCK_INVOICE.remainingBalance}
                step={0.01}
                className="h-12 w-full rounded-xl border border-border bg-background/70 pl-7 pr-3 text-lg font-bold text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Remaining balance: {formatCurrency(MOCK_INVOICE.remainingBalance)}
            </p>
          </div>

          {/* Payment Method */}
          <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                Payment Method
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                      isSelected
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-border bg-background/70 text-muted-foreground hover:border-border/60 hover:text-foreground'
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Payment UI */}
          {selectedMethod === 'Cash' && (
            <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
              <div className="mb-3 flex items-center gap-2">
                <Banknote className="size-4 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                  Cash Payment
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Amount Received
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => handleCashReceivedChange(parseFloat(e.target.value) || 0)}
                      min={0}
                      step={0.01}
                      className="h-11 w-full rounded-xl border border-border bg-background/70 pl-7 pr-3 text-sm font-semibold text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">Payment Amount</span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(paymentAmount)}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                  <span className="text-sm font-bold text-foreground">Change</span>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-200">
                    {formatCurrency(changeDue)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* QR Payment UI */}
          {selectedMethod === 'QR Payment' && (
            <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
              <div className="mb-3 flex items-center gap-2">
                <QrCode className="size-4 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                  QR Payment
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20">
                  <div className="text-center">
                    <QrCode className="mx-auto size-16 text-muted-foreground/40" />
                    <p className="mt-2 text-xs text-muted-foreground">Mock QR Code</p>
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                    <span className="text-sm text-muted-foreground">Payment Amount</span>
                    <span className="text-sm font-bold text-foreground">{formatCurrency(paymentAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                      Waiting for Payment
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer UI */}
          {selectedMethod === 'Bank Transfer' && (
            <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
              <div className="mb-3 flex items-center gap-2">
                <Landmark className="size-4 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                  Bank Transfer
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">Bank</span>
                  <span className="text-sm font-bold text-foreground">ABA Bank</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">Reference</span>
                  <span className="text-sm font-bold text-foreground">ABA-2026-00124</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(paymentAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Credit Card UI */}
          {selectedMethod === 'Credit Card' && (
            <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
              <div className="mb-3 flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                  Card Payment
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Amount to Charge</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(paymentAmount)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Card terminal will process the payment. This is a UI mockup only.
              </p>
            </div>
          )}

          {/* Mobile Payment UI */}
          {selectedMethod === 'Mobile Payment' && (
            <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
              <div className="mb-3 flex items-center gap-2">
                <Smartphone className="size-4 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                  Mobile Payment
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Provider</span>
                <span className="text-sm font-bold text-foreground">Wing / Cellcard / Smart</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(paymentAmount)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Mobile payment processing. This is a UI mockup only.
              </p>
            </div>
          )}

          {/* Payment Reference / Notes */}
          <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                Payment Reference / Notes
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Payment Reference
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g. Transaction ID"
                  className="h-11 w-full rounded-xl border border-border bg-background/70 px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Notes
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={2}
                  className="h-20 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <Receipt className="size-4 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                Payment Summary
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Invoice Total</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(MOCK_INVOICE.grandTotal)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Previously Paid</span>
                <span className="text-sm font-semibold text-emerald-600">{formatCurrency(MOCK_INVOICE.amountPaid)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Payment Amount</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(paymentAmount)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-primary/5 px-4 py-3">
                <span className="text-sm font-bold text-foreground">Remaining After Payment</span>
                <span
                  className={`text-lg font-black ${
                    remainingAfterPayment > 0
                      ? 'text-amber-700 dark:text-amber-200'
                      : 'text-emerald-700 dark:text-emerald-200'
                  }`}
                >
                  {formatCurrency(remainingAfterPayment)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Payment Type</span>
                <span className="text-sm font-bold text-foreground">
                  {isFullPayment ? 'Full Payment' : 'Partial Payment'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Resulting Invoice Status</span>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    resultingStatus === 'Paid'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
                      : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200'
                  }`}
                >
                  {resultingStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleConfirmPayment} disabled={paymentAmount <= 0}>
              <CheckCircle2 className="size-4" />
              Confirm Payment
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="size-4" />
              Cancel
            </Button>
            <Button variant="ghost" onClick={handleBackToInvoice}>
              <ArrowLeft className="size-4" />
              Back to Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        onViewReceipt={handleViewReceipt}
        amount={paymentAmount}
        method={selectedMethod}
      />

      {/* Toast */}
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}