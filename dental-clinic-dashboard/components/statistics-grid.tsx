'use client';

import { Users, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

export function StatisticsGrid() {
  const stats = [
    {
      title: 'Total Patients',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'from-blue-400 to-cyan-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Appointments Today',
      value: '18',
      change: '+3',
      icon: Calendar,
      color: 'from-cyan-400 to-teal-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    },
    {
      title: "Today's Revenue",
      value: '$4,820',
      change: '+8%',
      icon: DollarSign,
      color: 'from-teal-400 to-green-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30',
    },
    {
      title: 'Outstanding Balance',
      value: '$1,260',
      change: '4 overdue',
      icon: AlertTriangle,
      color: 'from-green-400 to-emerald-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`${stat.bgColor} border border-border rounded-2xl p-6 backdrop-blur-sm theme-surface-shadow-hover hover:border-primary/20`}
            style={{
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3 flex items-center justify-center theme-strong-shadow`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
