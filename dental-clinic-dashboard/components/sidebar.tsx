'use client';

import {
  Calendar,
  Users,
  Settings,
  BarChart3,
  Pill,
  LogOut,
  Stethoscope,
  X,
  Activity,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = [
    { icon: Calendar, label: 'Dashboard', href: '/' },
    { icon: Users, label: 'Patients', href: '/patients' },
    { icon: Stethoscope, label: 'Appointments', href: '/appointments' },
    { icon: Activity, label: 'Treatment Execution', href: '/treatment-execution' },
    { icon: BarChart3, label: 'Reports', href: '#' },
    { icon: Pill, label: 'Treatments', href: '#' },
    { icon: Settings, label: 'Settings', href: '#' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static z-40 h-screen w-64 bg-card border-r border-sidebar-border transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-border bg-card flex items-center justify-center">
                <Image
                  src="/Logo.png"
                  alt="DentalCare logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <span className="font-bold text-lg text-foreground">PreahChan Dental</span>
            </div>
            <button
              onClick={onClose}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu items */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : item.href !== '#' && pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User profile */}
          <div className="border-t border-sidebar-border pt-4 space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
                DR
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Dr. Sarah</p>
                <p className="text-xs text-muted-foreground">Dentist</p>
              </div>
            </div>
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-all">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
