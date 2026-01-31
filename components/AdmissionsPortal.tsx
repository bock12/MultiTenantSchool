
import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Calendar,
  ExternalLink,
  ChevronLeft,
  X,
  UserCheck,
  Check,
  UserPlus,
  Phone,
  Mail,
  User,
  Camera,
  FileUp,
  FileText,
  Trash2,
  Paperclip,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Eye,
  Clock,
  MapPin,
  HeartPulse,
  Settings2
} from 'lucide-react';
import { AdmissionStatus, AdmissionApplication, Student, StudentDocument, Tenant } from '../types';

interface AdmissionsPortalProps {
  admissions: AdmissionApplication[];
  setAdmissions: React.Dispatch<React.SetStateAction<AdmissionApplication[]>>;
  onUpdateStatus: (appId: string, status: AdmissionStatus) => void;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  /* Fixed: Added activeTenant prop */
  activeTenant: Tenant;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const AdmissionsPortal: React.FC<AdmissionsPortalProps> = ({ admissions, setAdmissions, onUpdateStatus, students, setStudents, activeTenant }) => {
  const [viewMode, setViewMode] = useState<'ADMIN' | 'PUBLIC'>('ADMIN');
  const [isManualEnrolling, setIsManualEnrolling] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<AdmissionStatus | 'ALL'>('ALL');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [isPublicSubmitted, setIsPublicSubmitted] = useState(false);
  
  const publicFileInputRef = useRef<HTMLInputElement>(null);
  const publicDocInputRef = useRef<HTMLInputElement>(null);

  // Public Form State
  const [publicForm, setPublicForm] = useState({
    name: '',
    dob: '',
    gender: 'O' as 'M' | 'F' | 'O',
    bloodGroup: '',
    grade: 'Grade 9',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    profilePicture: '',
    documents: [] as StudentDocument[]
  });

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPublicForm(prev => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newDoc: StudentDocument = {
            name: file.name,
            type: file.type,
            size: (file.size / 1024).toFixed(1) + ' KB',
            url: reader.result as string,
            category: 'ACADEMIC',
            uploadDate: new Date().toISOString().split('T')[0]
          };
          setPublicForm(prev => ({ ...prev, documents: [...prev.documents, newDoc] }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeDoc = (index: number) => {
    setPublicForm(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== index) }));
  };

  const handlePublicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    /* Fixed: Added tenantId to the application object */
    const newApplication: AdmissionApplication = {
      id: `APP-${Date.now()}`,
      tenantId: activeTenant.id,
      studentName: publicForm.name,
      parentName: publicForm.parentName,
      gradeApplying: publicForm.grade,
      contactEmail: publicForm.parentEmail,
      status: AdmissionStatus.PENDING,
      dateApplied: new Date().toISOString().split('T')[0],
      dob: publicForm.dob,
      gender: publicForm.gender,
      bloodGroup: publicForm.bloodGroup,
      parentPhone: publicForm.parentPhone,
      address: publicForm.address,
      profilePicture: publicForm.profilePicture,
      documents: publicForm.documents
    };
    setAdmissions([newApplication, ...admissions]);
    setIsPublicSubmitted(true);
  };

  const resetPublicForm = () => {
    setPublicForm({
      name: '', dob: '', gender: 'O', bloodGroup: '', 
      grade: 'Grade 9', parentName: '', 
      parentPhone: '', parentEmail: '', address: '', 
      profilePicture: '', documents: []
    });
    setIsPublicSubmitted(false);
  };

