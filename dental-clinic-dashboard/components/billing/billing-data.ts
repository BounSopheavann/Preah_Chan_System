'use client';

import type { ProcedureExecution } from '@/components/treatment-execution/treatment-execution-data';

/* ── Invoice Types ── */

export type InvoiceStatus = 'Draft' | 'Unpaid' | 'Partially Paid' | 'Paid';

export type PaymentMethod = 'Cash' | 'KHQR / Bank Transfer' | 'Card';

export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid';

export interface InvoiceItem {
  id: string;
  /** Description of the line item */
  description: string;
  /** Quantity (default 1) */
  quantity: number;
  /** Unit price in USD */
  unitPrice: number;
  /** Discount in USD */
  discount: number;
  /** Computed line total = (quantity * unitPrice) - discount */
  lineTotal: number;
  /** If the item originated from a completed procedure, reference its execution id */
  sourceExecutionId?: string;
  /** If the item originated from a completed procedure, reference its treatmentItemId */
  sourceTreatmentItemId?: string;
  /** Whether this is a manually added charge (not from treatment) */
  isManualCharge: boolean;
}

export interface Payment {
  amountPaid: number;
  paymentMethod: PaymentMethod;
  paymentNote: string;
  paymentStatus: PaymentStatus;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  finalizedAt?: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  payment: Payment;
  /** Link back to the treatment session this invoice was created from */
  sessionId: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  dentist: string;
}

/* ── Helpers ── */

export function calculateLineTotal(quantity: number, unitPrice: number, discount: number): number {
  return Math.max(0, quantity * unitPrice - discount);
}

export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function calculateTotalDiscount(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.discount, 0);
}

export function calculateGrandTotal(items: InvoiceItem[]): number {
  return Math.max(0, calculateSubtotal(items) - calculateTotalDiscount(items));
}

export function calculateBalanceDue(grandTotal: number, amountPaid: number): number {
  return Math.max(0, grandTotal - amountPaid);
}

export function determinePaymentStatus(grandTotal: number, amountPaid: number): PaymentStatus {
  if (amountPaid <= 0) return 'Unpaid';
  if (amountPaid < grandTotal) return 'Partially Paid';
  return 'Paid';
}

export function determineInvoiceStatus(
  isFinalized: boolean,
  paymentStatus: PaymentStatus
): InvoiceStatus {
  if (!isFinalized) return 'Draft';
  return paymentStatus;
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Build invoice items array from completed procedures that are billing-eligible.
 * Each procedure becomes one InvoiceItem with default quantity=1.
 * If the procedure has an estimatedPrice, that is used as unitPrice; otherwise 0.
 */
export function buildInvoiceItemsFromProcedures(
  completedProcedures: ProcedureExecution[]
): InvoiceItem[] {
  return completedProcedures
    .filter((proc) => proc.billingEligible === true)
    .map((proc) => {
      const quantity = proc.quantity || 1;
      // Use estimated price from procedure if it exists (from the plan item)
      // Since ProcedureExecution doesn't store price directly, default to 0 and let user enter
      const unitPrice = 0;
      return {
        id: `inv-item-${proc.id}-${Date.now()}`,
        description: proc.procedure,
        quantity,
        unitPrice,
        discount: 0,
        lineTotal: calculateLineTotal(quantity, unitPrice, 0),
        sourceExecutionId: proc.id,
        sourceTreatmentItemId: proc.treatmentItemId,
        isManualCharge: false,
      };
    });
}

/**
 * Generate a simple invoice number.
 */
export function generateInvoiceNumber(): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${datePart}-${rand}`;
}