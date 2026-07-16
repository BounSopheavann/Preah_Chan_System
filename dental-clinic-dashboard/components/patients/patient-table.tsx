'use client';

import {
  CalendarPlus,
  ChevronDown,
  ChevronsUpDown,
  Copy,
  Edit3,
  Eye,
  MoreHorizontal,
  QrCode,
  SearchX,
  UserPlus,
  UserX,
} from 'lucide-react';
import { useState } from 'react';

import { PatientAvatar } from './patient-avatar';
import { BalanceBadge, ConsentBadge, PatientStatusBadge, TelegramBadge } from './status-badge';
import type { Patient } from './patient-data';

export type PatientSortKey =
  | 'patientCode'
  | 'fullName'
  | 'gender'
  | 'phone'
  | 'lastVisit'
  | 'upcomingAppointment'
  | 'outstandingBalance'
  | 'consentStatus'
  | 'telegramStatus';

export type SortDirection = 'asc' | 'desc';

interface PatientTableProps {
  patients: Patient[];
  isLoading: boolean;
  sortKey: PatientSortKey;
  sortDirection: SortDirection;
  onSort: (key: PatientSortKey) => void;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onBookAppointment: (patient: Patient) => void;
  onGenerateQr: (patient: Patient) => void;
  onDeactivate: (patient: Patient) => void;
  onCreatePatient: () => void;
  onCopyCode: (patient: Patient) => void;
}

interface HeaderCellProps {
  label: string;
  sortKey?: PatientSortKey;
  activeSortKey: PatientSortKey;
  sortDirection: SortDirection;
  onSort: (key: PatientSortKey) => void;
  align?: 'left' | 'right' | 'center';
}

const alignClasses = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

