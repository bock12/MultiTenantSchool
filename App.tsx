
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
  /* Fixed: Added Plus to imports */
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
import { AdmissionStatus, AdmissionApplication, Student, Subject, Classroom, Staff, Assessment, SyllabusUnit, Tenant } from './types';

// Multi-Tenant Mock Data
const INITIAL_TENANTS: Tenant[] = [
  { id: 'T1', name: 'Springfield Academy', subdomain: 'springfield', logo: 'emerald', primaryColor: '#10b981', region: 'North District', studentCount: 1250 },
  { id: 'T2', name: 'Elite International School', subdomain: 'elite', logo: 'indigo', primaryColor: '#6366f1', region: 'West Metropolitan', studentCount: 840 },
  { id: 'T3', name: 'Riverdale High', subdomain: 'riverdale', logo: 'rose', primaryColor: '#f43f5e', region: 'South Valley', studentCount: 2100 },
];

const INITIAL_STAFF: Staff[] = [
  { id: 'STF1', tenantId: 'T1', name: 'Dr. Alan Grant', role: 'Senior Teacher', department: 'Science', joiningDate: '2020-01-15', salary: 6500 },
  { id: 'STF2', tenantId: 'T1', name: 'Ms. Ellie Sattler', role: 'Senior Teacher', department: 'Humanities', joiningDate: '2021-03-22', salary: 5200 },
  { id: 'STF3', tenantId: 'T2', name: 'Mr. Ian Malcolm', role: 'Math Specialist', department: 'STEM', joiningDate: '2022-08-10', salary: 4800 },
];

const INITIAL_STUDENTS: Student[] = [
  { id: 'S1', tenantId: 'T1', name: 'Alexander Wright', grade: 'Grade 10', section: 'A', admissionNo: 'ADM-2024-001', gender: 'M', parentName: 'Robert Wright', status: 'ACTIVE', advisor: 'Dr. Alan Grant' },
  { id: 'S2', tenantId: 'T2', name: 'Sophia Martinez', grade: 'Grade 10', section: 'B', admissionNo: 'ADM-2024-002', gender: 'F', parentName: 'Elena Martinez', status: 'ACTIVE', advisor: 'Mr. Ian Malcolm' },
];

const INITIAL_SUBJECTS: Subject[] = [
  { 
    id: 'SUB1', tenantId: 'T1', name: 'Mathematics', grade: 'Grade 10', teacher: 'Dr. Alan Grant', progress: 40,
    syllabus: [
      { id: 'U1', title: 'Algebra Foundations', description: 'Variables, expressions, and linear equations.', status: 'COMPLETED', order: 1 },
      { id: 'U2', title: 'Quadratic Equations', description: 'Solving quadratics.', status: 'COMPLETED', order: 2 },
    ]
  },
  { id: 'SUB2', tenantId: 'T2', name: 'Science', grade: 'Grade 10', teacher: 'Mr. Ian Malcolm', progress: 0, assessments: [], syllabus: [] },
];

