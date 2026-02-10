
import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Wallet,
  UserPlus,
  Search,
  Bell,
  Menu,
  X,
  BrainCircuit,
  CheckCircle2,
  School,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Building2,
  Globe,
  Plus,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import PrincipalDashboard from './components/PrincipalDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import ExamOfficerDashboard from './components/ExamOfficerDashboard';
import StudentPortal from './components/StudentPortal';
import AdmissionsPortal from './components/AdmissionsPortal';
import AcademicManagement from './components/AcademicManagement';
import FinanceManagement from './components/FinanceManagement';
import StaffManagement from './components/StaffManagement';
import LibraryManagement from './components/LibraryManagement';
import AIInsights from './components/AIInsights';
import MobileSync from './components/MobileSync';
import StudentManagement from './components/StudentManagement';
import ClassroomManagement from './components/ClassroomManagement';
import Auth from './components/Auth';
import { AdmissionStatus, AdmissionApplication, Student, Subject, Classroom, Staff, Assessment, SyllabusUnit, Tenant, AcademicStream, UserRole, Notification } from './types';
import { Session, User } from '@supabase/supabase-js';

// Multi-Tenant Mock Data
const INITIAL_TENANTS: Tenant[] = [
  { id: '5966d510-7264-469b-980b-f3513a936a28', name: 'Springfield Academy', subdomain: 'springfield', logo: 'emerald', primaryColor: '#6366f1', region: 'North District', studentCount: 1250 },
  { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', name: 'Oakwood High', subdomain: 'elite', logo: 'indigo', primaryColor: '#10b981', region: 'West Metropolitan', studentCount: 840 },
  { id: 'c53f86e3-f012-4a00-9993-9c8e19b88931', name: 'Riverdale International', subdomain: 'riverdale', logo: 'rose', primaryColor: '#f43f5e', region: 'South Valley', studentCount: 2100 },
];

const INITIAL_STAFF: Staff[] = [
  { id: 'STF1', tenantId: '5966d510-7264-469b-980b-f3513a936a28', name: 'Dr. Alan Grant', role: 'Senior Teacher', department: 'SCIENCE', joiningDate: '2020-01-15', salary: 6500, isHOD: true },
  { id: 'STF2', tenantId: '5966d510-7264-469b-980b-f3513a936a28', name: 'Ms. Ellie Sattler', role: 'Senior Teacher', department: 'ART', joiningDate: '2021-03-22', salary: 5200, isHOD: true },
  { id: 'STF3', tenantId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', name: 'Mr. Ian Malcolm', role: 'Math Specialist', department: 'SCIENCE', joiningDate: '2022-08-10', salary: 4800, isHOD: false },
  { id: 'STF4', tenantId: '5966d510-7264-469b-980b-f3513a936a28', name: 'Mrs. Claire Dearing', role: 'Admin Coordinator', department: 'COMMERCIAL', joiningDate: '2019-11-05', salary: 4500, isHOD: true },
];

const INITIAL_STUDENTS: Student[] = [
  { id: 'S1', tenantId: '5966d510-7264-469b-980b-f3513a936a28', name: 'Alexander Wright', grade: 'SSS1', section: '1', admissionNo: 'ADM-2024-001', gender: 'M', parentName: 'Robert Wright', status: 'ACTIVE', advisor: 'Dr. Alan Grant', stream: 'SCIENCE' },
  { id: 'S2', tenantId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', name: 'Sophia Martinez', grade: 'Grade 10', section: 'B', admissionNo: 'ADM-2024-002', gender: 'F', parentName: 'Elena Martinez', status: 'ACTIVE', advisor: 'Mr. Ian Malcolm', stream: 'GENERAL' },
  { id: 'S3', tenantId: '5966d510-7264-469b-980b-f3513a936a28', name: 'Marcus Aurelius', grade: 'SSS1', section: '1', admissionNo: 'ADM-2024-003', gender: 'M', parentName: 'Antoninus Pius', status: 'ACTIVE', advisor: 'Dr. Alan Grant', stream: 'SCIENCE' },
];

const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'SUB1', tenantId: '5966d510-7264-469b-980b-f3513a936a28', name: 'Mathematics', grade: 'SSS1', teacher: 'Dr. Alan Grant', teacherId: 'STF1', progress: 40,
    syllabus: [
      { id: 'U1', title: 'Algebra Foundations', description: 'Variables, expressions, and linear equations.', status: 'COMPLETED', order: 1 },
      { id: 'U2', title: 'Quadratic Equations', description: 'Solving quadratics.', status: 'COMPLETED', order: 2 },
    ],
    assessments: [
      { id: 'A1', title: 'T1 Assignment', type: 'ASSIGNMENT', term: 'FIRST', subType: 'ASSIGNMENT', maxMarks: 100, weightage: 40, date: '2024-02-10', scores: { 'S1': 85, 'S3': 70 } },
      { id: 'A2', title: 'T1 Exam', type: 'EXAM', term: 'FIRST', subType: 'EXAM', maxMarks: 100, weightage: 60, date: '2024-04-15', scores: { 'S1': 78, 'S3': 82 } },
      { id: 'A5', title: 'T2 Assignment', type: 'ASSIGNMENT', term: 'SECOND', subType: 'ASSIGNMENT', maxMarks: 100, weightage: 40, date: '2024-06-10', scores: { 'S1': 92, 'S3': 88 } }
    ]
  },
  {
    id: 'SUB2', tenantId: '5966d510-7264-469b-980b-f3513a936a28', name: 'Science', grade: 'SSS1', teacher: 'Ms. Ellie Sattler', teacherId: 'STF2', progress: 15,
    syllabus: [{ id: 'U-PH', title: 'Photosynthesis', description: 'The light cycle.', status: 'IN_PROGRESS', order: 1 }],
    assessments: [
      { id: 'A3', title: 'T1 Assignment', type: 'ASSIGNMENT', term: 'FIRST', subType: 'ASSIGNMENT', maxMarks: 100, weightage: 40, date: '2024-02-15', scores: { 'S1': 92, 'S3': 95 } },
      { id: 'A4', title: 'T1 Exam', type: 'EXAM', term: 'FIRST', subType: 'EXAM', maxMarks: 100, weightage: 60, date: '2024-04-20', scores: { 'S1': 88, 'S3': 90 } }
    ]
  },
];

const INITIAL_CLASSROOMS: Classroom[] = [
  { id: 'C1', tenantId: '5966d510-7264-469b-980b-f3513a936a28', grade: 'SSS1', section: '1', classTeacherId: 'STF1', roomNumber: '101', capacity: 30, stream: 'SCIENCE', schoolSection: 'SENIOR' },
  { id: 'C2', tenantId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', grade: 'Grade 10', section: 'B', classTeacherId: 'STF3', roomNumber: '102', capacity: 30, stream: 'GENERAL' },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'N1', title: 'New Admission', message: 'A new application has been submitted for Springfield Academy.', category: 'SYSTEM', date: '2024-02-03T09:00:00Z', read: false },
  { id: 'N2', title: 'Mid-term Exams', message: 'The mid-term exam schedule has been updated.', category: 'ACADEMIC', date: '2024-02-02T14:30:00Z', read: false },
  { id: 'N3', title: 'System Maintenance', message: 'The institutional OS will undergo maintenance tonight at 12 PM.', category: 'ALERT', date: '2024-02-01T10:00:00Z', read: true },
];

export type View = 'DASHBOARD' | 'STUDENTS' | 'ACADEMICS' | 'FINANCE' | 'ADMISSIONS' | 'STAFF' | 'LIBRARY' | 'AI_INSIGHTS' | 'MOBILE_SYNC' | 'CLASSROOMS' | 'EXAMS_OFFICE' | 'STUDENT_PORTAL' | 'SYSTEM_HUB';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.SUPERADMIN);
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [classrooms, setClassrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  // Phase 5 State
  const [fees, setFees] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);

  // Sync activeTenant with URL
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const tenantIdFromPath = pathParts[1];

    if (tenantIdFromPath && tenantIdFromPath !== 'login' && tenantIdFromPath !== 'signup') {
      const tenant = tenants.find(t => t.id === tenantIdFromPath);
      if (tenant) {
        setActiveTenant(tenant);
      }
    } else if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup') {
      setActiveTenant(null);
    }
  }, [location.pathname, tenants]);

  // Fetch Tenants (Global)
  useEffect(() => {
    const fetchTenants = async () => {
      const { data, error } = await supabase.from('tenants').select('*');
      if (!error && data) {
        setTenants(data.map(t => ({
          id: t.id,
          name: t.name,
          subdomain: t.domain || '',
          logo: t.logo_url || 'emerald',
          primaryColor: t.primary_color || '#6366f1',
          region: t.region || 'North District',
          studentCount: 0 // In prod, this would be a join/count
        })));
      }
    };
    fetchTenants();
  }, [session]);

  // Fetch Data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!session || !activeTenant) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch Students for this tenant
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('tenant_id', activeTenant.id);

        if (!studentError && studentData) {
          setStudents(studentData as any);
        }

        // Fetch Staff
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .eq('tenant_id', activeTenant.id);

        if (!staffError && staffData) {
          setStaff(staffData as any);
        }

        // Fetch Subjects (including assessments)
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('*, assessments(*)')
          .eq('tenant_id', activeTenant.id);

        if (!subjectError && subjectData) {
          setSubjects(subjectData as any);
        }

        // Fetch Classrooms
        const { data: classroomData, error: classroomError } = await supabase
          .from('classrooms')
          .select('*')
          .eq('tenant_id', activeTenant.id);

        if (!classroomError && classroomData) {
          setClassrooms(classroomData as any);
        }

        // Fetch Notifications
        const { data: notificationData, error: notificationError } = await supabase
          .from('notifications')
          .select('*')
          .eq('tenant_id', activeTenant.id);

        if (!notificationError && notificationData) {
          setNotifications(notificationData as any);
        }

        // Fetch Admissions
        const { data: admissionData, error: admissionError } = await supabase
          .from('admissions')
          .select('*')
          .eq('tenant_id', activeTenant.id);

        if (!admissionError && admissionData) {
          setAdmissions(admissionData as any);
        }

        // Phase 5: Fetch Finance & Library
        const [feesRes, transRes, booksRes, loansRes, finesRes] = await Promise.all([
          supabase.from('fees').select('*').eq('tenant_id', activeTenant.id),
          supabase.from('transactions').select('*').eq('tenant_id', activeTenant.id),
          supabase.from('books').select('*').eq('tenant_id', activeTenant.id),
          supabase.from('loans').select('*, books(*), students(*)').eq('tenant_id', activeTenant.id),
          supabase.from('fines').select('*, loans(*), students(*)').eq('tenant_id', activeTenant.id)
        ]);

        if (!feesRes.error) setFees(feesRes.data || []);
        if (!transRes.error) setTransactions(transRes.data || []);
        if (!booksRes.error) setBooks(booksRes.data || []);
        if (!loansRes.error) setLoans(loansRes.data || []);
        if (!finesRes.error) setFines(finesRes.data || []);

      } catch (err) {
        console.error('Data sync failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, activeTenant]);

  // Auth Session Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, tenants(*)')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
      if (data.role) setUserRole(data.role as UserRole);
      if (data.tenant_id && !activeTenant) {
        // Option: Auto-redirect to their tenant
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Memoized Partitioned Data
  const tenantData = useMemo(() => {
    if (!activeTenant) return null;
    return {
      students: students.filter(s => s.tenantId === activeTenant.id),
      staff: staff.filter(s => s.tenantId === activeTenant.id),
      subjects: subjects.filter(s => s.tenantId === activeTenant.id),
      classrooms: classrooms.filter(s => s.tenantId === activeTenant.id),
      admissions: admissions.filter(s => s.tenantId === activeTenant.id)
    };
  }, [activeTenant, students, staff, subjects, classrooms, admissions]);

  const handleAdmissionStatusUpdate = async (appId: string, newStatus: AdmissionStatus, enrollmentData?: { grade: string; section: string; stream?: AcademicStream }) => {
    if (!activeTenant) return;
    const app = admissions.find(a => a.id === appId);
    if (!app) return;
    if (newStatus === AdmissionStatus.ACCEPTED && app.status === AdmissionStatus.ACCEPTED) return;

    // Optimistic Update
    setAdmissions(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));

    if (newStatus === AdmissionStatus.ACCEPTED && enrollmentData) {
      // 1. Create Student in Supabase
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          tenant_id: activeTenant.id,
          name: app.studentName,
          admission_no: `ADM-2024-${Math.floor(100 + Math.random() * 899)}`,
          email: app.contactEmail,
          grade: enrollmentData.grade,
          section: enrollmentData.section,
          stream: enrollmentData.stream,
          status: 'ACTIVE',
          dob: app.dob,
          parent_name: app.parentName,
          parent_phone: app.parentPhone,
          profile_picture: app.profilePicture,
          gender: app.gender
        })
        .select()
        .single();

      if (studentError) {
        console.error('Enrollment failed:', studentError);
        return;
      }

      // 2. Update Admission in Supabase
      await supabase
        .from('admissions')
        .update({ status: newStatus, student_id: studentData.id })
        .eq('id', appId);

      // 3. Update Local State
      setStudents(prev => [studentData as any, ...prev]);
      setNotification(`${app.studentName} enrolled at ${activeTenant.name}!`);
      setTimeout(() => setNotification(null), 4000);
    } else {
      // Just Update Status
      await supabase
        .from('admissions')
        .update({ status: newStatus })
        .eq('id', appId);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addTestNotification = () => {
    const newN: Notification = {
      id: `N${Date.now()}`,
      title: 'Performance Alert',
      message: 'Class SSS1 Math average has dropped by 5%.',
      category: 'ACADEMIC',
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newN, ...prev]);
  };

  const updateSyllabus = async (subjectId: string, syllabus: SyllabusUnit[]) => {
    // Calculate progress
    const completed = syllabus?.filter(u => u.status === 'COMPLETED').length || 0;
    const total = syllabus?.length || 1;
    const progress = Math.round((completed / total) * 100);

    // Optimistic Update
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, syllabus, progress } : s));

    // Supabase Sync
    const { error } = await supabase
      .from('subjects')
      .update({ syllabus, progress })
      .eq('id', subjectId);

    if (error) console.error('Failed to sync syllabus:', error);
  };

  const updateAssessments = async (subjectId: string, assessments: Assessment[]) => {
    if (!activeTenant) return;

    // Optimistic Update
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, assessments } : s));

    // Supabase Relational Sync
    for (const assessment of assessments) {
      const isNew = !assessment.id.includes('-'); // Rough check for non-UUID

      const assessmentData = {
        tenant_id: activeTenant.id,
        subject_id: subjectId,
        title: assessment.title,
        type: assessment.type,
        term: assessment.term,
        sub_type: assessment.subType,
        max_marks: assessment.maxMarks,
        weightage: assessment.weightage,
        date: assessment.date
      };

      let assessmentId = assessment.id;

      if (isNew) {
        const { data, error } = await supabase
          .from('assessments')
          .insert(assessmentData)
          .select()
          .single();
        if (error) console.error('Failed to create assessment:', error);
        if (data) assessmentId = data.id;
      } else {
        await supabase
          .from('assessments')
          .update(assessmentData)
          .eq('id', assessment.id);
      }

      // Sync Scores
      if (assessment.scores) {
        const scoreEntries = Object.entries(assessment.scores).map(([studentId, score]) => ({
          assessment_id: assessmentId,
          student_id: studentId,
          score: score
        }));

        const { error: scoreError } = await supabase
          .from('scores')
          .upsert(scoreEntries, { onConflict: 'assessment_id,student_id' });

        if (scoreError) console.error('Failed to sync scores:', scoreError);
      }
    }
  };

  // Only show the global loading screen if we have an active tenant but data is still loading
  if (isLoading && activeTenant) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-indigo-400 font-black text-xs uppercase tracking-widest">Initializing Global OS...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Auth mode="login" tenants={INITIAL_TENANTS} onSuccess={() => navigate('/')} />} />
      <Route path="/signup" element={<Auth mode="signup" tenants={INITIAL_TENANTS} onSuccess={() => navigate('/')} />} />

      {/* Root redirection or Tenant Selector */}
      <Route path="/" element={
        !session ? <Navigate to="/login" replace /> :
          userRole === UserRole.SUPERADMIN ? (
            <div className="flex h-screen bg-slate-50 overflow-hidden">
              <Sidebar
                isOpen={isSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
                activeTenant={null as any}
                onSwitchTenant={() => setActiveTenant(null)}
                role={userRole}
                onLogout={handleLogout}
              />
              <main className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                  <div className="flex items-center gap-4">
                    <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Nexus Global</h1>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <button onClick={() => setShowRoleSelector(!showRoleSelector)} className="flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-indigo-100">
                        <ShieldCheck size={12} /> System Admin <ChevronDown size={10} />
                      </button>
                      {showRoleSelector && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                          <button onClick={() => { setUserRole(UserRole.SUPERADMIN); setShowRoleSelector(false); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-indigo-50 text-indigo-600 transition-colors">SuperAdmin</button>
                          <button onClick={() => { setUserRole(UserRole.PRINCIPAL); navigate('/T1/dashboard'); setShowRoleSelector(false); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-emerald-50 text-emerald-600 transition-colors">Springfield Principal</button>
                        </div>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black shadow-lg">SA</div>
                  </div>
                </header>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <SuperAdminDashboard
                    tenants={tenants}
                    onSelectTenant={(t) => { navigate(`/${t.id}/dashboard`); setUserRole(UserRole.PRINCIPAL); }}
                    onProvisionTenant={async (newTenant) => {
                      const dbTenant = {
                        name: newTenant.name,
                        domain: newTenant.subdomain,
                        logo_url: newTenant.logo,
                        primary_color: newTenant.primaryColor,
                        region: newTenant.region
                      };
                      const { data, error } = await supabase.from('tenants').insert(dbTenant).select().single();
                      if (!error && data) {
                        const mapped = {
                          id: data.id,
                          name: data.name,
                          subdomain: data.domain,
                          logo: data.logo_url,
                          primaryColor: data.primary_color,
                          region: data.region,
                          studentCount: 0
                        };
                        setTenants(prev => [...prev, mapped]);
                        setNotification(`Instance ${newTenant.name} provisioned successfully!`);
                        setTimeout(() => setNotification(null), 4000);
                      }
                    }}
                  />
                </div>
              </main>
            </div>
          ) : (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative">
              <div className="max-w-4xl w-full z-10 text-center">
                <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 mb-6"><BrainCircuit size={64} className="text-indigo-400" /></div>
                <h1 className="text-5xl font-black text-white tracking-tighter mb-4">EduNexus Login</h1>
                <p className="text-slate-400 mb-12">Select your institutional portal to begin.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {INITIAL_TENANTS.map((tenant) => (
                    <button key={tenant.id} onClick={() => { navigate(`/${tenant.id}/dashboard`); setUserRole(UserRole.PRINCIPAL); }} className="bg-slate-800/50 border border-slate-700 p-8 rounded-[2.5rem] text-left hover:border-indigo-500 transition-all">
                      <div className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center text-white shadow-xl" style={{ backgroundColor: tenant.primaryColor }}><School size={24} /></div>
                      <h3 className="text-lg font-bold text-white">{tenant.name}</h3>
                      <p className="text-slate-500 text-xs mt-1">{tenant.region}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
      } />

      {/* Institutional Routes */}
      <Route path="/:tenantId/*" element={
        !session ? <Navigate to="/login" replace /> :
          <div className="flex h-screen bg-slate-50 overflow-hidden">
            {activeTenant && (
              <Sidebar
                isOpen={isSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
                activeTenant={activeTenant}
                onSwitchTenant={() => navigate('/')}
                role={userRole}
                onLogout={handleLogout}
              />
            )}

            <main className="flex-1 flex flex-col h-full overflow-hidden">
              <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 lg:hidden">
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                  {activeTenant && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: activeTenant.primaryColor }}><School size={16} /></div>
                      <span className="font-black text-slate-900 tracking-tight uppercase hidden sm:inline">{activeTenant.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div className="relative">
                    <button onClick={() => setShowRoleSelector(!showRoleSelector)} className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full font-black text-[10px] uppercase tracking-widest border border-indigo-100">
                      <ShieldCheck size={12} /> {userRole} Access <ChevronDown size={10} />
                    </button>
                    {showRoleSelector && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <button onClick={() => { setUserRole(UserRole.SUPERADMIN); navigate('/'); setShowRoleSelector(false); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-indigo-50 text-indigo-600 transition-colors border-b border-slate-50">Back to SuperAdmin</button>
                        <button onClick={() => { setUserRole(UserRole.PRINCIPAL); setShowRoleSelector(false); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-emerald-50 text-emerald-600 transition-colors">School Principal</button>
                        <button onClick={() => { setUserRole(UserRole.STUDENT); navigate(`/${activeTenant?.id}/student_portal`); setShowRoleSelector(false); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-indigo-50 text-indigo-600 transition-colors">Student Persona</button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <button onClick={() => setShowNotificationCenter(!showNotificationCenter)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all relative">
                        <Bell size={20} />
                        {notifications.filter(n => !n.read).length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>}
                      </button>
                      {showNotificationCenter && (
                        <div className="absolute right-0 mt-4 w-96 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4">
                          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Notification Hub</h3>
                            <button onClick={clearAllNotifications} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500">Clear All</button>
                          </div>
                          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                              <div className="p-12 text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active alerts</p>
                              </div>
                            ) : (
                              <div className="divide-y divide-slate-50">
                                {notifications.map((n) => (
                                  <div
                                    key={n.id}
                                    className={`p-6 hover:bg-slate-50 transition-colors relative cursor-pointer ${!n.read ? 'bg-indigo-50/30' : ''}`}
                                    onClick={() => markNotificationAsRead(n.id)}
                                  >
                                    <div className="flex items-start gap-4">
                                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.category === 'ALERT' ? 'bg-rose-500' : n.category === 'ACADEMIC' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                                      <div>
                                        <p className={`text-xs ${!n.read ? 'font-black text-slate-900' : 'font-bold text-slate-600'} mb-1`}>{n.title}</p>
                                        <p className="text-[11px] text-slate-500 leading-relaxed mb-2">{n.message}</p>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                            <button onClick={addTestNotification} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Simulate System Alert</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">{userRole.charAt(0)}</div>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 shadow-inner">
                <Routes>
                  <Route path="dashboard" element={userRole === UserRole.EXAM_OFFICER ? <ExamOfficerDashboard subjects={tenantData?.subjects || []} students={tenantData?.students || []} setCurrentView={(v) => navigate(`/${activeTenant?.id}/${v.toLowerCase()}`)} /> : <PrincipalDashboard setCurrentView={(v) => navigate(`/${activeTenant?.id}/${v.toLowerCase()}`)} />} />
                  <Route path="students" element={<StudentManagement students={tenantData?.students || []} setStudents={setStudents} activeTenant={activeTenant!} admissions={admissions} />} />
                  <Route path="staff" element={<StaffManagement staff={tenantData?.staff || []} setStaff={setStaff} activeTenant={activeTenant!} />} />
                  <Route path="academics" element={<AcademicManagement subjects={tenantData?.subjects || []} setSubjects={setSubjects} onUpdateSyllabus={updateSyllabus} onUpdateAssessments={updateAssessments} students={tenantData?.students || []} activeTenant={activeTenant!} setCurrentView={(v) => navigate(`/${activeTenant?.id}/${v.toLowerCase()}`)} />} />
                  <Route path="exams_office" element={<ExamOfficerDashboard subjects={tenantData?.subjects || []} students={tenantData?.students || []} setCurrentView={(v) => navigate(`/${activeTenant?.id}/${v.toLowerCase()}`)} />} />
                  <Route path="finance" element={<FinanceManagement fees={fees} transactions={transactions} activeTenant={activeTenant!} />} />
                  <Route path="library" element={<LibraryManagement books={books} loans={loans} fines={fines} activeTenant={activeTenant!} />} />
                  <Route path="classrooms" element={<ClassroomManagement classrooms={tenantData?.classrooms || []} setClassrooms={setClassrooms} students={tenantData?.students || []} subjects={tenantData?.subjects || []} setSubjects={setSubjects} staff={tenantData?.staff || []} activeTenant={activeTenant!} />} />
                  <Route path="admissions" element={<AdmissionsPortal admissions={admissions} onUpdateStatus={handleAdmissionStatusUpdate} activeTenant={activeTenant!} />} />
                  <Route path="ai_insights" element={<AIInsights data={tenantData} />} />
                  <Route path="mobile_sync" element={<MobileSync activeTenant={activeTenant!} />} />
                  <Route path="student_portal" element={<StudentPortal student={tenantData?.students[0] || INITIAL_STUDENTS[0]} subjects={tenantData?.subjects || []} activeTenant={activeTenant!} allStudents={tenantData?.students || []} />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </div>
            </main>
          </div>
      } />
    </Routes>
  );
};

export default App;
