'use client';

import { Clock, MapPin, Phone, CheckCircle, AlertCircle } from 'lucide-react';

export function TodaysSchedule() {
  const appointments = [
    {
      id: 1,
      patient: 'John Smith',
      time: '09:00 AM',
      procedure: 'Routine Checkup',
      status: 'confirmed',
      room: 'Room 1',
    },
    {
      id: 2,
      patient: 'Emily Johnson',
      time: '10:30 AM',
      procedure: 'Cleaning & Scale',
      status: 'confirmed',
      room: 'Room 2',
    },
    {
      id: 3,
      patient: 'Michael Brown',
      time: '12:00 PM',
      procedure: 'Root Canal',
      status: 'pending',
      room: 'Room 1',
    },
    {
      id: 4,
      patient: 'Sarah Davis',
      time: '02:00 PM',
      procedure: 'Crown Replacement',
      status: 'confirmed',
      room: 'Room 3',
    },
    {
      id: 5,
      patient: 'Robert Wilson',
      time: '03:30 PM',
      procedure: 'Filling',
      status: 'confirmed',
      room: 'Room 2',
    },
  ];

  return (
    <div
      className="bg-card border border-border rounded-2xl p-6 backdrop-blur-sm theme-surface-shadow"
      style={{ backdropFilter: 'blur(10px)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Today&apos;s Schedule</h2>
          <p className="text-sm text-muted-foreground">5 appointments scheduled</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm font-medium">
          Add Appointment
        </button>
      </div>

      <div className="space-y-3">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-start gap-4 p-4 bg-muted/50 hover:bg-muted/70 rounded-xl transition-all border border-border/50"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{appointment.patient}</h3>
                  <p className="text-sm text-muted-foreground">{appointment.procedure}</p>
                </div>
                {appointment.status === 'confirmed' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {appointment.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {appointment.room}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
