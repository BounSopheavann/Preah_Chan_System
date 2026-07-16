'use client';

import { QrCode, Sparkles, Users } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import type { PatientFilterState } from './patient-filters';
import {
  PatientModal,
  type PatientFormValues,
} from './patient-modal';
import { PatientProfileDrawer, type PatientDrawerTab } from './patient-profile-drawer';
import {
  PatientTable,
  type PatientSortKey,
  type SortDirection,
} from './patient-table';
import { Pagination } from './pagination';
import {
  patientRecords,
  type Patient,
} from './patient-data';
import { PatientSearchBar } from './patient-search-bar';

const pageSize = 6;

const initialFilters: PatientFilterState = {
  status: 'All',
  gender: 'All',
  consent: 'All',
};

function splitList(value: string) {
  const entries = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return entries.length > 0 ? entries : ['None recorded'];
}

function buildNewPatient(values: PatientFormValues, nextCode: string): Patient {
  return {
    id: `pt-${Date.now()}`,
    patientCode: nextCode,
    fullName: values.fullName.trim(),
    gender: values.gender,
    phone: values.phone.trim(),
    email: values.email.trim() || 'No email recorded',
    dateOfBirth: values.dateOfBirth || 'Not recorded',
    address: values.address.trim() || 'No address recorded',
    emergencyContact: values.emergencyContact.trim() || 'No emergency contact recorded',
    emergencyPhone: values.emergencyPhone.trim() || 'No emergency phone recorded',
    allergies: splitList(values.allergies),
    medicalConditions: splitList(values.medicalConditions),
    currentMedication: splitList(values.currentMedication),
    status: 'Active',
    lastVisit: 'New patient',
    upcomingAppointment: 'No appointment',
    outstandingBalance: 0,
    consentStatus: values.consentStatus,
    telegramStatus: 'Not Linked',
    preferredContactMethod: values.preferredContactMethod,
    avatarTone: 'from-sky-400 to-cyan-400',
    appointments: [],
    invoices: [],
    payments: [],
    files: [],
  };
}

function updatePatientFromValues(patient: Patient, values: PatientFormValues): Patient {
  return {
    ...patient,
    fullName: values.fullName.trim(),
    gender: values.gender,
    phone: values.phone.trim(),
    email: values.email.trim() || 'No email recorded',
    dateOfBirth: values.dateOfBirth || 'Not recorded',
    address: values.address.trim() || 'No address recorded',
    emergencyContact: values.emergencyContact.trim() || 'No emergency contact recorded',
    emergencyPhone: values.emergencyPhone.trim() || 'No emergency phone recorded',
    allergies: splitList(values.allergies),
    medicalConditions: splitList(values.medicalConditions),
    currentMedication: splitList(values.currentMedication),
    consentStatus: values.consentStatus,
    preferredContactMethod: values.preferredContactMethod,
  };
}

function comparePatients(a: Patient, b: Patient, key: PatientSortKey) {
  if (key === 'outstandingBalance') {
    return a.outstandingBalance - b.outstandingBalance;
  }

  return String(a[key]).localeCompare(String(b[key]));
}

