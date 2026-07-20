'use client';

import { ReviewModel } from './final-review-data';
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
} from 'lucide-react';

interface CompletionSummaryProps {
  model: ReviewModel;
}

export function ExaminationCompletionSummary({ model }: CompletionSummaryProps) {
  const iconMap: Record<string, React.ReactNode> = {
    clinical: <Stethoscope className="size-4" />,
    odontogram: <ClipboardList className="size-4" />,
    xrays: <Scan className="size-4" />,
    diagnosis: <Activity className="size-4" />,
    treatment: <FileText className="size-4" />,
    prescription: <Pill className="size-4" />,
    progress: <NotebookPen className="size-4" />,
  };

  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4">
      <h3 className="mb-3 text-sm font-bold text-foreground">Examination Completion Summary</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {model.sections.map((section) => (
          <div
            key={section.key}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background/70 px-2 py-3 text-center dark:bg-background/30"
          >
            <div
              className={`rounded-full p-1.5 ${
                section.status === 'Complete'
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : section.status === 'Optional'
                  ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  : 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
              }`}
            >
              {iconMap[section.key]}
            </div>
            <span className="text-[11px] font-semibold text-foreground">{section.title.split('/')[0].trim()}</span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
              {section.status === 'Complete' ? (
                <CheckCircle2 className="size-3 text-emerald-500" />
              ) : section.status === 'Optional' ? (
                <MinusCircle className="size-3 text-slate-400" />
              ) : (
                <AlertCircle className="size-3 text-rose-500" />
              )}
              {section.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}