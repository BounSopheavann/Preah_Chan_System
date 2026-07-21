# Receipt / Payment Confirmation UI

## Overview

The Receipt / Payment Confirmation page is the final step in the billing workflow. It displays a read-only snapshot of the finalized invoice, providing a professional receipt that can be printed or saved as PDF.

## Architecture

```
Treatment Execution
  → Active Procedure Workspace
    → Treatment Summary
      → Billing / Invoice Workspace
        → Finalize Invoice
          → Receipt / Payment Confirmation  ← THIS COMPONENT
            → Finish Visit
```

The receipt is generated **from** the finalized invoice — it does not recalculate or edit financial data.

## Route

- **`/receipt`** — Receipt / Payment Confirmation page

## Files Created

| File | Purpose |
|------|---------|
| `components/billing/receipt-workspace.tsx` | Main receipt workspace component |
| `app/receipt/page.tsx` | Route page wrapping the workspace |

## Files Modified

| File | Change |
|------|--------|
| `components/billing/billing-data.ts` | Added `Receipt`, `ReceiptItem` interfaces and `generateReceiptNumber()` |
| `components/billing/billing-store.ts` | Added `loadSavedReceipt`, `saveReceipt`, `clearSavedReceipt`, `buildReceiptFromInvoice` |
| `components/billing/billing-workspace.tsx` | Finalize Invoice now navigates to `/receipt` |

## Data Model

### Receipt

```typescript
interface Receipt {
  id: string;
  receiptNumber: string;  // e.g. RCP-20260721-001
  invoiceNumber: string;
  invoiceId: string;
  createdAt: string;       // ISO timestamp when receipt was generated
  sessionId: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  dentist: string;
  items: ReceiptItem[];
  subtotal: number;
  totalDiscount: number;
  grandTotal: number;
  amountReceived: number;
  amountPaid: number;
  changeDue: number;
  balanceDue: number;
  paymentMethod: PaymentMethod;
  paymentNote: string;
  paymentStatus: PaymentStatus;
  invoiceStatus: InvoiceStatus;
  finalizedAt: string;
}
```

### ReceiptItem

```typescript
interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
  isManualCharge: boolean;
}
```

## Persistence

- **Storage Key:** `preah-chan-billing-receipt` (separate from `preah-chan-billing-invoice`)
- **Storage Type:** localStorage
- **Duplicate Protection:** `buildReceiptFromInvoice()` checks if a receipt already exists for the given invoice ID. If one exists, it returns the existing receipt instead of generating a new one. This ensures refreshing the page does NOT create a duplicate receipt number.

## Receipt Number Generation

Format: `RCP-YYYYMMDD-NNN`

- `YYYYMMDD` = current date
- `NNN` = random 3-digit number (zero-padded)
- Generated once at creation time, stable across page refreshes

## Key Behaviors

### Finalize Invoice → Navigate to Receipt
When the user clicks "Finalize Invoice" in the billing workspace:
1. Validation runs
2. Invoice is finalized via `finalizeInvoice()`
3. Finalized invoice is persisted to `preah-chan-billing-invoice`
4. Navigation to `/receipt` occurs
5. Receipt page loads, detects finalized invoice, calls `buildReceiptFromInvoice()` which generates and persists the receipt

### Refresh Safety
- Loading an existing receipt from localStorage (checks `invoiceId`)
- Refreshing returns the same receipt with the same receipt number

### Direct Access Without Finalized Invoice
- Shows clean empty state: "No Finalized Invoice Available"
- Provides "Return to Billing" button

### Read-Only
- No editable fields
- No quantity/price/discount changes
- No payment amount edits
- No Add/Remove charges
- Read-only table display

### Payment Confirmation Messages

| Payment Status | Title | Message |
|---------------|-------|---------|
| Paid | Payment Confirmed | "Payment has been successfully recorded." |
| Partially Paid | Partial Payment Recorded | "Outstanding balance: $XX.XX" |
| Unpaid | Invoice Finalized | "No payment has been recorded." |

### Print / Save as PDF
- Uses `window.print()`
- Print-specific CSS hides action buttons, navigation, and unrelated controls
- Receipt container removes border/shadow for clean printed output
- "Save as PDF" triggers the browser print dialog where user can select "Save as PDF"

### Finish Visit
- Navigates to `/treatment-execution` (dashboard)
- Does NOT destroy financial history
- Does NOT modify clinical data
- Invoice and receipt remain in localStorage

## UI Sections

1. **Page Header** — Receipt number, payment status badge, finalized indicator
2. **Patient / Visit Information** — Patient name/ID, visit date, dentist, invoice number, payment date
3. **Receipt Items Table** — Read-only table with #, Description, Qty, Unit Price, Discount, Total
4. **Invoice Summary** — Subtotal, Total Discount, Grand Total
5. **Payment Details** — Amount Received, Amount Paid, Change Due, Balance Due, Payment Method, Payment Status, Note
6. **Payment Confirmation Section** — Contextual message based on payment status
7. **Footer** — Receipt number, invoice number, generation timestamp, clinic name

## Action Buttons (Non-printable)

| Button | Behavior |
|--------|----------|
| Back to Billing | Navigates to `/billing` |
| Print Receipt | Opens browser print dialog |
| Save as PDF | Opens browser print dialog (user selects "Save as PDF") |
| Finish Visit | Navigates to `/treatment-execution` |

## Responsive Layout

- Desktop: Clean receipt/document layout with 2-column payment summary
- Mobile: Vertical stacking, table remains usable with horizontal scroll, buttons accessible

## Acceptance Tests

### Scenario 1 — Fully Paid Invoice
- Grand Total: $100, Amount Received: $100, Paid status
- Navigates to Receipt page with correct receipt number
- Correct items displayed
- Paid badge shown
- $100 Amount Received, $100 Amount Paid, $0 Balance Due, no incorrect Change Due
- Survives refresh

### Scenario 2 — Cash Overpayment
- Grand Total: $100, Amount Received: $120, Amount Paid: $100
- Change Due: $20, Balance Due: $0
- Change Due NOT counted as revenue

### Scenario 3 — Partial Payment
- Grand Total: $100, Amount Received: $40
- Partially Paid badge
- Outstanding balance: $60
- Confirmation: "Partial Payment Recorded"

### Scenario 4 — Unpaid Finalized Invoice
- Grand Total: $100, Amount Received: $0
- Unpaid status
- No false "Payment Confirmed" message
- Outstanding balance: $100

### Scenario 5 — Refresh
- Same receipt restored, no duplicate, same receipt number

### Scenario 6 — Direct Access Without Finalized Invoice
- Clean empty state, no crash, Return to Billing available

### Scenario 7 — Read-Only Safety
- No editable fields, no Add/Remove charges

### Scenario 8 — Clinical Safety
- Clinical data not modified

## Edge Cases

- If the receipt page is accessed with a Draft invoice, it shows the empty state (receipt requires finalized invoice)
- If both invoice and receipt are missing, empty state is shown
- If receipt exists but invoice was deleted, receipt still displays correctly
- Change Due only displays when > $0
- Amount Received only shown when > $0