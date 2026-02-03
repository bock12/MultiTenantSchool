
import React from 'react';
import { 
  FileCheck, 
  Trophy, 
  ShieldAlert, 
  ArrowUpRight, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  LayoutGrid,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  Calculator,
  Users,
  Briefcase,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Subject, Student } from '../types';
import { View } from '../App';

interface ExamOfficerDashboardProps {
  subjects: Subject[];
  students: Student[];
  setCurrentView?: (view: View) => void;
}

const ExamOfficerDashboard: React.FC<ExamOfficerDashboardProps> = ({ subjects, students, setCurrentView }) => {
  const pendingApprovals = [
    { id: '1', subject: 'Mathematics', grade: 'SSS1', term: 'SECOND', teacher: 'Dr. Alan Grant', status: 'WAITING_SIG' },
    { id: '2', subject: 'Science', grade: 'Grade 10', term: 'SECOND', teacher: 'Mr. Ian Malcolm', status: 'IN_REVIEW' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Exam & Results Control</h2>
          <p className="text-slate-500 font-medium mt-2">Institutional Results Pipeline & Transcripts OS</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Printer size={18} /> Bulk Report Cards
          </button>
          <button className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
            <Calculator size={18} /> Global Rank Recalculation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <OfficerStat label="Result Approval Queue" value="12" sub="Pending Verification" icon={<FileCheck />} color="indigo" />
        <OfficerStat label="Pass Percentage" value="84%" sub="AY 2024-25" icon={<Trophy />} color="emerald" />
        <OfficerStat label="Flagged Anomalies" value="3" sub="Score Discrepancies" icon={<ShieldAlert />} color="rose" />
        <OfficerStat label="Transcripts Issued" value="142" sub="Last 30 Days" icon={<FileSpreadsheet />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Results Approval Ledger</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Second Term 2024</p>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => setCurrentView?.('ACADEMICS')}
                     className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all"
                   >
                     <BookOpen size={12} /> Audit Registry
                   </button>
                   <button className="p-3 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                      <LayoutGrid size={18} />
                   </button>
                </div>
             </div>
             <div className="divide-y divide-slate-100">
                {pendingApprovals.map(app => (
                   <div key={app.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all group">
                      <div className="flex items-center gap-5">
                         <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm group-hover:scale-105 transition-transform">
                            <Hash size={24} />
                         </div>
                         <div>
                            <div className="flex items-center gap-2">
                               <h4 className="text-base font-black text-slate-900">{app.subject}</h4>
                               <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase">{app.grade}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Submitted by: {app.teacher}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${app.status === 'IN_REVIEW' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {app.status.replace('_', ' ')}
                         </span>
                         <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                            Verify & Post
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <ModuleLink 
               label="Student Registry" 
               desc="Sync biometric data & enrollment status." 
               icon={<Users />} 
               color="indigo" 
               onClick={() => setCurrentView?.('STUDENTS')}
             />
             <ModuleLink 
               label="Staff & Faculty" 
               desc="Verify educator credentials & payroll." 
               icon={<Briefcase />} 
               color="emerald" 
               onClick={() => setCurrentView?.('STAFF')}
             />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20 -mr-16 -mt-16"></div>
             <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <Settings className="text-indigo-400" /> Exam Engine
             </h3>
             <div className="space-y-4">
                <EngineToggle label="Allow Score Edits" desc="Teachers can modify marks" enabled={true} />
                <EngineToggle label="Post Results to Portal" desc="Visible to parents/students" enabled={false} />
                <EngineToggle label="Calculate Position (RNK)" desc="Automatic rank processing" enabled={true} />
             </div>
             <button className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl">
                Deploy Term Consensus
             </button>
          </div>

          <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 space-y-4">
             <div className="flex items-center gap-3 text-amber-600">
                <AlertCircle size={24} />
                <h4 className="text-sm font-black uppercase tracking-widest">Protocol Alert</h4>
             </div>
             <p className="text-amber-700/80 text-xs font-medium leading-relaxed">
                Result posting for SSS3 Science is delayed. Average across "Mathematics" is 15% lower than historical term aggregate. Manual review triggered.
             </p>
             <button className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2 hover:underline">
                Investigate Discrepancy <ChevronRight size={14} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OfficerStat: React.FC<{ label: string, value: string, sub: string, icon: React.ReactNode, color: string }> = ({ label, value, sub, icon, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all hover:shadow-lg">
    <div className={`w-12 h-12 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-600 group-hover:scale-110 transition-transform mb-5`}>
      {icon}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{value}</h4>
    <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">{sub}</p>
  </div>
);

const EngineToggle: React.FC<{ label: string, desc: string, enabled: boolean }> = ({ label, desc, enabled }) => (
  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
     <div className="min-w-0">
        <p className="text-xs font-black text-white">{label}</p>
        <p className="text-[9px] font-medium text-slate-400 truncate">{desc}</p>
     </div>
     <div className={`w-10 h-5 rounded-full transition-colors relative ${enabled ? 'bg-indigo-500' : 'bg-slate-700'}`}>
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
     </div>
  </div>
);

const ModuleLink: React.FC<{ label: string, desc: string, icon: React.ReactNode, color: string, onClick: () => void }> = ({ label, desc, icon, color, onClick }) => (
  <div onClick={onClick} className="p-6 bg-white border border-slate-200 rounded-[2rem] flex items-start gap-4 hover:border-indigo-400 cursor-pointer group transition-all hover:shadow-xl">
     <div className={`p-3 bg-${color}-50 text-${color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>
        {icon}
     </div>
     <div className="min-w-0">
        <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">{label}</h4>
        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">{desc}</p>
        <p className="text-[9px] font-black text-indigo-500 mt-3 flex items-center gap-1 uppercase tracking-widest">
           Audit Module <ArrowRight size={10} />
        </p>
     </div>
  </div>
);

export default ExamOfficerDashboard;
