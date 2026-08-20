import { UserProfile, AttendanceRecord, LeaveRequest, AppNotification } from '@/types';

export const INITIAL_TEACHERS: UserProfile[] = [
  {
    id: 't-1',
    name: 'Prof. Eleanor Vance',
    email: 'teacher@school.edu',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & IT',
    phone: '+1 (555) 234-5678',
    status: 'active',
    registeredAt: '2025-08-15T08:00:00Z',
  },
  {
    id: 't-2',
    name: 'Dr. Arthur Sterling',
    email: 'arthur.sterling@school.edu',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    department: 'Software Engineering',
    phone: '+1 (555) 345-6789',
    status: 'active',
    registeredAt: '2025-08-15T08:00:00Z',
  }
];

export const INITIAL_STUDENTS: UserProfile[] = [
  {
    id: 's-1',
    name: 'Alex Rivera',
    email: 'student@school.edu',
    role: 'student',
    studentId: 'CS-2026-101',
    grade: 'Semester 4 (CS-A)',
    department: 'Computer Science',
    phone: '+1 (555) 987-6543',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    registeredAt: '2026-01-10T09:00:00Z',
    approvedAt: '2026-01-11T10:00:00Z',
    approvedBy: 'Prof. Eleanor Vance',
    generatedPassword: 'Alex#2026!Pass9',
    guardianName: 'Carlos Rivera',
    guardianPhone: '+1 (555) 888-1234',
    address: '42 Academic Way, Suite 100',
  },
  {
    id: 's-2',
    name: 'Sophia Chen',
    email: 'sophia.chen@school.edu',
    role: 'student',
    studentId: 'CS-2026-102',
    grade: 'Semester 4 (CS-A)',
    department: 'Computer Science',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    registeredAt: '2026-01-10T10:30:00Z',
    approvedAt: '2026-01-11T10:05:00Z',
    approvedBy: 'Prof. Eleanor Vance',
    generatedPassword: 'Soph#2026!Star4',
    guardianName: 'David Chen',
    guardianPhone: '+1 (555) 777-2345',
    address: '15 Maple Avenue, Apt 4B',
  },
  {
    id: 's-3',
    name: 'Marcus Johnson',
    email: 'marcus.j@school.edu',
    role: 'student',
    studentId: 'CS-2026-103',
    grade: 'Semester 4 (CS-A)',
    department: 'Computer Science',
    phone: '+1 (555) 678-9012',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    registeredAt: '2026-01-12T11:00:00Z',
    approvedAt: '2026-01-12T14:20:00Z',
    approvedBy: 'Prof. Eleanor Vance',
    generatedPassword: 'Marc#2026!Nova8',
    guardianName: 'Brenda Johnson',
    guardianPhone: '+1 (555) 666-3456',
    address: '88 Oak Ridge Blvd',
  },
  {
    id: 's-4',
    name: 'Liam Davis',
    email: 'liam.davis@school.edu',
    role: 'student',
    studentId: 'CS-2026-104',
    grade: 'Semester 4 (CS-B)',
    department: 'Computer Science',
    phone: '+1 (555) 789-0123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    registeredAt: '2026-01-15T08:45:00Z',
    approvedAt: '2026-01-15T12:00:00Z',
    approvedBy: 'Prof. Eleanor Vance',
    generatedPassword: 'Liam#2026!Zen2',
    guardianName: 'Robert Davis',
    guardianPhone: '+1 (555) 555-4567',
    address: '104 Pine Street',
  },
  {
    id: 's-5',
    name: 'Emma Watson',
    email: 'emma.watson@school.edu',
    role: 'student',
    studentId: 'CS-2026-105',
    grade: 'Semester 4 (CS-B)',
    department: 'Software Engineering',
    phone: '+1 (555) 890-1234',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    registeredAt: '2026-01-16T14:10:00Z',
    approvedAt: '2026-01-17T09:15:00Z',
    approvedBy: 'Prof. Eleanor Vance',
    generatedPassword: 'Emma#2026!Sky7',
    guardianName: 'Hannah Watson',
    guardianPhone: '+1 (555) 444-5678',
    address: '77 Cedar Lane',
  }
];

export const INITIAL_PENDING_REGISTRATIONS: UserProfile[] = [
  {
    id: 's-pending-1',
    name: 'Jordan Miller',
    email: 'jordan.miller@school.edu',
    role: 'student',
    studentId: 'CS-2026-106',
    grade: 'Semester 4 (CS-A)',
    department: 'Computer Science',
    phone: '+1 (555) 321-7654',
    status: 'pending',
    registeredAt: '2026-08-19T14:30:00Z',
    guardianName: 'Mark Miller',
    guardianPhone: '+1 (555) 333-8765',
    address: '209 West End Blvd',
  },
  {
    id: 's-pending-2',
    name: 'Olivia Taylor',
    email: 'olivia.taylor@school.edu',
    role: 'student',
    studentId: 'CS-2026-107',
    grade: 'Semester 4 (CS-B)',
    department: 'Software Engineering',
    phone: '+1 (555) 654-9870',
    status: 'pending',
    registeredAt: '2026-08-20T08:15:00Z',
    guardianName: 'Sarah Taylor',
    guardianPhone: '+1 (555) 222-9876',
    address: '512 Sunrise Highway',
  }
];

