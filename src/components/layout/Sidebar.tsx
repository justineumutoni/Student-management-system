'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSystemData } from '@/context/SystemDataContext';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  FileCheck2, 
  Users, 
  BarChart3, 
  Send, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  UserPlus, 
  GraduationCap 
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { pendingStudents, leaves, unreadNotifsCount } = useSystemData();

  if (!user) return null;

  const isTeacher = user.role === 'teacher';
  const pendingLeavesCount = leaves.filter(l => l.status === 'pending').length;
  const pendingRegistrationsCount = pendingStudents.length;

  const teacherNavItems = [
    {
      label: 'Dashboard',
      href: '/teacher/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Mark Attendance',
      href: '/teacher/attendance',
      icon: CalendarCheck,
    },
    {
      label: 'Approve Leaves',
      href: '/teacher/leave',
      icon: FileCheck2,
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
      badgeColor: 'bg-amber-500',
    },
    {
      label: 'Students & Approvals',
      href: '/teacher/students',
      icon: Users,
      badge: pendingRegistrationsCount > 0 ? pendingRegistrationsCount : undefined,
      badgeColor: 'bg-indigo-500',
    },
    {
      label: 'Reports & Analytics',
      href: '/teacher/reports',
      icon: BarChart3,
    },
  ];

  const studentNavItems = [
    {
      label: 'Overview',
      href: '/student/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'My Attendance',
      href: '/student/attendance',
      icon: CalendarCheck,
    },
    {
      label: 'Ask for Leave',
      href: '/student/leave',
      icon: Send,
    },
    {
      label: 'View Report & Charts',
      href: '/student/report',
      icon: BarChart3,
    },
    {
      label: 'Notifications',
      href: '/student/notifications',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
      badgeColor: 'bg-rose-500',
    },
  ];

  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fadeIn"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 glass-panel border-r border-slate-800/80 bg-slate-950/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Role Indicator Banner */}
          <div className={`p-3.5 rounded-2xl border ${
            isTeacher 
              ? 'bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border-purple-500/20' 
              : 'bg-gradient-to-r from-indigo-950/40 to-cyan-950/40 border-cyan-500/20'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                isTeacher ? 'bg-purple-600' : 'bg-cyan-600'
              }`}>
                {isTeacher ? <ShieldCheck className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {isTeacher ? 'Faculty Portal' : (user.studentId || 'Student Portal')}
                </p>
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Menu Navigation
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 text-[11px] font-bold text-white rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>System Online</span>
            </span>
            <span className="text-slate-400">{user.department?.split(' ')[0] || 'CS'}</span>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition border border-rose-900/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
