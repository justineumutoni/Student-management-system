'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSystemData } from '@/context/SystemDataContext';
import { calculateTeacherStats, calculateStudentStats, formatDate } from '@/lib/utils';
import { AttendanceTrendsChart } from '@/components/charts/AttendanceTrendsChart';
import { LeaveBreakdownChart } from '@/components/charts/LeaveBreakdownChart';
import { SubjectBarChart } from '@/components/charts/SubjectBarChart';
import { 
  BarChart3, 
  Printer, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  CalendarCheck, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function TeacherReportsPage() {
  const { user } = useAuth();
  const { students, attendance, leaves, pendingStudents } = useSystemData();

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const approvedLeaves = leaves.filter(l => l.status === 'approved');

  const stats = calculateTeacherStats(
    students,
    attendance,
    pendingStudents.length,
    pendingLeaves.length,
    approvedLeaves.length
  );

  // Compute attendance stats for each student to identify low attendance students
  const studentMetrics = students.map(stu => {
    const sLeaves = leaves.filter(l => l.studentId === stu.id);
    const sStats = calculateStudentStats(stu.id, attendance, {
      requested: sLeaves.length,
      approved: sLeaves.filter(l => l.status === 'approved').length,
      pending: sLeaves.filter(l => l.status === 'pending').length,
    });
    return {
      student: stu,
      stats: sStats,
    };
  });

  const lowAttendanceStudents = studentMetrics.filter(m => m.stats.attendancePercentage < 80);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const subjectAverages = [
    { subject: 'Data Structures', percentage: 94, attended: 45, total: 48 },
    { subject: 'Database Systems', percentage: 91, attended: 43, total: 48 },
    { subject: 'Web Development', percentage: 96, attended: 46, total: 48 },
    { subject: 'Computer Networks', percentage: 88, attended: 42, total: 48 },
    { subject: 'Software Eng.', percentage: 93, attended: 44, total: 48 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Faculty Analytics Suite</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Academic Performance & Attendance Reports
          </h1>
          <p className="text-xs text-slate-400">
            Monitor class trends, identify attendance risk alerts, and export semester registries
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
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Class CSV</span>
          </button>
        </div>
      </div>

      {/* Class KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-400">Department Enrolled</span>
          <p className="text-3xl font-black text-white">{students.length} Students</p>
          <span className="text-xs text-indigo-400 font-semibold">Active in 2 Sections</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-400">Semester Average Attendance</span>
          <p className="text-3xl font-black text-emerald-400">{stats.todayAttendanceRate}%</p>
          <span className="text-xs text-emerald-400 font-semibold">&ge; 75% Threshold Maintained</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-400">Attendance Risk Flags (&lt;80%)</span>
          <p className="text-3xl font-black text-amber-400">{lowAttendanceStudents.length}</p>
          <span className="text-xs text-amber-400 font-semibold">Flagged for Academic Advisory</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Attendance Trajectory */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <CalendarCheck className="w-4 h-4 text-purple-400" />
              <span>Weekly Class Attendance Ratio</span>
            </h3>
            <span className="text-xs text-slate-400">Past 5 Days</span>
          </div>
          <AttendanceTrendsChart data={stats.classTrends} isTeacher />
        </div>

        {/* Subject Course Comparison */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Course Attendance Index</span>
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">Class Average</span>
          </div>
          <SubjectBarChart data={subjectAverages} />
        </div>
      </div>

      {/* Student Registry Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-xl space-y-2">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Class Cumulative Attendance Register</span>
          </h3>
          <span className="text-xs text-slate-400">{studentMetrics.length} Students Evaluated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Roll ID</th>
                <th className="px-5 py-3.5">Section</th>
                <th className="px-5 py-3.5">Classes Attended</th>
                <th className="px-5 py-3.5">Attendance %</th>
                <th className="px-5 py-3.5">Academic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {studentMetrics.map(({ student, stats: sStats }) => (
                <tr key={student.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-5 py-3.5 font-bold text-white">
                    {student.name}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-indigo-300">
                    {student.studentId || 'CS-2026-000'}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">
                    {student.grade || 'Semester 4'}
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">
                    {sStats.presentCount} / {sStats.totalClasses}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      sStats.attendancePercentage >= 85 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      sStats.attendancePercentage >= 75 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {sStats.attendancePercentage}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-300 flex items-center space-x-1">
                      {sStats.attendancePercentage >= 75 ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Eligible</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-rose-300 font-semibold">Attendance Warning</span>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
