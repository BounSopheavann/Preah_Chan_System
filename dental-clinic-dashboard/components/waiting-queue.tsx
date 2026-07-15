'use client';

import { Users, Clock, Zap } from 'lucide-react';

export function WaitingQueue() {
  const waitingPatients = [
    {
      id: 1,
      patient: 'Lisa Anderson',
      waitTime: '5 min',
      appointment: '09:00 AM - Checkup',
      priority: 'normal',
    },
    {
      id: 2,
      patient: 'David Martinez',
      waitTime: '12 min',
      appointment: '10:30 AM - Cleaning',
      priority: 'high',
    },
    {
      id: 3,
      patient: 'Jennifer Taylor',
      waitTime: '3 min',
      appointment: '11:00 AM - Consultation',
      priority: 'normal',
    },
    {
      id: 4,
      patient: 'Mark Thompson',
      waitTime: '8 min',
      appointment: '12:00 PM - Root Canal',
      priority: 'normal',
    },
  ];

  return (
    <div
      className="bg-card border border-border rounded-2xl p-6 backdrop-blur-sm theme-surface-shadow"
      style={{ backdropFilter: 'blur(10px)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Waiting Queue</h2>
          <p className="text-sm text-muted-foreground">4 patients waiting</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-xs font-semibold text-yellow-700 dark:text-yellow-400">
          <Zap className="w-3 h-3" />
          Avg Wait: 7 min
        </div>
      </div>

      <div className="space-y-2">
        {waitingPatients.map((patient, index) => (
          <div
            key={patient.id}
            className="flex items-center gap-4 p-3 bg-muted/50 hover:bg-muted/70 rounded-lg transition-all border border-border/50"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground text-sm">{patient.patient}</h3>
              <p className="text-xs text-muted-foreground">{patient.appointment}</p>
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-semibold ${
                  patient.priority === 'high' ? 'text-orange-600 dark:text-orange-400' : 'text-foreground'
                }`}
              >
                {patient.waitTime}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
