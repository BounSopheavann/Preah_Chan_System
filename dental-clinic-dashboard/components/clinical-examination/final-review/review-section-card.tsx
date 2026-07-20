'use client';

import { Button } from '@/components/ui/button';
import { SectionSummary, ExamTab } from './final-review-data';
import {
  Stethoscope,
  ClipboardList,
  Scan,
  Activity,
  FileText,
  Pill,
  NotebookPen,
  CheckCircle2,
  MinusCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  clinical: <Stethoscope className="size-5" />,
  odontogram: <ClipboardList className="size-5" />,
  xrays: <Scan className="size-5" />,
  diagnosis: <Activity className="size-5" />,
  treatment: <FileText className="size-5" />,
  prescription: <Pill className="size-5" />,
  progress: <NotebookPen className="size-5" />,
};

interface ReviewSectionCardProps {
  section: SectionSummary;
  onReview: (tab: ExamTab) => void;
}

export function ReviewSectionCard({ section, onReview }: ReviewSectionCardProps) {
  const isComplete = section.status === 'Complete';
  const isOptional = section.status === 'Optional';

  return (
    <div className="rounded-2xl border border-border bg-card/90 p-4 theme-surface-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`rounded-xl p-2.5 ${
              isComplete
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                : isOptional
                ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                : 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
            }`}
          >
            {iconMap[section.key]}
          </div>
          <div>
            <h4 className="text-base font-bold text-foreground">{section.title}</h4>
            <div className="mt-1 space-y-0.5 text-sm text-muted-foreground whitespace-pre-line">
              {section.summary}
            </div>
            {section.warning && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <AlertCircle className="size-3.5" />
                {section.warning}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            isComplete
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
              : isOptional
              ? 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
          }`}>
            {isComplete ? (
              <CheckCircle2 className="size-3" />
            ) : isOptional ? (
              <MinusCircle className="size-3" />
            ) : (
              <AlertCircle className="size-3" />
            )}
            {section.status}
          </span>
          <Button variant="outline" size="sm" onClick={() => onReview(section.targetTab)}>
            Review <ArrowRight className="ml-1 size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}