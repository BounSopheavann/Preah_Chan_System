'use client';

import { RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { imageTypeOptions } from './image-data';

interface ImageFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  toothFilter: string;
  onToothFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  uploadedByFilter: string;
  onUploadedByFilterChange: (value: string) => void;
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (value: boolean) => void;
  onReset: () => void;
}

export function ImageFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  toothFilter,
  onToothFilterChange,
  dateFilter,
  onDateFilterChange,
  uploadedByFilter,
  onUploadedByFilterChange,
  favoritesOnly,
  onFavoritesOnlyChange,
  onReset,
}: ImageFiltersProps) {
  const filterSelectClass =
    'h-10 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground outline-none transition-all hover:bg-muted/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 min-w-0';

  const hasFilters = search || typeFilter !== 'All' || toothFilter || dateFilter || uploadedByFilter !== 'All' || favoritesOnly;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search image name..."
          className="h-10 w-full rounded-xl border border-border bg-background/70 pl-9 pr-3 text-sm text-foreground outline-none transition-all hover:bg-muted/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className={filterSelectClass}
        >
          <option value="All">All Types</option>
          {imageTypeOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <input
          type="text"
          value={toothFilter}
          onChange={(e) => onToothFilterChange(e.target.value)}
          placeholder="Tooth #"
          className={filterSelectClass}
        />

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
          className={filterSelectClass}
        />

        <select
          value={uploadedByFilter}
          onChange={(e) => onUploadedByFilterChange(e.target.value)}
          className={filterSelectClass}
        >
          <option value="All">All Uploaders</option>
          <option value="Dr. Maya">Dr. Maya</option>
          <option value="Dr. Sarah">Dr. Sarah</option>
          <option value="Dr. John">Dr. John</option>
        </select>

        <label className="col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/70 px-3 py-2.5 transition-all hover:bg-muted/60 sm:col-span-1 dark:bg-background/30">
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(e) => onFavoritesOnlyChange(e.target.checked)}
            className="size-4 rounded-lg border-border text-primary accent-primary"
          />
          <span className="text-sm font-semibold text-foreground">Favorites Only</span>
        </label>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="size-3.5" />
            Reset Filters
          </Button>
          <span className="text-xs text-muted-foreground">Active filters applied</span>
        </div>
      )}
    </div>
  );
}