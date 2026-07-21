# Billing / Invoice Workspace

## Overview

The Billing Workspace provides the full invoice creation, editing, payment, and finalization workflow for completed treatment sessions. It follows the existing UI patterns (cards, buttons, spacing, dark mode support) used throughout the Preah Chan Dental System.

## Route

`/billing` — Replaces the former placeholder page.

## Files Created

| File | Purpose |
|---|---|
| `components/billing/billing-data.ts` | Invoice, InvoiceItem, Payment types; helper functions for calculations and formatting |
| `components/billing/billing-store.ts` | Invoice persistence (localStorage), mutation functions, build from session |
| `components/billing/billing-workspace.tsx` | Main billing workspace component with all UI sections |
| `app/billing/page.tsx` | Route wrapper (replaced placeholder) |

## Files Modified

None. Existing files are NOT modified. The billing module is completely additive.

## Invoice Data Structure

```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;        // e.g. "INV-20260721-003"
  createdAt: string;
  finalizedAt?: string;
  status: InvoiceStatus;        // 'Draft' | 'Unpaid' | 'Partially Paid' | 'Paid'
  items: InvoiceItem[];
  payment: Payment;
  sessionId: string;            // Links back to the treatment session
  patientId: string;
  patientName: string;
  appointmentDate: string;
  dentist: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;            // Computed: (qty × unitPrice) - discount
  sourceExecutionId?: string;   // Links back to the ProcedureExecution record
  sourceTreatmentItemId?: string;
  isManualCharge: boolean;      // true for manually added charges
}

interface Payment {
  amountPaid: number;
  paymentMethod: 'Cash' | 'KHQR / Bank Transfer' | 'Card';
  paymentNote: string;
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
}
```

## How Completed Procedures Become Invoice Items

1. Patient completes procedures → clinical notes → Complete Visit → `session.status = 'Completed'`, `billingEligible = true` on all completed procedures
2. User navigates to `/billing`
3. `buildInvoiceFromSession()` reads `TreatmentFlowState` from localStorage
4. Filters to `billingEligible === true` procedures only
5. Creates one `InvoiceItem` per procedure with `quantity = 1`, `unitPrice = 0` (user enters), `discount = 0`
6. Each item retains `sourceExecutionId` and `sourceTreatmentItemId` as links
7. Procedures without a price allow manual entry by the user

## Calculation Logic

- **Line Total** = `max(0, quantity × unitPrice - discount)`
- **Subtotal** = `sum of (quantity × unitPrice)` across all items
- **Total Discount** = `sum of discount` across all items
- **Grand Total** = `max(0, subtotal - totalDiscount)`
- **Balance Due** = `max(0, grandTotal - amountPaid)`
- All calculations update immediately when any field changes

## Payment / Status Logic

- **Amount Paid**: User enters; clamped to `[0, grandTotal]` to prevent negative balance
- **Payment Status**: Auto-calculated:
  - `amountPaid <= 0` → `Unpaid`
  - `amountPaid < grandTotal` → `Partially Paid`
  - `amountPaid >= grandTotal` → `Paid`
- **Invoice Status**:
  - Before finalization: `Draft`
  - After finalization: matches `paymentStatus`
- **Change Due**: Shown when `amountPaid > grandTotal` (calculated, not prevented — just displayed)

## localStorage Persistence

- **Key**: `preah-chan-billing-invoice`
- Invoice is saved automatically on every mutation (field edit, payment update, add/remove charge)
- `saveDraftInvoice()` saves with status forced to `Draft`
- `finalizeInvoice()` sets status + `finalizedAt` timestamp
- `clearSavedInvoice()` available for cleanup
- On page load: saved invoice is restored if present; otherwise a new invoice is built from the session
- Refreshing the page preserves all entered data (prices, discounts, payment info)

## Validation

Validated before Finalize Invoice:
- At least 1 invoice item exists
- Every item has a non-empty description
- Quantity ≥ 1
- Unit price ≥ 0
- Discount ≥ 0
- Errors displayed as dismissible red banners (same pattern as Treatment Summary)

