'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  FileText,
  Receipt,
  AlertCircle,
  XCircle,
  Printer,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatCurrency } from './billing-data';

/* ── Mock Data ── */

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
  appointmentType: 'Restorative Treatment',
  date: new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
  status: 'Completed' as const,
};

const MOCK_BILLABLE_PROCEDURES = [
  {
    id: 'proc-001',
    procedure: 'Composite Filling',
    tooth: '#16',
    surface: 'Occlusal',
    quantity: 1,
    unitPrice: 35.0,
    total: 35.0,
  },
  {
    id: 'proc-002',
    procedure: 'Scaling',
    tooth: 'Full Mouth',
    surface: '-',
    quantity: 1,
    unitPrice: 25.0,
    total: 25.0,
  },
];

const MOCK_BILLING_SUMMARY = {
  subtotal: 60.0,
  discount: 0.0,
  tax: 0.0,
  currentVisitTotal: 60.0,
  previousOutstandingBalance: 20.0,
  totalPatientBalance: 80.0,
};

const MOCK_BILLING_NOTE =
  'Patient has an existing $20.00 outstanding balance from a previous visit.';

/* ── Component ── */

export function BillingWorkspace() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('success');

  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const handleGenerateInvoice = useCallback(() => {
    showToast('Invoice generated successfully. Invoice #INV-20260724-001', 'success');
  }, [showToast]);

  const handleViewInvoice = useCallback(() => {
    router.push('/invoice');
  }, [router]);

  const handleBack = useCallback(() => {
    router.push('/treatment-summary');
  }, [router]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const statusBadgeClass =
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300';

  return (
    <div className="space-y-4 mx-[100px]">
      {/* Back navigation */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="group -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Treatment Summary
        </Button>
      </div>

      {/* Page header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Invoice</h1>
          <p className="text-sm text-muted-foreground">
            {MOCK_PATIENT.name}
            {' · '}
            {MOCK_APPOINTMENT.date}
            {' · '}
            {MOCK_APPOINTMENT.dentist}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex shrink-0 items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${statusBadgeClass}`}
          >
            <CheckCircle2 className="mr-1 size-3" />
            Ready for Invoice
          </span>
        </div>
      </div>

      {/* Toast message */}
      {toastMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 ${
            toastType === 'success'
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10'
              : 'border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
          <span
            className={`text-xs font-semibold ${
              toastType === 'success'
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-blue-700 dark:text-blue-300'
            }`}
          >
            {toastMessage}
          </span>
        </div>
      )}

      {/* Patient Summary */}
      <div className="rounded-xl border border-border bg-card/95 p-3.5 sm:p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-sm">
            {MOCK_PATIENT.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-foreground leading-tight">
                {MOCK_PATIENT.name}
              </h2>
              <span className="rounded-md border border-border bg-muted/50 px-1.5 py-0.25 text-[11px] font-semibold text-muted-foreground">
                {MOCK_PATIENT.patientId}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span>
                Phone: <strong className="text-foreground/90 font-semibold">{MOCK_PATIENT.phone}</strong>
              </span>
              <span className="text-muted-foreground/30">•</span>
              <span>
                Appointment:{' '}
                <strong className="text-foreground/90 font-semibold">
                  {MOCK_APPOINTMENT.appointmentId}
                </strong>
              </span>
              <span className="text-muted-foreground/30">•</span>
              <span>
                Dentist:{' '}
                <strong className="text-foreground/90 font-semibold">{MOCK_APPOINTMENT.dentist}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card/90 p-3.5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Billable Procedures
          </p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {MOCK_BILLABLE_PROCEDURES.length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card/90 p-3.5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Today's Charges
          </p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {formatCurrency(MOCK_BILLING_SUMMARY.currentVisitTotal)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card/90 p-3.5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Previous Balance
          </p>
          <p className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(MOCK_BILLING_SUMMARY.previousOutstandingBalance)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card/90 p-3.5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Outstanding
          </p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {formatCurrency(MOCK_BILLING_SUMMARY.totalPatientBalance)}
          </p>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-10">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-5 lg:col-span-7">
          {/* Billable Procedures */}
          <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
              <Receipt className="size-4 text-primary" />
              Billable Procedures
            </h3>

            {/* Table header */}
            <div className="hidden sm:grid sm:grid-cols-[2fr_80px_80px_80px_100px] gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              <span>Procedure</span>
              <span className="text-center">Tooth</span>
              <span className="text-center">Surface</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Total</span>
            </div>

            <div className="space-y-2">
              {MOCK_BILLABLE_PROCEDURES.map((proc) => (
                <div
                  key={proc.id}
                  className="rounded-xl border border-border bg-muted/20 px-3.5 py-3 dark:bg-background/10"
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_80px_80px_80px_100px] sm:gap-2 sm:items-center">
                    {/* Procedure Name */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {proc.procedure}
                      </p>
                    </div>

                    {/* Tooth */}
                    <div className="text-center">
                      <label className="sm:hidden block text-[10px] font-semibold text-muted-foreground mb-0.5">
                        Tooth
                      </label>
                      <span className="text-sm text-foreground">{proc.tooth}</span>
                    </div>

                    {/* Surface */}
                    <div className="text-center">
                      <label className="sm:hidden block text-[10px] font-semibold text-muted-foreground mb-0.5">
                        Surface
                      </label>
                      <span className="text-sm text-foreground">{proc.surface}</span>
                    </div>

                    {/* Quantity */}
                    <div className="text-center">
                      <label className="sm:hidden block text-[10px] font-semibold text-muted-foreground mb-0.5">
                        Qty
                      </label>
                      <span className="text-sm text-foreground">{proc.quantity}</span>
                    </div>

                    {/* Unit Price */}
                    <div className="text-right">
                      <label className="sm:hidden block text-[10px] font-semibold text-muted-foreground mb-0.5">
                        Unit Price
                      </label>
                      <span className="text-sm text-foreground">
                        {formatCurrency(proc.unitPrice)}
                      </span>
                    </div>

                    {/* Total */}
                    <div className="text-right">
                      <label className="sm:hidden block text-[10px] font-semibold text-muted-foreground mb-0.5">
                        Total
                      </label>
                      <span className="text-sm font-bold text-foreground">
                        {formatCurrency(proc.total)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Billing Notes ── */}
          <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
              <FileText className="size-4 text-primary" />
              Billing Notes
            </h3>
            <textarea
              readOnly
              value={MOCK_BILLING_NOTE}
              className="h-20 w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-foreground outline-none resize-none dark:bg-background/10"
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN: Billing Summary ── */}
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow lg:sticky lg:top-24">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
              <DollarSign className="size-4 text-primary" />
              Current Visit Charges
            </h3>

            <div className="space-y-3">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(MOCK_BILLING_SUMMARY.subtotal)}
                </span>
              </div>

              {/* Discount */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {MOCK_BILLING_SUMMARY.discount > 0
                    ? `-${formatCurrency(MOCK_BILLING_SUMMARY.discount)}`
                    : formatCurrency(MOCK_BILLING_SUMMARY.discount)}
                </span>
              </div>

              {/* Tax */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(MOCK_BILLING_SUMMARY.tax)}
                </span>
              </div>

              <div className="border-t border-border pt-2">
                {/* Grand Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">Grand Total</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatCurrency(MOCK_BILLING_SUMMARY.currentVisitTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Outstanding Balance */}
            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 dark:bg-background/20">
              <h4 className="mb-2 text-xs font-bold text-foreground">Outstanding Balance</h4>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Previous Balance</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {formatCurrency(MOCK_BILLING_SUMMARY.previousOutstandingBalance)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Today's Charges</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(MOCK_BILLING_SUMMARY.currentVisitTotal)}
                  </span>
                </div>
                <div className="border-t border-border pt-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Total Outstanding</span>
                    <span className="text-base font-bold text-foreground">
                      {formatCurrency(MOCK_BILLING_SUMMARY.totalPatientBalance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 space-y-2">
              <Button className="w-full" onClick={handleGenerateInvoice}>
                <Receipt className="mr-1.5 size-4" />
                Generate Invoice
              </Button>
              <Button variant="outline" className="w-full" onClick={handleViewInvoice}>
                <FileText className="mr-1.5 size-4" />
                View Invoice
              </Button>
              <Button variant="outline" className="w-full" onClick={handlePrint}>
                <Printer className="mr-1.5 size-4" />
                Print Summary
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push('/treatment-summary')}
              >
                <ArrowLeft className="mr-1.5 size-4" />
                Back to Treatment Summary
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}