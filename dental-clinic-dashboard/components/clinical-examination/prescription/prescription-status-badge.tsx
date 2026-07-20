'use client';

import { FileEdit, FileCheck2, FileClock, FileX2 } from 'lucide-react';
import type { PrescriptionStatus } from './prescription-data';
import { prescriptionStatusBadgeColor } from './prescription-data';

const statusIcon: Record<PrescriptionStatus, React.ReactNode> = {
  Draft: <FileEdit className="size-3" aria-hidden="true" />,
  Finalized: <FileCheck2 className="size-3" aria-hidden="true" />,
  Amended: <FileClock className="size-3" aria-hidden="true" />,
  Cancelled: <FileX2 className="size-3" aria-hidden="true" />,
};

export function PrescriptionStatusBadge({ status }: { status: PrescriptionStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${prescriptionStatusBadgeColor[status]}`}
    >
      {statusIcon[status]}
      {status}
    </span>
  );
}