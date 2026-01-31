
export enum UserRole {
  ADMIN = 'ADMIN',
  PRINCIPAL = 'PRINCIPAL',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  STUDENT = 'STUDENT'
}

export enum AdmissionStatus {
  PENDING = 'PENDING',
  INTERVIEW = 'INTERVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export type SyllabusStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type DocumentCategory = 'ACADEMIC' | 'MEDICAL' | 'CONSENT' | 'IDENTIFICATION' | 'OTHER';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  logo: string;
  primaryColor: string;
  region: string;
  studentCount: number;
}

export interface StudentDocument {
  name: string;
  type: string;
  size: string;
  url: string;
  category: DocumentCategory;
  uploadDate: string;
}

export interface Student {
  id: string;
  tenantId: string;
  name: string;
  grade: string;
  section: string;
  admissionNo: string;
  gender: 'M' | 'F' | 'O';
  parentName: string;
  status: 'ACTIVE' | 'INACTIVE';
  advisor?: string;
  dob?: string;
  bloodGroup?: string;
  parentPhone?: string;
  parentEmail?: string;
  address?: string;
  medicalNotes?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  profilePicture?: string;
  documents?: StudentDocument[];
}

export interface Staff {
  id: string;
  tenantId: string;
  name: string;
  role: string;
  department: string;
  joiningDate: string;
  salary: number;
}

export interface SyllabusUnit {
  id: string;
  title: string;
  description: string;
  status: SyllabusStatus;
  order: number;
}

export interface Assessment {
  id: string;
  title: string;
  type: 'ASSIGNMENT' | 'QUIZ' | 'EXAM';
  maxMarks: number;
  weightage: number;
  date: string;
  scores: Record<string, number>;
}

export interface Subject {
  id: string;
  tenantId: string;
  name: string;
  grade: string;
  teacher: string;
  progress: number;
  syllabus?: SyllabusUnit[];
  assessments?: Assessment[];
}

export interface Classroom {
  id: string;
  tenantId: string;
  grade: string;
  section: string;
  classTeacherId?: string;
  roomNumber: string;
  capacity: number;
}

export interface AdmissionApplication {
  id: string;
  tenantId: string;
  studentName: string;
  parentName: string;
  gradeApplying: string;
  contactEmail: string;
  status: AdmissionStatus;
  dateApplied: string;
  studentId?: string;
  dob?: string;
  gender?: 'M' | 'F' | 'O';
  bloodGroup?: string;
  parentPhone?: string;
  address?: string;
  profilePicture?: string;
  documents?: StudentDocument[];
  medicalNotes?: string;
}

export interface FinancialTransaction {
  id: string;
  tenantId: string;
  studentId: string;
  type: 'FEES' | 'SALARY' | 'OTHER';
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}
