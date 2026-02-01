
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
  Plus
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import PrincipalDashboard from './components/PrincipalDashboard';
import AdmissionsPortal from './components/AdmissionsPortal';
import AcademicManagement from './components/AcademicManagement';
import FinanceManagement from './components/FinanceManagement';
import StaffManagement from './components/StaffManagement';
import LibraryManagement from './components/LibraryManagement';
import AIInsights from './components/AIInsights';
import MobileSync from './components/MobileSync';
import StudentManagement from './components/StudentManagement';
import ClassroomManagement from './components/ClassroomManagement';
import { AdmissionStatus, AdmissionApplication, Student, Subject, Classroom, Staff, Assessment, SyllabusUnit, Tenant, AcademicStream } from './types';

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
];

const INITIAL_SUBJECTS: Subject[] = [
  { 
    id: 'SUB1', tenantId: 'T1', name: 'Mathematics', grade: 'SSS1', teacher: 'Dr. Alan Grant', teacherId: 'STF1', progress: 40,
    syllabus: [
      { id: 'U1', title: 'Algebra Foundations', description: 'Variables, expressions, and linear equations.', status: 'COMPLETED', order: 1 },
      { id: 'U2', title: 'Quadratic Equations', description: 'Solving quadratics.', status: 'COMPLETED', order: 2 },
    ]
  },
  { 
    id: 'SUB2', tenantId: 'T2', name: 'Science', grade: 'Grade 10', teacher: 'Mr. Ian Malcolm', teacherId: 'STF3', progress: 0, 
    assessments: [], 
    syllabus: [
      { 
        id: 'U-QM', 
        title: 'Introduction to Quantum Mechanics', 
        description: 'A basic overview of quantum concepts.', 
        status: 'PENDING', 
        order: 1 
      }
    ] 
  },
];

const INITIAL_CLASSROOMS: Classroom[] = [
  { id: 'C1', tenantId: 'T1', grade: 'SSS1', section: '1', classTeacherId: 'STF1', roomNumber: '101', capacity: 30, stream: 'SCIENCE', schoolSection: 'SENIOR' },
  { id: 'C2', tenantId: 'T2', grade: 'Grade 10', section: 'B', classTeacherId: 'STF3', roomNumber: '102', capacity: 30, stream: 'GENERAL' },
];

export type View = 'DASHBOARD' | 'STUDENTS' | 'ACADEMICS' | 'FINANCE' | 'ADMISSIONS' | 'STAFF' | 'LIBRARY' | 'AI_INSIGHTS' | 'MOBILE_SYNC' | 'CLASSROOMS';

const App: React.FC = () => {
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [classrooms, setClassrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [notification, setNotification] = useState<string | null>(null);

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

  const handleAdmissionStatusUpdate = (
    appId: string, 
    newStatus: AdmissionStatus, 
    enrollmentData?: { grade: string; section: string; stream?: AcademicStream }
  ) => {
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
      
      // Update application to link it back to the student
      setAdmissions(prev => prev.map(a => 
        a.id === appId ? { ...a, status: newStatus, studentId: studentId } : a
      ));

      setNotification(`${app.studentName} enrolled at ${activeTenant.name}!`);
      setTimeout(() => setNotification(null), 4000);
    } else {
      setAdmissions(prev => prev.map(a => 
        a.id === appId ? { ...a, status: newStatus } : a
      ));
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
    setSubjects(prev => prev.map(s => 
      s.id === subjectId ? { ...s, assessments } : s
    ));
  };

  if (!activeTenant) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"></div>
        
        <div className="max-w-4xl w-full z-10">
          <div className="text-center mb-12">
            <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 mb-6">
              <BrainCircuit size={64} className="text-indigo-400" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter mb-4">EduNexus</h1>
            <p className="text-slate-400 text-lg max-w-lg mx-auto font-medium">
              The next-generation multi-tenant operating system for modern educational institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_TENANTS.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => setActiveTenant(tenant)}
                className="group relative bg-slate-800/50 border border-slate-700 p-8 rounded-[2.5rem] text-left hover:bg-slate-800 hover:border-indigo-500 transition-all hover:scale-[1.02]"
              >
                <div 
                  className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-white shadow-xl"
                  style={{ backgroundColor: tenant.primaryColor }}
                >
                  <School size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{tenant.name}</h3>
                <p className="text-slate-500 text-sm mb-6">{tenant.region}</p>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">{tenant.studentCount} Students</span>
                  <ChevronRight size={20} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mt-16">
            Institutional OS v2.5 • Unified Multi-Tenant Architecture
          </p>
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
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 lg:hidden"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search resources, students..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-80 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full font-black text-[10px] uppercase tracking-widest border border-indigo-100">
              <ShieldCheck size={12} /> Principal Access
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
                P
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          {notification && (
            <div className="mx-8 mt-6 p-4 bg-indigo-600 text-white rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 shadow-xl shadow-indigo-200">
              <CheckCircle2 size={20} />
              <p className="font-bold text-sm">{notification}</p>
            </div>
          )}

          {currentView === 'DASHBOARD' && <PrincipalDashboard />}
          {currentView === 'ADMISSIONS' && (
            <AdmissionsPortal 
              admissions={admissions} 
              setAdmissions={setAdmissions} 
              onUpdateStatus={handleAdmissionStatusUpdate}
              students={students}
              setStudents={setStudents}
              activeTenant={activeTenant}
            />
          )}
          {currentView === 'STUDENTS' && (
            <StudentManagement 
              students={tenantData?.students || []} 
              setStudents={setStudents}
              activeTenant={activeTenant}
              admissions={admissions}
            />
          )}
          {currentView === 'ACADEMICS' && (
            <AcademicManagement 
              subjects={tenantData?.subjects || []}
              setSubjects={setSubjects}
              onUpdateSyllabus={updateSyllabus}
              onUpdateAssessments={updateAssessments}
              students={tenantData?.students || []}
              activeTenant={activeTenant}
            />
          )}
          {currentView === 'CLASSROOMS' && (
            <ClassroomManagement 
              classrooms={tenantData?.classrooms || []}
              setClassrooms={setClassrooms}
              students={tenantData?.students || []}
              subjects={tenantData?.subjects || []}
              setSubjects={setSubjects}
              staff={tenantData?.staff || []}
              activeTenant={activeTenant}
            />
          )}
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
