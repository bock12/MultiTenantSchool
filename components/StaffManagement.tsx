
import React, { useState, useRef } from 'react';
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
  ChevronDown,
  UserPlus,
  Camera,
  Plus,
  Calendar
} from 'lucide-react';
import IDCardGenerator from './IDCardGenerator';
import { Staff, AcademicStream, Tenant } from '../types';
import { supabase } from '../lib/supabase';

interface StaffManagementProps {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  activeTenant: Tenant;
}

const STREAMS: AcademicStream[] = ['SCIENCE', 'ART', 'COMMERCIAL', 'GENERAL'];

const StaffManagement: React.FC<StaffManagementProps> = ({ staff, setStaff, activeTenant }) => {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'LEAVE' | 'PAYROLL'>('DIRECTORY');
  const [selectedStaffForID, setSelectedStaffForID] = useState<Staff | null>(null);
  const [editingHOD, setEditingHOD] = useState<Staff | null>(null);
  const [isAddingStaff, setIsAddingStaff] = useState(false);

  // New Staff Form State
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    role: '',
    department: 'GENERAL' as AcademicStream,
    joiningDate: new Date().toISOString().split('T')[0],
    salary: 3000,
    isHOD: false,
    profilePicture: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const leaveRequests = [
    { name: 'Mr. Ian Malcolm', reason: 'Medical Checkup', dates: 'June 14 - June 15', status: 'PENDING' },
    { name: 'Ms. Ellie Sattler', reason: 'Academic Conference', dates: 'June 20 - June 22', status: 'APPROVED' },
    { name: 'Dr. Alan Grant', reason: 'Field Research', dates: 'July 01 - July 05', status: 'PENDING' },
  ];

  const handleUpdateHOD = async (staffId: string, isHOD: boolean, department?: string) => {
    const updatedStaff = staff.map(s =>
      s.id === staffId ? { ...s, isHOD, department: department || s.department } : s
    );
    setStaff(updatedStaff);
    setEditingHOD(null);

    // Supabase Sync
    const { error } = await supabase
      .from('staff')
      .update({
        is_hod: isHOD,
        department: department || (staff.find(s => s.id === staffId)?.department)
      })
      .eq('id', staffId);

    if (error) console.error('Failed to update HOD status:', error);
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStaffForm(prev => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempId = `STF${Date.now()}`;
    const newEmployee: Staff = {
      id: tempId,
      tenantId: activeTenant.id,
      name: newStaffForm.name,
      role: newStaffForm.role,
      department: newStaffForm.department,
      joiningDate: newStaffForm.joiningDate,
      salary: newStaffForm.salary,
      isHOD: newStaffForm.isHOD
    };

    // Optimistic Update
    setStaff(prev => [...prev, newEmployee]);
    setIsAddingStaff(false);

    // Supabase Sync
    const { data, error } = await supabase
      .from('staff')
      .insert({
        tenant_id: activeTenant.id,
        name: newEmployee.name,
        role: newEmployee.role,
        department: newEmployee.department,
        joining_date: newEmployee.joiningDate,
        salary: newEmployee.salary,
        is_hod: newEmployee.isHOD
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add staff:', error);
    } else if (data) {
      setStaff(prev => prev.map(s => s.id === tempId ? { ...s, id: data.id } : s));
    }

    setNewStaffForm({
      name: '',
      role: '',
      department: 'GENERAL',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 3000,
      isHOD: false,
      profilePicture: ''
    });
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight">HR & Payroll</h2>
          <p className="text-sm text-slate-500 font-medium">Manage employee contracts, attendance records, and salary distribution.</p>
        </div>
        <button
          onClick={() => setIsAddingStaff(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <UserPlus size={18} /> Add Employee
        </button>
      </div>

      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit mb-8 shadow-sm overflow-x-auto no-scrollbar max-w-full">
        <button
          onClick={() => setActiveTab('DIRECTORY')}
          className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'DIRECTORY' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Users size={16} /> Directory
        </button>
        <button
          onClick={() => setActiveTab('LEAVE')}
          className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'LEAVE' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <CalendarDays size={16} /> Leave
        </button>
        <button
          onClick={() => setActiveTab('PAYROLL')}
          className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === 'PAYROLL' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <DollarSign size={16} /> Payroll
        </button>
      </div>

      {activeTab === 'DIRECTORY' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <HRStat label="Total Staff" value={staff.length.toString()} sub="Verified Records" icon={<Briefcase />} />
            <HRStat label="On Campus" value={(staff.length > 0 ? staff.length - 1 : 0).toString()} sub="Active Status" icon={<UserCheck />} />
            <HRStat label="Heads of Dept" value={staff.filter(s => s.isHOD).length.toString()} sub="Institutional Leaders" icon={<Crown />} />
            <HRStat label="New Hires" value="2" sub="Onboarding" icon={<TrendingUp />} />
          </div>
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {staff.map((s, i) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <img src={`https://picsum.photos/id/${(i % 50) + 20}/100/100`} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm" alt="" />
                            {s.isHOD && (
                              <div className="absolute -top-2 -right-2 p-1 bg-amber-500 text-white rounded-lg shadow-lg border-2 border-white">
                                <Crown size={12} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-slate-900 truncate">{s.name}</h4>
                              {s.isHOD && <span className="text-[8px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded uppercase tracking-widest hidden sm:inline">HOD</span>}
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight truncate">{s.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-widest">{s.department}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Active</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 md:gap-2">
                          <button
                            onClick={() => setEditingHOD(s)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                            title="Manage HOD Status"
                          >
                            <Crown size={18} />
                          </button>
                          <button
                            onClick={() => setSelectedStaffForID(s)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Generate ID Card"
                          >
                            <IdCard size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            <ExternalLink size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddingStaff && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsAddingStaff(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[95vh] flex flex-col">
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30 shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight">New Employee Registration</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Faculty & Staff Onboarding Portal</p>
                </div>
              </div>
              <button onClick={() => setIsAddingStaff(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">
              {/* Profile Pic Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-8 bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-200">
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2.5rem] bg-white border-4 border-white shadow-xl overflow-hidden relative flex items-center justify-center">
                    {newStaffForm.profilePicture ? (
                      <img src={newStaffForm.profilePicture} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="text-indigo-200">
                        <Users size={52} />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-white"
                  >
                    <Camera size={20} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                  />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h4 className="text-lg font-black text-slate-900 leading-tight">Faculty Identity Portrait</h4>
                  <p className="text-sm text-slate-500 font-medium">Clear frontal image for ID card and portal access. Max 2MB.</p>
                  <div className="flex items-center gap-3 justify-center sm:justify-start pt-1">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 uppercase tracking-tighter">Required</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Full Legal Name">
                    <input
                      required
                      type="text"
                      placeholder="First Middle Last"
                      value={newStaffForm.name}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup label="Institutional Role">
                    <input
                      required
                      type="text"
                      placeholder="e.g. Senior Math Teacher"
                      value={newStaffForm.role}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                    />
                  </FormGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Departmental Assignment">
                    <select
                      value={newStaffForm.department}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, department: e.target.value as AcademicStream })}
                      className="appearance-none font-bold"
                    >
                      {STREAMS.map(s => <option key={s} value={s}>{s} DEPARTMENT</option>)}
                    </select>
                  </FormGroup>
                  <FormGroup label="Commencement Date">
                    <div className="relative">
                      <input
                        required
                        type="date"
                        value={newStaffForm.joiningDate}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, joiningDate: e.target.value })}
                      />
                    </div>
                  </FormGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Gross Monthly Salary ($)">
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        required
                        type="number"
                        className="pl-12"
                        value={newStaffForm.salary}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, salary: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </FormGroup>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Leadership Status</label>
                    <button
                      type="button"
                      onClick={() => setNewStaffForm({ ...newStaffForm, isHOD: !newStaffForm.isHOD })}
                      className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all border-2 ${newStaffForm.isHOD ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-white'}`}
                    >
                      {newStaffForm.isHOD ? <><Crown size={18} /> Head of Department Assigned</> : <><ShieldCheck size={18} /> Standard Faculty Member</>}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20 -mr-16 -mt-16"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                    <ShieldCheck className="text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black tracking-tight leading-tight uppercase">Credential Confirmation</h4>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em] mt-0.5">Automated ERP Account Generation</p>
                  </div>
                </div>
                <p className="text-indigo-100/80 text-sm font-medium leading-relaxed">
                  Finalizing this record will automatically generate an institutional email, initialize the payroll ledger for June 2024, and grant access to the EduNexus ERP mobile ecosystem.
                </p>
              </div>
            </form>

            <div className="p-6 md:p-8 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddingStaff(false)}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors order-2 sm:order-1"
              >
                Abort Onboarding
              </button>
              <button
                onClick={handleAddStaffSubmit}
                type="submit"
                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                <CheckCircle2 size={18} /> Finalize Recruitment
              </button>
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
                  <h3 className="text-lg font-black text-slate-900 uppercase leading-tight">Departmental Leadership</h3>
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
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{editingHOD.name}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase truncate">{editingHOD.role}</p>
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
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5">Employee</th>
                  <th className="px-6 py-5">Reason / Duration</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveRequests.map((req, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-slate-900">{req.name}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-700 font-medium">{req.reason}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1 font-bold">
                        <Clock size={12} /> {req.dates}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><CheckCircle2 size={18} /></button>
                        <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><XCircle size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PAYROLL' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Monthly Budget</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">${staff.reduce((acc, s) => acc + s.salary, 0).toLocaleString()}</h3>
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase">+4.2% vs Last Month</span>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Status</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                <span className="text-sm font-black text-slate-700 uppercase tracking-tighter">Ready for Disbursement</span>
              </div>
            </div>
            <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-100 flex items-center justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full translate-x-4 -translate-y-4"></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Next Cycle</p>
                <p className="text-xl font-black text-white tracking-tight leading-none">June 30, 2024</p>
              </div>
              <button className="relative z-10 px-5 py-3 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg active:scale-95">Run Batch</button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none">Salary Breakdown</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Net Pay & Adjustments</p>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all border border-indigo-50/50">
                <FileText size={16} /> Audit Logs
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {staff.map((s, i) => (
                <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{s.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{s.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 tracking-tight">${s.salary.toLocaleString()}</p>
                    <p className="text-[9px] text-emerald-600 font-black uppercase mt-0.5 tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded">Verified</p>
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
  <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all hover:shadow-lg hover:shadow-indigo-500/5">
    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all mb-5 group-hover:scale-110">
      {icon}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{value}</h4>
    <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest">{sub}</p>
  </div>
);

function FormGroup({ label, children, className = "" }: { label: string, children?: React.ReactElement, className?: string }) {
  if (!children) return null;
  return (
    <div className={`space-y-2.5 ${className}`}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
      {React.cloneElement(children, {
        className: `w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] md:rounded-2xl outline-none text-sm font-bold transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white placeholder:text-slate-300 ${(children.props as any)?.className || ""}`
      } as any)}
    </div>
  );
}

export default StaffManagement;
