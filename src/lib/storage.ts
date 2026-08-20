import { 
  UserProfile, 
  AttendanceRecord, 
  LeaveRequest, 
  AppNotification, 
  LeaveStatus, 
  AttendanceStatus,
  LeaveType
} from '@/types';
import { 
  INITIAL_TEACHERS, 
  INITIAL_STUDENTS, 
  INITIAL_PENDING_REGISTRATIONS, 
  generateSeedAttendance, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_NOTIFICATIONS 
} from './mockData';
import { generateSecurePassword, generateStudentId } from './utils';
import { isFirebaseConfigured, db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

const STORAGE_KEYS = {
  USERS: 'sms_users_data',
  ATTENDANCE: 'sms_attendance_data',
  LEAVES: 'sms_leaves_data',
  NOTIFICATIONS: 'sms_notifications_data',
  INIT_FLAG: 'sms_initialized_clean_v3',
};

export class StorageManager {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Initializes local storage with empty data for user's own accounts
   */
  public static initializeData(): void {
    if (!this.isClient()) return;

    const initialized = localStorage.getItem(STORAGE_KEYS.INIT_FLAG);
    if (!initialized) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.INIT_FLAG, 'true');
      // Also remove any old session user if they were a mock user
      localStorage.removeItem('sms_current_session_user');
    }
  }

  // ================= USERS & AUTH =================

  public static getUsers(): UserProfile[] {
    if (!this.isClient()) return [...INITIAL_TEACHERS, ...INITIAL_STUDENTS, ...INITIAL_PENDING_REGISTRATIONS];
    this.initializeData();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [...INITIAL_TEACHERS, ...INITIAL_STUDENTS, ...INITIAL_PENDING_REGISTRATIONS];
    }
  }

  public static saveUsers(users: UserProfile[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  public static getUserById(id: string): UserProfile | undefined {
    return this.getUsers().find(u => u.id === id || u.email.toLowerCase() === id.toLowerCase());
  }

  public static getUserByEmail(email: string): UserProfile | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Student Self-Registration (Pending approval)
   */
  public static registerStudent(studentData: Partial<UserProfile>): { success: boolean; student?: UserProfile; message: string } {
    const users = this.getUsers();
    
    if (!studentData.email) {
      return { success: false, message: 'Email address is required' };
    }

    const existing = users.find(u => u.email.toLowerCase() === studentData.email!.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email already exists' };
    }

    const newId = `s-pending-${Date.now()}`;
    const generatedRoll = studentData.studentId || generateStudentId(studentData.department);

    const newStudent: UserProfile = {
      id: newId,
      name: studentData.name || 'New Student',
      email: studentData.email.toLowerCase(),
      role: 'student',
      studentId: generatedRoll,
      department: studentData.department || 'Computer Science',
      grade: studentData.grade || 'Semester 1',
      phone: studentData.phone || '',
      status: 'pending',
      registeredAt: new Date().toISOString(),
      guardianName: studentData.guardianName || '',
      guardianPhone: studentData.guardianPhone || '',
      address: studentData.address || '',
    };

    users.push(newStudent);
    this.saveUsers(users);

    // Notify teachers of new pending registration
    this.addNotification({
      userId: 'teachers',
      title: '🎓 New Student Registration',
      message: `${newStudent.name} (${newStudent.email}) has registered and is awaiting approval.`,
      type: 'new_registration',
      actionLink: '/teacher/students',
      metadata: {
        studentId: newStudent.id,
        studentName: newStudent.name,
        email: newStudent.email,
      }
    });

    // Optional Firebase Firestore sync
    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'users', newStudent.id), newStudent).catch(console.error);
    }

    return { success: true, student: newStudent, message: 'Registration submitted successfully! Please wait for teacher approval.' };
  }

  /**
   * Teacher Account Registration (Immediate activation for faculty)
   */
  public static registerTeacher(data: {
    name: string;
    email: string;
    department: string;
    phone?: string;
    password?: string;
  }): { success: boolean; teacher?: UserProfile; message: string } {
    const users = this.getUsers();
    
    if (!data.email || !data.name) {
      return { success: false, message: 'Name and email are required' };
    }

    const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email already exists' };
    }

    const newId = `t-${Date.now()}`;
    const newTeacher: UserProfile = {
      id: newId,
      name: data.name,
      email: data.email.toLowerCase(),
      role: 'teacher',
      department: data.department || 'Computer Science & IT',
      phone: data.phone || '',
      status: 'active',
      registeredAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      generatedPassword: data.password || 'password123',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    };

    users.push(newTeacher);
    this.saveUsers(users);

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'users', newTeacher.id), newTeacher).catch(console.error);
    }

    return { 
      success: true, 
      teacher: newTeacher, 
      message: 'Teacher account created successfully! You are now registered as faculty.' 
    };
  }

  /**
   * Teacher Approves a Pending Student:
   * Generates secure password, marks active, and triggers credentials notification!
   */
  public static approveStudent(
    studentId: string, 
    teacherName: string
  ): { success: boolean; student?: UserProfile; generatedPassword?: string; message: string } {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === studentId);
    
    if (index === -1) {
      return { success: false, message: 'Student registration not found' };
    }

    const student = users[index];
    const generatedPassword = generateSecurePassword(student.name);

    student.status = 'active';
    student.approvedAt = new Date().toISOString();
    student.approvedBy = teacherName;
    student.generatedPassword = generatedPassword;

    users[index] = student;
    this.saveUsers(users);

    // Create credential notification for the student
    this.addNotification({
      userId: student.id,
      title: '🎉 Account Approved - Your Login Credentials',
      message: `Congratulations! Your student account has been approved by ${teacherName}. You can now log into the Student Portal using your email: ${student.email} and generated password: ${generatedPassword}.`,
      type: 'credentials',
      actionLink: '/student/dashboard',
      metadata: {
        email: student.email,
        generatedPassword: generatedPassword,
        studentId: student.studentId,
        studentName: student.name,
      }
    });

    if (isFirebaseConfigured && db) {
      updateDoc(doc(db, 'users', student.id), {
        status: 'active',
        approvedAt: student.approvedAt,
        approvedBy: teacherName,
        generatedPassword: generatedPassword,
      }).catch(console.error);
    }

    return { 
      success: true, 
      student, 
      generatedPassword, 
      message: `Student approved! Generated password: ${generatedPassword}` 
    };
  }

  /**
   * Teacher Rejects a Pending Student
   */
  public static rejectStudent(studentId: string, reason?: string): { success: boolean; message: string } {
    let users = this.getUsers();
    const student = users.find(u => u.id === studentId);
    if (!student) return { success: false, message: 'Student not found' };

    users = users.filter(u => u.id !== studentId);
    this.saveUsers(users);

    if (isFirebaseConfigured && db) {
      deleteDoc(doc(db, 'users', studentId)).catch(console.error);
    }

    return { success: true, message: 'Student registration rejected and removed.' };
  }

  /**
   * Teacher Directly Adds a Student:
   * Instantly creates active student, generates password, and sends credentials notification.
   */
  public static addStudentDirectly(
    data: {
      name: string;
      email: string;
      department: string;
      grade: string;
      phone?: string;
      studentId?: string;
      guardianName?: string;
      guardianPhone?: string;
      address?: string;
    },
    teacherName: string
  ): { success: boolean; student?: UserProfile; generatedPassword?: string; message: string } {
    const users = this.getUsers();
    
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: 'A user with this email already exists' };
    }

    const generatedPassword = generateSecurePassword(data.name);
    const newId = `s-${Date.now()}`;
    const studentRoll = data.studentId || generateStudentId(data.department);

    const newStudent: UserProfile = {
      id: newId,
      name: data.name,
      email: data.email.toLowerCase(),
      role: 'student',
      studentId: studentRoll,
      department: data.department,
      grade: data.grade,
      phone: data.phone || '',
      status: 'active',
      registeredAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      approvedBy: teacherName,
      generatedPassword: generatedPassword,
      guardianName: data.guardianName || '',
      guardianPhone: data.guardianPhone || '',
      address: data.address || '',
    };

    users.push(newStudent);
    this.saveUsers(users);

    // Send credential notification to student
    this.addNotification({
      userId: newStudent.id,
      title: '🔐 Welcome - Your Student Credentials',
      message: `Your student portal account has been created by ${teacherName}. Email: ${newStudent.email}, Generated Password: ${generatedPassword}.`,
      type: 'credentials',
      actionLink: '/student/dashboard',
      metadata: {
        email: newStudent.email,
        generatedPassword: generatedPassword,
        studentId: newStudent.studentId,
        studentName: newStudent.name,
      }
    });

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'users', newStudent.id), newStudent).catch(console.error);
    }

    return { 
      success: true, 
      student: newStudent, 
      generatedPassword, 
      message: `Student added successfully! Password generated: ${generatedPassword}` 
    };
  }

  // ================= ATTENDANCE =================

  public static getAttendance(): AttendanceRecord[] {
    if (!this.isClient()) return generateSeedAttendance();
    this.initializeData();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return data ? JSON.parse(data) : generateSeedAttendance();
    } catch {
      return generateSeedAttendance();
    }
  }

  public static saveAttendance(records: AttendanceRecord[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  }

  /**
   * Save / update daily attendance batch for multiple students
   */
  public static markAttendanceBatch(
    newRecords: Omit<AttendanceRecord, 'id' | 'markedAt'>[],
    markedByName: string
  ): { success: boolean; count: number } {
    const existing = this.getAttendance();
    const now = new Date().toISOString();

    const updated = [...existing];

    newRecords.forEach(rec => {
      // Check if existing record for student on this date exists
      const matchIndex = updated.findIndex(
        r => r.studentId === rec.studentId && r.date === rec.date
      );

      const recordWithId: AttendanceRecord = {
        ...rec,
        id: matchIndex !== -1 ? updated[matchIndex].id : `att-${rec.date}-${rec.studentId}`,
        markedAt: now,
        markedByName,
      };

      if (matchIndex !== -1) {
        updated[matchIndex] = recordWithId;
      } else {
        updated.push(recordWithId);
      }

      if (isFirebaseConfigured && db) {
        setDoc(doc(db, 'attendance', recordWithId.id), recordWithId).catch(console.error);
      }
    });

    this.saveAttendance(updated);
    return { success: true, count: newRecords.length };
  }

  // ================= LEAVES =================

  public static getLeaveRequests(): LeaveRequest[] {
    if (!this.isClient()) return INITIAL_LEAVE_REQUESTS;
    this.initializeData();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEAVES);
      return data ? JSON.parse(data) : INITIAL_LEAVE_REQUESTS;
    } catch {
      return INITIAL_LEAVE_REQUESTS;
    }
  }

  public static saveLeaveRequests(leaves: LeaveRequest[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
  }

  /**
   * Student applies for leave
   */
  public static submitLeaveRequest(
    student: UserProfile,
    data: {
      leaveType: LeaveType;
      startDate: string;
      endDate: string;
      reason: string;
      documentName?: string;
    }
  ): { success: boolean; request?: LeaveRequest; message: string } {
    const leaves = this.getLeaveRequests();
    
    // Calculate days
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentRoll: student.studentId || 'CS-2026-000',
      department: student.department || 'Computer Science',
      grade: student.grade || 'Semester 4',
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: totalDays > 0 ? totalDays : 1,
      reason: data.reason,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      documentName: data.documentName,
    };

    leaves.unshift(newRequest);
    this.saveLeaveRequests(leaves);

    // Notify teachers
    this.addNotification({
      userId: 'teachers',
      title: '📋 New Leave Application',
      message: `${student.name} requested ${newRequest.totalDays} day(s) ${newRequest.leaveType} leave (${newRequest.startDate} to ${newRequest.endDate}).`,
      type: 'leave_status',
      actionLink: '/teacher/leave',
      metadata: {
        leaveId: newRequest.id,
        studentId: student.id,
        studentName: student.name,
      }
    });

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'leaves', newRequest.id), newRequest).catch(console.error);
    }

    return { success: true, request: newRequest, message: 'Leave request submitted successfully!' };
  }

  /**
   * Teacher Reviews Leave Request (Approve or Reject)
   */
  public static reviewLeaveRequest(
    leaveId: string,
    status: 'approved' | 'rejected',
    teacherId: string,
    teacherName: string,
    remarks?: string
  ): { success: boolean; request?: LeaveRequest; message: string } {
    const leaves = this.getLeaveRequests();
    const index = leaves.findIndex(l => l.id === leaveId);
    
    if (index === -1) {
      return { success: false, message: 'Leave request not found' };
    }

    const request = leaves[index];
    request.status = status;
    request.reviewedBy = teacherId;
    request.reviewedByName = teacherName;
    request.reviewedAt = new Date().toISOString();
    request.reviewRemarks = remarks || (status === 'approved' ? 'Leave Approved' : 'Leave Rejected');

    leaves[index] = request;
    this.saveLeaveRequests(leaves);

    // Notify the student
    const statusEmoji = status === 'approved' ? '✅' : '❌';
    this.addNotification({
      userId: request.studentId,
      title: `${statusEmoji} Leave Request ${status.toUpperCase()}`,
      message: `Your ${request.leaveType} leave application for ${request.startDate} to ${request.endDate} was ${status} by ${teacherName}.${remarks ? ` Note: "${remarks}"` : ''}`,
      type: 'leave_status',
      actionLink: '/student/leave',
      metadata: {
        leaveId: request.id,
        status: status,
      }
    });

    if (isFirebaseConfigured && db) {
      updateDoc(doc(db, 'leaves', leaveId), {
        status,
        reviewedBy: teacherId,
        reviewedByName: teacherName,
        reviewedAt: request.reviewedAt,
        reviewRemarks: request.reviewRemarks,
      }).catch(console.error);
    }

    return { success: true, request, message: `Leave request ${status} successfully!` };
  }

  // ================= NOTIFICATIONS =================

  public static getNotifications(userId?: string): AppNotification[] {
    if (!this.isClient()) return INITIAL_NOTIFICATIONS;
    this.initializeData();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const all: AppNotification[] = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
      
      if (!userId) return all;
      return all.filter(n => 
        n.userId === userId || 
        n.userId === 'all' || 
        (n.userId === 'teachers' && userId.startsWith('t-')) ||
        (n.userId === 'students' && userId.startsWith('s-'))
      );
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  public static addNotification(notifData: Omit<AppNotification, 'id' | 'read' | 'createdAt'>): AppNotification {
    const notifications = this.getNotifications();
    const newNotif: AppNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    notifications.unshift(newNotif);
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(console.error);
    }

    return newNotif;
  }

  public static markNotificationAsRead(id: string): void {
    if (!this.isClient()) return;
    const notifications = this.getNotifications();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      updateDoc(doc(db, 'notifications', id), { read: true }).catch(console.error);
    }
  }

  public static markAllNotificationsRead(userId?: string): void {
    if (!this.isClient()) return;
    const notifications = this.getNotifications();
    const updated = notifications.map(n => {
      if (!userId || n.userId === userId || n.userId === 'all') {
        return { ...n, read: true };
      }
      return n;
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  }

  public static resetToDemoDefaults(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(STORAGE_KEYS.INIT_FLAG);
    this.initializeData();
  }
}
