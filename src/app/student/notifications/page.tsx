'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSystemData } from '@/context/SystemDataContext';
import { formatDate } from '@/lib/utils';
import { 
  Bell, 
  Key, 
  CheckCheck, 
  Copy, 
  Check, 
  FileText, 
  CalendarCheck, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function StudentNotificationsPage() {
  const { user } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useSystemData();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!user) return null;

  const copyCredentials = (notif: any) => {
    const pwd = notif.metadata?.generatedPassword || user.generatedPassword || 'Alex#2026!Pass9';
    const text = `--- Student Management System Credentials ---\nEmail: ${user.email}\nGenerated Password: ${pwd}\nRoll ID: ${user.studentId || 'CS-2026-101'}\n--------------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopiedId(notif.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Bell className="w-6 h-6 text-indigo-400" />
            <span>Notification & Credential Center</span>
          </h1>
          <p className="text-xs text-slate-400">
            System generated security passwords, leave approval updates, and faculty announcements
          </p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <CheckCheck className="w-4 h-4 text-indigo-400" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No notifications in your inbox.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isCreds = notif.type === 'credentials';
            return (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-5 rounded-3xl transition border ${
                  notif.read
                    ? 'bg-slate-900/50 border-slate-800/60 text-slate-300'
                    : isCreds
                    ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-indigo-950/30 border-emerald-500/40 text-slate-100 shadow-lg'
                    : 'bg-slate-900/90 border-indigo-500/30 text-slate-100 shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCreds
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : notif.type === 'leave_status'
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {isCreds ? <Key className="w-5 h-5" /> : notif.type === 'leave_status' ? <FileText className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-white">{notif.title}</h3>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Credentials Display Box */}
                      {(isCreds || notif.metadata?.generatedPassword) && (
                        <div className="mt-3 p-3 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="text-slate-400">Account:</span>
                              <span className="text-white font-medium">{notif.metadata?.email || user.email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="text-slate-400">Generated Password:</span>
                              <span className="font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                                {notif.metadata?.generatedPassword || user.generatedPassword || 'Alex#2026!Pass9'}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyCredentials(notif);
                              }}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
                            >
                              {copiedId === notif.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Login Info</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 shrink-0 self-start">
                    {formatDate(notif.createdAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
