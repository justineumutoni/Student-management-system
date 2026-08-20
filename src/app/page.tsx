'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StorageManager } from '@/lib/storage';
import { isFirebaseConfigured } from '@/lib/firebase';
import { 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  User, 
  Mail, 
  Lock, 
  Clock, 
  Check, 
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AuthPortal() {
  const router = useRouter();
  const { user, login, registerTeacher, isLoading } = useAuth();
  
  // Auth Mode: 'register' (matches reference image "Create an account") | 'login' | 'status'
  const [mode, setMode] = useState<'register' | 'login' | 'status'>('register');
  
  // Selected Role: 'student' | 'teacher'
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');
  
  // Form credentials (clean and empty for user's own data)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [grade, setGrade] = useState('Semester 1');
  const [phone, setPhone] = useState('');

  // Status check for student registration
  const [statusEmail, setStatusEmail] = useState('');
  const [statusResult, setStatusResult] = useState<{
    found: boolean;
    name?: string;
    status?: 'active' | 'pending' | 'rejected';
    approvedBy?: string;
    generatedPassword?: string;
    message?: string;
  } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Immediate auto redirect if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      if (user.role === 'teacher') {
        router.replace('/teacher/dashboard');
      } else {
        router.replace('/student/dashboard');
      }
    }
  }, [user, isLoading, router]);

  // Handle role switch
  const handleRoleChange = (role: 'student' | 'teacher') => {
    setSelectedRole(role);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Switch between Register / Login / Status
  const switchMode = (newMode: 'register' | 'login' | 'status') => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (!email.trim()) {
      setErrorMsg('Please provide your school email address.');
      setIsSubmitting(false);
      return;
    }

    if (mode === 'login') {
      try {
        const result = await login(email.trim(), password, selectedRole);
        if (result.success) {
          // Immediately redirect to the proper dashboard
          if (result.role === 'teacher') {
            router.push('/teacher/dashboard');
          } else {
            router.push('/student/dashboard');
          }
          return;
        } else {
          setErrorMsg(result.message);
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Login failed. Please verify your credentials.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        setIsSubmitting(false);
        return;
      }

      if (selectedRole === 'student') {
        const res = StorageManager.registerStudent({
          name: name.trim(),
          email: email.trim(),
          department,
          grade,
          phone: phone.trim(),
        });

        if (res.success) {
          setSuccessMsg('Account registration submitted! A teacher can now approve your registration from the teacher dashboard.');
          if (typeof window !== 'undefined') {
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
          }
          setName('');
          setTimeout(() => {
            setMode('status');
            setStatusEmail(email.trim());
          }, 1800);
        } else {
          setErrorMsg(res.message);
        }
      } else {
        // Teacher registration
        const res = await registerTeacher({
          name: name.trim(),
          email: email.trim(),
          department,
          phone: phone.trim(),
          password: password || 'password123',
        });

        if (res.success) {
          // Immediately open teacher dashboard
          router.push('/teacher/dashboard');
          return;
        } else {
          setErrorMsg(res.message);
        }
      }
      setIsSubmitting(false);
    }
  };

  // Status Check Handler
  const handleCheckStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusEmail.trim()) return;

    const u = StorageManager.getUserByEmail(statusEmail.trim());
    if (!u) {
      setStatusResult({
        found: false,
        message: 'No registration application found for this email address.',
      });
    } else {
      setStatusResult({
        found: true,
        name: u.name,
        status: u.status,
        approvedBy: u.approvedBy,
        generatedPassword: u.generatedPassword,
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f7fb] flex flex-col justify-between items-center py-6 px-4 sm:px-6 lg:px-8 text-slate-800 antialiased font-sans">
      {/* Top Brand Bar */}
      <header className="w-full max-w-6xl flex items-center justify-between py-2 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
              <path d="M12 8v4"/>
              <path d="M12 16h.01"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Class Optima</span>
        </div>

        {/* Database Status Indicator */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 shadow-xs text-xs">
          <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
          <span className="text-[11px] font-semibold">{isFirebaseConfigured ? 'Firebase Active' : 'System Ready'}</span>
        </div>
      </header>

      {/* Main Split-Card Container */}
      <main className="w-full max-w-5xl my-auto">
        <div className="bg-white rounded-[32px] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          
          {/* ================= LEFT SIDE: Soft Blue Hero & 3D Illustration ================= */}
          <div className="lg:col-span-6 bg-gradient-to-b from-[#e3f0fe] via-[#ebf4ff] to-[#d8ebff] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Soft Organic Wavy Vector Patterns */}
            <svg 
              className="absolute inset-0 w-full h-full object-cover opacity-45 pointer-events-none" 
              viewBox="0 0 500 700" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M-50,150 C120,50 200,280 400,120 C500,40 550,100 600,180" stroke="#90c2f8" strokeWidth="48" strokeLinecap="round" opacity="0.4" />
              <path d="M-80,320 C100,240 220,440 450,280 C550,220 580,320 620,380" stroke="#b4d7fc" strokeWidth="56" strokeLinecap="round" opacity="0.3" />
              <path d="M-20,520 C150,420 280,620 520,460" stroke="#9bc9f9" strokeWidth="42" strokeLinecap="round" opacity="0.35" />
            </svg>

            {/* Top Logo & Branding inside Left Box */}
            <div className="relative z-10">
              <div className="flex items-center space-x-2.5 mb-6">
                <div className="w-7 h-7 rounded-lg border-2 border-blue-600 flex items-center justify-center text-blue-600 bg-white/70 shadow-xs">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight text-blue-900 italic font-serif">Class Optima</span>
              </div>

              {/* Headline with hand-drawn circle around "Scheduling" */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1d4ed8] tracking-tight leading-[1.2]">
                Simplify{' '}
                <span className="relative inline-block px-1.5 py-0.5">
                  <span className="relative z-10 text-[#1d4ed8]">Scheduling</span>
                  {/* Hand-drawn Orange Oval Accent */}
                  <svg 
                    className="absolute -top-1 -left-1 w-[calc(100%+10px)] h-[calc(100%+10px)] pointer-events-none z-0" 
                    viewBox="0 0 170 54" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M16 28 C 22 10, 148 6, 158 24 C 166 38, 126 50, 80 50 C 35 50, 6 42, 10 24 C 12 16, 32 10, 58 8" 
                      stroke="#f97316" 
                      strokeWidth="2.8" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                </span>
                <br />
                And Timetable
                <br />
                Management
              </h1>
            </div>

            {/* 3D Character Illustration */}
            <div className="relative z-10 mt-6 sm:mt-8 flex justify-center items-end">
              <div className="relative w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden shadow-lg shadow-blue-500/10 border border-white/60 bg-white/30 backdrop-blur-xs">
                <Image
                  src="/images/characters.png"
                  alt="Student & Teacher 3D Characters"
                  fill
                  sizes="(max-width: 768px) 100vw, 340px"
                  className="object-cover object-top hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDE: Clean White Form Container ================= */}
          <div className="lg:col-span-6 bg-white p-8 sm:p-12 flex flex-col justify-between">
            <div>
              {/* Header Title & Subtitle */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {mode === 'register' ? 'Create an account' : mode === 'login' ? 'Sign in to your account' : 'Check Application Status'}
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {mode === 'register' 
                    ? 'Choose your category to access tailored features and resources' 
                    : mode === 'login'
                    ? 'Sign in to access your customized academic portal'
                    : 'Check the approval progress and credentials for your student profile'}
                </p>
              </div>

              {/* Role Selector Card Pills */}
              {mode !== 'status' && (
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Select a role to access tailored features
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Student Option */}
                    <button
                      type="button"
                      onClick={() => handleRoleChange('student')}
                      className={`flex items-center space-x-2.5 px-3.5 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedRole === 'student'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-600/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {/* Radio Circle */}
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedRole === 'student' ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                      }`}>
                        {selectedRole === 'student' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span className="text-sm">🧑‍🎓</span>
                      <span className="text-xs font-semibold">I&apos;m a Student</span>
                    </button>

                    {/* Teacher Option */}
                    <button
                      type="button"
                      onClick={() => handleRoleChange('teacher')}
                      className={`flex items-center space-x-2.5 px-3.5 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedRole === 'teacher'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-600/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {/* Radio Circle */}
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedRole === 'teacher' ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                      }`}>
                        {selectedRole === 'teacher' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span className="text-sm">👩‍🏫</span>
                      <span className="text-xs font-semibold">I&apos;m a Teacher</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Alert Feedback Messages */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                  <span className="font-bold">Error:</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Mode 1 & 2: Form */}
              {mode !== 'status' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name for Registration */}
                  {mode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* School Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      School Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. name@school.edu"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition"
                      />
                    </div>
                  </div>

                  {/* Department & Grade for Student Registration */}
                  {mode === 'register' && selectedRole === 'student' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Department
                        </label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                        >
                          <option value="Computer Science">Computer Science</option>
                          <option value="Software Engineering">Software Eng</option>
                          <option value="Information Tech">Information Tech</option>
                          <option value="Data Science">Data Science</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Semester / Grade
                        </label>
                        <select
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                        >
                          <option value="Semester 1">Semester 1</option>
                          <option value="Semester 2">Semester 2</option>
                          <option value="Semester 3">Semester 3</option>
                          <option value="Semester 4 (CS-A)">Semester 4 (CS-A)</option>
                          <option value="Semester 4 (CS-B)">Semester 4 (CS-B)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Password Field */}
                  {(mode === 'login' || selectedRole === 'teacher') && (
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          Password
                        </label>
                        {mode === 'login' && (
                          <button
                            type="button"
                            onClick={() => switchMode('status')}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                          >
                            Forgot ?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required={mode === 'login'}
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Main Action Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </span>
                    ) : (
                      <span>{mode === 'register' ? 'Create account' : 'Log in'}</span>
                    )}
                  </button>

                  {/* Mode Switcher */}
                  <div className="text-center pt-2 text-xs text-slate-600">
                    {mode === 'register' ? (
                      <span>
                        Already Have An Account ?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('login')}
                          className="text-blue-600 font-semibold hover:underline cursor-pointer"
                        >
                          Log in
                        </button>
                      </span>
                    ) : (
                      <span>
                        Don&apos;t have an account ?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('register')}
                          className="text-blue-600 font-semibold hover:underline cursor-pointer"
                        >
                          Create account
                        </button>
                      </span>
                    )}
                  </div>
                </form>
              ) : (
                /* Mode 3: Student Status & Password Finder */
                <div className="space-y-4">
                  <form onSubmit={handleCheckStatus} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Enter Student Email to View Application Status
                      </label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="email"
                            value={statusEmail}
                            onChange={(e) => setStatusEmail(e.target.value)}
                            placeholder="e.g. your.email@school.edu"
                            required
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer"
                        >
                          Check
                        </button>
                      </div>
                    </div>
                  </form>

                  {statusResult && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5 animate-fadeIn">
                      {!statusResult.found ? (
                        <p className="text-red-600">{statusResult.message}</p>
                      ) : statusResult.status === 'pending' ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2 text-amber-600 font-bold">
                            <Clock className="w-4 h-4" />
                            <span>Application Pending Teacher Review</span>
                          </div>
                          <p className="text-slate-600">
                            Hi <strong>{statusResult.name}</strong>! Your registration application is waiting for teacher approval. Once approved, you can log in right away.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Application Approved by Teacher!</span>
                          </div>
                          <p className="text-slate-700">
                            Welcome <strong>{statusResult.name}</strong>! Approved by {statusResult.approvedBy || 'Teacher'}.
                          </p>
                          {statusResult.generatedPassword && (
                            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                              <span className="font-mono text-blue-900 text-xs">
                                Password: <strong>{statusResult.generatedPassword}</strong>
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(statusResult.generatedPassword!);
                                  setCopiedPass(true);
                                  setTimeout(() => setCopiedPass(false), 2000);
                                }}
                                className="text-xs text-blue-700 hover:underline flex items-center space-x-1 cursor-pointer"
                              >
                                {copiedPass ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setEmail(statusEmail);
                              if (statusResult.generatedPassword) setPassword(statusResult.generatedPassword);
                              setSelectedRole('student');
                              switchMode('login');
                            }}
                            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer"
                          >
                            Proceed to Sign In &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
                    >
                      &larr; Back to Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Link (matching reference image) */}
            <div className="text-center pt-8 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('teacher');
                  switchMode('register');
                }}
                className="text-xs text-blue-600 hover:text-blue-700 underline font-medium hover:opacity-80 transition cursor-pointer"
              >
                Administrators, register your school here
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl py-3 text-center text-xs text-slate-500">
        Class Optima &bull; Student and Timetable Management System
      </footer>
    </div>
  );
}
