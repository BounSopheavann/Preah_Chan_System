import { type AppointmentStatus } from './appointment-data';

type BadgeTone = 'sky' | 'blue' | 'emerald' | 'violet' | 'green' | 'red' | 'amber' | 'gray';

interface StatusBadgeProps {
  children: React.ReactNode;
  tone: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  sky: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
  emerald:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  violet:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
  green:
    'border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300',
  red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
  amber:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  gray: 'border-border bg-muted/70 text-muted-foreground dark:bg-muted/30',
};

export function StatusBadge({ children, tone }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const tone: Record<AppointmentStatus, BadgeTone> = {
    Booked: 'sky',
    Confirmed: 'blue',
    'Checked-in': 'emerald',
    'In Chair': 'violet',
    Completed: 'green',
    Cancelled: 'red',
    'No-show': 'amber',
  };

  return <StatusBadge tone={tone[status]}>{status}</StatusBadge>;
}

export function CheckInBadge({
  status,
  label,
}: {
  status: AppointmentStatus;
  label: string;
}) {
  const tone: Record<AppointmentStatus, BadgeTone> = {
    Booked: 'amber',
    Confirmed: 'sky',
    'Checked-in': 'emerald',
    'In Chair': 'violet',
    Completed: 'green',
    Cancelled: 'gray',
    'No-show': 'red',
  };

  return <StatusBadge tone={tone[status]}>{label}</StatusBadge>;
}

export function BalanceBadge({ amount }: { amount: number }) {
  if (amount > 0) {
    return <StatusBadge tone="red">${amount.toLocaleString()}</StatusBadge>;
  }

  return <StatusBadge tone="green">Paid</StatusBadge>;
}

