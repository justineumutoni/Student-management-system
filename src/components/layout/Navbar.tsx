'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSystemData } from '@/context/SystemDataContext';
import { isFirebaseConfigured } from '@/lib/firebase';
import { formatDate } from '@/lib/utils';
import { 
  Bell, 
  CheckCheck, 
  GraduationCap, 
  Key, 
  LogOut, 
  Menu, 
  ShieldCheck, 
  Sparkles, 
  User, 
  X,
  FileText,
  CalendarCheck
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadNotifsCount, markNotificationRead, markAllNotificationsRead } = useSystemData();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        {/* Left: Brand and Sidebar Toggle */}
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition lg:hidden"
              aria-label="Toggle navigation"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                EduCore
              </span>
              <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                SMS v2.0
              </span>
            </div>
          </Link>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3" ref={dropdownRef}>
          {/* Firebase Connection Pill */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
            <span className="text-slate-400 font-medium">
              {isFirebaseConfigured ? 'Firebase Live' : 'Demo Mode (Sync Ready)'}
            </span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowUserMenu(false);
              }}
              className="relative p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-rose-500 rounded-full px-1 animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Notification Menu */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-dropdown p-4 border border-slate-800 text-slate-200 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-white">Notifications</span>
                    {unreadNotifsCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {unreadNotifsCount} new
                      </span>
                    )}
                  </div>
                  {unreadNotifsCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3 rounded-xl transition cursor-pointer border ${
                          notif.read
                            ? 'bg-slate-900/40 border-slate-800/40 text-slate-400'
                            : 'bg-slate-900/90 border-indigo-500/30 text-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-semibold text-white flex items-center space-x-1">
                            {notif.type === 'credentials' && <Key className="w-3.5 h-3.5 text-amber-400 mr-1 shrink-0" />}
                            {notif.type === 'leave_status' && <FileText className="w-3.5 h-3.5 text-blue-400 mr-1 shrink-0" />}
                            {notif.type === 'attendance_alert' && <CalendarCheck className="w-3.5 h-3.5 text-rose-400 mr-1 shrink-0" />}
                            <span>{notif.title}</span>
                          </h4>
                          <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                            {formatDate(notif.createdAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs mt-1 text-slate-300 line-clamp-3">
                          {notif.message}
                        </p>
                        {notif.metadata?.generatedPassword && (
                          <div className="mt-2 p-1.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono flex items-center justify-between">
                            <span>Password: <strong>{notif.metadata.generatedPassword}</strong></span>
                            <span className="text-[10px] uppercase bg-emerald-500/20 px-1 rounded">System Generated</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account Capsule */}
          {user && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifs(false);
                }}
                className="flex items-center space-x-2.5 p-1.5 pl-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    <span>{user.role}</span>
                  </div>
                </div>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-dropdown p-2 border border-slate-800 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {user.role === 'teacher' ? 'Faculty / Teacher' : `Student (${user.studentId || 'CS-2026'})`}
                    </span>
                  </div>

                  <Link
                    href={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>My Dashboard</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/40 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
