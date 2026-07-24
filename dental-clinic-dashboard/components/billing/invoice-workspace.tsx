'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  Hash,
  Percent,
  Printer,
  Receipt,
  Tag,
  User,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from './billing-data';

/* ── MOCK DATA ──────────────────────────────────────────── */

const MOCK_PATIENT = {
  name: 'Sok Dara',
  patientId: 'PT000124',
  age: 34,
  gender: 'Male',
  phone: '012 345 678',
};

const MOCK_APPOINTMENT = {
  appointmentId: 'APT-2026-0124',
  dentist: 'Dr. Chan Vireak',
  type: 'Restorative Treatment',
  date: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
};

const MOCK_INVOICE = {
  invoiceNumber: 'INV-2026-00124',
  status: 'Pending' as const,
  issueDate: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
};

const MOCK_INVOICE_ITEMS = [
  {
    id: 'item-1',
    procedure: 'Composite Filling',
    tooth: '#16',
    surface: 'Occlusal',
    quantity: 1,
    unitPrice: 35.0,
    total: 35.0,
  },
  {
    id: 'item-2',
    procedure: 'Scaling',
    tooth: 'Full Mouth',
    surface: 'N/A',
    quantity: 1,
    unitPrice: 25.0,
    total: 25.0,
  },
];

const MOCK_DISCOUNT = {
  type: 'Fixed Amount',
  value: 5.0,
  reason: 'Loyalty discount',
  status: 'Approved',
};

const MOCK_PREVIOUS_BALANCE = 20.0;

const SUBTOTAL = MOCK_INVOICE_ITEMS.reduce((sum, item) => sum + item.total, 0);
const DISCOUNT = MOCK_DISCOUNT.value;
const TAX = 0;
const GRAND_TOTAL = SUBTOTAL - DISCOUNT + TAX;
const AMOUNT_PAID = 0;
const REMAINING_BALANCE = GRAND_TOTAL - AMOUNT_PAID;

/* ── TOAST ───────────────────────────────────────────────── */

function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-border bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-2xl">
      {message}
    </div>
  );
}

/* ── DISCOUNT MODAL ─────────────────────────────────────── */

function DiscountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Apply Discount</h3>
          <button
            onClick={onClose}
            className="rounded-xl border border-border p-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Discount Type
            </label>
            <select className="h-11 w-full rounded-xl border border-border bg-background/70 px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15">
              <option>Percentage</option>
              <option selected>Fixed Amount</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Value
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <input
                type="number"
                defaultValue={5}
                className="h-11 w-full rounded-xl border border-border bg-background/70 pl-7 pr-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Reason
            </label>
            <input
              defaultValue="Loyalty discount"
              className="h-11 w-full rounded-xl border border-border bg-background/70 px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ─────────────────────────────────────── */

