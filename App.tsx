
import React, { useState, useMemo } from 'react';
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
import { AdmissionStatus, AdmissionApplication, Student, Subject, Classroom, Staff, Assessment, SyllabusUnit, Tenant, AcademicStream, UserRole } from './types';

// Multi-Tenant Mock Data
const INITIAL_TENANTS: Tenant[] = [
  { id: 'T1', name: 'Springfield Academy', subdomain: 'springfield', logo: 'emerald', primaryColor: '#10b981', region: 'North District', studentCount: 1250 },
  { id: 'T2', name: 'Elite International School', subdomain: 'elite', logo: 'indigo', primaryColor: '#6366f1', region: 'West Metropolitan', studentCount: 840 },
  { id: 'T3', name: 'Riverdale High', subdomain: 'riverdale', logo: 'rose', primaryColor: '#f43f5e', region: 'South Valley', studentCount: 2100 },
];

const INITIAL_STAFF: Staff[] = [
  { id: 'STF1', tenantId: 'T1', name: 'Dr. Alan Grant', role: 'Senior Teacher', department: 'SCIENCE', joiningDate: '2020-01-15', salary: 6500, isHOD: true },
  { id: 'STF2', tenantId: 'T1', name: 'Ms. Ellie Sattler', role: 'Senior Teacher', department: 'ART', joiningDate: '2021-03-22', salary: 5200, isHOD: true },
  { id: 'STF3', tenantId: 'T2', name: 'Mr. Ian Malcolm', role: 'Math Specialist', department: 'SCIENCE', joiningDate: '2022-08-10', salary: 4800, isHOD: false },
  { id: 'STF4', tenantId: 'T1', name: 'Mrs. Claire Dearing', role: 'Admin Coordinator', department: 'COMMERCIAL', joiningDate: '2019-11-05', salary: 4500, isHOD: true },
];

const INITIAL_STUDENTS: Student[] = [
  { id: 'S1', tenantId: 'T1', name: 'Alexander Wright', grade: 'SSS1', section: '1', admissionNo: 'ADM-2024-001', gender: 'M', parentName: 'Robert Wright', status: 'ACTIVE', advisor: 'Dr. Alan Grant', stream: 'SCIENCE' },
  { id: 'S2', tenantId: 'T2', name: 'Sophia Martinez', grade: 'Grade 10', section: 'B', admissionNo: 'ADM-2024-002', gender: 'F', parentName: 'Elena Martinez', status: 'ACTIVE', advisor: 'Mr. Ian Malcolm', stream: 'GENERAL' },
  { id: 'S3', tenantId: 'T1', name: 'Marcus Aurelius', grade: 'SSS1', section: '1', admissionNo: 'ADM-2024-003', gender: 'M', parentName: 'Antoninus Pius', status: 'ACTIVE', advisor: 'Dr. Alan Grant', stream: 'SCIENCE' },
];

