/**
 * Billing Route – Placeholder
 *
 * TODO: Implement Billing module.
 * After a successful Complete Visit from Treatment Summary,
 * this page is the intended destination. At minimum it should
 * display the completed procedures and calculated charges
 * from the treatment session stored in localStorage.
 *
 * For now, this is a placeholder that shows a simple message
 * and provides navigation back to Treatment Execution.
 */

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BillingPlaceholderPage() {
  return (
    <div className="space-y-4 mx-[100px]">
      <div>
        <Link
          href="/treatment-execution"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Treatment Execution
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card/90 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <span className="text-2xl font-bold text-primary">$</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The Billing module has not been implemented yet.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Visit completed successfully. Completed procedures are marked as billing-eligible
          in the local state. This page should display itemized charges and payment processing.
        </p>
        <div className="mt-6">
          <Link
            href="/treatment-execution"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Treatment Execution
          </Link>
        </div>
      </div>
    </div>
  );
}