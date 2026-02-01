
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
  Settings2,
  ArrowRightCircle,
  School,
  History,
  FileBadge,
  Info
} from 'lucide-react';
import { AdmissionStatus, AdmissionApplication, Student, StudentDocument, Tenant, AcademicStream } from '../types';

interface AdmissionsPortalProps {
  admissions: AdmissionApplication[];
  setAdmissions: React.Dispatch<React.SetStateAction<AdmissionApplication[]>>;
  onUpdateStatus: (appId: string, status: AdmissionStatus, enrollmentData?: any) => void;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  activeTenant: Tenant;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const SECTIONS = ['1', '2', '3', '4', 'A', 'B', 'C', 'D'];
const STREAMS: AcademicStream[] = ['SCIENCE', 'ART', 'COMMERCIAL', 'GENERAL'];
const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3', 'Grade 10', 'Grade 11', 'Grade 12'];

const isSeniorGrade = (grade: string) => {
  return grade.startsWith('SSS') || grade.includes('10') || grade.includes('11') || grade.includes('12');
};

const AdmissionsPortal: React.FC<AdmissionsPortalProps> = ({ admissions, setAdmissions, onUpdateStatus, students, setStudents, activeTenant }) => {
  const [viewMode, setViewMode] = useState<'ADMIN' | 'PUBLIC'>('ADMIN');
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<AdmissionStatus | 'ALL'>('ALL');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [isPublicSubmitted, setIsPublicSubmitted] = useState(false);
  
  // Placement Confirmation Modal State
  const [isDeploying, setIsDeploying] = useState(false);
  const [appToDeploy, setAppToDeploy] = useState<AdmissionApplication | null>(null);
  const [deploymentForm, setDeploymentForm] = useState({
    grade: '',
    section: '1',
    stream: 'GENERAL' as AcademicStream
  });

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
    documents: [] as StudentDocument[],
    previousSchool: '',
    lastGradeCompleted: '',
    leavingReason: ''
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
      (Array.from(files) as File[]).forEach(file => {
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
      documents: publicForm.documents,
      previousSchool: publicForm.previousSchool,
      lastGradeCompleted: publicForm.lastGradeCompleted,
      leavingReason: publicForm.leavingReason
    };
    setAdmissions([newApplication, ...admissions]);
    setIsPublicSubmitted(true);
  };

  const resetPublicForm = () => {
    setPublicForm({
      name: '', dob: '', gender: 'O', bloodGroup: '', 
      grade: 'Grade 9', parentName: '', 
      parentPhone: '', parentEmail: '', address: '', 
      profilePicture: '', documents: [],
      previousSchool: '', lastGradeCompleted: '', leavingReason: ''
    });
    setIsPublicSubmitted(false);
  };

  const initiateDeployment = (app: AdmissionApplication) => {
    setAppToDeploy(app);
    setDeploymentForm({
      grade: app.gradeApplying,
      section: '1',
      stream: isSeniorGrade(app.gradeApplying) ? 'SCIENCE' : 'GENERAL'
    });
    setIsDeploying(true);
  };

  const finalizeDeployment = () => {
    if (!appToDeploy) return;
    onUpdateStatus(appToDeploy.id, AdmissionStatus.ACCEPTED, deploymentForm);
    setIsDeploying(false);
    setAppToDeploy(null);
    if (selectedApplication?.id === appToDeploy.id) setSelectedApplication(null);
  };

  const filteredAdmissions = admissions.filter(app => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesSearch = app.studentName.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
                         app.parentName.toLowerCase().includes(adminSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (viewMode === 'PUBLIC') {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-24">
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-100">
                <GraduationCap size={26} />
              </div>
              <div>
                <h1 className="font-black text-xl text-slate-900 tracking-tight leading-none">EduNexus</h1>
                <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mt-1">Admissions Portal</p>
              </div>
            </div>
            <button onClick={() => { setViewMode('ADMIN'); resetPublicForm(); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 font-black text-[10px] uppercase tracking-widest transition-all group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Return to Registry
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 mt-12">
          {isPublicSubmitted ? (
            <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl p-12 md:p-24 text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                <Check size={52} strokeWidth={3} />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Submission Successful</h2>
              <p className="text-slate-500 text-lg mb-12 max-w-lg mx-auto leading-relaxed">Your admission request has been logged. Our administrative team will review your application and contact you via email shortly.</p>
              
              <div className="bg-slate-50 rounded-3xl p-6 mb-12 max-w-sm mx-auto border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Application Reference</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">#ADM-{Math.floor(100000 + Math.random() * 900000)}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={resetPublicForm} className="px-10 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 transition-all">Submit Another</button>
                <button onClick={() => setViewMode('ADMIN')} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Finish & Return</button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
              <div className="bg-slate-900 p-10 md:p-16 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20 -mr-48 -mt-48"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="p-6 bg-white/5 rounded-[2.5rem] backdrop-blur-md border border-white/10 shadow-2xl">
                    <UserPlus size={52} className="text-indigo-400" />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">Admission Request</h2>
                    <p className="text-slate-400 mt-4 text-base md:text-xl font-medium max-w-md opacity-80">Please provide accurate academic and personal credentials to initialize your registration process.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePublicSubmit} className="p-8 md:p-16 space-y-20">
                {/* 01. Student Section */}
                <section className="space-y-10">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <User size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Student Credentials</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Identity & Biological Data</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-10 items-center bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100/50 group">
                    <div className="relative shrink-0">
                      <div className="w-40 h-40 rounded-[3rem] bg-white border-8 border-white shadow-2xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-[1.02] duration-500">
                        {publicForm.profilePicture ? <img src={publicForm.profilePicture} className="w-full h-full object-cover" alt="" /> : <div className="text-slate-200"><Camera size={48} /></div>}
                      </div>
                      <button type="button" onClick={() => publicFileInputRef.current?.click()} className="absolute -bottom-3 -right-3 p-4 bg-indigo-600 text-white rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-white"><Plus size={22} /></button>
                      <input type="file" ref={publicFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleProfileImageChange(e)} />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                      <p className="text-xl font-black text-slate-900 tracking-tight">Biometric Portrait</p>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">Please upload a high-resolution, passport-standard photo. This will be used for your institutional identity card and digital records.</p>
                      <div className="flex items-center gap-4 justify-center md:justify-start pt-2">
                         <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-white px-3 py-1 rounded-lg border border-slate-100"><Info size={12} className="text-indigo-500" /> Max 2MB</span>
                         <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-white px-3 py-1 rounded-lg border border-slate-100"><Check size={12} className="text-emerald-500" /> PNG / JPG</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    <FormGroup label="Full Legal Name" className="sm:col-span-2">
                      <input required type="text" placeholder="First Middle Surname" value={publicForm.name} onChange={(e) => setPublicForm({...publicForm, name: e.target.value})} className="h-14" />
                    </FormGroup>
                    <FormGroup label="Birth Date">
                      <input required type="date" value={publicForm.dob} onChange={(e) => setPublicForm({...publicForm, dob: e.target.value})} className="h-14" />
                    </FormGroup>
                    <FormGroup label="Target Grade Level">
                      <select required value={publicForm.grade} onChange={(e) => setPublicForm({...publicForm, grade: e.target.value})} className="h-14 appearance-none font-bold">
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="Gender Identification">
                      <div className="flex gap-2 h-14">
                        {(['M', 'F', 'O'] as const).map(g => (
                          <button key={g} type="button" onClick={() => setPublicForm({...publicForm, gender: g})} className={`flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${publicForm.gender === g ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-white hover:border-indigo-200 hover:text-indigo-500'}`}>
                            {g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other'}
                          </button>
                        ))}
                      </div>
                    </FormGroup>
                    <FormGroup label="Blood Type">
                      <select value={publicForm.bloodGroup} onChange={(e) => setPublicForm({...publicForm, bloodGroup: e.target.value})} className="h-14 appearance-none font-bold">
                        <option value="">N/A (Unknown)</option>
                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </FormGroup>
                  </div>
                </section>

                {/* 02. Academic History Section (NEW REFINEMENT) */}
                <section className="space-y-10">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <History size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Academic History</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Previous Institutional Records</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormGroup label="Previous Institution Name">
                      <input type="text" placeholder="Full name of last school attended" value={publicForm.previousSchool} onChange={(e) => setPublicForm({...publicForm, previousSchool: e.target.value})} className="h-14" />
                    </FormGroup>
                    <FormGroup label="Last Grade Completed">
                      <input type="text" placeholder="e.g. Grade 8 or JSS2" value={publicForm.lastGradeCompleted} onChange={(e) => setPublicForm({...publicForm, lastGradeCompleted: e.target.value})} className="h-14" />
                    </FormGroup>
                    <FormGroup label="Primary Reason for Transfer" className="md:col-span-2">
                      <textarea rows={2} placeholder="Explain briefly why you are seeking admission..." value={publicForm.leavingReason} onChange={(e) => setPublicForm({...publicForm, leavingReason: e.target.value})} className="resize-none w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none text-sm font-medium transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"></textarea>
                    </FormGroup>
                  </div>
                </section>

                {/* 03. Guardian Section */}
                <section className="space-y-10">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Guardian Oversight</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Responsible Adult & Emergency Contact</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormGroup label="Legal Guardian Name">
                      <input required type="text" placeholder="e.g. Robert Wright" value={publicForm.parentName} onChange={(e) => setPublicForm({...publicForm, parentName: e.target.value})} className="h-14" />
                    </FormGroup>
                    <FormGroup label="Emergency Mobile Number">
                      <div className="relative">
                        <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input required type="tel" placeholder="+1 (555) 000-0000" value={publicForm.parentPhone} onChange={(e) => setPublicForm({...publicForm, parentPhone: e.target.value})} className="h-14 pl-12" />
                      </div>
                    </FormGroup>
                    <FormGroup label="Primary Email Address">
                      <div className="relative">
                        <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input required type="email" placeholder="guardian@email.com" value={publicForm.parentEmail} onChange={(e) => setPublicForm({...publicForm, parentEmail: e.target.value})} className="h-14 pl-12" />
                      </div>
                    </FormGroup>
                    <FormGroup label="Residential Address" className="md:col-span-2">
                      <div className="relative">
                        <MapPin size={18} className="absolute left-5 top-6 text-slate-400" />
                        <textarea rows={3} placeholder="Full street address, city, state and zip..." value={publicForm.address} onChange={(e) => setPublicForm({...publicForm, address: e.target.value})} className="resize-none w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none text-sm font-medium transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"></textarea>
                      </div>
                    </FormGroup>
                  </div>
                </section>

                {/* 04. Documentation Section */}
                <section className="space-y-10">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                        <Paperclip size={22} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Institutional Verification</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Birth Certificates, Transcripts, ID</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => publicDocInputRef.current?.click()} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all font-black text-[10px] uppercase tracking-widest border border-indigo-100/50 shadow-sm shadow-indigo-100">
                      <Plus size={16} /> 
                      Attach Documents
                    </button>
                    <input type="file" multiple ref={publicDocInputRef} className="hidden" onChange={(e) => handleDocUpload(e)} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {publicForm.documents.length > 0 ? publicForm.documents.map((doc, idx) => (
                      <div key={idx} className="p-6 bg-white border border-slate-200 rounded-[2rem] flex items-center justify-between group hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm group-hover:scale-110 transition-transform"><FileText size={24} /></div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-black text-slate-900 truncate">{doc.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">{doc.size} • {doc.type.split('/')[1]?.toUpperCase()}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeDoc(idx)} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                      </div>
                    )) : (
                      <div onClick={() => publicDocInputRef.current?.click()} className="col-span-full border-2 border-dashed border-slate-200 rounded-[3rem] p-16 flex flex-col items-center justify-center text-slate-400 hover:bg-indigo-50/20 hover:border-indigo-200 transition-all cursor-pointer group shadow-inner">
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] group-hover:bg-white mb-6 transition-all shadow-sm group-hover:scale-110 duration-500">
                          <FileUp size={48} className="opacity-40 text-indigo-600" />
                        </div>
                        <p className="text-lg font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">Drag or click to upload</p>
                        <p className="text-sm text-slate-400 mt-1 font-medium">Valid documents: Academic reports, Identity proofs (Max 5 files)</p>
                      </div>
                    )}
                  </div>
                </section>

                <div className="pt-10">
                  <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4">
                    Finalize & Dispatch Application 
                    <ArrowRightCircle size={22} className="text-indigo-400" />
                  </button>
                  <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-6 opacity-60">By submitting, you agree to the EduNexus terms of service and data privacy policies.</p>
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
                          <button onClick={() => initiateDeployment(app)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Approve & Deploy"><UserCheck size={18} /></button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deployment Confirmation Modal */}
      {isDeploying && appToDeploy && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsDeploying(false)}></div>
           <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 border-b border-slate-100 bg-indigo-50/30 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                       <ArrowRightCircle size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 tracking-tight">Confirm Placement</h3>
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Deploying {appToDeploy.studentName}</p>
                    </div>
                 </div>
                 <button onClick={() => setIsDeploying(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                    <X size={24} />
                 </button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="Final Grade Level">
                       <select 
                         value={deploymentForm.grade}
                         onChange={(e) => {
                            const newGrade = e.target.value;
                            setDeploymentForm({
                               ...deploymentForm, 
                               grade: newGrade,
                               stream: isSeniorGrade(newGrade) ? 'SCIENCE' : 'GENERAL'
                            });
                         }}
                       >
                          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                       </select>
                    </FormGroup>
                    <FormGroup label="Target Section">
                       <select 
                         value={deploymentForm.section}
                         onChange={(e) => setDeploymentForm({...deploymentForm, section: e.target.value})}
                       >
                          {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </FormGroup>
                 </div>
                 {isSeniorGrade(deploymentForm.grade) && (
                    <FormGroup label="Academic Stream">
                       <select 
                         value={deploymentForm.stream}
                         onChange={(e) => setDeploymentForm({...deploymentForm, stream: e.target.value as AcademicStream})}
                       >
                          {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </FormGroup>
                 )}
                 <div className="pt-4 flex gap-4">
                    <button 
                      onClick={() => setIsDeploying(false)}
                      className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                    >Abort Placement</button>
                    <button 
                      onClick={finalizeDeployment}
                      className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    ><UserCheck size={16} /> Complete Enrollment</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedApplication(null)}></div>
          <div className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
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
            
            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar space-y-12">
               <div className="flex items-center gap-8">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-slate-100 overflow-hidden ring-4 ring-slate-50 shadow-xl">
                    {selectedApplication.profilePicture ? <img src={selectedApplication.profilePicture} className="w-full h-full object-cover" alt="" /> : <User size={48} className="text-slate-200 mx-auto mt-7" />}
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-slate-900 leading-tight">{selectedApplication.studentName}</h4>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg border border-indigo-100">{selectedApplication.gradeApplying} Target</span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5"><Clock size={12} /> Logged {selectedApplication.dateApplied}</span>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <DetailBox label="Birth Date" value={selectedApplication.dob || 'N/A'} icon={<Calendar size={14} />} />
                  <DetailBox label="Gender" value={selectedApplication.gender === 'M' ? 'Male' : selectedApplication.gender === 'F' ? 'Female' : 'Other'} icon={<User size={14} />} />
                  <DetailBox label="Parent Name" value={selectedApplication.parentName} icon={<ShieldCheck size={14} />} />
                  <DetailBox label="Blood Group" value={selectedApplication.bloodGroup || 'N/A'} icon={<HeartPulse size={14} />} />
               </div>

               {/* New Detail View for Academic History */}
               {(selectedApplication.previousSchool || selectedApplication.lastGradeCompleted) && (
                 <div className="p-8 bg-amber-50/30 rounded-[2.5rem] border border-amber-100/50 space-y-6">
                   <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2"><History size={16} /> Previous Academic Standing</h5>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Previous Institution</p>
                        <p className="text-base font-bold text-slate-900">{selectedApplication.previousSchool || 'Not Recorded'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Grade Completed</p>
                        <p className="text-base font-bold text-slate-900">{selectedApplication.lastGradeCompleted || 'Not Recorded'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reason for Entry</p>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{selectedApplication.leavingReason || 'No detailed reason provided.'}"</p>
                      </div>
                   </div>
                 </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailBox label="Contact Email" value={selectedApplication.contactEmail} icon={<Mail size={14} />} />
                  <DetailBox label="Address" value={selectedApplication.address || 'Not Provided'} icon={<MapPin size={14} />} />
               </div>

               <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden space-y-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20 -mr-16 -mt-16"></div>
                  <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2"><Settings2 size={16} /> Admissions Workflow Pipeline</h5>
                  <div className="flex flex-wrap gap-3">
                    {Object.values(AdmissionStatus).map(s => (
                      <button
                        key={s}
                        disabled={selectedApplication.status === AdmissionStatus.ACCEPTED}
                        onClick={() => {
                          if (s === AdmissionStatus.ACCEPTED) {
                             initiateDeployment(selectedApplication);
                          } else {
                             onUpdateStatus(selectedApplication.id, s);
                             setSelectedApplication(null);
                          }
                        }}
                        className={`flex-1 min-w-[140px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          selectedApplication.status === s 
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-900' 
                            : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white disabled:opacity-30'
                        }`}
                      >
                        Set to {s}
                      </button>
                    ))}
                  </div>
               </div>

               {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                 <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Paperclip size={14} /> Attached Credentials</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedApplication.documents.map((doc, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                           <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm"><FileText size={20} /></div>
                           <div className="overflow-hidden">
                              <p className="text-xs font-black text-slate-900 truncate">{doc.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">{doc.size} • {doc.type.split('/')[1]?.toUpperCase()}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
            </div>

            <div className="p-8 md:p-12 border-t border-slate-100 bg-white shrink-0 flex gap-4">
               <button 
                 onClick={() => {
                   onUpdateStatus(selectedApplication.id, AdmissionStatus.REJECTED);
                   setSelectedApplication(null);
                 }}
                 className="flex-1 py-5 bg-white border-2 border-slate-100 text-rose-600 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-rose-50 hover:border-rose-100 transition-all"
               >Decline Entry</button>
               {selectedApplication.status !== AdmissionStatus.ACCEPTED && (
                 <button 
                   onClick={() => initiateDeployment(selectedApplication)}
                   className="flex-[2] py-5 bg-indigo-600 text-white rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
                 ><UserCheck size={20} /> Authorize Enrollment</button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Functions declared here to allow hoisting and resolve JSX typing issues
function DetailBox({ label, value, icon, className = "" }: { label: string, value: string, icon: React.ReactNode, className?: string }) {
  return (
    <div className={`p-5 bg-slate-50 rounded-[1.8rem] border border-slate-100 shadow-sm ${className}`}>
       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1.5 opacity-70">{icon} {label}</p>
       <p className="text-sm font-black text-slate-900 truncate">{value}</p>
    </div>
  );
}

// Added cast to `any` for children.props to avoid "Property 'className' does not exist on type 'unknown'" error.
function FormGroup({ label, children, className = "" }: { label: string, children?: React.ReactElement, className?: string }) {
  if (!children) return null;
  return (
    <div className={`space-y-2.5 ${className}`}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 opacity-80">{label}</label>
      {React.cloneElement(children, {
        className: `w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] outline-none text-sm font-bold transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white placeholder:text-slate-300 ${(children.props as any)?.className || ""}`
      } as any)}
    </div>
  );
}

export default AdmissionsPortal;