const INITIAL_SUBJECTS: Subject[] = [
  { 
    id: 'SUB1', tenantId: 'T1', name: 'Mathematics', grade: 'SSS1', teacher: 'Dr. Alan Grant', teacherId: 'STF1', progress: 40,
    syllabus: [
      { id: 'U1', title: 'Algebra Foundations', description: 'Variables, expressions, and linear equations.', status: 'COMPLETED', order: 1 },
      { id: 'U2', title: 'Quadratic Equations', description: 'Solving quadratics.', status: 'COMPLETED', order: 2 },
    ],
    assessments: [
      { id: 'A1', title: 'T1 Test', type: 'QUIZ', term: 'FIRST', subType: 'TEST', maxMarks: 100, weightage: 50, date: '2024-02-10', scores: { 'S1': 85, 'S3': 70 } },
      { id: 'A2', title: 'T1 Exam', type: 'EXAM', term: 'FIRST', subType: 'EXAM', maxMarks: 100, weightage: 50, date: '2024-04-15', scores: { 'S1': 78, 'S3': 82 } },
      { id: 'A5', title: 'T2 Test', type: 'QUIZ', term: 'SECOND', subType: 'TEST', maxMarks: 100, weightage: 50, date: '2024-06-10', scores: { 'S1': 92, 'S3': 88 } }
    ]
  },
  { 
    id: 'SUB2', tenantId: 'T1', name: 'Science', grade: 'SSS1', teacher: 'Ms. Ellie Sattler', teacherId: 'STF2', progress: 15,
    syllabus: [{ id: 'U-PH', title: 'Photosynthesis', description: 'The light cycle.', status: 'IN_PROGRESS', order: 1 }],
    assessments: [
      { id: 'A3', title: 'T1 Test', type: 'QUIZ', term: 'FIRST', subType: 'TEST', maxMarks: 100, weightage: 50, date: '2024-02-15', scores: { 'S1': 92, 'S3': 95 } },
      { id: 'A4', title: 'T1 Exam', type: 'EXAM', term: 'FIRST', subType: 'EXAM', maxMarks: 100, weightage: 50, date: '2024-04-20', scores: { 'S1': 88, 'S3': 90 } }
    ]
  },
];

const INITIAL_CLASSROOMS: Classroom[] = [
  { id: 'C1', tenantId: 'T1', grade: 'SSS1', section: '1', classTeacherId: 'STF1', roomNumber: '101', capacity: 30, stream: 'SCIENCE', schoolSection: 'SENIOR' },
  { id: 'C2', tenantId: 'T2', grade: 'Grade 10', section: 'B', classTeacherId: 'STF3', roomNumber: '102', capacity: 30, stream: 'GENERAL' },
];

export type View = 'DASHBOARD' | 'STUDENTS' | 'ACADEMICS' | 'FINANCE' | 'ADMISSIONS' | 'STAFF' | 'LIBRARY' | 'AI_INSIGHTS' | 'MOBILE_SYNC' | 'CLASSROOMS' | 'EXAMS_OFFICE' | 'STUDENT_PORTAL' | 'SYSTEM_HUB';

