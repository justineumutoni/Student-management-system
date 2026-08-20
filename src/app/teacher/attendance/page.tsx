'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSystemData } from '@/context/SystemDataContext';
import { AttendanceStatus } from '@/types';
import { 
  CalendarCheck, 
  CheckCheck, 
  XCircle, 
  Clock, 
  Calendar, 
  Users, 
  UserPlus,
  Save, 
  CheckCircle2, 
  Filter, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const { students, attendance, markAttendance } = useSystemData();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSubject, setSelectedSubject] = useState('Data Structures');
  const [selectedGrade, setSelectedGrade] = useState('All');
  
  // Local state for attendance roster mapping: { [studentId]: { status: AttendanceStatus, remarks: string } }
  const [rosterStatus, setRosterStatus] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Initialize or load existing records for selected date
  useEffect(() => {
    const existingForDate = attendance.filter(r => r.date === selectedDate);
    const newStatusMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};

    students.forEach(stu => {
      const match = existingForDate.find(r => r.studentId === stu.id);
      newStatusMap[stu.id] = {
        status: match ? match.status : 'present', // Default to present
        remarks: match?.remarks || '',
      };
    });

    setRosterStatus(newStatusMap);
    setSavedSuccess(false);
  }, [selectedDate, students, attendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRosterStatus(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      }
    }));
    setSavedSuccess(false);
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setRosterStatus(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      }
    }));
  };

  const handleBulkAction = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    students.forEach(stu => {
      updated[stu.id] = {
        status,
        remarks: rosterStatus[stu.id]?.remarks || '',
      };
    });
    setRosterStatus(updated);
    setSavedSuccess(false);
  };

  const handleSaveAttendance = () => {
    const recordsToSave = students.map(stu => {
      const entry = rosterStatus[stu.id] || { status: 'present' as AttendanceStatus, remarks: '' };
      return {
        studentId: stu.id,
        studentName: stu.name,
        studentRoll: stu.studentId || 'CS-2026-000',
        department: stu.department || 'Computer Science',
        grade: stu.grade || 'Semester 4',
        date: selectedDate,
        status: entry.status,
        markedBy: user?.id || 't-1',
        subject: selectedSubject,
        remarks: entry.remarks,
      };
    });

    const res = markAttendance(recordsToSave);
    if (res.success) {
      setSavedSuccess(true);
      if (typeof window !== 'undefined') {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
      }
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  const filteredStudents = students.filter(stu => {
    if (selectedGrade === 'All') return true;
    return stu.grade === selectedGrade;
  });

  // Calculate live statistics for today's roster
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  Object.values(rosterStatus).forEach(item => {
    if (item.status === 'present') presentCount++;
    else if (item.status === 'absent') absentCount++;
    else if (item.status === 'late') lateCount++;
  });

  const totalCount = filteredStudents.length || 1;
  const attendanceRate = Math.round(((presentCount + lateCount * 0.5) / totalCount) * 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <CalendarCheck className="w-6 h-6 text-purple-400" />
            <span>Class Attendance Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Record daily presence, perform bulk mark actions, and log subject participation
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/30 hover:scale-[1.02]"
        >
          <Save className="w-4 h-4" />
          <span>Save Attendance Record</span>
        </button>
      </div>

      {/* Success Banner */}
      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Attendance saved successfully for <strong>{selectedDate}</strong> ({selectedSubject})!</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono">Sync Complete</span>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 glass-panel shadow-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Select Date</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Course / Subject</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Data Structures">Data Structures & Algorithms</option>
              <option value="Database Systems">Database Systems (SQL & NoSQL)</option>
              <option value="Web Development">Fullstack Web Development</option>
              <option value="Computer Networks">Computer Networks & Security</option>
              <option value="Software Eng.">Software Engineering Principles</option>
            </select>
          </div>

          {/* Grade / Section Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Section / Class</span>
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Sections (All Students)</option>
              <option value="Semester 4 (CS-A)">Semester 4 (CS-A)</option>
              <option value="Semester 4 (CS-B)">Semester 4 (CS-B)</option>
            </select>
          </div>
        </div>

        {/* Quick Bulk Action Buttons & Live Stats */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">Quick Actions:</span>
            <button
              onClick={() => handleBulkAction('present')}
              className="px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
            >
              ✓ Mark All Present
            </button>
            <button
              onClick={() => handleBulkAction('absent')}
              className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
            >
              ✗ Mark All Absent
            </button>
            <button
              onClick={() => handleBulkAction('late')}
              className="px-3 py-1.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
            >
              ⏰ Mark All Late
            </button>
          </div>

          {/* Live Roster Summary */}
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-400">Session Ratio:</span>
            <span className="text-emerald-400 font-bold">{presentCount} Present</span>
            <span>&bull;</span>
            <span className="text-rose-400 font-bold">{absentCount} Absent</span>
            <span>&bull;</span>
            <span className="text-amber-400 font-bold">{lateCount} Late</span>
            <span className="px-2 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-300 font-bold">
              {attendanceRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Roll ID</th>
                <th className="px-5 py-3.5">Class / Section</th>
                <th className="px-5 py-3.5 text-center">Attendance Status</th>
                <th className="px-5 py-3.5">Remarks (Optional)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400 space-y-3">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-slate-500" />
                      <p className="text-sm font-semibold text-white">No active students registered yet</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        You can add new students directly or approve students who submit their registration applications.
                      </p>
                      <Link
                        href="/teacher/students"
                        className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Go to Students Directory &rarr;</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const currentStatus = rosterStatus[student.id]?.status || 'present';
                  const currentRemark = rosterStatus[student.id]?.remarks || '';

                  return (
                    <tr key={student.id} className="hover:bg-slate-800/30 transition">
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
                            {student.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              student.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{student.name}</p>
                            <p className="text-[11px] text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Roll ID */}
                      <td className="px-5 py-3.5 font-mono text-slate-300">
                        {student.studentId || 'CS-2026-100'}
                      </td>

                      {/* Grade */}
                      <td className="px-5 py-3.5 text-slate-400">
                        {student.grade || 'Semester 4'}
                      </td>

                      {/* Status Toggle Buttons */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex p-1 rounded-xl bg-slate-950/80 border border-slate-800 space-x-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'present')}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'late')}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                              currentStatus === 'late'
                                ? 'bg-amber-600 text-white shadow'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>

                      {/* Remarks */}
                      <td className="px-5 py-3.5">
                        <input
                          type="text"
                          value={currentRemark}
                          onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                          placeholder="e.g. Left early, sick..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
