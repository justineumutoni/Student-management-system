'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSystemData } from '@/context/SystemDataContext';
import { StorageManager } from '@/lib/storage';
import { isFirebaseConfigured } from '@/lib/firebase';
import { 
  GraduationCap, 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  KeyRound, 
  UserPlus, 
  Calendar, 
  BarChart2, 
  FileText,
  Building,
  Phone,
  BookOpen,
  CalendarCheck,
  FileCheck2,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, quickDemoLogin, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('teacher');
  
  // Login form state
  const [email, setEmail] = useState('teacher@school.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    department: 'Computer Science',
    grade: 'Semester 1',
    phone: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
  });

  // Switch default prefill when role changes
  const handleRoleToggle = (role: 'student' | 'teacher') => {
    setSelectedRole(role);
    if (role === 'teacher') {
      setEmail('teacher@school.edu');
      setPassword('password123');
    } else {
      setEmail('student@school.edu');
      setPassword('Alex#2026!Pass9');
    }
  };

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      if (user.role === 'teacher') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    }
  }, [user, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password, selectedRole);
      if (result.success) {
        setSuccessMsg(`Login successful! Redirecting to ${result.role} dashboard...`);
        if (result.role === 'teacher') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (!regData.name || !regData.email) {
      setErrorMsg('Please fill in student name and email address.');
      setIsSubmitting(false);
      return;
    }

    const res = StorageManager.registerStudent(regData);
    if (res.success) {
      setSuccessMsg(res.message);
      if (typeof window !== 'undefined') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
      setRegData({
        name: '',
        email: '',
        department: 'Computer Science',
        grade: 'Semester 1',
        phone: '',
        guardianName: '',
        guardianPhone: '',
        address: '',
      });
      setTimeout(() => {
        setActiveTab('login');
        setSelectedRole('student');
      }, 4000);
    } else {
      setErrorMsg(res.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-between relative overflow-hidden text-slate-100">
      {/* Background glowing gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[30%] w-[350px] h-[350px] rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <nav className="w-full px-6 lg:px-12 py-5 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">EduCore</span>
            <span className="block text-[11px] text-indigo-400 font-medium tracking-wide uppercase">
              Student & Teacher Management System
            </span>
          </div>
        </div>

        {/* Quick Portal Switch Links */}
        <div className="flex items-center space-x-2">
          <Link
            href="/teacher/login"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:bg-purple-900/60 text-xs font-semibold transition"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Teacher Portal</span>
          </Link>

          <Link
            href="/student/login"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold transition"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Portal</span>
          </Link>

          {/* Firebase connectivity badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`} />
            <span className="text-slate-400 text-[11px] font-medium hidden md:inline">
              {isFirebaseConfigured ? 'Firebase Live' : 'Demo Ready'}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content Layout */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 my-auto z-10">
        {/* Dual Direct Portal Access Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Direct Teacher Portal Access */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-purple-950/40 border border-purple-500/30 shadow-xl space-y-4 hover:border-purple-500/60 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Teacher & Faculty Portal</h3>
                  <p className="text-xs text-purple-300">Prof. Eleanor Vance (`teacher@school.edu`)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                Teacher Role
              </span>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Access the Teacher Dashboard to mark daily attendance, approve student leaves, manage student rosters, and auto-generate student passwords.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => quickDemoLogin('teacher')}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/25 hover:scale-[1.02]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>1-Click Open Teacher Dashboard</span>
              </button>
              <Link
                href="/teacher/login"
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
              >
                Teacher Login &rarr;
              </Link>
            </div>
          </div>

          {/* Direct Student Portal Access */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 shadow-xl space-y-4 hover:border-cyan-500/60 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Student Portal</h3>
                  <p className="text-xs text-cyan-300">Alex Rivera (`student@school.edu`)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
                Student Role
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Access the Student Dashboard to view attendance history, submit leave requests with reason, and view statistical performance charts.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => quickDemoLogin('student')}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-600/25 hover:scale-[1.02]"
              >
                <GraduationCap className="w-4 h-4" />
                <span>1-Click Open Student Dashboard</span>
              </button>
              <Link
                href="/student/login"
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
              >
                Student Login &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Grid and Interactive Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Feature Highlights */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Fullstack Student Management System</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
              Smart Academic <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">
                Management System
              </span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Complete academic lifecycle system with role-based access for teachers and students, automated password generation and notifications, attendance tracking, leave approval workflows, and interactive statistical analytics with charts.
            </p>

            {/* Quick Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">Teacher Dashboard</h3>
                <p className="text-[11px] text-slate-400">
                  Daily attendance marking, leave approval hub, and student registrations.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">Student Dashboard</h3>
                <p className="text-[11px] text-slate-400">
                  Attendance logs, leave request portal, and statistical Recharts.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Unified Form */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-7 rounded-3xl glass-panel bg-slate-900/80 border border-slate-800/90 shadow-2xl space-y-4">
              {/* Tabs */}
              <div className="flex p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
                <button
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                    activeTab === 'login'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                    activeTab === 'register'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Student Registration
                </button>
              </div>

              {/* Error and Success Banners */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form 1: Sign In */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  {/* Role Selector Pill */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Choose Role to Log In
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleRoleToggle('teacher')}
                        className={`flex items-center justify-center space-x-2 p-2 rounded-xl border text-xs font-semibold transition ${
                          selectedRole === 'teacher'
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-sm'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        <span>Teacher</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRoleToggle('student')}
                        className={`flex items-center justify-center space-x-2 p-2 rounded-xl border text-xs font-semibold transition ${
                          selectedRole === 'student'
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 shadow-sm'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <GraduationCap className="w-4 h-4 text-cyan-400" />
                        <span>Student</span>
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={selectedRole === 'teacher' ? 'teacher@school.edu' : 'student@school.edu'}
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-slate-300">
                        Password
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {selectedRole === 'teacher' ? 'password123' : 'Alex#2026!Pass9'}
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 mt-1"
                  >
                    <span>Sign In to {selectedRole === 'teacher' ? 'Teacher' : 'Student'} Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Form 2: Register */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={regData.name}
                      onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                      placeholder="e.g. Maya Jenkins"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      placeholder="e.g. maya.jenkins@school.edu"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Department
                      </label>
                      <select
                        value={regData.department}
                        onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white"
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Information Tech">Information Tech</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Grade / Class
                      </label>
                      <select
                        value={regData.grade}
                        onChange={(e) => setRegData({ ...regData, grade: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white"
                      >
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                        <option value="Semester 4 (CS-A)">Semester 4 (CS-A)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs transition shadow-lg mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Submit Registration</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-600 border-t border-slate-900 z-10">
        EduCore Student & Teacher Management System &copy; 2026
      </footer>
    </div>
  );
}
