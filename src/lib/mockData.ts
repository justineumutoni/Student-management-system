import { UserProfile, AttendanceRecord, LeaveRequest, AppNotification } from '@/types';

export const INITIAL_TEACHERS: UserProfile[] = [];

export const INITIAL_STUDENTS: UserProfile[] = [];

export const INITIAL_PENDING_REGISTRATIONS: UserProfile[] = [];

export function generateSeedAttendance(): AttendanceRecord[] {
  return [];
}

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
