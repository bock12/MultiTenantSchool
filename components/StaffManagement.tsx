
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
  IdCard
} from 'lucide-react';
import IDCardGenerator from './IDCardGenerator';
import { Staff } from '../types';

interface StaffManagementProps {
  /* Fixed: Added staff prop */
  staff?: Staff[];
}

const StaffManagement: React.FC<StaffManagementProps> = ({ staff: propStaff }) => {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'LEAVE' | 'PAYROLL'>('DIRECTORY');
  const [selectedStaffForID, setSelectedStaffForID] = useState<Staff | null>(null);

  /* Fixed: Added tenantId to local mock staff data */
  const localStaff: Staff[] = [
    { id: '1', tenantId: 'T1', name: 'Dr. Alan Grant', role: 'Head of Science', department: 'Science', joiningDate: '2020-01-15', salary: 6500 },
    { id: '2', tenantId: 'T1', name: 'Ms. Ellie Sattler', role: 'Senior Lecturer', department: 'Humanities', joiningDate: '2021-03-22', salary: 5200 },
    { id: '3', tenantId: 'T1', name: 'Mr. Ian Malcolm', role: 'Mathematics Teacher', department: 'STEM', joiningDate: '2022-08-10', salary: 4800 },
    { id: '4', tenantId: 'T1', name: 'Mrs. Claire Dearing', role: 'Admin Coordinator', department: 'Administration', joiningDate: '2019-11-05', salary: 4500 },
  ];

  const staff = propStaff || localStaff;

  const leaveRequests = [
    { name: 'Mr. Ian Malcolm', reason: 'Medical Checkup', dates: 'June 14 - June 15', status: 'PENDING' },
    { name: 'Ms. Ellie Sattler', reason: 'Academic Conference', dates: 'June 20 - June 22', status: 'APPROVED' },
    { name: 'Dr. Alan Grant', reason: 'Field Research', dates: 'July 01 - July 05', status: 'PENDING' },
  ];

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
            <HRStat label="Contract Renewals" value="3" sub="Due this month" icon={<ShieldCheck />} />
            <HRStat label="New Hires" value="2" sub="Onboarding" icon={<TrendingUp />} />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {staff.map((s, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <img src={`https://picsum.photos/id/${(i % 50) + 20}/100/100`} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" alt="" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{s.name}</h4>
                      <p className="text-xs text-slate-500 uppercase tracking-tighter">{s.role} • {s.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedStaffForID(s)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Generate ID Card"
                    >
                      <IdCard size={18} />
                    </button>
                    <div className="flex items-center gap-2 min-w-[100px] justify-end">
                      <span className={`w-2 h-2 rounded-full ${s.name === 'Mr. Ian Malcolm' ? 'bg-slate-300' : 'bg-emerald-500'}`}></span>
                      <span className="text-xs font-medium text-slate-600">{s.name === 'Mr. Ian Malcolm' ? 'Away' : 'On Campus'}</span>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-indigo-600">
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              ))}
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
