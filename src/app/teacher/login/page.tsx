'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  GraduationCap, 
  Users, 
  CalendarCheck, 
  FileCheck2,
  UserPlus,
  User,
  Building,
  Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TeacherLoginPage() {
  const router = useRouter();
  const { login, registerTeacher, quickDemoLogin } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('teacher@school.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    phone: '',
    password: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (!email) {
      setErrorMsg('Please enter your faculty email.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password, 'teacher');
      if (result.success) {
        setSuccessMsg('Faculty authentication verified! Opening dashboard...');
        router.push('/teacher/dashboard');
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (!regData.name || !regData.email || !regData.password) {
      setErrorMsg('Please fill in name, email, and password.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await registerTeacher(regData);
      if (result.success) {
        setSuccessMsg('Faculty account created! Opening your dashboard...');
        if (typeof window !== 'undefined') {
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
        }
        setTimeout(() => {
          router.push('/teacher/dashboard');
        }, 1000);
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-between relative overflow-hidden text-slate-100">
      {/* Glow Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[130px] pointer-events-none" />

      {/* Top Bar */}
      <header className="w-full px-6 lg:px-12 py-5 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 group-hover:scale-105 transition">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">EduCore</span>
            <span className="block text-[10px] text-purple-400 font-semibold uppercase tracking-wider">
              Faculty & Teacher Portal
            </span>
          </div>
        </Link>

        <Link
          href="/student/login"
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 transition"
        >
          <GraduationCap className="w-4 h-4 text-cyan-400" />
          <span>Switch to Student Login &rarr;</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 my-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Teacher Capabilities */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Teacher / Faculty Suite</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Teacher Portal & <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400">
                Academic Management
              </span>
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed">
              Log in to your existing faculty account or create a new teacher profile to manage daily attendance, review student leave requests, approve registrations, and auto-generate student passwords.
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300">
                <CalendarCheck className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Mark daily class attendance with single-click bulk actions</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300">
                <FileCheck2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Review student leave applications with faculty feedback notes</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300">
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Approve registrations and auto-generate secure passwords for students</span>
              </div>
            </div>

            {/* Quick 1-Click Teacher Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => quickDemoLogin('teacher')}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/30 hover:scale-[1.01]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>1-Click Instant Teacher Login (Prof. Eleanor Vance)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Teacher Login / Register Card */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-purple-500/30 glass-panel shadow-2xl space-y-4">
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
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Faculty Sign In
                </button>
                <button
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                    activeTab === 'register'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Teacher Account
                </button>
              </div>

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

              {/* Tab 1: Login */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Faculty Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="teacher@school.edu"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
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
                    className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition shadow-lg shadow-purple-600/30 disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </span>
                    ) : (
                      <>
                        <span>Open Teacher Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Tab 2: Create Teacher Account */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterTeacher} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name & Title *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={regData.name}
                        onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                        placeholder="e.g. Prof. Marcus Thorne"
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Faculty Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={regData.email}
                        onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                        placeholder="e.g. marcus.thorne@school.edu"
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
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
                        className="w-full px-2.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Computer Science & Engineering">Computer Science & Eng</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Information Technology">Information Tech</option>
                        <option value="Data Science & AI">Data Science & AI</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Phone (Optional)
                      </label>
                      <input
                        type="text"
                        value={regData.phone}
                        onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Account Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regData.password}
                        onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                        placeholder="Create secure password..."
                        required
                        className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
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
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/30 disabled:opacity-50 mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Faculty Account & Log In</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-600 border-t border-slate-900 z-10">
        EduCore Faculty Portal &bull; Academic Management System
      </footer>
    </div>
  );
}