## UI Layout

- **Left column (7/10 width)**: Billable Procedures table + Payment section
- **Right column (3/10, sticky)**: Invoice Summary card with totals + actions
- Responsive: stacks vertically on mobile/small screens

## State Persistence Rules

- Invoice is stored separately from treatment session
- Finalizing an invoice does NOT modify:
  - `TreatmentSession`
  - `ProcedureExecution` records
  - `billingEligible` flags
  - Unfinished treatment plan items
- Manual charges are NOT linked to any procedure
- Manual charges can be removed; imported procedure items cannot

## Assumptions

1. Procedures without prices default to $0.00 — user must enter manually.
2. Payment amount is clamped to grand total (no negative balance allowed).
3. Change due is shown for informational purposes when overpayment occurs.
4. The existing `patient-table.tsx:377` TypeScript error (pre-existing) is unrelated.

## TODOs Remaining

- Full Receipt / Printable Invoice module (next phase)
- Invoice history / list of past invoices
- Edit finalized invoices (post-finalization corrections)
- Payment due dates / credit tracking
- Invoice email / print functionality
- Multi-currency support

## Payment Calculation Changes (2026-07-21 Fix)

### Overpayment / Change Due Logic

**Before (BUG):** `amountReceived` was clamped to `grandTotal`, preventing proper cash overpayment.

**After (FIXED):**
- `amountReceived` = actual cash entered by user (preserves the exact amount typed)
- `amountPaid` = `Math.min(amountReceived, grandTotal)` — amount actually applied to invoice
- `changeDue` = `Math.max(0, amountReceived - grandTotal)` — excess to return
- `balanceDue` = `Math.max(0, grandTotal - amountPaid)` — remaining invoice balance

Examples:

| Scenario | Grand Total | Amount Received | Amount Paid | Balance Due | Change Due | Status |
|---|---|---|---|---|---|---|
| No Payment | $100 | $0 | $0 | $100 | $0 | Unpaid |
| Partial Payment | $100 | $40 | $40 | $60 | $0 | Partially Paid |
| Exact Payment | $100 | $100 | $100 | $0 | $0 | Paid |
| Cash Overpayment | $100 | $120 | $100 | $0 | **$20** | Paid |

### Payment Method Changes

**Before:** `Cash` | `KHQR / Bank Transfer` | `Card`

**After:** `Cash` | `KHQR` | `Card` | `Bank Transfer` | `Other`

### Finalized Invoice Lock

After finalization, the following become read-only:
- Invoice item descriptions (manual charges)
- Quantity, unit price, discount on all items
- Amount Received
- Payment Method
- `+ Add Charge` button hidden
- Manual charge trash/delete icons hidden

The finalized invoice remains viewable and survives page refresh.

### Payment Status

Payment status is calculated from `amountPaid` (NOT `amountReceived`):
- `amountPaid <= 0` → Unpaid
- `amountPaid < grandTotal` → Partially Paid
- `amountPaid >= grandTotal` → Paid

Invoice status = `Draft` before finalization; matches `paymentStatus` after.

### UI Changes (Invoice Summary)

Added explicit display of **Amount Received** and **Change Due** rows in the Invoice Summary card (shown only when applicable).

## Build/TypeScript Result

Next.js build completed successfully with no new errors.
Only the 3 billing files were modified. No clinical/treatment files were touched.

## Files Changed (this fix round)
- `components/billing/billing-data.ts` — Payment interface: added `amountReceived`, `changeDue` fields. Expanded `PaymentMethod` type. Added `calculateChangeDue()` helper.
- `components/billing/billing-store.ts` — `updatePayment()`: now takes `amountReceived`, computes `amountPaid` + `changeDue` + `paymentStatus`. `buildInvoiceFromSession()`: initializes new Payment fields.
- `components/billing/billing-workspace.tsx` — Payment section uses `amountReceived` input. Change Due computed. Summary shows Amount Received / Change Due. `disabled` prop locks all fields after finalization.
