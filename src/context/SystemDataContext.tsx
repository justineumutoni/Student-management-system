'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  AttendanceRecord, 
  LeaveRequest, 
  AppNotification, 
  LeaveType,
  AttendanceStatus
} from '@/types';
import { StorageManager } from '@/lib/storage';
import { useAuth } from './AuthContext';

interface SystemDataContextType {
  users: UserProfile[];
  students: UserProfile[];
  pendingStudents: UserProfile[];
  teachers: UserProfile[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  notifications: AppNotification[];
  unreadNotifsCount: number;
  
  // Actions
  approveStudent: (studentId: string) => { success: boolean; generatedPassword?: string; message: string };
  rejectStudent: (studentId: string) => { success: boolean; message: string };
  addStudent: (data: {
    name: string;
    email: string;
    department: string;
    grade: string;
    phone?: string;
    studentId?: string;
    guardianName?: string;
    guardianPhone?: string;
    address?: string;
  }) => { success: boolean; student?: UserProfile; generatedPassword?: string; message: string };
  
  applyLeave: (data: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    documentName?: string;
  }) => { success: boolean; message: string };
  
  reviewLeave: (
    leaveId: string, 
    status: 'approved' | 'rejected', 
    remarks?: string
  ) => { success: boolean; message: string };
  
  markAttendance: (
    records: Omit<AttendanceRecord, 'id' | 'markedAt'>[]
  ) => { success: boolean; count: number };
  
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshData: () => void;
}

const SystemDataContext = createContext<SystemDataContextType | undefined>(undefined);

export function SystemDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refreshData = useCallback(() => {
    StorageManager.initializeData();
    setUsers(StorageManager.getUsers());
    setAttendance(StorageManager.getAttendance());
    setLeaves(StorageManager.getLeaveRequests());
    setNotifications(StorageManager.getNotifications(user?.id));
  }, [user?.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Derived filtered lists
  const students = users.filter(u => u.role === 'student' && u.status === 'active');
  const pendingStudents = users.filter(u => u.role === 'student' && u.status === 'pending');
  const teachers = users.filter(u => u.role === 'teacher' && u.status === 'active');

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const approveStudent = (studentId: string) => {
    const teacherName = user?.name || 'Prof. Administrator';
    const res = StorageManager.approveStudent(studentId, teacherName);
    refreshData();
    return res;
  };

  const rejectStudent = (studentId: string) => {
    const res = StorageManager.rejectStudent(studentId);
    refreshData();
    return res;
  };

  const addStudent = (data: {
    name: string;
    email: string;
    department: string;
    grade: string;
    phone?: string;
    studentId?: string;
    guardianName?: string;
    guardianPhone?: string;
    address?: string;
  }) => {
    const teacherName = user?.name || 'Prof. Administrator';
    const res = StorageManager.addStudentDirectly(data, teacherName);
    refreshData();
    return res;
  };

  const applyLeave = (data: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    documentName?: string;
  }) => {
    if (!user) return { success: false, message: 'Please log in to apply for leave.' };
    const res = StorageManager.submitLeaveRequest(user, data);
    refreshData();
    return res;
  };

  const reviewLeave = (
    leaveId: string, 
    status: 'approved' | 'rejected', 
    remarks?: string
  ) => {
    const teacherId = user?.id || 't-1';
    const teacherName = user?.name || 'Prof. Administrator';
    const res = StorageManager.reviewLeaveRequest(leaveId, status, teacherId, teacherName, remarks);
    refreshData();
    return res;
  };

  const markAttendance = (records: Omit<AttendanceRecord, 'id' | 'markedAt'>[]) => {
    const teacherName = user?.name || 'Prof. Administrator';
    const res = StorageManager.markAttendanceBatch(records, teacherName);
    refreshData();
    return res;
  };

  const markNotificationRead = (id: string) => {
    StorageManager.markNotificationAsRead(id);
    refreshData();
  };

  const markAllNotificationsRead = () => {
    StorageManager.markAllNotificationsRead(user?.id);
    refreshData();
  };

  return (
    <SystemDataContext.Provider
      value={{
        users,
        students,
        pendingStudents,
        teachers,
        attendance,
        leaves,
        notifications,
        unreadNotifsCount,
        approveStudent,
        rejectStudent,
        addStudent,
        applyLeave,
        reviewLeave,
        markAttendance,
        markNotificationRead,
        markAllNotificationsRead,
        refreshData,
      }}
    >
      {children}
    </SystemDataContext.Provider>
  );
}

export function useSystemData() {
  const context = useContext(SystemDataContext);
  if (!context) {
    throw new Error('useSystemData must be used within a SystemDataProvider');
  }
  return context;
}
