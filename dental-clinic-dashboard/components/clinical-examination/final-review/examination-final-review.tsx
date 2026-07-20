'use client';

import { useMemo, useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExamTab, AmendmentRecord, StatusLogEvent, OdontogramRecordLite, buildReviewModel, createSeedStatusLog } from './final-review-data';
import { ExaminationReviewHeader } from './examination-review-header';
import { ExaminationCompletionSummary } from './examination-completion-summary';
import { ReviewSectionCard } from './review-section-card';
import { ExaminationValidationPanel } from './examination-validation-panel';
import { CompleteExaminationModal } from './complete-examination-modal';
import { ExaminationStatusLog } from './examination-status-log';
import { AmendmentHistory } from './amendment-history';
import { PostCompletionActions } from './post-completion-actions';
import { AddAmendmentModal } from './add-amendment-modal';

type ReviewStep = 'review' | 'confirm' | 'completed';

interface ExaminationFinalReviewProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: ExamTab) => void;
  odontogramRecords: Record<number, OdontogramRecordLite>;
  noClinicalProblem: boolean;
  noTreatmentRequired: boolean;
  unsavedChanges: boolean;
  onComplete: (result: { status: 'Completed'; amendments: AmendmentRecord[]; statusLog: StatusLogEvent[] }) => void;
  onAddAmendment: (amendment: AmendmentRecord) => void;
  existingAmendments: AmendmentRecord[];
  existingStatusLog: StatusLogEvent[];
  onSetNoClinicalProblem: (value: boolean) => void;
  onSetNoTreatmentRequired: (value: boolean) => void;
}

export function ExaminationFinalReview({
  open,
  onClose,
  onNavigate,
  odontogramRecords,
  noClinicalProblem,
  noTreatmentRequired,
  unsavedChanges,
  onComplete,
  onAddAmendment,
  existingAmendments,
  existingStatusLog,
  onSetNoClinicalProblem,
  onSetNoTreatmentRequired,
}: ExaminationFinalReviewProps) {
  const [step, setStep] = useState<ReviewStep>('review');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);

  const model = useMemo(
    () => buildReviewModel({ odontogramRecords, noClinicalProblem, noTreatmentRequired }),
    [odontogramRecords, noClinicalProblem, noTreatmentRequired]
  );

  useEffect(() => {
    if (open) setStep('review');
  }, [open]);

  if (!open) return null;

  const handleCompleteClick = () => {
    if (unsavedChanges) {
      setShowUnsavedWarning(true);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmComplete = () => {
    setShowConfirm(false);
    setStep('completed');
    const completionEvent: StatusLogEvent = {
      id: `sl-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      user: 'Dr. Maya',
      action: 'Examination Completed',
    };
    onComplete({
      status: 'Completed',
      amendments: existingAmendments,
      statusLog: [...existingStatusLog, completionEvent],
    });
  };

  const handleFix = (tab?: ExamTab) => {
    if (tab) {
      onNavigate(tab);
      onClose();
    }
  };

  const handleSaveAndReturn = () => {
    setShowUnsavedWarning(false);
    onNavigate('odontogram');
    onClose();
  };

  const handleDiscard = () => {
    setShowUnsavedWarning(false);
    setShowConfirm(true);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 pt-8" onClick={onClose}>
      <div className="w-full max-w-4xl rounded-2xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {step === 'review' && (
          <>
            <ExaminationReviewHeader onClose={onClose} />
            <div className="mt-4 space-y-4">
              <ExaminationCompletionSummary model={model} />
              <ExaminationValidationPanel issues={model.issues} readyToComplete={model.readyToComplete} onFix={handleFix} />

              {/* No Clinical Problem + No Treatment Toggles */}
              <div className="flex flex-wrap gap-4 rounded-2xl border border-border bg-muted/30 p-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={noClinicalProblem} onChange={(e) => onSetNoClinicalProblem(e.target.checked)} className="rounded border-border" />
                  <span className="text-sm font-semibold text-foreground">No Clinical Problem Found</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={noTreatmentRequired} onChange={(e) => onSetNoTreatmentRequired(e.target.checked)} className="rounded border-border" />
                  <span className="text-sm font-semibold text-foreground">No Treatment Required</span>
                </label>
              </div>

              {/* Review Section Cards */}
              <div className="grid gap-3">
                {model.sections.map((section) => (
                  <ReviewSectionCard key={section.key} section={section} onReview={handleFix} />
                ))}
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleCompleteClick} disabled={!model.readyToComplete}>
                <CheckCircle2 className="mr-1.5 size-4" />
                Complete Examination
              </Button>
            </div>
          </>
        )}

        {step === 'completed' && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Examination Completed</h2>
              <button type="button" onClick={onClose} className="rounded-xl border border-border p-1.5 text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-4">
              <PostCompletionActions noTreatmentRequired={noTreatmentRequired} />
              <ExaminationStatusLog events={existingStatusLog} />
              <AmendmentHistory amendments={existingAmendments} onAddAmendment={() => setShowAmendmentModal(true)} />
            </div>
          </>
        )}

        {/* Unsaved Changes Warning */}
        {showUnsavedWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowUnsavedWarning(false)}>
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground">Unsaved Changes</h3>
              <p className="mt-2 text-sm text-muted-foreground">Some changes have not been saved. What would you like to do?</p>
              <div className="mt-4 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowUnsavedWarning(false)}>Cancel</Button>
                <Button variant="secondary" onClick={handleDiscard}>Discard Unsaved Changes</Button>
                <Button onClick={handleSaveAndReturn}>Return and Save</Button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <CompleteExaminationModal open={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleConfirmComplete} />

        {/* Amendment Modal */}
        <AddAmendmentModal open={showAmendmentModal} onClose={() => setShowAmendmentModal(false)} onSave={(amendment) => { onAddAmendment(amendment); setShowAmendmentModal(false); }} />
      </div>
    </div>
  );
}