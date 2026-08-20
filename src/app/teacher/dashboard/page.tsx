'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSystemData } from '@/context/SystemDataContext';
import { calculateTeacherStats, formatDate } from '@/lib/utils';
import { AttendanceTrendsChart } from '@/components/charts/AttendanceTrendsChart';
import { CredentialsModal } from '@/components/modals/CredentialsModal';
import { 
  Users, 
  CalendarCheck, 
  FileCheck2, 
  UserPlus, 
  BarChart3, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  ShieldCheck,
  Award,
  ChevronRight
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { 
    students, 
    pendingStudents, 
    attendance, 
    leaves, 
    approveStudent, 
    rejectStudent,
    reviewLeave
  } = useSystemData();

  // Modal state for generated credentials upon approval
  const [credModal, setCredModal] = useState<{
    isOpen: boolean;
    studentName: string;
    studentEmail: string;
    studentRoll: string;
    generatedPassword?: string;
  }>({
    isOpen: false,
    studentName: '',
    studentEmail: '',
    studentRoll: '',
  });

  if (!user) return null;

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const approvedLeaves = leaves.filter(l => l.status === 'approved');

  const stats = calculateTeacherStats(
    students,
    attendance,
    pendingStudents.length,
    pendingLeaves.length,
    approvedLeaves.length
  );

  const handleQuickApprove = (student: any) => {
    const res = approveStudent(student.id);
    if (res.success) {
      setCredModal({
        isOpen: true,
        studentName: student.name,
        studentEmail: student.email,
        studentRoll: student.studentId || 'CS-2026-000',
        generatedPassword: res.generatedPassword,
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Credentials Distribution Modal */}
      <CredentialsModal
        isOpen={credModal.isOpen}
        onClose={() => setCredModal({ ...credModal, isOpen: false })}
        studentName={credModal.studentName}
        studentEmail={credModal.studentEmail}
        studentRoll={credModal.studentRoll}
        generatedPassword={credModal.generatedPassword}
      />

      {/* Hero Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl overflow-hidden glass-panel border border-slate-800/80 bg-gradient-to-r from-slate-900 via-purple-950/30 to-indigo-950/20">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Faculty Administration Hub</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {user.name} 🎓
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="font-semibold text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-500/20">
                {user.department || 'Computer Science & Engineering'}
              </span>
              <span>&bull;</span>
              <span>Active Semester 2026</span>
              <span>&bull;</span>
              <span className="text-emerald-400 font-medium flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 inline-block" />
                Live Database
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/teacher/attendance"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/20 hover:scale-[1.02]"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Mark Today&apos;s Attendance</span>
            </Link>

            <Link
              href="/teacher/students"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition border border-slate-700 hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4 text-purple-400" />
              <span>Add Student</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <Link href="/teacher/students" className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3 hover:border-indigo-500/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Enrolled Students</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{students.length}</span>
            <span className="text-xs font-semibold text-indigo-400">Active Students</span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Verified in directory</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </p>
        </Link>

        {/* Today's Attendance Rate */}
        <Link href="/teacher/attendance" className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3 hover:border-emerald-500/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Today&apos;s Presence Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{stats.todayAttendanceRate}%</span>
            <span className="text-xs font-semibold text-emerald-400">
              {stats.totalPresentToday} Present
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>{stats.totalAbsentToday} Absent today</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </p>
        </Link>

        {/* Pending Leave Requests */}
        <Link href="/teacher/leave" className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3 hover:border-amber-500/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Leave Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{pendingLeaves.length}</span>
            <span className={`text-xs font-semibold ${pendingLeaves.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {pendingLeaves.length > 0 ? 'Requires Action' : 'All Cleared'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>{approvedLeaves.length} Approved total</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </p>
        </Link>

        {/* Pending Student Registrations */}
        <Link href="/teacher/students" className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3 hover:border-purple-500/40 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Registrations</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{pendingStudents.length}</span>
            <span className={`text-xs font-semibold ${pendingStudents.length > 0 ? 'text-purple-400' : 'text-slate-400'}`}>
              {pendingStudents.length > 0 ? 'Waiting Approval' : 'No Queue'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Auto-generates credentials</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </p>
        </Link>
      </div>

      {/* Main Charts & Live Queue Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Class Weekly Attendance Ratio</h3>
              <p className="text-xs text-slate-400">Daily average present vs absent distribution</p>
            </div>
            <Link
              href="/teacher/reports"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
            >
              <span>Class Reports</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <AttendanceTrendsChart data={stats.classTrends} isTeacher />
        </div>

        {/* Pending Approvals & Leave Quick Queue */}
        <div className="lg:col-span-5 space-y-4">
          {/* Pending Registrations Widget */}
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <UserPlus className="w-3.5 h-3.5 text-purple-400" />
                <span>Pending Student Approvals ({pendingStudents.length})</span>
              </h3>
              <Link href="/teacher/students" className="text-[11px] text-purple-400 hover:underline">
                View All
              </Link>
            </div>

            {pendingStudents.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">
                No new registration requests waiting for approval.
              </p>
            ) : (
              <div className="space-y-2">
                {pendingStudents.slice(0, 2).map((stu) => (
                  <div key={stu.id} className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{stu.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{stu.email} &bull; {stu.grade}</p>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleQuickApprove(stu)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                        title="Approve & Generate Password"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectStudent(stu.id)}
                        className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 text-xs font-semibold transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Leave Requests Widget */}
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending Leave Submissions ({pendingLeaves.length})</span>
              </h3>
              <Link href="/teacher/leave" className="text-[11px] text-amber-400 hover:underline">
                Manage
              </Link>
            </div>

            {pendingLeaves.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">
                All student leave applications are reviewed.
              </p>
            ) : (
              <div className="space-y-2">
                {pendingLeaves.slice(0, 2).map((leave) => (
                  <div key={leave.id} className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{leave.studentName}</span>
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/20 capitalize">
                        {leave.leaveType} ({leave.totalDays}d)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-1 italic">
                      &ldquo;{leave.reason}&rdquo;
                    </p>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-900 text-[10px] text-slate-500">
                      <span>{leave.startDate} to {leave.endDate}</span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => reviewLeave(leave.id, 'approved', 'Approved by faculty supervisor.')}
                          className="text-emerald-400 hover:text-emerald-300 font-bold"
                        >
                          Approve
                        </button>
                        <span>&bull;</span>
                        <button
                          onClick={() => reviewLeave(leave.id, 'rejected', 'Declined due to academic scheduling conflicts.')}
                          className="text-rose-400 hover:text-rose-300 font-bold"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
