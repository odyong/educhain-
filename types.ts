
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SUB_ADMIN = 'sub_admin', 
  TEACHER = 'teacher',     
  PARENT = 'parent',
  STUDENT = 'student'
}

export enum StudentStatus {
  ACTIVE = 'active',
  GRADUATED = 'graduated',
  TRANSFERRED = 'transferred',
  EXPELLED = 'expelled'
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused'
}

export enum ReminderType {
  HOMEWORK = 'homework',
  ASSIGNMENT = 'assignment',
  REVISION = 'revision',
  GENERAL = 'general'
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'classroom' | 'parent_dm';
  classId?: string;
  recipientId?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  classId: string;
  teacherName: string;
  fileType: 'pdf' | 'word' | 'slides';
  fileUrl: string;
  fileName?: string;
  fileData?: string; // Base64 simulated storage
  description: string;
  createdAt: string;
  isLive?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  classId: string;
  teacherName: string;
  questions: QuizQuestion[];
  createdAt: string;
  status: 'active' | 'closed';
}

export interface Reminder {
  id: string;
  type: ReminderType;
  studentId: string;
  studentName: string;
  parentId: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  dueDate?: string;
  createdAt: string;
  status: 'active' | 'completed' | 'archived';
}

export interface ExamResult {
  subject: string;
  testScore: number;
  examScore: number;
  total: number;
  grade: string;
  comment: string;
}

export interface SchoolConfig {
  academicSession: string;
  currentTerm: '1st' | '2nd' | '3rd';
  classLabels: Record<string, string>;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string;
  departmentId?: string;
  photoURL?: string;
  assignedClassId?: string;
  studentRefId?: string;
}

export interface Student {
  id: string;
  name: string;
  dob: string;
  classId: string;
  status: StudentStatus;
  parentId?: string;
  enrollmentDate: string;
  schoolId: string;
  studentIdCard: string;
  photoURL?: string;
}
