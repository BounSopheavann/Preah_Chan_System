'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, totalItems, pageSize, onPageChange }: PaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
      <span>
        Showing {start}-{end} of {totalItems} patients
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
          {page} / {pageCount || 1}
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
  );
}
