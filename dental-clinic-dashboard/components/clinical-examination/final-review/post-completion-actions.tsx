'use client';

import { Button } from '@/components/ui/button';
import { Eye, Printer, CalendarClock, Play, ArrowLeft, Calendar, User } from 'lucide-react';
import { dummyTreatmentPlan } from '../treatment/treatment-data';
import { PATIENT, CURRENT_USER, CURRENT_EXAMINATION, CLINIC_INFO } from '../patient-context';
import { LockedRecordBanner } from './locked-record-banner';
import { useState } from 'react';
import { ClinicalSummaryPrintPreview } from './clinical-summary-print-preview';

interface PostCompletionActionsProps {
  noTreatmentRequired: boolean;
}

export function PostCompletionActions({ noTreatmentRequired }: PostCompletionActionsProps) {
  const [showPrint, setShowPrint] = useState(false);

  if (showPrint) {
    return <ClinicalSummaryPrintPreview onClose={() => setShowPrint(false)} />;
  }

  const approvedItems = dummyTreatmentPlan.items.filter((item) => item.status === 'Proposed');
  const hasApprovedTreatment = !noTreatmentRequired && approvedItems.length > 0;

  return (
    <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
      <h3 className="text-lg font-bold text-foreground">Examination Complete</h3>
      <p className="mt-1 text-sm text-muted-foreground">The clinical examination has been successfully completed.</p>

      <LockedRecordBanner />

      {noTreatmentRequired ? (
        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
          No active treatment required. Routine examination with no significant clinical findings.
        </div>
      ) : null}

      <div className="mt-4">
        <h4 className="mb-2 text-sm font-bold text-foreground">Next Steps</h4>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm"><Eye className="mr-1.5 size-3.5" /> View Completed Examination</Button>
          <Button variant="outline" size="sm" onClick={() => setShowPrint(true)}>
            <Printer className="mr-1.5 size-3.5" /> Print Clinical Summary
          </Button>
          {hasApprovedTreatment && (
            <>
              <Button variant="outline" size="sm"><CalendarClock className="mr-1.5 size-3.5" /> Schedule Approved Treatment</Button>
              <Button variant="outline" size="sm"><Play className="mr-1.5 size-3.5" /> Start Treatment</Button>
            </>
          )}
          <Button variant="outline" size="sm"><ArrowLeft className="mr-1.5 size-3.5" /> Return to Appointments</Button>
          <Button variant="outline" size="sm"><User className="mr-1.5 size-3.5" /> View Patient Profile</Button>
        </div>
      </div>

      {hasApprovedTreatment && (
        <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4">
          <h4 className="mb-3 text-sm font-bold text-foreground">Schedule Approved Treatment</h4>
          <div className="space-y-2">
            {approvedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm dark:bg-background/30">
                <div>
                  <span className="font-semibold text-foreground">{item.procedure}</span>
                  <span className="ml-2 text-muted-foreground">Tooth {item.toothArea}</span>
                  <span className="ml-2 text-muted-foreground">· {item.estimatedDuration}</span>
                </div>
                <span className="text-xs text-muted-foreground">{item.dentist}</span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Button size="sm"><Calendar className="mr-1.5 size-3.5" /> Continue to Scheduling</Button>
          </div>
        </div>
      )}
    </div>
  );
}