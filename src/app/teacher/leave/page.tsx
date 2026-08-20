'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSystemData } from '@/context/SystemDataContext';
import { formatDate } from '@/lib/utils';
import { LeaveRequest } from '@/types';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Search, 
  Paperclip, 
  MessageSquare, 
  Check, 
  X, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TeacherLeavePage() {
  const { user } = useAuth();
  const { leaves, reviewLeave } = useSystemData();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Review Modal / Action state
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [remarks, setRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filteredLeaves = leaves.filter(l => {
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesSearch = !searchQuery || 
      l.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.studentRoll.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenReview = (leave: LeaveRequest, action: 'approved' | 'rejected') => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setRemarks(action === 'approved' ? 'Approved by faculty advisor.' : 'Declined due to upcoming scheduled exams.');
  };

  const handleConfirmReview = () => {
    if (!selectedLeave) return;
    setIsProcessing(true);

    const res = reviewLeave(selectedLeave.id, reviewAction, remarks);
    if (res.success) {
      setToastMsg(`Leave request ${reviewAction} successfully! Student has been notified.`);
      if (reviewAction === 'approved' && typeof window !== 'undefined') {
        confetti({ particleCount: 65, spread: 60, origin: { y: 0.6 } });
      }
      setSelectedLeave(null);
      setTimeout(() => setToastMsg(null), 4000);
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Review Modal Dialog */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedLeave(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                reviewAction === 'approved' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}>
                {reviewAction === 'approved' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {reviewAction === 'approved' ? 'Approve Student Leave' : 'Decline Student Leave'}
                </h3>
                <p className="text-xs text-slate-400">
                  Student: {selectedLeave.studentName} ({selectedLeave.studentRoll})
                </p>
              </div>
            </div>

            {/* Leave Details Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Leave Type & Duration:</span>
                <span className="font-semibold text-white capitalize">{selectedLeave.leaveType} ({selectedLeave.totalDays} Days)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Date Range:</span>
                <span className="font-mono text-indigo-300">{selectedLeave.startDate} to {selectedLeave.endDate}</span>
              </div>
              <div className="pt-1 border-t border-slate-900 text-slate-300">
                <span className="text-[11px] text-slate-500 block mb-0.5">Student Explanation:</span>
                &ldquo;{selectedLeave.reason}&rdquo;
              </div>
            </div>

            {/* Teacher Remarks Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Faculty Remarks / Advisory Notes *
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter feedback or instructions for the student..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmReview}
                disabled={isProcessing}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs text-white transition shadow-lg ${
                  reviewAction === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Confirm {reviewAction === 'approved' ? 'Approval' : 'Rejection'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <FileCheck2 className="w-6 h-6 text-amber-400" />
            <span>Student Leave Approval Hub</span>
          </h1>
          <p className="text-xs text-slate-400">
            Review student absence requests, evaluate supporting documents, and issue feedback
          </p>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 text-xs flex items-center space-x-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or roll ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leave Requests Grid / Cards */}
      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
            <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No Leave Requests Found</h3>
            <p className="text-xs text-slate-500">There are no student leave requests matching your current filter.</p>
          </div>
        ) : (
          filteredLeaves.map((leave) => (
            <div
              key={leave.id}
              className={`p-6 rounded-3xl border transition shadow-lg ${
                leave.status === 'pending'
                  ? 'bg-slate-900/90 border-amber-500/30 hover:border-amber-500/50'
                  : 'bg-slate-900/60 border-slate-800/80'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Student & Request Overview */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-white">{leave.studentName}</span>
                    <span className="font-mono text-xs text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/20">
                      {leave.studentRoll}
                    </span>
                    <span className="text-xs text-slate-400">&bull; {leave.department} ({leave.grade})</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="capitalize px-2.5 py-0.5 rounded-full bg-slate-800 font-semibold text-slate-300 border border-slate-700">
                      {leave.leaveType} Leave
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{leave.startDate} to {leave.endDate}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 font-bold">
                      {leave.totalDays} {leave.totalDays === 1 ? 'Day' : 'Days'}
                    </span>
                    <span>&bull;</span>
                    <span>Applied: {formatDate(leave.appliedAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <p className="text-xs text-slate-200 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
                    &ldquo;{leave.reason}&rdquo;
                  </p>

                  {leave.documentName && (
                    <div className="flex items-center space-x-1.5 text-xs text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-xl border border-cyan-500/20 w-fit">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Attached: {leave.documentName}</span>
                    </div>
                  )}

                  {/* Existing Review remarks if already processed */}
                  {leave.reviewedBy && (
                    <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Reviewed by: {leave.reviewedByName || 'Teacher'}</span>
                        <span>{leave.reviewedAt && formatDate(leave.reviewedAt, { dateStyle: 'short' })}</span>
                      </div>
                      <p className="text-xs italic text-slate-300">
                        &ldquo;{leave.reviewRemarks}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 shrink-0">
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

                  {leave.status === 'pending' && (
                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        onClick={() => handleOpenReview(leave, 'approved')}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 hover:scale-[1.02]"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Leave</span>
                      </button>
                      <button
                        onClick={() => handleOpenReview(leave, 'rejected')}
                        className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 text-xs font-semibold transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
