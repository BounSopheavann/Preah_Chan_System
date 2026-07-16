import { Search, X } from 'lucide-react';

interface AppointmentSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function AppointmentSearchBar({ value, onChange }: AppointmentSearchBarProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl theme-surface-shadow">
      <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/60 px-4 py-3 transition-all focus-within:border-primary/40 focus-within:bg-background/70 focus-within:shadow-[0_0_0_4px_rgba(14,165,233,0.10)] dark:bg-background/20">
        <Search className="size-5 shrink-0 text-primary" aria-hidden="true" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by patient name, patient code, phone, or dentist..."
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Clear appointment search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

