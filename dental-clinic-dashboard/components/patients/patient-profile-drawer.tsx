'use client';

import {
  CalendarPlus,
  Copy,
  CreditCard,
  FileImage,
  FileText,
  FolderOpen,
  HeartPulse,
  MapPin,
  Phone,
  QrCode,
  ReceiptText,
  UserRound,
  X,
} from 'lucide-react';

import { PatientAvatar } from './patient-avatar';
import { BalanceBadge, ConsentBadge, TelegramBadge } from './status-badge';
import type { Patient } from './patient-data';

export type PatientDrawerTab = 'Overview' | 'Medical' | 'Appointments' | 'Billing' | 'Files';

interface PatientProfileDrawerProps {
  patient: Patient | null;
  activeTab: PatientDrawerTab;
  onTabChange: (tab: PatientDrawerTab) => void;
  onClose: () => void;
  onBookAppointment: (patient: Patient) => void;
  onGenerateQr: (patient: Patient) => void;
  onCopyCode: (patient: Patient) => void;
}

const tabs: PatientDrawerTab[] = ['Overview', 'Medical', 'Appointments', 'Billing', 'Files'];

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-3 dark:bg-background/20">
      <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  tone = 'default',
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: 'default' | 'primary';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition-all hover:-translate-y-0.5 ${
        tone === 'primary'
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90'
          : 'border border-border bg-background/70 text-foreground hover:bg-muted dark:bg-background/30'
      }`}
    >
      {children}
    </button>
  );
}

function OverviewTab({ patient }: { patient: Patient }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DetailRow label="Patient Code" value={patient.patientCode} />
      <DetailRow label="Phone" value={patient.phone} />
      <DetailRow label="Email" value={patient.email} />
      <DetailRow label="Gender" value={patient.gender} />
      <DetailRow label="Date of Birth" value={patient.dateOfBirth} />
      <DetailRow label="Preferred Contact" value={patient.preferredContactMethod} />
      <div className="sm:col-span-2">
        <DetailRow label="Address" value={patient.address} />
      </div>
      <DetailRow label="Emergency Contact" value={patient.emergencyContact} />
      <DetailRow label="Emergency Phone" value={patient.emergencyPhone} />
    </div>
  );
}

function MedicalTab({ patient }: { patient: Patient }) {
  return (
    <div className="grid gap-3">
      <DetailRow label="Allergies" value={patient.allergies.join(', ')} />
      <DetailRow label="Medical Conditions" value={patient.medicalConditions.join(', ')} />
      <DetailRow label="Current Medication" value={patient.currentMedication.join(', ')} />
      <DetailRow label="Consent" value={<ConsentBadge status={patient.consentStatus} />} />
    </div>
  );
}

function AppointmentsTab({ patient }: { patient: Patient }) {
  return (
    <div className="space-y-3">
      {patient.appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="rounded-xl border border-border/60 bg-background/50 p-4 transition-colors hover:bg-muted/50 dark:bg-background/20"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">{appointment.type}</p>
              <p className="mt-1 text-sm text-muted-foreground">{appointment.date} with {appointment.dentist}</p>
            </div>
            <span className="rounded-full border border-border bg-muted/70 px-2.5 py-1 text-xs font-bold text-muted-foreground">
              {appointment.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function BillingTab({ patient }: { patient: Patient }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailRow label="Outstanding Balance" value={<BalanceBadge amount={patient.outstandingBalance} />} />
        <DetailRow label="Payment Preference" value={patient.preferredContactMethod} />
      </div>

      <div className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <ReceiptText className="size-4 text-primary" />
          Invoices
        </h3>
        {patient.invoices.map((invoice) => (
          <DetailRow
            key={invoice.id}
            label={`${invoice.id} - ${invoice.date}`}
            value={`$${invoice.amount.toLocaleString()} - ${invoice.status}`}
          />
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <CreditCard className="size-4 text-primary" />
          Payments
        </h3>
        {patient.payments.length > 0 ? (
          patient.payments.map((payment) => (
            <DetailRow
              key={payment.id}
              label={`${payment.id} - ${payment.date}`}
              value={`$${payment.amount.toLocaleString()} - ${payment.status}`}
            />
          ))
        ) : (
          <DetailRow label="Payments" value="No payments recorded" />
        )}
      </div>
    </div>
  );
}

function FilesTab({ patient }: { patient: Patient }) {
  const iconByType = {
    'X-ray': FileImage,
    'Clinical Photo': FileImage,
    Document: FileText,
  };

  return (
    <div className="space-y-3">
      {patient.files.map((file) => {
        const Icon = iconByType[file.type];

        return (
          <div key={file.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-4 dark:bg-background/20">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{file.type} - {file.date}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PatientProfileDrawer({
  patient,
  activeTab,
  onTabChange,
  onClose,
  onBookAppointment,
  onGenerateQr,
  onCopyCode,
}: PatientProfileDrawerProps) {
  if (!patient) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close patient profile drawer"
      />
      <aside
        className="absolute inset-y-0 right-0 flex w-full max-w-2xl animate-in slide-in-from-right duration-300 flex-col overflow-hidden border-l border-border bg-card/95 shadow-2xl backdrop-blur-xl"
        style={{ backdropFilter: 'blur(14px)' }}
      >
        <div className="border-b border-border/70 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <PatientAvatar patient={patient} size="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold text-foreground">{patient.fullName}</h2>
                  <TelegramBadge status={patient.telegramStatus} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <UserRound className="size-4" />
                    {patient.patientCode}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-4" />
                    {patient.phone}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close drawer"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-4">
            <ActionButton onClick={() => onBookAppointment(patient)} tone="primary">
              <CalendarPlus className="size-4" />
              Book
            </ActionButton>
            <ActionButton onClick={() => onGenerateQr(patient)}>
              <QrCode className="size-4" />
              QR
            </ActionButton>
            <ActionButton onClick={() => window.print()}>
              <FolderOpen className="size-4" />
              Print Card
            </ActionButton>
            <ActionButton onClick={() => onCopyCode(patient)}>
              <Copy className="size-4" />
              Copy Code
            </ActionButton>
          </div>
        </div>

        <div className="border-b border-border/70 px-5 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'border border-border bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground dark:bg-background/30'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <DetailRow label="Last Visit" value={patient.lastVisit} />
            <DetailRow label="Next Visit" value={patient.upcomingAppointment} />
            <DetailRow label="Balance" value={<BalanceBadge amount={patient.outstandingBalance} />} />
          </div>

          {activeTab === 'Overview' && <OverviewTab patient={patient} />}
          {activeTab === 'Medical' && <MedicalTab patient={patient} />}
          {activeTab === 'Appointments' && <AppointmentsTab patient={patient} />}
          {activeTab === 'Billing' && <BillingTab patient={patient} />}
          {activeTab === 'Files' && <FilesTab patient={patient} />}
        </div>

        <div className="border-t border-border/70 p-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <HeartPulse className="size-3.5 text-primary" />
            Medical alerts and billing status are visible before chair-side care.
          </span>
          <span className="mt-1 flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary" />
            {patient.address}
          </span>
        </div>
      </aside>
    </div>
  );
}
