
import React, { useState, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  Plus,
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  UserCheck,
  UserX,
  BadgeCheck,
  Calendar,
  X,
  UserCog,
  Check,
  User,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Camera,
  FileText,
  Trash2,
  Paperclip,
  FileUp,
  CheckCircle2,
  Activity,
  AlertTriangle,
  HeartPulse,
  Tag,
  Clock,
  IdCard,
  Edit2,
  Printer
} from 'lucide-react';
import { Student, StudentDocument, DocumentCategory, Tenant } from '../types';
import IDCardGenerator from './IDCardGenerator';

const MOCK_TEACHERS = [
  "Dr. Alan Grant",
  "Ms. Ellie Sattler",
  "Mr. Ian Malcolm",
  "Mrs. Claire Dearing",
  "Prof. Albus Dumbledore",
  "Ms. Minerva McGonagall"
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const SECTIONS = ['A', 'B', 'C', 'D'];

const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string; color: string }[] = [
  { value: 'ACADEMIC', label: 'Academic Record', color: 'indigo' },
  { value: 'MEDICAL', label: 'Medical Document', color: 'rose' },
  { value: 'CONSENT', label: 'Parental Consent', color: 'amber' },
  { value: 'IDENTIFICATION', label: 'Identification (ID)', color: 'emerald' },
  { value: 'OTHER', label: 'Miscellaneous', color: 'slate' },
];

