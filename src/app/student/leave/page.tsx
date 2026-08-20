'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSystemData } from '@/context/SystemDataContext';
import { LeaveType } from '@/types';
import { calculateDaysBetween, formatDate } from '@/lib/utils';
import { 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  FileText, 
  Paperclip, 
  Sparkles,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StudentLeavePage() {
  const { user } = useAuth();
  const { leaves, applyLeave } = useSystemData();

  const [leaveType, setLeaveType] = useState<LeaveType>('medical');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [docName, setDocName] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  if (!user) return null;

  const totalDays = calculateDaysBetween(startDate, endDate);

  const studentLeaves = leaves.filter(
    l => l.studentId === user.id || l.studentEmail.toLowerCase() === user.email.toLowerCase()
  );

  const filteredLeaves = studentLeaves.filter(
    l => statusFilter === 'all' || l.status === statusFilter
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    if (!reason.trim()) {
      setMessage({ type: 'error', text: 'Please enter a clear reason for your leave request.' });
      setIsSubmitting(false);
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setMessage({ type: 'error', text: 'End date cannot be earlier than start date.' });
      setIsSubmitting(false);
      return;
    }

    const res = applyLeave({
      leaveType,
      startDate,
      endDate,
      reason,
      documentName: docName || undefined,
    });

    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      if (typeof window !== 'undefined') {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      }
      setReason('');
      setDocName('');
    } else {
      setMessage({ type: 'error', text: res.message });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Leave Portal & Applications
        </h1>
        <p className="text-xs text-slate-400">
          Apply for academic, medical, or casual leave and track teacher approval status
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Leave Application Form */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/90 glass-panel shadow-xl space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Send className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white">Submit New Leave Request</h2>
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-xs flex items-start space-x-2 animate-fadeIn ${
                message.type === 'success' 
                  ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-200' 
                  : 'bg-rose-950/60 border border-rose-500/30 text-rose-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Leave Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Type of Leave
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 capitalize"
                >
                  <option value="medical">🏥 Medical Leave (Illness / Surgery)</option>
                  <option value="casual">🌴 Casual Leave (Personal / Family)</option>
                  <option value="emergency">🚨 Emergency Leave (Urgent domestic)</option>
                  <option value="academic">🎓 Academic / Hackathon / Event</option>
                  <option value="other">📌 Other Special Purpose</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Duration Indicator */}
              <div className="px-3 py-2 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 text-xs flex items-center justify-between font-medium">
                <span>Calculated Duration:</span>
                <span className="font-bold text-white bg-indigo-600/40 px-2 py-0.5 rounded">
                  {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
                </span>
              </div>

              {/* Reason Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason / Explanation *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide a detailed explanation for your faculty supervisor..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Supporting Document / Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supporting Document (Optional)
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      placeholder="e.g. medical_prescription.pdf"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setDocName('medical_doctor_certificate.pdf')}
                    className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 shrink-0"
                  >
                    Attach Demo Cert
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Submit Leave Application</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Submitted Leaves & History */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Application Status History</h3>
            <div className="flex items-center space-x-1">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold capitalize transition ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {filteredLeaves.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No leave applications found in this category.</p>
              </div>
            ) : (
              filteredLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/90 shadow-md space-y-3 hover:border-slate-700 transition"
                >
                  {/* Top line */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white capitalize">
                        {leave.leaveType} Leave
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/30 text-[11px] font-semibold text-indigo-300">
                        {leave.totalDays} {leave.totalDays === 1 ? 'Day' : 'Days'}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize flex items-center space-x-1.5 ${
                      leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      leave.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {leave.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {leave.status === 'rejected' && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                      {leave.status === 'pending' && <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                      <span>{leave.status}</span>
                    </span>
                  </div>

                  {/* Dates & Reason */}
                  <div className="text-xs text-slate-400 flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Period: <strong>{leave.startDate}</strong> to <strong>{leave.endDate}</strong></span>
                    <span>&bull;</span>
                    <span>Applied: {formatDate(leave.appliedAt, { month: 'short', day: 'numeric' })}</span>
                  </div>

                  <p className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    &ldquo;{leave.reason}&rdquo;
                  </p>

                  {/* Attachment if present */}
                  {leave.documentName && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-cyan-400 bg-cyan-950/30 px-2.5 py-1 rounded-lg border border-cyan-500/20 w-fit">
                      <Paperclip className="w-3 h-3" />
                      <span>Attachment: {leave.documentName}</span>
                    </div>
                  )}

                  {/* Teacher Feedback remarks */}
                  {leave.reviewedBy && (
                    <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-semibold text-slate-300 flex items-center">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-400 mr-1" />
                          Feedback from {leave.reviewedByName || 'Teacher'}:
                        </span>
                        <span className="text-[10px]">
                          {leave.reviewedAt && formatDate(leave.reviewedAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] italic">
                        {leave.reviewRemarks}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