// Helper to generate recent historical attendance
export function generateSeedAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const students = INITIAL_STUDENTS;
  const subjects = ['Data Structures', 'Database Systems', 'Web Development', 'Computer Networks', 'Software Eng.'];

  // Past 14 weekdays
  const today = new Date();
  let dayOffset = 0;
  let count = 0;

  while (count < 12) {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOffset);
    dayOffset++;
    
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    
    const dateStr = d.toISOString().split('T')[0];
    count++;

    students.forEach((student, sIdx) => {
      // Pick random subject
      const subject = subjects[(count + sIdx) % subjects.length];
      
      // Determine status (mostly present, occasional late/absent)
      let status: 'present' | 'absent' | 'late' | 'excused' = 'present';
      if ((count + sIdx) % 11 === 0) status = 'absent';
      else if ((count + sIdx) % 7 === 0) status = 'late';

      records.push({
        id: `att-${dateStr}-${student.id}`,
        studentId: student.id,
        studentName: student.name,
        studentRoll: student.studentId || 'CS-2026-000',
        department: student.department || 'Computer Science',
        grade: student.grade || 'Semester 4',
        date: dateStr,
        status,
        markedBy: 't-1',
        markedByName: 'Prof. Eleanor Vance',
        markedAt: `${dateStr}T09:15:00Z`,
        subject,
      });
    });
  }

  return records;
}

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave-1',
    studentId: 's-1',
    studentName: 'Alex Rivera',
    studentEmail: 'student@school.edu',
    studentRoll: 'CS-2026-101',
    department: 'Computer Science',
    grade: 'Semester 4 (CS-A)',
    leaveType: 'medical',
    startDate: '2026-08-25',
    endDate: '2026-08-26',
    totalDays: 2,
    reason: 'Scheduled wisdom tooth removal surgery and subsequent rest recommended by dental surgeon.',
    status: 'pending',
    appliedAt: '2026-08-20T07:45:00Z',
    documentName: 'dental_prescription_cert.pdf',
  },
  {
    id: 'leave-2',
    studentId: 's-2',
    studentName: 'Sophia Chen',
    studentEmail: 'sophia.chen@school.edu',
    studentRoll: 'CS-2026-102',
    department: 'Computer Science',
    grade: 'Semester 4 (CS-A)',
    leaveType: 'academic',
    startDate: '2026-08-28',
    endDate: '2026-08-29',
    totalDays: 2,
    reason: 'Selected to represent the department at the National Collegiate Hackathon 2026.',
    status: 'approved',
    appliedAt: '2026-08-18T11:20:00Z',
    reviewedBy: 't-1',
    reviewedByName: 'Prof. Eleanor Vance',
    reviewedAt: '2026-08-19T09:00:00Z',
    reviewRemarks: 'Approved! Best of luck in the hackathon representing our university.',
    documentName: 'hackathon_acceptance_letter.pdf',
  },
  {
    id: 'leave-3',
    studentId: 's-3',
    studentName: 'Marcus Johnson',
    studentEmail: 'marcus.j@school.edu',
    studentRoll: 'CS-2026-103',
    department: 'Computer Science',
    grade: 'Semester 4 (CS-A)',
    leaveType: 'casual',
    startDate: '2026-08-15',
    endDate: '2026-08-16',
    totalDays: 2,
    reason: 'Family wedding event out of town.',
    status: 'approved',
    appliedAt: '2026-08-10T14:15:00Z',
    reviewedBy: 't-1',
    reviewedByName: 'Prof. Eleanor Vance',
    reviewedAt: '2026-08-11T10:30:00Z',
    reviewRemarks: 'Approved. Ensure you catch up on Data Structures chapter 5 assignments.',
  },
  {
    id: 'leave-4',
    studentId: 's-4',
    studentName: 'Liam Davis',
    studentEmail: 'liam.davis@school.edu',
    studentRoll: 'CS-2026-104',
    department: 'Computer Science',
    grade: 'Semester 4 (CS-B)',
    leaveType: 'emergency',
    startDate: '2026-08-22',
    endDate: '2026-08-22',
    totalDays: 1,
    reason: 'Urgent family domestic travel requirement.',
    status: 'pending',
    appliedAt: '2026-08-20T08:00:00Z',
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 's-1',
    title: '🔐 Welcome to Student Portal - Your Credentials',
    message: 'Your student account has been approved by Prof. Eleanor Vance. Your system login email is student@school.edu and your generated password is Alex#2026!Pass9. Keep this secure!',
    type: 'credentials',
    read: false,
    createdAt: '2026-08-20T07:30:00Z',
    actionLink: '/student/dashboard',
    metadata: {
      email: 'student@school.edu',
      generatedPassword: 'Alex#2026!Pass9',
      studentId: 'CS-2026-101',
    }
  },
  {
    id: 'notif-2',
    userId: 't-1',
    title: '📝 New Student Registration Requests',
    message: 'Jordan Miller and Olivia Taylor have submitted student registration requests pending your approval.',
    type: 'new_registration',
    read: false,
    createdAt: '2026-08-20T08:15:00Z',
    actionLink: '/teacher/students',
  },
  {
    id: 'notif-3',
    userId: 't-1',
    title: '🏖️ Pending Leave Application',
    message: 'Alex Rivera has applied for 2 days Medical leave (Aug 25 - Aug 26).',
    type: 'leave_status',
    read: false,
    createdAt: '2026-08-20T07:45:00Z',
    actionLink: '/teacher/leave',
  }
];
