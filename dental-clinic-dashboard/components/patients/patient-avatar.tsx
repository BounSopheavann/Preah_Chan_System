import { getPatientInitials, type Patient } from './patient-data';

interface PatientAvatarProps {
  patient: Pick<Patient, 'fullName' | 'avatarTone'>;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'size-9 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-20 text-xl',
};

export function PatientAvatar({ patient, size = 'md' }: PatientAvatarProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${patient.avatarTone} ${sizeClasses[size]} font-bold text-white theme-strong-shadow`}
    >
      {getPatientInitials(patient.fullName)}
    </div>
  );
}
