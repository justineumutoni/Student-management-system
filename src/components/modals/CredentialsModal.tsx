'use client';

import React, { useState } from 'react';
import { Check, Copy, Key, Mail, ShieldAlert, UserCheck, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentEmail: string;
  studentRoll: string;
  generatedPassword?: string;
  isNewStudent?: boolean;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  studentName,
  studentEmail,
  studentRoll,
  generatedPassword,
  isNewStudent = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Trigger celebration confetti
  if (typeof window !== 'undefined') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  const copyToClipboard = () => {
    const text = `--- Student Management System Credentials ---\nStudent: ${studentName}\nRoll ID: ${studentRoll}\nEmail: ${studentEmail}\nGenerated Password: ${generatedPassword}\nLogin URL: ${window.location.origin}/login\n--------------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isNewStudent ? 'Student Added Successfully!' : 'Student Registration Approved!'}
            </h3>
            <p className="text-xs text-slate-400">
              System generated security credentials
            </p>
          </div>
        </div>

        {/* Notification Alert Banner */}
        <div className="p-3 mb-4 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-200 text-xs flex items-start space-x-2">
          <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            An in-app notification and email alert containing these login credentials has been sent to <strong>{studentEmail}</strong>.
          </span>
        </div>

        {/* Credentials Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 mb-5">
          <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800/80 pb-2">
            <span>Student Name:</span>
            <span className="font-semibold text-slate-200">{studentName}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800/80 pb-2">
            <span>Student ID / Roll:</span>
            <span className="font-mono font-medium text-slate-200">{studentRoll}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800/80 pb-2">
            <span>Login Email:</span>
            <span className="font-medium text-slate-200">{studentEmail}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
            <span className="flex items-center text-emerald-400 font-medium">
              <Key className="w-3.5 h-3.5 mr-1" />
              Generated Password:
            </span>
            <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              {generatedPassword || 'Acad#2026!Pass9'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={copyToClipboard}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/20"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Credentials</span>
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-sm transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
