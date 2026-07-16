'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AppointmentPaginationProps {
  page: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function AppointmentPagination({
  page,
  pageCount,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: AppointmentPaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-4 border-t border-border/70 px-4 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
      <label className="flex items-center gap-2 font-semibold text-foreground">
        Rows per page
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-9 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground outline-none transition-all hover:bg-muted/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
        >
          {[6, 10, 15].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-3 md:items-end">
        <span>
          Showing {start}-{end} of {totalItems} appointments
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-background/70 px-3 font-semibold text-foreground transition-all hover:bg-muted disabled:pointer-events-none disabled:opacity-40 dark:bg-background/30"
          >
            <ChevronLeft className="size-4" />
            Prev
          </button>
          <span className="rounded-xl border border-border bg-muted/60 px-3 py-2 text-xs font-bold text-foreground">
            Page {page} of {pageCount || 1}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(pageCount, page + 1))}
            disabled={page >= pageCount}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-background/70 px-3 font-semibold text-foreground transition-all hover:bg-muted disabled:pointer-events-none disabled:opacity-40 dark:bg-background/30"
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

