'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSystemData } from '@/context/SystemDataContext';
import { formatDate } from '@/lib/utils';
import { CredentialsModal } from '@/components/modals/CredentialsModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Key, 
  Mail, 
  Phone, 
  Building, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Check, 
  AlertCircle,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TeacherStudentsPage() {
  const { user } = useAuth();
  const { 
    students, 
    pendingStudents, 
    approveStudent, 
    rejectStudent, 
    addStudent 
  } = useSystemData();

  const [activeTab, setActiveTab] = useState<'directory' | 'pending' | 'add'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Add student form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science',
    grade: 'Semester 4 (CS-A)',
    phone: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Modal state for credentials popup
  const [credModal, setCredModal] = useState<{
    isOpen: boolean;
    studentName: string;
    studentEmail: string;
    studentRoll: string;
    generatedPassword?: string;
    isNewStudent?: boolean;
  }>({
    isOpen: false,
    studentName: '',
    studentEmail: '',
    studentRoll: '',
  });

  const handleApprovePending = (student: any) => {
    const res = approveStudent(student.id);
    if (res.success) {
      setCredModal({
        isOpen: true,
        studentName: student.name,
        studentEmail: student.email,
        studentRoll: student.studentId || 'CS-2026-000',
        generatedPassword: res.generatedPassword,
        isNewStudent: false,
      });
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!formData.name || !formData.email) {
      setFormError('Please enter student name and email.');
      setIsSubmitting(false);
      return;
    }

    const res = addStudent(formData);
    if (res.success && res.student) {
      setCredModal({
        isOpen: true,
        studentName: res.student.name,
        studentEmail: res.student.email,
        studentRoll: res.student.studentId || 'CS-2026-000',
        generatedPassword: res.generatedPassword,
        isNewStudent: true,
      });
      setFormData({
        name: '',
        email: '',
        department: 'Computer Science',
        grade: 'Semester 4 (CS-A)',
        phone: '',
        guardianName: '',
        guardianPhone: '',
        address: '',
      });
      setActiveTab('directory');
    } else {
      setFormError(res.message);
    }
    setIsSubmitting(false);
  };

  const filteredStudents = students.filter(stu => {
    const matchesSearch = !searchQuery || 
      stu.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      stu.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stu.studentId && stu.studentId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = departmentFilter === 'All' || stu.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Generated Credentials Popup Modal */}
      <CredentialsModal
        isOpen={credModal.isOpen}
        onClose={() => setCredModal({ ...credModal, isOpen: false })}
        studentName={credModal.studentName}
        studentEmail={credModal.studentEmail}
        studentRoll={credModal.studentRoll}
        generatedPassword={credModal.generatedPassword}
        isNewStudent={credModal.isNewStudent}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Student Administration & Approvals</span>
          </h1>
          <p className="text-xs text-slate-400">
            Manage student registrations, auto-generate passwords, and maintain active rosters
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'directory'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Directory ({students.length})
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'pending'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Pending</span>
            {pendingStudents.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                {pendingStudents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
              activeTab === 'add'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Active Student Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, roll ID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 shrink-0">Department:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Information Tech">Information Tech</option>
              </select>
            </div>
          </div>

          {/* Directory Table */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Roll ID</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Class / Grade</th>
                    <th className="px-5 py-3.5">Contact</th>
                    <th className="px-5 py-3.5">Status & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                        No students found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((stu) => (
                      <tr key={stu.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
                              {stu.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={stu.avatar} alt={stu.name} className="w-full h-full object-cover" />
                              ) : (
                                stu.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs">{stu.name}</p>
                              <p className="text-[11px] text-slate-400">{stu.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 font-mono text-indigo-300">
                          {stu.studentId || 'CS-2026-100'}
                        </td>

                        <td className="px-5 py-3.5 text-slate-300">
                          {stu.department || 'Computer Science'}
                        </td>

                        <td className="px-5 py-3.5 text-slate-400">
                          {stu.grade || 'Semester 4'}
                        </td>

                        <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                          {stu.phone || 'Not provided'}
                        </td>

                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => {
                              setCredModal({
                                isOpen: true,
                                studentName: stu.name,
                                studentEmail: stu.email,
                                studentRoll: stu.studentId || 'CS-2026-100',
                                generatedPassword: stu.generatedPassword || 'Alex#2026!Pass9',
                                isNewStudent: false,
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-semibold flex items-center space-x-1 transition border border-slate-700"
                          >
                            <Key className="w-3 h-3" />
                            <span>View Pass</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pending Registrations Approval Queue */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              When you click <strong>Approve</strong>, the system will automatically generate a secure password, create their credentials, and dispatch a login notification to the student!
            </span>
          </div>

          <div className="space-y-3">
            {pendingStudents.length === 0 ? (
              <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">All Registrations Handled!</h3>
                <p className="text-xs text-slate-500">There are no pending self-registration requests waiting for approval.</p>
              </div>
            ) : (
              pendingStudents.map((stu) => (
                <div
                  key={stu.id}
                  className="p-5 rounded-3xl bg-slate-900/80 border border-purple-500/30 shadow-lg space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold text-white">{stu.name}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                          Pending Approval
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-slate-300">{stu.email}</span>
                        <span>&bull;</span>
                        <span>{stu.department} ({stu.grade})</span>
                        <span>&bull;</span>
                        <span>Applied: {formatDate(stu.registeredAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleApprovePending(stu)}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 hover:scale-[1.02]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Generate Password</span>
                      </button>
                      <button
                        onClick={() => rejectStudent(stu.id)}
                        className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 text-xs font-semibold transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>

                  {stu.guardianPhone && (
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex flex-wrap gap-4">
                      <span>Phone: <strong className="text-slate-200">{stu.phone || 'N/A'}</strong></span>
                      <span>Guardian: <strong className="text-slate-200">{stu.guardianName || 'N/A'} ({stu.guardianPhone})</strong></span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Direct Add Student Form */}
      {activeTab === 'add' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800/90 glass-panel shadow-2xl space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Enroll New Student Directly</h2>
              <p className="text-xs text-slate-400">
                System will auto-generate secure credentials and notify the student
              </p>
            </div>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleAddStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Samuel Green"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student Login Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. samuel.green@school.edu"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Information Tech">Information Tech</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Class / Semester
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4 (CS-A)">Semester 4 (CS-A)</option>
                  <option value="Semester 4 (CS-B)">Semester 4 (CS-B)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Guardian Phone
                </label>
                <input
                  type="text"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  placeholder="+1 (555) 999-8888"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/30 disabled:opacity-50 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll Student & Auto-Generate Password</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
