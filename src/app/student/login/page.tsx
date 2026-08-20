'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StorageManager } from '@/lib/storage';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  CalendarCheck, 
  Send, 
  BarChart3,
  UserPlus,
  User,
  Clock,
  Key,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StudentLoginPage() {
  const router = useRouter();
  const { login, quickDemoLogin } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'status'>('login');

  // Login form state
  const [email, setEmail] = useState('student@school.edu');
  const [password, setPassword] = useState('Alex#2026!Pass9');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    department: 'Computer Science',
    grade: 'Semester 4 (CS-A)',
    phone: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
  });

  // Status check state
  const [checkEmail, setCheckEmail] = useState('');
  const [statusResult, setStatusResult] = useState<{
    found: boolean;
    name?: string;
    status?: 'active' | 'pending' | 'rejected';
    approvedBy?: string;
    generatedPassword?: string;
    message?: string;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (!email) {
      setErrorMsg('Please enter your student email.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password, 'student');
      if (result.success) {
        setSuccessMsg('Student credentials verified! Opening dashboard...');
        router.push('/student/dashboard');
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed.');
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
      setErrorMsg('Please fill in student name and email.');
      setIsSubmitting(false);
      return;
    }

    const res = StorageManager.registerStudent(regData);
    if (res.success) {
      setSuccessMsg('Registration submitted successfully! Please wait for a teacher to approve your account. Once approved, you can log in with your generated password.');
      if (typeof window !== 'undefined') {
        confetti({ particleCount: 65, spread: 60, origin: { y: 0.6 } });
      }
      setRegData({
        name: '',
        email: '',
        department: 'Computer Science',
        grade: 'Semester 4 (CS-A)',
        phone: '',
        guardianName: '',
        guardianPhone: '',
        address: '',
      });
    } else {
      setErrorMsg(res.message);
    }
    setIsSubmitting(false);
  };

  const handleCheckStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkEmail.trim()) return;

    const user = StorageManager.getUserByEmail(checkEmail.trim());
    if (!user) {
      setStatusResult({
        found: false,
        message: 'No registration application found with this email address.',
      });
    } else {
      setStatusResult({
        found: true,
        name: user.name,
        status: user.status,
        approvedBy: user.approvedBy,
        generatedPassword: user.generatedPassword,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-between relative overflow-hidden text-slate-100">
      {/* Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[130px] pointer-events-none" />

      {/* Top Bar */}
      <header className="w-full px-6 lg:px-12 py-5 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">EduCore</span>
            <span className="block text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
              Student Portal
            </span>
          </div>
        </Link>

        <Link
          href="/teacher/login"
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 transition"
        >
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>Teacher / Faculty Portal &rarr;</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 my-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Student Highlights */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Student Academic Suite</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Student Portal & <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
                Attendance Management
              </span>
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed">
              Once your student application is approved by a teacher, log in with your registered email and system-generated password to check attendance records, apply for leave, and view statistical performance charts.
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300">
                <CalendarCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>View daily attendance calendar and presence percentages</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300">
                <Send className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Apply for medical or casual leaves and track teacher approval</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300">
                <BarChart3 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Interactive charts showing subject and monthly trends</span>
              </div>
            </div>

            {/* Quick 1-Click Student Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => quickDemoLogin('student')}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-600/30 hover:scale-[1.01]"
              >
                <GraduationCap className="w-4 h-4" />
                <span>1-Click Instant Student Login (Alex Rivera)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Student Card */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-cyan-500/30 glass-panel shadow-2xl space-y-4">
              {/* Tab Selector */}
              <div className="flex p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
                <button
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                    activeTab === 'login'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Student Sign In
                </button>

                <button
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                    activeTab === 'register'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Register
                </button>

                <button
                  onClick={() => {
                    setActiveTab('status');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                    activeTab === 'status'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Check Status
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Tab 1: Student Login */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 text-[11px]">
                    🔐 <strong>Note:</strong> You must be an approved student to log in. Once approved by a teacher, your auto-generated password will grant access.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Student Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@school.edu"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Generated Password
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Demo: <code>Alex#2026!Pass9</code>
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition shadow-lg shadow-cyan-600/30 disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </span>
                    ) : (
                      <>
                        <span>Open Student Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Tab 2: Student Registration */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-[11px]">
                    📝 Fill out the application. When a faculty member approves your registration, your system password will be created automatically!
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Student Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={regData.name}
                        onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                        placeholder="e.g. Maya Jenkins"
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Student Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={regData.email}
                        onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                        placeholder="e.g. maya.jenkins@school.edu"
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Department
                      </label>
                      <select
                        value={regData.department}
                        onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Information Technology">Information Tech</option>
                        <option value="Data Science">Data Science</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Semester / Grade
                      </label>
                      <select
                        value={regData.grade}
                        onChange={(e) => setRegData({ ...regData, grade: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                        <option value="Semester 3">Semester 3</option>
                        <option value="Semester 4 (CS-A)">Semester 4 (CS-A)</option>
                        <option value="Semester 4 (CS-B)">Semester 4 (CS-B)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-600/30 disabled:opacity-50 mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Submit Application for Approval</span>
                  </button>
                </form>
              )}

              {/* Tab 3: Check Approval Status */}
              {activeTab === 'status' && (
                <div className="space-y-4">
                  <form onSubmit={handleCheckStatus} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Enter Registered Email to Check Status
                      </label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="email"
                            value={checkEmail}
                            onChange={(e) => setCheckEmail(e.target.value)}
                            placeholder="e.g. jordan.miller@school.edu"
                            required
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
                        >
                          Check
                        </button>
                      </div>
                    </div>
                  </form>

                  {statusResult && (
                    <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs space-y-2 animate-fadeIn">
                      {!statusResult.found ? (
                        <p className="text-rose-300">{statusResult.message}</p>
                      ) : statusResult.status === 'pending' ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-amber-400 font-bold">
                            <Clock className="w-4 h-4" />
                            <span>Application Pending Review</span>
                          </div>
                          <p className="text-slate-300">
                            Hello <strong>{statusResult.name}</strong>, your application is currently in the faculty approval queue. A teacher will review and activate your access shortly.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Application Approved!</span>
                          </div>
                          <p className="text-slate-300">
                            Congratulations <strong>{statusResult.name}</strong>! Your application has been approved by {statusResult.approvedBy || 'Faculty'}.
                          </p>
                          {statusResult.generatedPassword && (
                            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-between">
                              <span className="font-mono text-emerald-300">
                                Password: <strong>{statusResult.generatedPassword}</strong>
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(statusResult.generatedPassword!);
                                  setCopiedPass(true);
                                  setTimeout(() => setCopiedPass(false), 2500);
                                }}
                                className="text-[11px] text-emerald-300 hover:underline flex items-center space-x-1"
                              >
                                {copiedPass ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setEmail(checkEmail);
                              if (statusResult.generatedPassword) setPassword(statusResult.generatedPassword);
                              setActiveTab('login');
                            }}
                            className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition mt-2"
                          >
                            Proceed to Sign In &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-600 border-t border-slate-900 z-10">
        EduCore Student Portal &bull; Academic Management System
      </footer>
    </div>
  );
}
