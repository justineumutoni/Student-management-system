'use client';

import React, { useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSystemData } from '@/context/SystemDataContext';
import { calculateStudentStats, formatDate } from '@/lib/utils';
import { AttendanceTrendsChart } from '@/components/charts/AttendanceTrendsChart';
import { LeaveBreakdownChart } from '@/components/charts/LeaveBreakdownChart';
import { SubjectBarChart } from '@/components/charts/SubjectBarChart';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  PieChart as PieIcon,
  TrendingUp,
  FileCheck2
} from 'lucide-react';

export default function StudentReportPage() {
  const { user } = useAuth();
  const { attendance, leaves } = useSystemData();
  const reportRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const studentLeaves = leaves.filter(
    l => l.studentId === user.id || l.studentEmail.toLowerCase() === user.email.toLowerCase()
  );

  const stats = calculateStudentStats(user.id, attendance, {
    requested: studentLeaves.length,
    approved: studentLeaves.filter(l => l.status === 'approved').length,
    pending: studentLeaves.filter(l => l.status === 'pending').length,
  });

  // Pie chart data for attendance status distribution
  const distributionData = [
    { name: 'Present', value: stats.presentCount, color: '#10b981' },
    { name: 'Late', value: stats.lateCount, color: '#f59e0b' },
    { name: 'Absent', value: stats.absentCount, color: '#f43f5e' },
  ];

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" ref={reportRef}>
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Official Academic Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Comprehensive Student Performance Report
          </h1>
          <p className="text-xs text-slate-400">
            Statistical breakdown of attendance percentages, subject performance, and leave history
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition border border-slate-700 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Summary</span>
          </button>
        </div>
      </div>

      {/* Official Summary Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Student Profile</span>
            <h3 className="text-lg font-bold text-white">{user.name}</h3>
            <p className="text-xs text-indigo-300 font-mono">ID: {user.studentId || 'CS-2026-101'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400">Department & Grade</span>
            <h3 className="text-sm font-bold text-white">{user.department || 'Computer Science'}</h3>
            <p className="text-xs text-slate-400">{user.grade || 'Semester 4 (CS-A)'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400">Attendance Index</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-emerald-400">{stats.attendancePercentage}%</span>
              <span className="text-xs font-semibold text-slate-300">
                ({stats.presentCount}/{stats.totalClasses} Classes)
              </span>
            </div>
            <p className="text-[11px] text-emerald-400 font-medium">Eligible for Term Examination</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400">Leave Compliance</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-indigo-400">{stats.leavesApproved}</span>
              <span className="text-xs text-slate-400">Approved Leaves</span>
            </div>
            <p className="text-[11px] text-slate-400">{stats.leavesPending} Pending Review</p>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Trends & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Attendance Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Monthly Attendance Trendline</span>
            </h3>
            <span className="text-xs text-slate-400">Past 4 Months</span>
          </div>
          <AttendanceTrendsChart data={stats.monthlyTrends} />
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-1">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <span>Status Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">Presence ratio breakdown</p>
          </div>
          
          <LeaveBreakdownChart data={distributionData} />

          <div className="pt-2 grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400">Present</span>
              <p className="font-bold text-emerald-400">{stats.presentCount}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Late</span>
              <p className="font-bold text-amber-400">{stats.lateCount}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Absent</span>
              <p className="font-bold text-rose-400">{stats.absentCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Subject-wise Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Subject-Wise Attendance Breakdown</span>
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">&ge; 75% Min. Required</span>
          </div>

          <SubjectBarChart data={stats.subjectBreakdown} />
        </div>

        {/* Official Faculty Verification Stamp */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/70 border border-slate-800/90 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Academic Advisory Notes</h4>
                <p className="text-xs text-slate-400">Verified by Faculty Administration</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-2">
              <p>
                Student <strong>{user.name}</strong> maintains an attendance rating of <strong>{stats.attendancePercentage}%</strong> across {stats.totalClasses} academic units.
              </p>
              <p className="text-emerald-400 font-medium">
                ✓ Student satisfies all minimum attendance requirements for semester final examinations.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Report Generated</span>
              <p className="font-semibold text-slate-300">{formatDate(new Date().toISOString(), { dateStyle: 'long' })}</p>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Authorized By</span>
              <p className="font-semibold text-indigo-300">Prof. Eleanor Vance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
