'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSystemData } from '@/context/SystemDataContext';
import { calculateStudentStats, formatDate } from '@/lib/utils';
import { AttendanceTrendsChart } from '@/components/charts/AttendanceTrendsChart';
import { 
  CalendarCheck, 
  Send, 
  BarChart3, 
  Key, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  ArrowUpRight, 
  Sparkles,
  ShieldCheck,
  Award
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { attendance, leaves, notifications } = useSystemData();

  if (!user) return null;

  const studentLeaves = leaves.filter(l => l.studentId === user.id || l.studentEmail.toLowerCase() === user.email.toLowerCase());
  const pendingLeaves = studentLeaves.filter(l => l.status === 'pending');
  const approvedLeaves = studentLeaves.filter(l => l.status === 'approved');

  const stats = calculateStudentStats(
    user.id,
    attendance,
    {
      requested: studentLeaves.length,
      approved: approvedLeaves.length,
      pending: pendingLeaves.length,
    }
  );

  // Check if student has a generated credentials notification
  const credentialNotif = notifications.find(n => n.type === 'credentials');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl overflow-hidden glass-panel border border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-indigo-950/30 to-purple-950/20">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Academic Year 2026</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Hello, {user.name} 👋
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center space-x-1 font-mono text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                <span>ID:</span>
                <strong>{user.studentId || 'CS-2026-101'}</strong>
              </span>
              <span>&bull;</span>
              <span>{user.department || 'Computer Science'}</span>
              <span>&bull;</span>
              <span>{user.grade || 'Semester 4 (CS-A)'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/student/leave"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 hover:scale-[1.02]"
            >
              <Send className="w-4 h-4" />
              <span>Ask for Leave</span>
            </Link>

            <Link
              href="/student/report"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition border border-slate-700 hover:scale-[1.02]"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>View Statistical Report</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Generated Password & Credential Notification Banner */}
      {(user.generatedPassword || credentialNotif) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-300">
                System Generated Security Credentials
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Your account was approved with generated password: <strong className="font-mono text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{user.generatedPassword || 'Alex#2026!Pass9'}</strong> (Email: {user.email})
              </p>
            </div>
          </div>
          <Link
            href="/student/notifications"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1 shrink-0"
          >
            <span>View in Notifications</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Attendance Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{stats.attendancePercentage}%</span>
            <span className="text-xs font-semibold text-emerald-400">
              {stats.attendancePercentage >= 85 ? 'Good Standing' : 'Needs Attention'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.attendancePercentage >= 85 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${stats.attendancePercentage}%` }}
            />
          </div>
        </div>

        {/* Classes Attended */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Classes Attended</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{stats.presentCount}</span>
            <span className="text-xs text-slate-400">/ {stats.totalClasses} Total</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {stats.absentCount} missed &bull; {stats.lateCount} late marks
          </p>
        </div>

        {/* Leave Requests */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Leave Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{studentLeaves.length}</span>
            <span className="text-xs font-semibold text-amber-400">
              {pendingLeaves.length} Pending Review
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {approvedLeaves.length} Approved &bull; {studentLeaves.filter(l => l.status === 'rejected').length} Rejected
          </p>
        </div>

        {/* Academic Status */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Account Status</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white capitalize">{user.status}</span>
            <span className="text-xs font-semibold text-emerald-400">Verified</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Approved by {user.approvedBy || 'Faculty'}
          </p>
        </div>
      </div>

      {/* Main Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Trends Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Monthly Attendance Trajectory</h3>
              <p className="text-xs text-slate-400">Your average presence percentage by month</p>
            </div>
            <Link
              href="/student/report"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <AttendanceTrendsChart data={stats.monthlyTrends} />
        </div>

        {/* Recent Leave Requests widget */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">My Leave Requests</h3>
              <Link
                href="/student/leave"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                + New
              </Link>
            </div>

            <div className="space-y-3">
              {studentLeaves.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No leave requests submitted yet.
                </div>
              ) : (
                studentLeaves.slice(0, 3).map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white capitalize">
                        {leave.leaveType} Leave ({leave.totalDays}d)
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        leave.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {leave.reason}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>{leave.startDate} to {leave.endDate}</span>
                      <span>{formatDate(leave.appliedAt, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/student/leave"
            className="w-full py-2.5 text-center text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
          >
            View All Leave Applications &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
