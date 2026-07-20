'use client';

import { FileText, Image as ImageIcon, FileImage, FlaskConical, Send, FileSignature } from 'lucide-react';
import type { AttachmentType } from './progress-notes-data';

const iconMap: Record<AttachmentType, React.ReactNode> = {
  Image: <ImageIcon className="size-4" />,
  'X-ray': <FileImage className="size-4" />,
  PDF: <FileText className="size-4" />,
  'Lab Result': <FlaskConical className="size-4" />,
  'Referral Document': <Send className="size-4" />,
  'Consent Form': <FileSignature className="size-4" />,
};

const colorMap: Record<AttachmentType, string> = {
  Image: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  'X-ray': 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300',
  PDF: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  'Lab Result': 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
  'Referral Document': 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  'Consent Form': 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
};

export function AttachmentCard({ name, type }: { name: string; type: AttachmentType }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${colorMap[type]}`}>
      {iconMap[type]}
      {name}
    </span>
  );
}