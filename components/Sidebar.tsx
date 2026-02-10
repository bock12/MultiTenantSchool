
import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Wallet,
  UserPlus,
  Settings,
  Library,
  Briefcase,
  GraduationCap,
  BrainCircuit,
  Smartphone,
  School,
  LogOut,
  Repeat,
  ShieldCheck,
  FileCheck,
  LayoutGrid,
  Database,
  Award,
  IdCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Tenant, UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeTenant: Tenant;
  onSwitchTenant: () => void;
  onLogout: () => void;
  role: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  activeTenant,
  onSwitchTenant,
  onLogout,
  role
}) => {
  const location = useLocation();

  const getMenuItems = () => {
    // SuperAdmin Menu
    if (role === UserRole.SUPERADMIN) {
      return [
        { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Cloud Nexus' },
        { id: 'SYSTEM_HUB', icon: Database, label: 'Instance Manager' },
        { id: 'FINANCE', icon: Wallet, label: 'Global Billing' },
        { id: 'AI_INSIGHTS', icon: BrainCircuit, label: 'System Analytics' },
      ];
    }

    // Teacher Portal Menu
    if (role === UserRole.TEACHER) {
      return [
        { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Teacher Hub' },
        { id: 'ACADEMICS', icon: BookOpen, label: 'My Classes' },
        { id: 'STUDENTS', icon: Users, label: 'Student List' },
        { id: 'LIBRARY', icon: Library, label: 'Resource Library' },
        { id: 'AI_INSIGHTS', icon: BrainCircuit, label: 'AI Assistance' },
      ];
    }

    // Student Portal Menu
    if (role === UserRole.STUDENT) {
      return [
        { id: 'STUDENT_PORTAL', icon: LayoutDashboard, label: 'My Portal' },
        { id: 'ACADEMICS', icon: Award, label: 'My Performance' },
        { id: 'LIBRARY', icon: Library, label: 'E-Library' },
        { id: 'AI_INSIGHTS', icon: BrainCircuit, label: 'Personal Tutor' },
      ];
    }

    // Common Institutional Base
    const base = [
      { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Overview' },
    ];

    // Exam Officer Specific
    if (role === UserRole.EXAM_OFFICER) {
      return [
        ...base,
        { id: 'ACADEMICS', icon: FileCheck, label: 'Results Approval' },
        { id: 'STUDENTS', icon: Users, label: 'Student Registry' },
        { id: 'MOBILE_SYNC', icon: Smartphone, label: 'Results Dissemination' },
      ];
    }

    // Full Admin/Principal Menu
    return [
      ...base,
      { id: 'ADMISSIONS', icon: UserPlus, label: 'Admissions' },
      { id: 'STUDENTS', icon: Users, label: 'Students' },
      { id: 'CLASSROOMS', icon: School, label: 'Classrooms' },
      { id: 'ACADEMICS', icon: BookOpen, label: 'Academics' },
      { id: 'EXAMS_OFFICE', icon: FileCheck, label: 'Exams Office' },
      { id: 'FINANCE', icon: Wallet, label: 'Finance' },
      { id: 'STAFF', icon: Briefcase, label: 'HR & Payroll' },
      { id: 'LIBRARY', icon: Library, label: 'Library' },
      { id: 'AI_INSIGHTS', icon: BrainCircuit, label: 'AI Analytics' },
      { id: 'MOBILE_SYNC', icon: Smartphone, label: 'Mobile Sync' },
    ];
  };

  const menuItems = getMenuItems();

  if (!isOpen) return null;

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 lg:relative ${isCollapsed ? 'w-24' : 'w-72'} bg-slate-900 text-slate-400 flex flex-col h-screen overflow-y-auto no-scrollbar shrink-0 border-r border-slate-800 transition-all duration-300`}>
      <div className={`p-8 ${isCollapsed ? 'px-4' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-8`}>
          <div className="p-2 rounded-xl shadow-lg shrink-0" style={{ backgroundColor: activeTenant?.primaryColor || '#6366f1' }}>
            <GraduationCap className="text-white" size={24} />
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in duration-500">
              <h1 className="text-white font-black text-xl tracking-tighter leading-none">EduNexus</h1>
              <p className="text-[9px] uppercase tracking-[0.3em] font-black mt-1 text-slate-500">
                {role === UserRole.SUPERADMIN ? 'Infrastructure OS' : role === UserRole.STUDENT ? 'Student Portal' : 'Institutional OS'}
              </p>
            </div>
          )}
        </div>

        {/* Branding/Switching Area */}
        <div className={`bg-slate-800/40 rounded-2xl ${isCollapsed ? 'p-2' : 'p-4'} border border-slate-700/50 mb-4 transition-all`}>
          {!isCollapsed && (
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 animate-in fade-in duration-300">
              {role === UserRole.SUPERADMIN ? 'System Context' : 'Active Institution'}
            </p>
          )}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed ? (
              <p className="text-sm font-bold text-white truncate pr-2 animate-in fade-in duration-300">
                {role === UserRole.SUPERADMIN ? 'Nexus Global Hub' : activeTenant?.name}
              </p>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white shrink-0">
                <LayoutGrid size={16} />
              </div>
            )}
            {role === UserRole.SUPERADMIN && !isCollapsed && (
              <button onClick={onSwitchTenant} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-indigo-400" title="Switch Context">
                <Repeat size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {!isCollapsed && (
          <p className="px-4 py-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1 animate-in fade-in duration-300">Command Center</p>
        )}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const path = role === UserRole.SUPERADMIN ? `/${item.id.toLowerCase()}` : `/${activeTenant?.id}/${item.id.toLowerCase()}`;
          const isActive = location.pathname === path || (item.id === 'DASHBOARD' && location.pathname === `/${activeTenant?.id}`);

          return (
            <Link
              key={item.id}
              to={path}
              title={isCollapsed ? item.label : ''}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                ? 'text-white shadow-xl'
                : 'hover:bg-slate-800 hover:text-white'
                }`}
              style={isActive ? { backgroundColor: activeTenant?.primaryColor || '#6366f1' } : {}}
            >
              <div className="flex items-center gap-4">
                <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-indigo-400 transition-colors'} />
                {!isCollapsed && (
                  <span className="font-bold text-sm tracking-tight animate-in slide-in-from-left-2 duration-300">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 mt-auto border-t border-slate-800/50 space-y-2 ${isCollapsed ? 'items-center' : ''}`}>
        <button onClick={onLogout} className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} px-4 py-3 text-slate-400 hover:text-white transition-colors group`} title="Exit Session">
          <LogOut size={20} className="group-hover:text-rose-400" />
          {!isCollapsed && <span className="font-bold text-sm">Exit Session</span>}
        </button>

        <div className="hidden lg:block pt-2">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all border border-slate-700/30"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
