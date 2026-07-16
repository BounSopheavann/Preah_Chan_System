import {
  type ConsentStatus,
  type PatientStatus,
  type TelegramStatus,
} from './patient-data';

type BadgeTone = 'green' | 'orange' | 'red' | 'gray' | 'blue';

interface StatusBadgeProps {
  children: React.ReactNode;
  tone: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  green:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  orange:
    'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300',
  red:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
  gray:
    'border-border bg-muted/70 text-muted-foreground dark:bg-muted/30',
  blue:
    'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
};

export function StatusBadge({ children, tone }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

export function ConsentBadge({ status }: { status: ConsentStatus }) {
  const tone: Record<ConsentStatus, BadgeTone> = {
    Accepted: 'green',
    Pending: 'orange',
    Declined: 'red',
  };

  return <StatusBadge tone={tone[status]}>{status}</StatusBadge>;
}

export function TelegramBadge({ status }: { status: TelegramStatus }) {
  return <StatusBadge tone={status === 'Linked' ? 'green' : 'gray'}>{status}</StatusBadge>;
}

export function BalanceBadge({ amount }: { amount: number }) {
  if (amount > 0) {
    return <StatusBadge tone="red">${amount.toLocaleString()}</StatusBadge>;
  }

  return <StatusBadge tone="green">Paid</StatusBadge>;
}

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  return <StatusBadge tone={status === 'Active' ? 'blue' : 'gray'}>{status}</StatusBadge>;
}
