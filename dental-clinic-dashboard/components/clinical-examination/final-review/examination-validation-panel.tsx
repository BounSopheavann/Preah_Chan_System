'use client';

import { Button } from '@/components/ui/button';
import { ValidationIssue, ExamTab } from './final-review-data';
import { AlertTriangle, CheckCircle2, ArrowRight, XCircle } from 'lucide-react';

interface ValidationPanelProps {
  issues: ValidationIssue[];
  readyToComplete: boolean;
  onFix: (tab?: ExamTab) => void;
}

export function ExaminationValidationPanel({ issues, readyToComplete, onFix }: ValidationPanelProps) {
  const blocking = issues.filter((i) => i.level === 'blocking');
  const recommendations = issues.filter((i) => i.level === 'recommendation');

  if (readyToComplete && recommendations.length === 0) return null;

  return (
    <div className={`rounded-2xl border p-4 ${
      readyToComplete
        ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
        : 'border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10'
    }`}>
      <div className="flex items-center gap-2">
        {readyToComplete ? (
          <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <XCircle className="size-5 text-rose-600 dark:text-rose-400" />
        )}
        <h3 className="text-sm font-bold text-foreground">
          {readyToComplete ? 'Ready to Complete' : 'Action Required'}
        </h3>
      </div>
      {!readyToComplete && (
        <p className="mt-1 text-sm text-muted-foreground">
          {blocking.length} item{blocking.length !== 1 ? 's' : ''} need{blocking.length === 1 ? 's' : ''} attention before completing this examination.
        </p>
      )}
      <div className="mt-3 space-y-2">
        {blocking.map((issue) => (
          <CompletionIssueItem key={issue.id} issue={issue} onFix={onFix} />
        ))}
        {recommendations.map((issue) => (
          <CompletionIssueItem key={issue.id} issue={issue} onFix={onFix} />
        ))}
      </div>
    </div>
  );
}

function CompletionIssueItem({ issue, onFix }: { issue: ValidationIssue; onFix: (tab?: ExamTab) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/70 px-3 py-2.5 dark:bg-background/30">
      <div className="flex items-start gap-2">
        {issue.level === 'blocking' ? (
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-500" />
        ) : (
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
        )}
        <div>
          <p className="text-sm font-semibold text-foreground">{issue.message}</p>
          <p className="text-xs text-muted-foreground">{issue.detail}</p>
        </div>
      </div>
      {issue.targetTab && (
        <Button variant="outline" size="sm" onClick={() => onFix(issue.targetTab)}>
          Fix <ArrowRight className="ml-1 size-3.5" />
        </Button>
      )}
    </div>
  );
}