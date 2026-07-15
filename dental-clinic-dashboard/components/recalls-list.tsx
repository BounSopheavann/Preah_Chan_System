'use client';

import { AlertCircle, Calendar, Phone } from 'lucide-react';

export function RecallsList() {
  const recalls = [
    {
      id: 1,
      patient: 'Amanda White',
      procedure: '6-Month Checkup',
      dueDate: 'Today',
      dayOverdue: 0,
      priority: 'urgent',
    },
    {
      id: 2,
      patient: 'Christopher Lee',
      procedure: 'Annual Cleaning',
      dueDate: 'Tomorrow',
      dayOverdue: 0,
      priority: 'high',
    },
    {
      id: 3,
      patient: 'Jessica Harris',
      procedure: 'Follow-up Check',
      dueDate: '3 days ago',
      dayOverdue: 3,
      priority: 'urgent',
    },
    {
      id: 4,
      patient: 'Daniel Clark',
      procedure: 'Teeth Whitening',
      dueDate: '2 weeks ago',
      dayOverdue: 14,
      priority: 'high',
    },
  ];

  return (
    <div
      className="bg-card border border-border rounded-2xl p-6 backdrop-blur-sm theme-surface-shadow"
      style={{ backdropFilter: 'blur(10px)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Patient Recalls</h2>
        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded-full">
          4 Due
        </span>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {recalls.map((recall) => (
          <div
            key={recall.id}
            className={`p-3 rounded-lg border transition-all ${
              recall.priority === 'urgent'
                ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  recall.priority === 'urgent' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-foreground">{recall.patient}</h3>
                <p className="text-xs text-muted-foreground">{recall.procedure}</p>
                <p
                  className={`text-xs mt-1 font-semibold ${
                    recall.priority === 'urgent'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}
                >
                  {recall.dueDate}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded-lg transition-all">
        View All Recalls
      </button>
    </div>
  );
}
