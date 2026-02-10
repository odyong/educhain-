
import { Student, StudentStatus } from './types';

export const CLASS_OPTIONS = [
  { id: 'KG', label: 'Kindergarten' },
  { id: 'P1', label: 'Primary 1' },
  { id: 'P2', label: 'Primary 2' },
  { id: 'P3', label: 'Primary 3' },
  { id: 'P4', label: 'Primary 4' },
  { id: 'P5', label: 'Primary 5' },
  { id: 'P6', label: 'Primary 6' },
  { id: 'JSS1', label: 'Junior Secondary 1' },
  { id: 'JSS2', label: 'Junior Secondary 2' },
  { id: 'JSS3', label: 'Junior Secondary 3' },
  { id: 'SS1', label: 'Senior Secondary 1' },
  { id: 'SS2', label: 'Senior Secondary 2' },
  { id: 'SS3', label: 'Senior Secondary 3' }
];

export const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'James Wilson', dob: '2015-05-12', classId: 'P4', status: StudentStatus.ACTIVE, enrollmentDate: '2023-09-01', schoolId: 's1', studentIdCard: 'SCH-001', parentId: 'p2' },
  { id: '2', name: 'Alice Thompson', dob: '2015-08-22', classId: 'P4', status: StudentStatus.ACTIVE, enrollmentDate: '2023-09-01', schoolId: 's1', studentIdCard: 'SCH-002', parentId: 'p3' },
  { id: '3', name: 'Benjamin Harrison', dob: '2014-04-12', classId: 'P4', status: StudentStatus.ACTIVE, enrollmentDate: '2023-09-15', schoolId: 's1', studentIdCard: 'SCH-003', parentId: 'p1' },
  { id: '4', name: 'Clara Oswald', dob: '2015-11-12', classId: 'P4', status: StudentStatus.ACTIVE, enrollmentDate: '2023-09-01', schoolId: 's1', studentIdCard: 'SCH-004', parentId: 'p1' },
  { id: '5', name: 'David Miller', dob: '2015-02-10', classId: 'P4', status: StudentStatus.ACTIVE, enrollmentDate: '2023-09-01', schoolId: 's1', studentIdCard: 'SCH-005', parentId: 'p2' },
  { id: '6', name: 'Elena Rodriguez', dob: '2015-06-30', classId: 'P4', status: StudentStatus.ACTIVE, enrollmentDate: '2023-09-01', schoolId: 's1', studentIdCard: 'SCH-006', parentId: 'p3' },
];

export const MOCK_TEACHERS = [
  { uid: 't1', name: 'Mrs. Adewale', role: 'teacher', photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', specialization: 'Mathematics' },
  { uid: 't2', name: 'Mr. Thompson', role: 'teacher', photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', specialization: 'Physics' },
  { uid: 't3', name: 'Ms. Chen', role: 'teacher', photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop', specialization: 'English' },
];

export const MOCK_PARENTS = [
  { id: 'p1', name: 'Mrs. Cynthia Harrison', studentName: 'Benjamin Harrison', email: 'cynthia@gmail.com' },
  { id: 'p2', name: 'Mr. John Wilson', studentName: 'James Wilson', email: 'wilson.j@outlook.com' },
  { id: 'p3', name: 'Ms. Alice Thompson Sr.', studentName: 'Alice Thompson', email: 'alice.m@school.com' },
];