export function InvoiceWorkspace() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const toastTimer = useState<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    if (toastTimer[0]) clearTimeout(toastTimer[0]);
    const timer = setTimeout(() => setToastVisible(false), 2000);
    toastTimer[1](timer);
  }, [toastTimer]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleReceivePayment = useCallback(() => {
    showToast('Payment workspace (UI mockup)');
  }, [showToast]);

  const handleBackToBilling = useCallback(() => {
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
            onClick={handleBackToBilling}
          >
            <ArrowLeft className="size-4" />
            Back to Billing
          </Button>
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary/80">
              Invoice Workspace
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Invoice {MOCK_INVOICE.invoiceNumber}
            </h1>
          </div>
        </div>

        <div className="hidden flex-col items-end gap-2 md:flex">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-300">
              Status
            </p>
            <p className="text-lg font-black text-amber-700 dark:text-amber-200">{MOCK_INVOICE.status}</p>
          </div>
        </div>
      </div>

      {/* Invoice Header Card */}
      <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Building2 className="size-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Preah Chan Dental Clinic</h2>
              <p className="text-sm text-muted-foreground">123 Street, Phnom Penh, Cambodia</p>
              <p className="text-sm text-muted-foreground">info@preahchanclinic.com | +855 12 345 678</p>
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="flex items-center gap-2 justify-end">
              <Hash className="size-4 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground">{MOCK_INVOICE.invoiceNumber}</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{MOCK_INVOICE.issueDate}</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Tag className="size-4 text-muted-foreground" />
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                {MOCK_INVOICE.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Patient & Appointment Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
          <div className="mb-3 flex items-center gap-2">
            <User className="size-4 text-primary" />
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
              Patient Information
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-bold text-foreground">{MOCK_PATIENT.name}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>ID: {MOCK_PATIENT.patientId}</span>
              <span>{MOCK_PATIENT.age} years old</span>
              <span>{MOCK_PATIENT.gender}</span>
            </div>
            <p className="text-sm text-muted-foreground">Phone: {MOCK_PATIENT.phone}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
              Appointment Information
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-foreground">{MOCK_APPOINTMENT.type}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>ID: {MOCK_APPOINTMENT.appointmentId}</span>
              <span>{MOCK_APPOINTMENT.dentist}</span>
            </div>
            <p className="text-sm text-muted-foreground">Date: {MOCK_APPOINTMENT.date}</p>
          </div>
        </div>
      </div>

      {/* Invoice Items Table */}
      <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
            Invoice Items
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_0.7fr_1fr_1fr] gap-px bg-border text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <div className="bg-muted/30 px-4 py-3">Procedure</div>
            <div className="bg-muted/30 px-4 py-3">Tooth</div>
            <div className="bg-muted/30 px-4 py-3">Surface</div>
            <div className="bg-muted/30 px-4 py-3 text-center">Qty</div>
            <div className="bg-muted/30 px-4 py-3 text-right">Unit Price</div>
            <div className="bg-muted/30 px-4 py-3 text-right">Total</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-border bg-background/70">
            {MOCK_INVOICE_ITEMS.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-2 p-4 md:grid-cols-[2fr_1fr_1fr_0.7fr_1fr_1fr] md:items-center"
              >
                <div>
                  <p className="text-sm font-bold text-foreground">{item.procedure}</p>
                  <p className="text-xs text-muted-foreground md:hidden">Procedure</p>
                </div>
                <div>
                  <p className="text-sm text-foreground">{item.tooth}</p>
                  <p className="text-xs text-muted-foreground md:hidden">Tooth</p>
                </div>
                <div>
                  <p className="text-sm text-foreground">{item.surface}</p>
                  <p className="text-xs text-muted-foreground md:hidden">Surface</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">{item.quantity}</p>
                  <p className="text-xs text-muted-foreground md:hidden">Qty</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">{formatCurrency(item.unitPrice)}</p>
                  <p className="text-xs text-muted-foreground md:hidden">Unit Price</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{formatCurrency(item.total)}</p>
                  <p className="text-xs text-muted-foreground md:hidden">Total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice Calculation & Discount Info */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Invoice Totals */}
        <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="size-4 text-primary" />
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
              Invoice Calculation
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm font-semibold text-foreground">{formatCurrency(SUBTOTAL)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
              <span className="text-sm text-muted-foreground">Discount</span>
              <span className="text-sm font-semibold text-rose-600">-{formatCurrency(DISCOUNT)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
              <span className="text-sm text-muted-foreground">Tax</span>
              <span className="text-sm font-semibold text-foreground">{formatCurrency(TAX)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-primary/5 px-4 py-3">
              <span className="text-sm font-bold text-foreground">Grand Total</span>
              <span className="text-lg font-black text-foreground">{formatCurrency(GRAND_TOTAL)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
              <span className="text-sm text-muted-foreground">Amount Paid</span>
              <span className="text-sm font-semibold text-emerald-600">{formatCurrency(AMOUNT_PAID)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/5">
              <span className="text-sm font-bold text-foreground">Remaining Balance</span>
              <span className="text-lg font-black text-amber-700 dark:text-amber-200">{formatCurrency(REMAINING_BALANCE)}</span>
            </div>
          </div>
        </div>

        {/* Discount Information */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
            <div className="mb-4 flex items-center gap-2">
              <Percent className="size-4 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                Discount Information
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Discount Type</span>
                <span className="text-sm font-semibold text-foreground">{MOCK_DISCOUNT.type}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Discount</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(MOCK_DISCOUNT.value)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Reason</span>
                <span className="text-sm font-semibold text-foreground">{MOCK_DISCOUNT.reason}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                  {MOCK_DISCOUNT.status}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                Payment Status
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Invoice Status</span>
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                  {MOCK_INVOICE.status}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(AMOUNT_PAID)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/5">
                <span className="text-sm font-bold text-foreground">Balance</span>
                <span className="text-lg font-black text-amber-700 dark:text-amber-200">{formatCurrency(REMAINING_BALANCE)}</span>
              </div>
            </div>
          </div>

          {/* Previous Balance (separate from current invoice) */}
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
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setDiscountModalOpen(true)}>
          <Percent className="size-4" />
          Apply Discount
        </Button>
        <Button variant="default" onClick={handleReceivePayment}>
          <DollarSign className="size-4" />
          Receive Payment
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="size-4" />
          Print Invoice
        </Button>
        <Button variant="ghost" onClick={handleBackToBilling}>
          <ArrowLeft className="size-4" />
          Back to Billing
        </Button>
      </div>

      {/* Discount Modal */}
      <DiscountModal open={discountModalOpen} onClose={() => setDiscountModalOpen(false)} />

      {/* Toast */}
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}