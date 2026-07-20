'use client';

export const CLINIC_INFO = {
  name: 'Preah Chan Dental Clinic',
  logoText: 'PC',
  address: '123 Monivong Blvd, Phnom Penh',
  phone: '+855 23 123 456',
  email: 'care@preahchan.dental',
  disclaimer:
    'This prescription is issued for the named patient only. Medication information shown in this demo is dummy UI data and is not medical advice. Follow local prescribing regulations.',
};

export const PATIENT = {
  name: 'Sofia Martin',
  code: 'PC-1003',
  age: 34,
  sex: 'Female',
  medicalConditions: ['Diabetes (Type 2)'],
  allergies: ['Penicillin'],
  currentMedications: ['Metformin 500mg — twice daily'],
  alerts: ['Known Penicillin allergy — avoid beta-lactam antibiotics'],
};

export const PRESCRIBER = 'Dr. Maya';
export const CURRENT_USER = 'Dr. Maya';
export const CURRENT_EXAMINATION = 'EX-2026-0082';

export function todayLabel(): string {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function nowTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}