const App: React.FC = () => {
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.SUPERADMIN);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [classrooms, setClassrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [notification, setNotification] = useState<string | null>(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

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

  const handleAdmissionStatusUpdate = (appId: string, newStatus: AdmissionStatus, enrollmentData?: { grade: string; section: string; stream?: AcademicStream }) => {
    if (!activeTenant) return;
    const app = admissions.find(a => a.id === appId);
    if (!app) return;
    if (newStatus === AdmissionStatus.ACCEPTED && app.status === AdmissionStatus.ACCEPTED) return;

    if (newStatus === AdmissionStatus.ACCEPTED && enrollmentData) {
      const studentId = `S${Date.now()}`;
      const newStudent: Student = {
        id: studentId,
        tenantId: activeTenant.id,
        applicationId: app.id,
        name: app.studentName,
        grade: enrollmentData.grade,
        section: enrollmentData.section,
        stream: enrollmentData.stream,
        admissionNo: `ADM-2024-${Math.floor(100 + Math.random() * 899)}`,
        gender: app.gender || 'O',
        parentName: app.parentName,
        status: 'ACTIVE',
        profilePicture: app.profilePicture,
        documents: app.documents,
        dob: app.dob,
        bloodGroup: app.bloodGroup,
        parentPhone: app.parentPhone,
        address: app.address,
        medicalNotes: app.medicalNotes
      };
      setStudents(prev => [newStudent, ...prev]);
      setAdmissions(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus, studentId: studentId } : a));
      setNotification(`${app.studentName} enrolled at ${activeTenant.name}!`);
      setTimeout(() => setNotification(null), 4000);
    } else {
      setAdmissions(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    }
  };

  const updateSyllabus = (subjectId: string, syllabus: SyllabusUnit[]) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) {
        const completed = syllabus?.filter(u => u.status === 'COMPLETED').length || 0;
        const total = syllabus?.length || 1;
        const progress = Math.round((completed / total) * 100);
        return { ...s, syllabus, progress };
      }
      return s;
    }));
  };

  const updateAssessments = (subjectId: string, assessments: Assessment[]) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, assessments } : s));
  };

  // If SuperAdmin and no tenant selected, show the Cloud Management Hub
  if (userRole === UserRole.SUPERADMIN && !activeTenant) {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          isOpen={isSidebarOpen} 
          activeTenant={null as any}
          onSwitchTenant={() => setActiveTenant(null)}
          role={userRole}
        />
        <main className="flex-1 flex flex-col h-full overflow-hidden">
           <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
             <div className="flex items-center gap-4">
               <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Nexus Global</h1>
             </div>
             <div className="flex items-center gap-4">
                <div className="relative">
                  <button 
                    onClick={() => setShowRoleSelector(!showRoleSelector)}
                    className="flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-indigo-100"
                  >
                    <ShieldCheck size={12} /> System Admin <ChevronDown size={10} />
                  </button>
                  {showRoleSelector && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                       <p className="px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 bg-slate-50/50">Simulate Identity</p>
                       <button onClick={() => { setUserRole(UserRole.SUPERADMIN); setShowRoleSelector(false); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-indigo-50 text-indigo-600 transition-colors">SuperAdmin</button>
                       <button onClick={() => { setUserRole(UserRole.PRINCIPAL); setActiveTenant(INITIAL_TENANTS[0]); setShowRoleSelector(false); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-emerald-50 text-emerald-600 transition-colors">School Principal</button>
                       <button onClick={() => { setUserRole(UserRole.EXAM_OFFICER); setActiveTenant(INITIAL_TENANTS[0]); setShowRoleSelector(false); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-amber-50 text-amber-600 transition-colors">Exam Officer</button>
                       <button onClick={() => { setUserRole(UserRole.STUDENT); setActiveTenant(INITIAL_TENANTS[0]); setCurrentView('STUDENT_PORTAL'); setShowRoleSelector(false); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-indigo-50 text-indigo-600 transition-colors">Student Persona</button>
                    </div>
                  )}
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black shadow-lg">SA</div>
             </div>
           </header>
           <div className="flex-1 overflow-y-auto custom-scrollbar">
             <SuperAdminDashboard tenants={INITIAL_TENANTS} onSelectTenant={(t) => { setActiveTenant(t); setUserRole(UserRole.PRINCIPAL); }} />
           </div>
        </main>
      </div>
    );
  }

  // Fallback for when no tenant is selected and user is NOT SuperAdmin (Should theoretically prompt for Login)
  if (!activeTenant) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative">
        <div className="max-w-4xl w-full z-10 text-center">
          <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 mb-6"><BrainCircuit size={64} className="text-indigo-400" /></div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">EduNexus Login</h1>
          <p className="text-slate-400 mb-12">Select your institutional portal to begin.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_TENANTS.map((tenant) => (
              <button key={tenant.id} onClick={() => { setActiveTenant(tenant); setUserRole(UserRole.PRINCIPAL); }} className="bg-slate-800/50 border border-slate-700 p-8 rounded-[2.5rem] text-left hover:border-indigo-500 transition-all">
                <div className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center text-white shadow-xl" style={{ backgroundColor: tenant.primaryColor }}><School size={24} /></div>
                <h3 className="text-lg font-bold text-white">{tenant.name}</h3>
                <p className="text-slate-500 text-xs mt-1">{tenant.region}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setUserRole(UserRole.SUPERADMIN)} className="mt-12 text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:underline">Access Global System Command</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isOpen={isSidebarOpen} 
        activeTenant={activeTenant}
        onSwitchTenant={() => setActiveTenant(null)}
        role={userRole}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 lg:hidden">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: activeTenant.primaryColor }}><School size={16} /></div>
               <span className="font-black text-slate-900 tracking-tight uppercase hidden sm:inline">{activeTenant.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setShowRoleSelector(!showRoleSelector)}
                className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full font-black text-[10px] uppercase tracking-widest border border-indigo-100"
              >
                <ShieldCheck size={12} /> {userRole} Access <ChevronDown size={10} />
              </button>
              {showRoleSelector && (
                 <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <button onClick={() => { setUserRole(UserRole.SUPERADMIN); setActiveTenant(null); setShowRoleSelector(false); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-indigo-50 text-indigo-600 transition-colors border-b border-slate-50">Back to SuperAdmin</button>
                    <button onClick={() => { setUserRole(UserRole.PRINCIPAL); setShowRoleSelector(false); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-emerald-50 text-emerald-600 transition-colors">School Principal</button>
                    <button onClick={() => { setUserRole(UserRole.EXAM_OFFICER); setShowRoleSelector(false); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-amber-50 text-amber-600 transition-colors">Exam Officer</button>
                    <button onClick={() => { setUserRole(UserRole.STUDENT); setCurrentView('STUDENT_PORTAL'); setShowRoleSelector(false); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-indigo-50 text-indigo-600 transition-colors">Student Persona</button>
                    <button onClick={() => { setUserRole(UserRole.TEACHER); setShowRoleSelector(false); }} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-indigo-50 text-indigo-600 transition-colors">Teacher Persona</button>
                 </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
                {userRole.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          {notification && (
            <div className="mx-8 mt-6 p-4 bg-indigo-600 text-white rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 shadow-xl">
              <CheckCircle2 size={20} /><p className="font-bold text-sm">{notification}</p>
            </div>
          )}

          {currentView === 'DASHBOARD' && userRole === UserRole.EXAM_OFFICER && <ExamOfficerDashboard subjects={tenantData?.subjects || []} students={tenantData?.students || []} setCurrentView={setCurrentView} />}
          {currentView === 'DASHBOARD' && userRole !== UserRole.EXAM_OFFICER && userRole !== UserRole.STUDENT && <PrincipalDashboard setCurrentView={setCurrentView} />}
          {currentView === 'STUDENT_PORTAL' && userRole === UserRole.STUDENT && <StudentPortal student={tenantData?.students[0] || INITIAL_STUDENTS[0]} subjects={tenantData?.subjects || []} activeTenant={activeTenant} allStudents={tenantData?.students || []} />}
          {currentView === 'EXAMS_OFFICE' && <ExamOfficerDashboard subjects={tenantData?.subjects || []} students={tenantData?.students || []} setCurrentView={setCurrentView} />}
          {currentView === 'ADMISSIONS' && <AdmissionsPortal admissions={admissions} setAdmissions={setAdmissions} onUpdateStatus={handleAdmissionStatusUpdate} students={students} setStudents={setStudents} activeTenant={activeTenant} />}
          {currentView === 'STUDENTS' && <StudentManagement students={tenantData?.students || []} setStudents={setStudents} activeTenant={activeTenant} admissions={admissions} />}
          {currentView === 'ACADEMICS' && <AcademicManagement subjects={tenantData?.subjects || []} setSubjects={setSubjects} onUpdateSyllabus={updateSyllabus} onUpdateAssessments={updateAssessments} students={tenantData?.students || []} activeTenant={activeTenant} setCurrentView={setCurrentView} />}
          {currentView === 'CLASSROOMS' && <ClassroomManagement classrooms={tenantData?.classrooms || []} setClassrooms={setClassrooms} students={tenantData?.students || []} subjects={tenantData?.subjects || []} setSubjects={setSubjects} staff={tenantData?.staff || []} activeTenant={activeTenant} />}
          {currentView === 'FINANCE' && <FinanceManagement />}
          {currentView === 'STAFF' && <StaffManagement staff={tenantData?.staff || []} setStaff={setStaff} />}
          {currentView === 'LIBRARY' && <LibraryManagement />}
          {currentView === 'AI_INSIGHTS' && <AIInsights />}
          {currentView === 'MOBILE_SYNC' && <MobileSync />}
        </div>
      </main>
    </div>
  );
};

export default App;