function HeaderCell({
  label,
  sortKey,
  activeSortKey,
  sortDirection,
  onSort,
  align = 'left',
}: HeaderCellProps) {
  const isActive = sortKey === activeSortKey;

  if (!sortKey) {
    return (
      <th className={`px-4 py-3 text-xs font-bold uppercase tracking-normal text-muted-foreground ${alignClasses[align]}`}>
        {label}
      </th>
    );
  }

  return (
    <th className={`px-4 py-3 ${alignClasses[align]}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-normal transition-colors hover:text-foreground ${
          isActive ? 'text-foreground' : 'text-muted-foreground'
        } ${align === 'right' ? 'justify-end' : ''}`}
      >
        {label}
        {isActive ? (
          <ChevronDown className={`size-3.5 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
        ) : (
          <ChevronsUpDown className="size-3.5" />
        )}
      </button>
    </th>
  );
}

function TableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-t border-border/60">
          {Array.from({ length: 11 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-4">
              <div className="h-4 animate-pulse rounded-full bg-muted" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function EmptyState({ onCreatePatient }: { onCreatePatient: () => void }) {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center px-6 py-14 text-center">
      <div className="relative mb-5 flex size-24 items-center justify-center rounded-2xl border border-border bg-muted/60 text-primary theme-strong-shadow">
        <SearchX className="size-10" aria-hidden="true" />
        <span className="absolute -right-2 -top-2 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <UserPlus className="size-4" aria-hidden="true" />
        </span>
      </div>
      <h2 className="text-xl font-bold text-foreground">No patients found</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Adjust the search or filters, or create a new patient record to start the list.
      </p>
      <button
        type="button"
        onClick={onCreatePatient}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
      >
        <UserPlus className="size-4" />
        Create First Patient
      </button>
    </div>
  );
}

function RowActions({
  patient,
  onView,
  onEdit,
  onBookAppointment,
  onGenerateQr,
  onDeactivate,
  onCopyCode,
}: Omit<PatientTableProps, 'patients' | 'isLoading' | 'sortKey' | 'sortDirection' | 'onSort' | 'onCreatePatient'> & {
  patient: Patient;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const actionClass =
    'inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background/70 text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:bg-background/30';

  return (
    <div className="relative flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
      <button type="button" className={actionClass} onClick={() => onView(patient)} title="View patient">
        <Eye className="size-4" />
      </button>
      <button type="button" className={actionClass} onClick={() => onEdit(patient)} title="Edit patient">
        <Edit3 className="size-4" />
      </button>
      <button
        type="button"
        className={actionClass}
        onClick={() => onBookAppointment(patient)}
        title="Book appointment"
      >
        <CalendarPlus className="size-4" />
      </button>
      <button type="button" className={actionClass} onClick={() => onGenerateQr(patient)} title="Generate Telegram QR">
        <QrCode className="size-4" />
      </button>
      <button type="button" className={actionClass} onClick={() => onDeactivate(patient)} title="Deactivate patient">
        <UserX className="size-4" />
      </button>
      <button
        type="button"
        className={actionClass}
        onClick={() => setMenuOpen((current) => !current)}
        title="More actions"
        aria-expanded={menuOpen}
      >
        <MoreHorizontal className="size-4" />
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-10 z-20 w-56 overflow-hidden rounded-xl border border-border bg-popover p-1 text-sm text-popover-foreground shadow-xl">
          <button
            type="button"
            onClick={() => {
              onCopyCode(patient);
              setMenuOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
          >
            <Copy className="size-4 text-primary" />
            Copy Patient Code
          </button>
          <button
            type="button"
            onClick={() => {
              onGenerateQr(patient);
              setMenuOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
          >
            <QrCode className="size-4 text-primary" />
            Generate Telegram QR
          </button>
        </div>
      )}
    </div>
  );
}

export function PatientTable(props: PatientTableProps) {
  const {
    patients,
    isLoading,
    sortKey,
    sortDirection,
    onSort,
    onView,
    onEdit,
    onBookAppointment,
    onGenerateQr,
    onDeactivate,
    onCreatePatient,
    onCopyCode,
  } = props;

  return (
    <section
      className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl theme-surface-shadow"
      style={{ backdropFilter: 'blur(10px)' }}
    >
      <div className="flex flex-col gap-2 border-b border-border/70 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Patient Records</h2>
          <p className="text-sm text-muted-foreground">Sortable, paginated clinical directory</p>
        </div>
        <PatientStatusBadge status="Active" />
      </div>

      <div className="max-h-[660px] overflow-auto">
        <table className="min-w-[1220px] w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl">
            <tr>
              <HeaderCell label="Avatar" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
              <HeaderCell label="Patient Code" sortKey="patientCode" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
              <HeaderCell label="Full Name" sortKey="fullName" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
              <HeaderCell label="Gender" sortKey="gender" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
              <HeaderCell label="Phone" sortKey="phone" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
              <HeaderCell label="Last Visit" sortKey="lastVisit" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
              <HeaderCell label="Upcoming Appointment" sortKey="upcomingAppointment" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
              <HeaderCell label="Balance" sortKey="outstandingBalance" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} align="right" />
              <HeaderCell label="Consent" sortKey="consentStatus" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} align="center" />
              <HeaderCell label="Telegram" sortKey="telegramStatus" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} align="center" />
              <HeaderCell label="Actions" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} align="right" />
            </tr>
          </thead>

          {isLoading ? (
            <TableSkeleton />
          ) : (
            <tbody>
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => onView(patient)}
                  className="cursor-pointer border-t border-border/60 transition-all hover:bg-primary/5"
                >
                  <td className="px-4 py-4">
                    <PatientAvatar patient={patient} size="sm" />
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-primary">{patient.patientCode}</td>
                  <td className="px-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{patient.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">{patient.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">{patient.gender}</td>
                  <td className="px-4 py-4 text-sm text-foreground">{patient.phone}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{patient.lastVisit}</td>
                  <td className="px-4 py-4 text-sm text-foreground">{patient.upcomingAppointment}</td>
                  <td className="px-4 py-4 text-right">
                    <BalanceBadge amount={patient.outstandingBalance} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <ConsentBadge status={patient.consentStatus} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <TelegramBadge status={patient.telegramStatus} />
                  </td>
                  <td className="px-4 py-4">
                    <RowActions
                      patient={patient}
                      onView={onView}
                      onEdit={onEdit}
                      onBookAppointment={onBookAppointment}
                      onGenerateQr={onGenerateQr}
                      onDeactivate={onDeactivate}
                      onCopyCode={onCopyCode}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>

        {!isLoading && patients.length === 0 && <EmptyState onCreatePatient={onCreatePatient} />}
      </div>
    </section>
  );
}
