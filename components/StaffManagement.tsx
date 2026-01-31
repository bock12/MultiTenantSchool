
import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  Briefcase, 
  DollarSign, 
  ExternalLink,
  Users,
  CalendarDays,
  CheckCircle2,
  XCircle,
  FileText,
  TrendingUp,
  Clock,
  IdCard,
  Crown,
  Edit2,
  X,
  ChevronDown
} from 'lucide-react';
import IDCardGenerator from './IDCardGenerator';
import { Staff, AcademicStream } from '../types';

interface StaffManagementProps {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ staff, setStaff }) => {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'LEAVE' | 'PAYROLL'>('DIRECTORY');
  const [selectedStaffForID, setSelectedStaffForID] = useState<Staff | null>(null);
  const [editingHOD, setEditingHOD] = useState<Staff | null>(null);

  const leaveRequests = [
    { name: 'Mr. Ian Malcolm', reason: 'Medical Checkup', dates: 'June 14 - June 15', status: 'PENDING' },
    { name: 'Ms. Ellie Sattler', reason: 'Academic Conference', dates: 'June 20 - June 22', status: 'APPROVED' },
    { name: 'Dr. Alan Grant', reason: 'Field Research', dates: 'July 01 - July 05', status: 'PENDING' },
  ];

  const handleUpdateHOD = (staffId: string, isHOD: boolean, department?: string) => {
    setStaff(prev => prev.map(s => 
      s.id === staffId ? { ...s, isHOD, department: department || s.department } : s
    ));
    setEditingHOD(null);
  };

  const STREAMS: AcademicStream[] = ['SCIENCE', 'ART', 'COMMERCIAL', 'GENERAL'];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">HR & Payroll</h2>
          <p className="text-slate-500 mt-1">Manage employee contracts, attendance records, and salary distribution.</p>
        </div>
        <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
          Add Employee
        </button>
      </div>

      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit mb-8 shadow-sm">
        <button 
          onClick={() => setActiveTab('DIRECTORY')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'DIRECTORY' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Users size={16} /> Directory
        </button>
        <button 
          onClick={() => setActiveTab('LEAVE')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'LEAVE' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <CalendarDays size={16} /> Leave Requests
        </button>
        <button 
          onClick={() => setActiveTab('PAYROLL')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'PAYROLL' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <DollarSign size={16} /> Payroll
        </button>
      </div>

      {activeTab === 'DIRECTORY' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <HRStat label="Total Staff" value={staff.length.toString()} sub="Verified Records" icon={<Briefcase />} />
            <HRStat label="On Campus" value={(staff.length - 1).toString()} sub="Active Status" icon={<UserCheck />} />
            <HRStat label="Heads of Dept" value={staff.filter(s => s.isHOD).length.toString()} sub="Institutional Leaders" icon={<Crown />} />
            <HRStat label="New Hires" value="2" sub="Onboarding" icon={<TrendingUp />} />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {staff.map((s, i) => (
                <div key={s.id} className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={`https://picsum.photos/id/${(i % 50) + 20}/100/100`} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm" alt="" />
                      {s.isHOD && (
                        <div className="absolute -top-2 -right-2 p-1 bg-amber-500 text-white rounded-lg shadow-lg border-2 border-white">
                          <Crown size={12} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">{s.name}</h4>
                        {s.isHOD && <span className="text-[8px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded uppercase tracking-widest">HOD</span>}
                      </div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">{s.role} • <span className="text-indigo-600">{s.department}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingHOD(s)}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      title="Manage HOD Status"
                    >
                      <Crown size={18} />
                    </button>
                    <button 
                      onClick={() => setSelectedStaffForID(s)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Generate ID Card"
                    >
                      <IdCard size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg">
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HOD Designation Modal */}
      {editingHOD && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingHOD(null)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/30">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 rounded-xl text-white shadow-lg">
                    <Crown size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase">Departmental Leadership</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Appoint Head of Department</p>
                  </div>
               </div>
               <button onClick={() => setEditingHOD(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                 <X size={24} />
               </button>
             </div>
             <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <img src={`https://picsum.photos/id/40/100/100`} className="w-12 h-12 rounded-xl object-cover" alt="" />
                   <div>
                      <p className="text-sm font-black text-slate-900">{editingHOD.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{editingHOD.role}</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Leadership Designation</label>
                   <button 
                     onClick={() => handleUpdateHOD(editingHOD.id, !editingHOD.isHOD)}
                     className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all border-2 ${editingHOD.isHOD ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100' : 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100'}`}
                   >
                     {editingHOD.isHOD ? <><XCircle size={18} /> Revoke HOD Status</> : <><Crown size={18} /> Promote to HOD</>}
                   </button>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Department</label>
                   <div className="grid grid-cols-2 gap-2">
                     {STREAMS.map(stream => (
                       <button 
                         key={stream}
                         onClick={() => handleUpdateHOD(editingHOD.id, true, stream)}
                         className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${editingHOD.department === stream ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'}`}
                       >
                         {stream}
                       </button>
                     ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* ID Card Modal for Staff */}
      {selectedStaffForID && (
        <IDCardGenerator 
          type="STAFF" 
          data={selectedStaffForID} 
          onClose={() => setSelectedStaffForID(null)} 
        />
      )}

      {activeTab === 'LEAVE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Reason / Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaveRequests.map((req, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{req.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{req.reason}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <Clock size={12} /> {req.dates}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><CheckCircle2 size={18} /></button>
                       <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><XCircle size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'PAYROLL' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Monthly Budget</p>
              <h3 className="text-3xl font-black text-slate-900">${staff.reduce((acc, s) => acc + s.salary, 0).toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                <span className="text-sm font-bold text-slate-700 uppercase">Ready for Processing</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Next Payout</p>
                <p className="text-sm font-bold text-slate-900">June 30, 2024</p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md">Run Payroll</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
               <h3 className="font-bold text-slate-900">Salary Breakdown</h3>
               <button className="text-indigo-600 text-xs font-bold flex items-center gap-2">
                 <FileText size={14} /> Download Summary
               </button>
             </div>
             <div className="divide-y divide-slate-100">
               {staff.map((s, i) => (
                 <div key={i} className="px-6 py-4 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                       <DollarSign size={20} />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-slate-900">{s.name}</h4>
                       <p className="text-xs text-slate-500">Net Salary</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-black text-slate-900">${s.salary.toLocaleString()}</p>
                     <p className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5">Verified</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HRStat: React.FC<{ label: string, value: string, sub: string, icon: React.ReactNode }> = ({ label, value, sub, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-colors">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors mb-4">
      {icon}
    </div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    <h4 className="text-2xl font-black text-slate-900 mt-1">{value}</h4>
    <p className="text-xs text-slate-500 mt-1.5">{sub}</p>
  </div>
);

export default StaffManagement;
