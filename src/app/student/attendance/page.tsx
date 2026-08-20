'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSystemData } from '@/context/SystemDataContext';
import { calculateStudentStats, formatDate } from '@/lib/utils';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const { attendance, leaves } = useSystemData();

  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'late'>('all');
  const [searchSubject, setSearchSubject] = useState('');

  if (!user) return null;

  const studentRecords = attendance.filter(
    r => r.studentId === user.id || r.studentRoll === user.studentId
  );

  const studentLeaves = leaves.filter(l => l.studentId === user.id);
  const stats = calculateStudentStats(user.id, attendance, {
    requested: studentLeaves.length,
    approved: studentLeaves.filter(l => l.status === 'approved').length,
    pending: studentLeaves.filter(l => l.status === 'pending').length,
  });

  const filteredRecords = studentRecords.filter(rec => {
    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    const matchesSubject = !searchSubject || (rec.subject && rec.subject.toLowerCase().includes(searchSubject.toLowerCase()));
    return matchesStatus && matchesSubject;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Attendance Record & History
          </h1>
          <p className="text-xs text-slate-400">
            View daily presence logs, attendance percentages, and subject-wise logs
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-300 font-semibold flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>Overall: {stats.attendancePercentage}% Present</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-400 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
            Present Days
          </span>
          <p className="text-2xl font-black text-white">{stats.presentCount}</p>
          <span className="text-[10px] text-emerald-400">Classes Attended</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-400 flex items-center">
            <XCircle className="w-3.5 h-3.5 text-rose-400 mr-1.5" />
            Absent Days
          </span>
          <p className="text-2xl font-black text-white">{stats.absentCount}</p>
          <span className="text-[10px] text-rose-400">Unexcused Misses</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-400 flex items-center">
            <Clock className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
            Late Marks
          </span>
          <p className="text-2xl font-black text-white">{stats.lateCount}</p>
          <span className="text-[10px] text-amber-400">Recorded Tardy</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-400 flex items-center">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
            Total Lectures
          </span>
          <p className="text-2xl font-black text-white">{stats.totalClasses}</p>
          <span className="text-[10px] text-indigo-400">Completed Sessions</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col sm:flex-row gap-3 justify-between items-center">
        {/* Search by subject */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchSubject}
            onChange={(e) => setSearchSubject(e.target.value)}
            placeholder="Search by subject..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'present', 'absent', 'late'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Attendance Log Sessions</span>
          </h3>
          <span className="text-xs text-slate-400">
            Showing {filteredRecords.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Subject</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Marked By</th>
                <th className="px-5 py-3.5">Marked Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    No attendance records found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4 font-medium text-white">
                      {formatDate(record.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-medium text-slate-200">
                        {record.subject || 'Computer Science'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize flex items-center space-x-1 w-fit ${
                        record.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        record.status === 'absent' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {record.status === 'present' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {record.status === 'absent' && <XCircle className="w-3 h-3 mr-1" />}
                        {record.status === 'late' && <Clock className="w-3 h-3 mr-1" />}
                        <span>{record.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {record.markedByName || 'Prof. Eleanor Vance'}
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-[11px]">
                      {record.markedAt ? formatDate(record.markedAt, { hour: '2-digit', minute: '2-digit' }) : '09:00 AM'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