interface StudentManagementProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  /* Fixed: Added activeTenant prop */
  activeTenant: Tenant;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ students, setStudents, activeTenant }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditingAdvisor, setIsEditingAdvisor] = useState(false);
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [showIDCard, setShowIDCard] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    dob: '',
    gender: 'O' as 'M' | 'F' | 'O',
    bloodGroup: '',
    grade: 'Grade 9',
    section: 'A',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    medicalNotes: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    advisor: '',
    profilePicture: '',
    documents: [] as StudentDocument[]
  });

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStudentForm(prev => ({ ...prev, profilePicture: reader.result as string }));
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
            category: 'ACADEMIC', // Default category
            uploadDate: new Date().toISOString().split('T')[0]
          };
          setNewStudentForm(prev => ({ ...prev, documents: [...prev.documents, newDoc] }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const updateDocCategory = (index: number, category: DocumentCategory) => {
    setNewStudentForm(prev => {
      const updatedDocs = [...prev.documents];
      updatedDocs[index] = { ...updatedDocs[index], category };
      return { ...prev, documents: updatedDocs };
    });
  };

  const removeDoc = (index: number) => {
    setNewStudentForm(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateAdvisor = (newAdvisor: string) => {
    if (!selectedStudent) return;
    const updatedStudents = students.map(s => 
      s.id === selectedStudent.id ? { ...s, advisor: newAdvisor } : s
    );
    setStudents(updatedStudents);
    setSelectedStudent({ ...selectedStudent, advisor: newAdvisor });
    setIsEditingAdvisor(false);
  };

  const handleUpdateClass = (grade: string, section: string) => {
    if (!selectedStudent) return;
    const updatedStudents = students.map(s => 
      s.id === selectedStudent.id ? { ...s, grade, section } : s
    );
    setStudents(updatedStudents);
    setSelectedStudent({ ...selectedStudent, grade, section });
    setIsEditingClass(false);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    /* Fixed: Added tenantId to the student object */
    const student: Student = {
      id: `S${Date.now()}`,
      tenantId: activeTenant.id,
      name: newStudentForm.name,
      dob: newStudentForm.dob,
      gender: newStudentForm.gender,
      bloodGroup: newStudentForm.bloodGroup,
      grade: newStudentForm.grade,
      section: newStudentForm.section,
      parentName: newStudentForm.parentName,
      parentPhone: newStudentForm.parentPhone,
      parentEmail: newStudentForm.parentEmail,
      address: newStudentForm.address,
      medicalNotes: newStudentForm.medicalNotes,
      allergies: newStudentForm.allergies,
      emergencyContactName: newStudentForm.emergencyContactName,
      emergencyContactPhone: newStudentForm.emergencyContactPhone,
      profilePicture: newStudentForm.profilePicture,
      documents: newStudentForm.documents,
      admissionNo: `ADM-DIR-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'ACTIVE',
      advisor: newStudentForm.advisor || undefined
    };

    setStudents([student, ...students]);
    setIsAddingStudent(false);
    resetForm();
  };

  const resetForm = () => {
    setNewStudentForm({
      name: '', dob: '', gender: 'O', bloodGroup: '', 
      grade: 'Grade 9', section: 'A', parentName: '', 
      parentPhone: '', parentEmail: '', address: '', 
      medicalNotes: '', allergies: '', emergencyContactName: '', 
      emergencyContactPhone: '', advisor: '', profilePicture: '', documents: []
    });
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'All Grades' || s.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const grades = ['All Grades', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Student Directory</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage comprehensive student records and institutional profiles.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} /> Export List
          </button>
          <button 
            onClick={() => setIsAddingStudent(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <UserPlus size={18} /> Add Student
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StudentStat label="Enrolled Students" value={students.length.toString()} icon={<Users className="text-indigo-600" />} color="indigo" />
        <StudentStat label="Active Academic" value={students.filter(s => s.status === 'ACTIVE').length.toString()} icon={<UserCheck className="text-emerald-600" />} color="emerald" />
        <StudentStat label="On Sabbatical" value="12" icon={<UserX className="text-rose-600" />} color="rose" />
        <StudentStat label="Direct Admits" value="45" icon={<BadgeCheck className="text-amber-600" />} color="amber" />
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search records..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold appearance-none cursor-pointer"
            >
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Admission ID</th>
                <th className="px-6 py-4">Grade / Section</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr 
                  key={student.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4" onClick={() => { setSelectedStudent(student); setIsEditingAdvisor(false); setIsEditingClass(false); }}>
                    <div className="flex items-center gap-3">
                      {student.profilePicture ? (
                        <img src={student.profilePicture} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 ring-2 ring-slate-100">
                           <User size={18} />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-900">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase">{student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'Other'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4" onClick={() => { setSelectedStudent(student); setIsEditingAdvisor(false); setIsEditingClass(false); }}>
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">{student.admissionNo}</span>
                  </td>
                  <td className="px-6 py-4" onClick={() => { setSelectedStudent(student); setIsEditingAdvisor(false); setIsEditingClass(false); }}>
                    <span className="text-sm font-semibold text-slate-700">{student.grade} - {student.section}</span>
                  </td>
                  <td className="px-6 py-4" onClick={() => { setSelectedStudent(student); setIsEditingAdvisor(false); setIsEditingClass(false); }}>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${student.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           setSelectedStudent(student); 
                           setShowIDCard(true); 
                         }}
                         className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                         title="Print ID Card"
                       >
                         <IdCard size={18} />
                       </button>
                       <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                         <MoreVertical size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setSelectedStudent(null)}></div>
          <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-900">Student Profile</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowIDCard(true)}
                  className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-indigo-100"
                  title="Generate ID"
                >
                  <Printer size={20} />
                </button>
                <button onClick={() => setSelectedStudent(null)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="flex flex-col items-center mb-10 text-center">
                <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 border-4 border-indigo-50 shadow-xl overflow-hidden mb-4 relative">
                   {selectedStudent.profilePicture ? (
                     <img src={selectedStudent.profilePicture} className="w-full h-full object-cover" alt="" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-indigo-300">
                        <User size={48} />
                     </div>
                   )}
                </div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{selectedStudent.name}</h4>
                
                {isEditingClass ? (
                  <div className="mt-2 flex flex-col items-center gap-3 animate-in fade-in duration-200">
                    <div className="flex gap-2">
                      <select 
                        defaultValue={selectedStudent.grade} 
                        id="edit-grade-select"
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                      >
                        {grades.filter(g => g !== 'All Grades').map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <select 
                        defaultValue={selectedStudent.section} 
                        id="edit-section-select"
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                      >
                        {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const g = (document.getElementById('edit-grade-select') as HTMLSelectElement).value;
                          const s = (document.getElementById('edit-section-select') as HTMLSelectElement).value;
                          handleUpdateClass(g, s);
                        }}
                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100"
                      >
                        Apply Changes
                      </button>
                      <button 
                        onClick={() => setIsEditingClass(false)}
                        className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1 mb-4">
                    <p className="text-indigo-600 font-bold">{selectedStudent.grade} • Section {selectedStudent.section}</p>
                    <button 
                      onClick={() => setIsEditingClass(true)}
                      className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Reassign Grade/Section"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                )}

                <button 
                  onClick={() => setShowIDCard(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-indigo-700 transition-all border border-indigo-500 shadow-lg shadow-indigo-100"
                >
                  <IdCard size={16} /> Generate ID Card
                </button>
              </div>

              {/* Health Records Section */}
              <div className="mb-10 bg-rose-50/50 rounded-3xl p-6 border border-rose-100">
                <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <HeartPulse size={14} /> Critical Health Records
                </h5>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/80 p-3 rounded-2xl border border-rose-100/50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Group</p>
                    <p className="text-sm font-black text-slate-900">{selectedStudent.bloodGroup || 'Not Recorded'}</p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-2xl border border-rose-100/50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Allergies</p>
                    <p className="text-sm font-bold text-rose-600 truncate">{selectedStudent.allergies || 'None Known'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/80 p-3 rounded-2xl border border-rose-100/50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Medical Notes</p>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">{selectedStudent.medicalNotes || 'No specific medical conditions reported.'}</p>
                  </div>
                  <div className="bg-white/80 p-4 rounded-2xl border border-rose-100 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Emergency Contact</p>
                      <p className="text-sm font-bold text-slate-900">{selectedStudent.emergencyContactName || 'Guardian'}</p>
                    </div>
                    <a href={`tel:${selectedStudent.emergencyContactPhone}`} className="p-2.5 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-200">
                      <Phone size={16} />
                    </a>
                  </div>
                </div>
              </div>

              {selectedStudent.documents && selectedStudent.documents.length > 0 && (
                <div className="mb-10 space-y-4">
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Paperclip size={14} /> Vaulted Documents
                   </h5>
                   <div className="space-y-6">
                     {DOCUMENT_CATEGORIES.filter(cat => selectedStudent.documents?.some(doc => doc.category === cat.value)).map(category => (
                       <div key={category.value} className="space-y-2">
                          <h6 className={`text-[9px] font-black uppercase text-${category.color}-600 bg-${category.color}-50 px-2 py-1 rounded w-fit`}>
                            {category.label}
                          </h6>
                          <div className="space-y-2 pl-2 border-l-2 border-slate-100 ml-1">
                            {selectedStudent.documents?.filter(doc => doc.category === category.value).map((doc, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText size={18} className={`text-${category.color}-500`} />
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-slate-700 truncate">{doc.name}</p>
                                      <p className="text-[9px] text-slate-400 flex items-center gap-1 font-medium">
                                        <Clock size={10} /> {doc.uploadDate} • {doc.size}
                                      </p>
                                    </div>
                                </div>
                                <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline shrink-0 ml-2">Open</button>
                              </div>
                            ))}
                          </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              <div className="mb-10 bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100/50">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <UserCog size={14} /> Academic Support Team
                  </h5>
                  {!isEditingAdvisor && (
                    <button onClick={() => setIsEditingAdvisor(true)} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Assign New</button>
                  )}
                </div>
                {isEditingAdvisor ? (
                   <select defaultValue={selectedStudent.advisor} onChange={(e) => handleUpdateAdvisor(e.target.value)} className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl outline-none text-sm font-bold">
                    <option value="">Select an Advisor</option>
                    {MOCK_TEACHERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                ) : (
                  <p className="text-sm font-bold text-slate-900">{selectedStudent.advisor || 'No Advisor Assigned'}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <ProfileStat label="Admission No" value={selectedStudent.admissionNo} />
                <ProfileStat label="Parent Name" value={selectedStudent.parentName} />
                {selectedStudent.dob && <ProfileStat label="Date of Birth" value={selectedStudent.dob} />}
                {selectedStudent.parentPhone && <ProfileStat label="Contact Phone" value={selectedStudent.parentPhone} />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ID Card Generator Modal Overlay */}
      {showIDCard && selectedStudent && (
        <IDCardGenerator 
          type="STUDENT" 
          data={selectedStudent} 
          onClose={() => setShowIDCard(false)} 
        />
      )}

      {isAddingStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 md:p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsAddingStudent(false)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[95vh] flex flex-col">
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900">Direct Enrollment Form</h3>
                    <p className="text-xs md:text-sm text-slate-500 font-medium">Record a new student profile in the Institutional OS.</p>
                  </div>
              </div>
              <button type="button" onClick={() => setIsAddingStudent(false)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                  <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-white border-4 border-white shadow-xl overflow-hidden relative">
                      {newStudentForm.profilePicture ? (
                        <img src={newStudentForm.profilePicture} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <User size={48} />
                        </div>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform"
                    >
                      <Camera size={18} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleProfileImageChange} 
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-lg font-bold text-slate-900">Student Identity Portrait</h4>
                    <p className="text-sm text-slate-500 font-medium">Clear front-facing photo required for institutional ID cards.</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">PNG, JPG preferred • Max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <FormGroup label="Full Name" className="md:col-span-2">
                    <input required type="text" value={newStudentForm.name} onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })} />
                  </FormGroup>
                  <FormGroup label="Birth Date">
                    <input required type="date" value={newStudentForm.dob} onChange={(e) => setNewStudentForm({ ...newStudentForm, dob: e.target.value })} />
                  </FormGroup>
                  <FormGroup label="Gender Identification">
                    <div className="flex gap-2">
                      {(['M', 'F', 'O'] as const).map((g) => (
                        <button 
                          key={g} type="button" 
                          onClick={() => setNewStudentForm({ ...newStudentForm, gender: g })}
                          className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase transition-all border ${newStudentForm.gender === g ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                        >
                          {g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other'}
                        </button>
                      ))}
                    </div>
                  </FormGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="Grade Level">
                      <select value={newStudentForm.grade} onChange={(e) => setNewStudentForm({ ...newStudentForm, grade: e.target.value })}>
                        {grades.filter(g => g !== 'All Grades').map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="Section">
                      <select value={newStudentForm.section} onChange={(e) => setNewStudentForm({ ...newStudentForm, section: e.target.value })}>
                        {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </FormGroup>
                  </div>
                </div>

                {/* Health & Emergency Information Form Section */}
                <div className="bg-rose-50/30 p-8 rounded-[2.5rem] border border-rose-100 space-y-8">
                  <h4 className="flex items-center gap-2 text-xs font-black text-rose-500 uppercase tracking-widest">
                    <HeartPulse size={16} /> Health & Emergency Records
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FormGroup label="Blood Group">
                      <select value={newStudentForm.bloodGroup} onChange={(e) => setNewStudentForm({ ...newStudentForm, bloodGroup: e.target.value })}>
                        <option value="">Select</option>
                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="Known Allergies" className="lg:col-span-3">
                      <input type="text" placeholder="e.g. Peanuts, Penicillin" value={newStudentForm.allergies} onChange={(e) => setNewStudentForm({ ...newStudentForm, allergies: e.target.value })} />
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormGroup label="Emergency Contact Name">
                      <input type="text" placeholder="Primary relative or guardian" value={newStudentForm.emergencyContactName} onChange={(e) => setNewStudentForm({ ...newStudentForm, emergencyContactName: e.target.value })} />
                    </FormGroup>
                    <FormGroup label="Emergency Contact Phone">
                      <input type="tel" placeholder="+1 (555) 000-0000" value={newStudentForm.emergencyContactPhone} onChange={(e) => setNewStudentForm({ ...newStudentForm, emergencyContactPhone: e.target.value })} />
                    </FormGroup>
                  </div>
                  <FormGroup label="Detailed Medical Notes">
                    <textarea rows={3} placeholder="Any medical history, chronic conditions, or medications staff should be aware of." value={newStudentForm.medicalNotes} onChange={(e) => setNewStudentForm({ ...newStudentForm, medicalNotes: e.target.value })} className="resize-none" />
                  </FormGroup>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest">
                      <Paperclip size={16} /> Institutional Credentials
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => docInputRef.current?.click()}
                      className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                    >
                      <Plus size={14} /> Add Documents
                    </button>
                    <input type="file" multiple ref={docInputRef} className="hidden" onChange={handleDocUpload} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {newStudentForm.documents.length > 0 ? newStudentForm.documents.map((doc, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col gap-4 group hover:border-indigo-200 transition-all shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                              <FileText size={20} />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{doc.size} • {doc.uploadDate}</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeDoc(idx)} className="p-2 text-slate-300 hover:text-rose-500 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Tag size={10} /> Category
                          </label>
                          <select 
                            value={doc.category}
                            onChange={(e) => updateDocCategory(idx, e.target.value as DocumentCategory)}
                            className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-[10px] font-bold uppercase tracking-tight focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            {DOCUMENT_CATEGORIES.map(cat => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )) : (
                      <div onClick={() => docInputRef.current?.click()} className="col-span-full border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-all cursor-pointer">
                        <FileUp size={40} className="mb-2 opacity-20" />
                        <p className="text-sm font-bold tracking-tight">Click to attach academic, medical, or ID records</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormGroup label="Primary Parent Name">
                    <input required type="text" value={newStudentForm.parentName} onChange={(e) => setNewStudentForm({ ...newStudentForm, parentName: e.target.value })} />
                  </FormGroup>
                  <FormGroup label="Contact Phone">
                    {/* Fixed typo: changed ...newStudentPhone to ...newStudentForm */}
                    <input required type="tel" value={newStudentForm.parentPhone} onChange={(e) => setNewStudentForm({ ...newStudentForm, parentPhone: e.target.value })} />
                  </FormGroup>
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddingStudent(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Finalize Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StudentStat: React.FC<{ label: string, value: string, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
    <div className={`p-3 bg-slate-50 rounded-2xl w-fit mb-4 group-hover:bg-${color}-50 transition-all`}>{icon}</div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h4 className="text-3xl font-black text-slate-900 leading-none">{value}</h4>
  </div>
);

const ProfileStat: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-slate-900 truncate">{value}</p>
  </div>
);

const FormGroup = ({ label, children, className = "" }: { label: string, children: React.ReactNode, className?: string }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    {React.cloneElement(children as React.ReactElement<any>, {
      className: `w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 ${(children as any).props?.className || ""}`
    })}
  </div>
);

export default StudentManagement;
