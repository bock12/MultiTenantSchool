
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
  Repeat
} from 'lucide-react';
import { View } from '../App';
import { Tenant } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isOpen: boolean;
  activeTenant: Tenant;
  onSwitchTenant: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, activeTenant, onSwitchTenant }) => {
  const menuItems = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'ADMISSIONS', icon: UserPlus, label: 'Admissions' },
    { id: 'STUDENTS', icon: Users, label: 'Students' },
    { id: 'CLASSROOMS', icon: School, label: 'Classrooms' },
    { id: 'ACADEMICS', icon: BookOpen, label: 'Academics' },
    { id: 'FINANCE', icon: Wallet, label: 'Finance' },
    { id: 'STAFF', icon: Briefcase, label: 'HR & Payroll' },
    { id: 'LIBRARY', icon: Library, label: 'Library' },
    { id: 'AI_INSIGHTS', icon: BrainCircuit, label: 'AI Analytics' },
    { id: 'MOBILE_SYNC', icon: Smartphone, label: 'Mobile Sync' },
  ];

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 lg:relative w-72 bg-slate-900 text-slate-400 flex flex-col h-screen overflow-y-auto no-scrollbar shrink-0 border-r border-slate-800 transition-all duration-300">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl shadow-lg" style={{ backgroundColor: activeTenant.primaryColor }}>
            <GraduationCap className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-tighter leading-none">EduNexus</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] font-black mt-1 text-slate-500">Multi-School OS</p>
          </div>
        </div>

        {/* Tenant Switcher */}
        <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 mb-4">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Active Institution</p>
           <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white truncate pr-2">{activeTenant.name}</p>
              <button 
                onClick={onSwitchTenant}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-indigo-400"
                title="Switch School"
              >
                <Repeat size={14} />
              </button>
           </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'text-white shadow-xl' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
              style={isActive ? { backgroundColor: activeTenant.primaryColor } : {}}
            >
              <div className="flex items-center gap-4">
                <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-indigo-400 transition-colors'} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800/50 space-y-2">
        <button 
          onClick={onSwitchTenant}
          className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white transition-colors group"
        >
          <LogOut size={20} className="group-hover:text-rose-400" />
          <span className="font-bold text-sm">Log Out / Exit</span>
        </button>
        <button className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white transition-colors">
          <Settings size={20} />
          <span className="font-bold text-sm">System Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;