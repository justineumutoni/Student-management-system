export type UserRole = 'student' | 'teacher' | 'admin';

export type UserStatus = 'active' | 'pending' | 'rejected';

export interface UserProfile {
  id: string;
  uid?: string; // Firebase Auth UID if connected
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  grade?: string; // e.g. "Grade 10-A", "Computer Science 3rd Year"
  studentId?: string; // e.g. "STU-2026-104"
  status: UserStatus;
  registeredAt: string;
  approvedAt?: string;
  approvedBy?: string;
  generatedPassword?: string; // Temporary cleartext for copy/email notification delivery
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string; // references UserProfile.id
  studentName: string;
  studentRoll: string;
  department: string;
  grade: string;
  date: string; // Format: YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string;
  markedByName?: string;
  markedAt: string;
  subject?: string;
  remarks?: string;
}

export type LeaveType = 'medical' | 'casual' | 'emergency' | 'academic' | 'other';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRoll: string;
  department: string;
  grade: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewRemarks?: string;
  documentName?: string;
}

export type NotificationType = 
  | 'credentials' 
  | 'leave_status' 
  | 'attendance_alert' 
  | 'system' 
  | 'registration_approved'
  | 'registration_rejected'
  | 'new_registration';

export interface AppNotification {
  id: string;
  userId: string; // Target student/teacher ID or 'all' | 'teachers' | 'students'
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  actionLink?: string;
  metadata?: {
    email?: string;
    generatedPassword?: string;
    studentId?: string;
    studentName?: string;
    leaveId?: string;
    status?: string;
  };
}

export interface StudentStatistics {
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
  monthlyTrends: {
    month: string;
    present: number;
    absent: number;
    late: number;
    percentage: number;
  }[];
  subjectBreakdown: {
    subject: string;
    total: number;
    attended: number;
    percentage: number;
  }[];
  leavesRequested: number;
  leavesApproved: number;
  leavesPending: number;
}

export interface TeacherStatistics {
  totalStudents: number;
  pendingApprovals: number;
  todayAttendanceMarked: boolean;
  todayAttendanceRate: number;
  totalPresentToday: number;
  totalAbsentToday: number;
  totalLateToday: number;
  pendingLeaveRequests: number;
  approvedLeavesCount: number;
  classTrends: {
    day: string;
    presentRate: number;
    absentRate: number;
  }[];
}
