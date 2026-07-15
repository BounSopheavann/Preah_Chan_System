'use client';

import {
  Plus,
  PhoneCall,
  FileText,
  Settings,
  MessageSquare,
  Clock,
} from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: 'New Patient',
      color: 'from-blue-400 to-cyan-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      icon: Clock,
      label: 'Schedule Recall',
      color: 'from-cyan-400 to-teal-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    },
    {
      icon: PhoneCall,
      label: 'Call Patient',
      color: 'from-teal-400 to-green-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30',
    },
    {
      icon: MessageSquare,
      label: 'Send Message',
      color: 'from-green-400 to-emerald-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      icon: FileText,
      label: 'Create Invoice',
      color: 'from-purple-400 to-pink-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      icon: Settings,
      label: 'Settings',
      color: 'from-pink-400 to-red-400',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    },
  ];

  return (
    <div
      className="bg-card border border-border rounded-2xl p-6 backdrop-blur-sm theme-surface-shadow"
      style={{ backdropFilter: 'blur(10px)' }}
    >
      <h2 className="text-xl font-bold text-foreground mb-6">Quick Actions</h2>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              className={`${action.bgColor} border border-border rounded-xl p-4 theme-surface-shadow-hover hover:border-primary/30 group flex flex-col items-center justify-center gap-2 min-h-24`}
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} p-2 flex items-center justify-center theme-strong-shadow group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-foreground text-center">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