  const filteredAdmissions = admissions.filter(app => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesSearch = app.studentName.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
                         app.parentName.toLowerCase().includes(adminSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (viewMode === 'PUBLIC') {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-20">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <GraduationCap size={24} />
              </div>
              <h1 className="font-black text-xl text-slate-900 tracking-tight">EduNexus Admissions</h1>
            </div>
            <button onClick={() => { setViewMode('ADMIN'); resetPublicForm(); }} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors group">
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Exit to Admin
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-8 md:mt-12">
          {isPublicSubmitted ? (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl p-10 md:p-20 text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <Check size={48} strokeWidth={3} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Application Received!</h2>
              <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto">Reference: <span className="font-bold text-slate-900">#ADM-{Math.floor(100000 + Math.random() * 900000)}</span></p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={resetPublicForm} className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Submit Another</button>
                <button onClick={() => setViewMode('ADMIN')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Return to Dashboard</button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-700">
              <div className="bg-slate-900 px-6 md:px-12 py-10 md:py-16 text-white text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm">
                    <UserPlus size={40} className="text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Student Application</h2>
                    <p className="text-slate-400 mt-2 text-base md:text-lg font-medium">Start your journey at EduNexus.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePublicSubmit} className="p-6 md:p-12 space-y-12">
                <div className="space-y-8">
                  <h3 className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-4">
                    <User size={16} /> 01. Student Information
                  </h3>
                  <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50/50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                    <div className="relative shrink-0">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                        {publicForm.profilePicture ? <img src={publicForm.profilePicture} className="w-full h-full object-cover" alt="" /> : <Camera size={40} className="text-slate-200" />}
                      </div>
                      <button type="button" onClick={() => publicFileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform"><Plus size={18} /></button>
                      <input type="file" ref={publicFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleProfileImageChange(e)} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-base font-bold text-slate-900">Applicant Portrait</p>
                      <p className="text-sm text-slate-500 mt-1 font-medium">Passport-style photo for identity verification.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <FormGroup label="Full Legal Name" className="sm:col-span-2">
                      <input required type="text" placeholder="First Middle Surname" value={publicForm.name} onChange={(e) => setPublicForm({...publicForm, name: e.target.value})} />
                    </FormGroup>
                    <FormGroup label="Date of Birth">
                      <input required type="date" value={publicForm.dob} onChange={(e) => setPublicForm({...publicForm, dob: e.target.value})} />
                    </FormGroup>
                    <FormGroup label="Grade Applying For">
                      <select required value={publicForm.grade} onChange={(e) => setPublicForm({...publicForm, grade: e.target.value})}>
                        {['Grade 1', 'Grade 5', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="Gender">
                      <div className="flex gap-2">
                        {(['M', 'F', 'O'] as const).map(g => (
                          <button key={g} type="button" onClick={() => setPublicForm({...publicForm, gender: g})} className={`flex-1 py-3.5 rounded-xl text-xs font-black border ${publicForm.gender === g ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-white'}`}>
                            {g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other'}
                          </button>
                        ))}
                      </div>
                    </FormGroup>
                    <FormGroup label="Blood Group">
                      <select value={publicForm.bloodGroup} onChange={(e) => setPublicForm({...publicForm, bloodGroup: e.target.value})}>
                        <option value="">N/A</option>
                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </FormGroup>
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-4">
                    <ShieldCheck size={16} /> 02. Guardian & Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormGroup label="Parent / Guardian Name">
                      <input required type="text" placeholder="e.g. Robert Wright" value={publicForm.parentName} onChange={(e) => setPublicForm({...publicForm, parentName: e.target.value})} />
                    </FormGroup>
                    <FormGroup label="Primary Phone">
                      <input required type="tel" placeholder="+1 (555) 000-0000" value={publicForm.parentPhone} onChange={(e) => setPublicForm({...publicForm, parentPhone: e.target.value})} />
                    </FormGroup>
                    <FormGroup label="Email Address">
                      <input required type="email" placeholder="guardian@email.com" value={publicForm.parentEmail} onChange={(e) => setPublicForm({...publicForm, parentEmail: e.target.value})} />
                    </FormGroup>
                    <FormGroup label="Home Address" className="md:col-span-2">
                      <textarea rows={2} placeholder="Full street address..." value={publicForm.address} onChange={(e) => setPublicForm({...publicForm, address: e.target.value})} className="resize-none w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"></textarea>
                    </FormGroup>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-indigo-50 pb-4">
                    <h3 className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest"><Paperclip size={16} /> 03. Documentation</h3>
                    <button type="button" onClick={() => publicDocInputRef.current?.click()} className="text-xs font-black text-indigo-600 flex items-center gap-1 hover:underline uppercase tracking-tighter"><Plus size={14} /> Attach Files</button>
                    <input type="file" multiple ref={publicDocInputRef} className="hidden" onChange={(e) => handleDocUpload(e)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {publicForm.documents.length > 0 ? publicForm.documents.map((doc, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between group hover:border-indigo-300 transition-all">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><FileText size={20} /></div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{doc.size} • {doc.type.split('/')[1]?.toUpperCase()}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeDoc(idx)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    )) : (
                      <div onClick={() => publicDocInputRef.current?.click()} className="col-span-1 sm:col-span-2 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 flex flex-col items-center justify-center text-slate-400 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer group">
                        <div className="p-5 bg-slate-50 rounded-full group-hover:bg-white mb-4 transition-all"><FileUp size={40} className="opacity-40" /></div>
                        <p className="text-sm font-bold text-slate-600">Upload Academic Records</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-10">
                  <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3">Submit Application <ArrowRight size={20} /></button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admission Control Center</h2>
          <p className="text-slate-500 mt-1 font-medium">Review and process student applications for the upcoming term.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setViewMode('PUBLIC')} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            <ExternalLink size={18} className="text-indigo-600" /> Open Public Portal
          </button>
          <button onClick={() => setViewMode('PUBLIC')} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
            <Plus size={18} /> New Application
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', ...Object.values(AdmissionStatus)] as const).map((status) => (
              <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-tight ${statusFilter === status ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{status}</button>
            ))}
          </div>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search applications..." value={adminSearchQuery} onChange={(e) => setAdminSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Applying For</th>
                <th className="px-6 py-4">Date Applied</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdmissions.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{app.studentName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{app.contactEmail}</p>
                  </td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest">{app.gradeApplying}</span></td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{app.dateApplied}</td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block">
                      <select 
                        value={app.status}
                        disabled={app.status === AdmissionStatus.ACCEPTED}
                        onChange={(e) => onUpdateStatus(app.id, e.target.value as AdmissionStatus)}
                        className={`appearance-none px-3 py-1.5 pr-8 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer disabled:cursor-default ${
                          app.status === AdmissionStatus.ACCEPTED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          app.status === AdmissionStatus.REJECTED ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          app.status === AdmissionStatus.INTERVIEW ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}
                      >
                        {Object.values(AdmissionStatus).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {app.status !== AdmissionStatus.ACCEPTED && <ChevronLeft size={10} className="absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none opacity-40" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedApplication(app)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye size={18} /></button>
                        {app.status !== AdmissionStatus.ACCEPTED && (
                          <button onClick={() => onUpdateStatus(app.id, AdmissionStatus.ACCEPTED)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Approve & Enroll"><UserCheck size={18} /></button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedApplication(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><FileText size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Application Review</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Reference: {selectedApplication.id}</p>
                  </div>
               </div>
               <button onClick={() => setSelectedApplication(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
               <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-100 overflow-hidden ring-4 ring-slate-50 shadow-lg">
                    {selectedApplication.profilePicture ? <img src={selectedApplication.profilePicture} className="w-full h-full object-cover" /> : <User size={40} className="text-slate-200 mx-auto mt-6" />}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 leading-tight">{selectedApplication.studentName}</h4>
                    <p className="text-indigo-600 font-bold uppercase text-xs tracking-widest mt-1">Applying for {selectedApplication.gradeApplying}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <DetailBox label="Birth Date" value={selectedApplication.dob || 'N/A'} icon={<Calendar size={14} />} />
                  <DetailBox label="Gender" value={selectedApplication.gender === 'M' ? 'Male' : selectedApplication.gender === 'F' ? 'Female' : 'Other'} icon={<User size={14} />} />
                  <DetailBox label="Parent Name" value={selectedApplication.parentName} icon={<ShieldCheck size={14} />} />
                  <DetailBox label="Blood Group" value={selectedApplication.bloodGroup || 'N/A'} icon={<HeartPulse size={14} />} />
                  <DetailBox label="Contact Email" value={selectedApplication.contactEmail} icon={<Mail size={14} />} className="col-span-2" />
                  <DetailBox label="Address" value={selectedApplication.address || 'Not Provided'} icon={<MapPin size={14} />} className="col-span-2" />
               </div>

               <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Settings2 size={14} /> Pipeline Management</h5>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(AdmissionStatus).map(s => (
                      <button
                        key={s}
                        disabled={selectedApplication.status === AdmissionStatus.ACCEPTED}
                        onClick={() => {
                          onUpdateStatus(selectedApplication.id, s);
                          setSelectedApplication(null);
                        }}
                        className={`flex-1 min-w-[120px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          selectedApplication.status === s 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 disabled:opacity-50'
                        }`}
                      >
                        Set to {s}
                      </button>
                    ))}
                  </div>
               </div>

               {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                 <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Paperclip size={14} /> Attached Credentials</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedApplication.documents.map((doc, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                           <FileText size={18} className="text-indigo-500" />
                           <div className="overflow-hidden">
                              <p className="text-[10px] font-bold text-slate-900 truncate">{doc.name}</p>
                              <p className="text-[8px] text-slate-400 font-bold uppercase">{doc.size}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-white shrink-0 flex gap-3">
               <button 
                 onClick={() => {
                   onUpdateStatus(selectedApplication.id, AdmissionStatus.REJECTED);
                   setSelectedApplication(null);
                 }}
                 className="flex-1 py-4 bg-white border border-slate-200 text-rose-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-50 transition-all"
               >Reject Application</button>
               {selectedApplication.status !== AdmissionStatus.ACCEPTED && (
                 <button 
                   onClick={() => {
                     onUpdateStatus(selectedApplication.id, AdmissionStatus.ACCEPTED);
                     setSelectedApplication(null);
                   }}
                   className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                 ><UserCheck size={18} /> Approve & Finalize Enrollment</button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailBox = ({ label, value, icon, className = "" }: { label: string, value: string, icon: React.ReactNode, className?: string }) => (
  <div className={`p-4 bg-slate-50 rounded-2xl border border-slate-100 ${className}`}>
     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">{icon} {label}</p>
     <p className="text-sm font-bold text-slate-900">{value}</p>
  </div>
);

const FormGroup = ({ label, children, className = "" }: { label: string, children: React.ReactNode, className?: string }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    {React.cloneElement(children as React.ReactElement<any>, {
      className: `w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white ${(children as any).props?.className || ""}`
    })}
  </div>
);

export default AdmissionsPortal;