function TelegramQrModal({
  patient,
  onClose,
}: {
  patient: Patient | null;
  onClose: () => void;
}) {
  if (!patient) {
    return null;
  }

  const cells = Array.from({ length: 81 }, (_, index) => {
    const charTotal = patient.patientCode
      .split('')
      .reduce((total, char) => total + char.charCodeAt(0), 0);
    return (index + charTotal) % 3 !== 0 || index % 10 === 0;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close Telegram QR preview"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card/95 p-6 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <QrCode className="size-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-foreground">Telegram QR</h2>
        <p className="mt-1 text-sm text-muted-foreground">{patient.fullName} - {patient.patientCode}</p>
        <div className="mx-auto mt-5 grid size-52 grid-cols-9 gap-1 rounded-2xl border border-border bg-white p-4 shadow-inner">
          {cells.map((filled, index) => (
            <span
              key={index}
              className={`rounded-[3px] ${filled ? 'bg-slate-900' : 'bg-transparent'}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export function PatientsModule() {
  const [patients, setPatients] = useState<Patient[]>(patientRecords);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [filters, setFilters] = useState<PatientFilterState>(initialFilters);
  const [sortKey, setSortKey] = useState<PatientSortKey>('fullName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [drawerTab, setDrawerTab] = useState<PatientDrawerTab>('Overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [qrPatient, setQrPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, filters, sortKey, sortDirection]);

  const filteredPatients = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return patients
      .filter((patient) => {
        const matchesSearch =
          !normalizedSearch ||
          patient.fullName.toLowerCase().includes(normalizedSearch) ||
          patient.patientCode.toLowerCase().includes(normalizedSearch) ||
          patient.phone.toLowerCase().includes(normalizedSearch);

        const matchesStatus = filters.status === 'All' || patient.status === filters.status;
        const matchesGender = filters.gender === 'All' || patient.gender === filters.gender;
        const matchesConsent = filters.consent === 'All' || patient.consentStatus === filters.consent;

        return matchesSearch && matchesStatus && matchesGender && matchesConsent;
      })
      .sort((a, b) => {
        const result = comparePatients(a, b, sortKey);
        return sortDirection === 'asc' ? result : -result;
      });
  }, [patients, deferredSearch, filters, sortKey, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const visiblePatients = filteredPatients.slice((page - 1) * pageSize, page * pageSize);

  const activeCount = patients.filter((patient) => patient.status === 'Active').length;
  const balanceCount = patients.filter((patient) => patient.outstandingBalance > 0).length;

  const handleSort = (key: PatientSortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const openPatient = (patient: Patient, tab: PatientDrawerTab = 'Overview') => {
    setSelectedPatient(patient);
    setDrawerTab(tab);
  };

  const openNewPatient = () => {
    setEditingPatient(null);
    setModalOpen(true);
  };

  const openEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setModalOpen(true);
  };

  const savePatient = (values: PatientFormValues, patient: Patient | null) => {
    if (patient) {
      const updatedPatient = updatePatientFromValues(patient, values);
      setPatients((current) =>
        current.map((item) => (item.id === patient.id ? updatedPatient : item)),
      );
      setSelectedPatient((current) => (current?.id === patient.id ? updatedPatient : current));
    } else {
      const maxCode = patients.reduce((max, item) => {
        const numericCode = Number(item.patientCode.replace('PC-', ''));
        return Number.isNaN(numericCode) ? max : Math.max(max, numericCode);
      }, 1000);
      const newPatient = buildNewPatient(values, `PC-${maxCode + 1}`);
      setPatients((current) => [newPatient, ...current]);
      setSelectedPatient(newPatient);
      setDrawerTab('Overview');
    }

    setModalOpen(false);
    setEditingPatient(null);
  };

  const deactivatePatient = (patient: Patient) => {
    const nextStatus = patient.status === 'Active' ? 'Inactive' : 'Active';
    setPatients((current) =>
      current.map((item) => (item.id === patient.id ? { ...item, status: nextStatus } : item)),
    );
    setSelectedPatient((current) => (current?.id === patient.id ? { ...current, status: nextStatus } : current));
  };

  const bookAppointment = (patient: Patient) => {
    openPatient(patient, 'Appointments');
  };

  const generateQr = (patient: Patient) => {
    setQrPatient(patient);
  };

  const copyCode = (patient: Patient) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(patient.patientCode);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground">Manage patient records and medical information.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl theme-surface-shadow">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground">{patients.length}</p>
              <p className="text-xs font-semibold text-muted-foreground">Total patients</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl theme-surface-shadow">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              <p className="text-xs font-semibold text-muted-foreground">Active records</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl theme-surface-shadow">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <QrCode className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground">{balanceCount}</p>
              <p className="text-xs font-semibold text-muted-foreground">Open balances</p>
            </div>
          </div>
        </div>
      </div>

      <PatientSearchBar value={search} onChange={setSearch} />

      <div className="overflow-hidden rounded-2xl">
        <PatientTable
          patients={visiblePatients}
          isLoading={isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          filters={filters}
          onFiltersChange={setFilters}
          onFiltersReset={() => {
            setFilters(initialFilters);
            setSearch('');
          }}
          onView={(patient) => openPatient(patient)}
          onEdit={openEditPatient}
          onBookAppointment={bookAppointment}
          onGenerateQr={generateQr}
          onDeactivate={deactivatePatient}
          onCreatePatient={openNewPatient}
          onCopyCode={copyCode}
        />
        {!isLoading && (
          <Pagination
            page={page}
            pageCount={pageCount}
            totalItems={filteredPatients.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        )}
      </div>

      <PatientProfileDrawer
        patient={selectedPatient}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
        onClose={() => setSelectedPatient(null)}
        onBookAppointment={bookAppointment}
        onGenerateQr={generateQr}
        onCopyCode={copyCode}
      />

      <PatientModal
        open={modalOpen}
        patient={editingPatient}
        onClose={() => {
          setModalOpen(false);
          setEditingPatient(null);
        }}
        onSave={savePatient}
      />

      <TelegramQrModal patient={qrPatient} onClose={() => setQrPatient(null)} />
    </div>
  );
}
