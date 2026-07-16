'use client';

import { Save, UserPlus, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import type {
  ConsentStatus,
  Patient,
  PatientGender,
  PreferredContactMethod,
} from './patient-data';

export interface PatientFormValues {
  fullName: string;
  phone: string;
  gender: PatientGender;
  dateOfBirth: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  allergies: string;
  medicalConditions: string;
  currentMedication: string;
  consentStatus: ConsentStatus;
  preferredContactMethod: PreferredContactMethod;
}

interface PatientModalProps {
  open: boolean;
  patient: Patient | null;
  onClose: () => void;
  onSave: (values: PatientFormValues, patient: Patient | null) => void;
}

const emptyForm: PatientFormValues = {
  fullName: '',
  phone: '',
  gender: 'Female',
  dateOfBirth: '',
  email: '',
  address: '',
  emergencyContact: '',
  emergencyPhone: '',
  allergies: '',
  medicalConditions: '',
  currentMedication: '',
  consentStatus: 'Pending',
  preferredContactMethod: 'Phone',
};

function valuesFromPatient(patient: Patient): PatientFormValues {
  return {
    fullName: patient.fullName,
    phone: patient.phone,
    gender: patient.gender,
    dateOfBirth: patient.dateOfBirth,
    email: patient.email,
    address: patient.address,
    emergencyContact: patient.emergencyContact,
    emergencyPhone: patient.emergencyPhone,
    allergies: patient.allergies.join(', '),
    medicalConditions: patient.medicalConditions.join(', '),
    currentMedication: patient.currentMedication.join(', '),
    consentStatus: patient.consentStatus,
    preferredContactMethod: patient.preferredContactMethod,
  };
}

function Field({
  label,
  children,
  required,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-foreground">
      <span>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      {children}
      {error && <span className="text-xs font-medium text-destructive">{error}</span>}
    </label>
  );
}

const inputClass =
  'h-11 rounded-xl border border-border bg-background/70 px-3 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30';

const textareaClass =
  'min-h-24 rounded-xl border border-border bg-background/70 px-3 py-2 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30';

export function PatientModal({ open, patient, onClose, onSave }: PatientModalProps) {
  const [values, setValues] = useState<PatientFormValues>(emptyForm);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(patient ? valuesFromPatient(patient) : emptyForm);
    setSubmitted(false);
  }, [open, patient]);

  if (!open) {
    return null;
  }

  const nameError = submitted && !values.fullName.trim() ? 'Name required' : '';
  const phoneError = submitted && !values.phone.trim() ? 'Phone required' : '';

  const updateValue = <Key extends keyof PatientFormValues>(key: Key, value: PatientFormValues[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    if (!values.fullName.trim() || !values.phone.trim()) {
      return;
    }

    onSave(values, patient);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close patient modal"
      />
      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[92vh] w-full max-w-5xl animate-in fade-in zoom-in-95 duration-200 flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl"
        style={{ backdropFilter: 'blur(14px)' }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/70 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserPlus className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{patient ? 'Edit Patient' : 'New Patient'}</h2>
              <p className="text-sm text-muted-foreground">Patient identity, contact, consent, and medical basics.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full Name" required error={nameError}>
              <input
                value={values.fullName}
                onChange={(event) => updateValue('fullName', event.target.value)}
                className={inputClass}
                placeholder="Enter patient full name"
              />
            </Field>
            <Field label="Phone Number" required error={phoneError}>
              <input
                value={values.phone}
                onChange={(event) => updateValue('phone', event.target.value)}
                className={inputClass}
                placeholder="+1 (555) 000-0000"
              />
            </Field>
            <Field label="Gender">
              <select
                value={values.gender}
                onChange={(event) => updateValue('gender', event.target.value as PatientGender)}
                className={inputClass}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Date of Birth">
              <input
                type="date"
                value={values.dateOfBirth}
                onChange={(event) => updateValue('dateOfBirth', event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={values.email}
                onChange={(event) => updateValue('email', event.target.value)}
                className={inputClass}
                placeholder="patient@example.com"
              />
            </Field>
            <Field label="Preferred Contact Method">
              <select
                value={values.preferredContactMethod}
                onChange={(event) => updateValue('preferredContactMethod', event.target.value as PreferredContactMethod)}
                className={inputClass}
              >
                <option>Phone</option>
                <option>Telegram</option>
                <option>Email</option>
                <option>SMS</option>
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Address">
                <input
                  value={values.address}
                  onChange={(event) => updateValue('address', event.target.value)}
                  className={inputClass}
                  placeholder="Street, city, state"
                />
              </Field>
            </div>
            <Field label="Emergency Contact">
              <input
                value={values.emergencyContact}
                onChange={(event) => updateValue('emergencyContact', event.target.value)}
                className={inputClass}
                placeholder="Emergency contact name"
              />
            </Field>
            <Field label="Emergency Phone">
              <input
                value={values.emergencyPhone}
                onChange={(event) => updateValue('emergencyPhone', event.target.value)}
                className={inputClass}
                placeholder="+1 (555) 000-0000"
              />
            </Field>
            <Field label="Consent Status">
              <select
                value={values.consentStatus}
                onChange={(event) => updateValue('consentStatus', event.target.value as ConsentStatus)}
                className={inputClass}
              >
                <option>Accepted</option>
                <option>Pending</option>
                <option>Declined</option>
              </select>
            </Field>
            <Field label="Allergies">
              <textarea
                value={values.allergies}
                onChange={(event) => updateValue('allergies', event.target.value)}
                className={textareaClass}
                placeholder="Separate multiple items with commas"
              />
            </Field>
            <Field label="Medical Conditions">
              <textarea
                value={values.medicalConditions}
                onChange={(event) => updateValue('medicalConditions', event.target.value)}
                className={textareaClass}
                placeholder="Separate multiple items with commas"
              />
            </Field>
            <Field label="Medication">
              <textarea
                value={values.currentMedication}
                onChange={(event) => updateValue('currentMedication', event.target.value)}
                className={textareaClass}
                placeholder="Separate multiple items with commas"
              />
            </Field>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border/70 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background/70 px-5 text-sm font-bold text-foreground transition-all hover:bg-muted dark:bg-background/30"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <Save className="size-4" />
            Save Patient
          </button>
        </div>
      </form>
    </div>
  );
}