const INITIAL_CLASSROOMS: Classroom[] = [
  { id: 'C1', tenantId: 'T1', grade: 'Grade 10', section: 'A', classTeacherId: 'STF1', roomNumber: '101', capacity: 30 },
  { id: 'C2', tenantId: 'T2', grade: 'Grade 10', section: 'B', classTeacherId: 'STF3', roomNumber: '102', capacity: 30 },
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

  const handleAdmissionStatusUpdate = (appId: string, newStatus: AdmissionStatus) => {
    if (!activeTenant) return;
    const app = admissions.find(a => a.id === appId);
    if (!app) return;

    if (newStatus === AdmissionStatus.ACCEPTED && app.status === AdmissionStatus.ACCEPTED) return;

    if (newStatus === AdmissionStatus.ACCEPTED) {
      const newStudent: Student = {
        id: `S${Date.now()}`,
        tenantId: activeTenant.id,
        name: app.studentName,
        grade: app.gradeApplying,
        section: 'A',
        admissionNo: `ADM-2024-${Math.floor(100 + Math.random() * 899)}`,
        gender: app.gender || 'O',
        parentName: app.parentName,
        status: 'ACTIVE',
      };
      setStudents(prev => [newStudent, ...prev]);
      setNotification(`${app.studentName} enrolled at ${activeTenant.name}!`);
      setTimeout(() => setNotification(null), 4000);
    }

    setAdmissions(prev => prev.map(a => 
      a.id === appId ? { ...a, status: newStatus } : a
    ));
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
        
        <div className="max-w-4xl w-full z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="text-center mb-16">
             <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md mb-6">
                <ShieldCheck size={16} className="text-indigo-400" />
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Institutional Access Control</span>
             </div>
             <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-4">EduNexus <span className="text-indigo-500">v2.5</span></h1>
             <p className="text-slate-400 text-base md:text-lg max-w-lg mx-auto font-medium">Please select your managed institution to initialize the OS session.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_TENANTS.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => setActiveTenant(tenant)}
                className="group relative bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-left hover:bg-white/10 hover:scale-105 transition-all duration-500 backdrop-blur-lg"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-12`} style={{ backgroundColor: tenant.primaryColor }}>
                  <Building2 className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-black text-white leading-tight mb-2">{tenant.name}</h3>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Globe size={12} /> {tenant.subdomain}.edunexus.io
                  </span>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] font-bold text-slate-400">{tenant.studentCount} Students</span>
                    <ChevronRight size={20} className="text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-20 text-center">
            <button className="text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto">
              <Plus size={16} /> Register New Institution
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (!tenantData) return null;
    switch (currentView) {
      case 'DASHBOARD':
        return <PrincipalDashboard />;
      case 'STUDENTS':
        return <StudentManagement students={tenantData.students} setStudents={setStudents} activeTenant={activeTenant} />;
      case 'CLASSROOMS':
        return <ClassroomManagement classrooms={tenantData.classrooms} students={tenantData.students} subjects={tenantData.subjects} staff={tenantData.staff} />;
      case 'ADMISSIONS':
        return (
          <AdmissionsPortal 
            admissions={tenantData.admissions} 
            setAdmissions={setAdmissions} 
            onUpdateStatus={handleAdmissionStatusUpdate} 
            students={tenantData.students} 
            setStudents={setStudents}
            activeTenant={activeTenant}
          />
        );
      case 'ACADEMICS':
        return (
          <AcademicManagement 
            subjects={tenantData.subjects} 
            setSubjects={setSubjects} 
            onUpdateSyllabus={updateSyllabus} 
            onUpdateAssessments={updateAssessments}
            students={tenantData.students}
            activeTenant={activeTenant}
          />
        );
      case 'FINANCE':
        return <FinanceManagement />;
      case 'STAFF':
        return <StaffManagement staff={tenantData.staff} />;
      case 'LIBRARY':
        return <LibraryManagement />;
      case 'AI_INSIGHTS':
        return <AIInsights />;
      case 'MOBILE_SYNC':
        return <MobileSync />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 relative overflow-hidden">
      {notification && (
        <div className="fixed top-20 right-4 md:right-8 z-[100] animate-in slide-in-from-right fade-in duration-300 max-w-[90vw] md:max-w-md">
          <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500">
            <CheckCircle2 size={24} className="shrink-0" />
            <div className="min-w-0">
              <p className="font-black text-sm uppercase tracking-widest truncate">System Update</p>
              <p className="text-xs text-emerald-100 font-medium truncate">{notification}</p>
            </div>
            <button onClick={() => setNotification(null)} className="ml-4 hover:bg-emerald-700 p-1 rounded-lg transition-colors shrink-0">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar 
        currentView={currentView} 
        setCurrentView={(view) => {
          setCurrentView(view);
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }} 
        isOpen={isSidebarOpen}
        activeTenant={activeTenant}
        onSwitchTenant={() => setActiveTenant(null)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-20 shrink-0">
          <div className="flex items-center gap-3 md:gap-6 text-slate-500 min-w-0">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 min-w-0">
               <div className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0" style={{ backgroundColor: activeTenant.primaryColor }}></div>
               <span className="text-[10px] md:text-xs font-black uppercase text-slate-900 tracking-widest truncate">{activeTenant.name}</span>
            </div>
            <div className="relative group hidden xl:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search across institution..." 
                className="pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 w-64 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => setCurrentView('AI_INSIGHTS')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all border border-slate-700 shadow-xl shadow-slate-200"
            >
              <BrainCircuit size={16} className="text-indigo-400" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">AI Hub</span>
            </button>
            <button className="relative text-slate-400 hover:text-indigo-600 transition-colors p-1">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2 md:gap-3 pl-3 md:pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none">Dr. Sarah Jenkins</p>
                <p className="text-[9px] text-slate-500 mt-1.5 uppercase tracking-widest font-black">Admin</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200">
                SJ
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar p-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;