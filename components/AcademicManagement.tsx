
import React, { useState, useRef } from 'react';
import { 
  Book, 
  Plus, 
  Search, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  Trash2, 
  Clock, 
  MapPin, 
  X,
  ChevronRight,
  Info,
  User,
  GraduationCap,
  LayoutGrid,
  Check,
  ListTodo,
  TrendingUp,
  Circle,
  FileSpreadsheet,
  Award,
  AlertCircle,
  Edit3,
  GripVertical,
  PlayCircle
} from 'lucide-react';
import { AddSubjectFormBatch } from './AddSubjectFormBatch';
import { Subject, SyllabusUnit, Assessment, Student, SyllabusStatus, Tenant } from '../types';

interface AcademicManagementProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  onUpdateSyllabus: (subjectId: string, syllabus: SyllabusUnit[]) => void;
  onUpdateAssessments: (subjectId: string, assessments: Assessment[]) => void;
  students: Student[];
  /* Fixed: Added activeTenant prop */
  activeTenant: Tenant;
}

interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'EVENT' | 'HOLIDAY' | 'EXAM';
}

const INITIAL_EVENTS: SchoolEvent[] = [
  { id: '1', title: 'Mid-Term Examinations', description: 'Annual mid-term assessments for Grades 5 to 12.', date: '2024-06-15', type: 'EXAM' },
  { id: '2', title: 'Summer Solstice Holiday', description: 'School closed for summer solstice celebrations.', date: '2024-06-21', type: 'HOLIDAY' },
  { id: '3', title: 'Science Fair 2024', description: 'Showcasing innovation from our junior scientists.', date: '2024-07-05', type: 'EVENT' },
];

const MOCK_TEACHERS = [
  "Dr. Alan Grant",
  "Ms. Ellie Sattler",
  "Mr. Ian Malcolm",
  "Mrs. Claire Dearing",
  "Prof. Albus Dumbledore",
  "Ms. Minerva McGonagall",
];

const CLASSES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

const AcademicManagement: React.FC<AcademicManagementProps> = ({ subjects, setSubjects, onUpdateSyllabus, onUpdateAssessments, students, activeTenant }) => {
  const [activeTab, setActiveTab] = useState<'SUBJECTS' | 'CALENDAR'>('SUBJECTS');
  const [events, setEvents] = useState<SchoolEvent[]>(INITIAL_EVENTS);
  
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isBatchAdding, setIsBatchAdding] = useState(false);
  const [selectedSubjectForSyllabus, setSelectedSubjectForSyllabus] = useState<Subject | null>(null);
  const [selectedSubjectForGrading, setSelectedSubjectForGrading] = useState<Subject | null>(null);
  
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', type: 'EVENT' as const });
  const [newSubject, setNewSubject] = useState({ name: '', grade: 'Grade 5', teacher: '', progress: 0 });

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Grading Specific State
  const [gradingTab, setGradingTab] = useState<'ASSESSMENTS' | 'GRADEBOOK'>('ASSESSMENTS');
  const [isAddingAssessment, setIsAddingAssessment] = useState(false);
  const [newAssessment, setNewAssessment] = useState({ title: '', type: 'ASSIGNMENT' as Assessment['type'], maxMarks: 100, weightage: 20, date: '' });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const event: SchoolEvent = {
      id: Math.random().toString(36).substr(2, 9),
      ...newEvent
    };
    setEvents([event, ...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setIsAddingEvent(false);
    setNewEvent({ title: '', description: '', date: '', type: 'EVENT' });
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    /* Fixed: Added tenantId to the subject object */
    const subject: Subject = {
      id: `SUB-${Date.now()}`,
      tenantId: activeTenant.id,
      ...newSubject,
      syllabus: [],
      assessments: []
    };
    setSubjects([subject, ...subjects]);
    setIsAddingSubject(false);
    setNewSubject({ name: '', grade: 'Grade 5', teacher: '', progress: 0 });
  };

  const handleAddAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectForGrading) return;
    
    const assessment: Assessment = {
      id: `ASM-${Date.now()}`,
      ...newAssessment,
      scores: {}
    };

    const updatedAssessmentsList = [...(selectedSubjectForGrading.assessments || []), assessment];
    onUpdateAssessments(selectedSubjectForGrading.id, updatedAssessmentsList);
    setSelectedSubjectForGrading({ ...selectedSubjectForGrading, assessments: updatedAssessmentsList });
    setIsAddingAssessment(false);
    setNewAssessment({ title: '', type: 'ASSIGNMENT', maxMarks: 100, weightage: 20, date: '' });
  };

  const handleScoreUpdate = (assessmentId: string, studentId: string, score: number) => {
    if (!selectedSubjectForGrading) return;
    
    const updatedAssessmentsList = (selectedSubjectForGrading.assessments || []).map(asm => {
      if (asm.id === assessmentId) {
        return { ...asm, scores: { ...asm.scores, [studentId]: score } };
      }
      return asm;
    });

    onUpdateAssessments(selectedSubjectForGrading.id, updatedAssessmentsList);
    setSelectedSubjectForGrading({ ...selectedSubjectForGrading, assessments: updatedAssessmentsList });
  };

  const calculateOverallGrade = (studentId: string, sub: Subject) => {
    const relevantAssessments = sub.assessments || [];
    if (relevantAssessments.length === 0) return 0;
    
    let totalWeightedScore = 0;
    let totalWeight = 0;

    relevantAssessments.forEach(asm => {
      const score = asm.scores[studentId];
      if (score !== undefined) {
        totalWeightedScore += (score / asm.maxMarks) * asm.weightage;
        totalWeight += asm.weightage;
      }
    });

    if (totalWeight === 0) return 0;
    return Math.round((totalWeightedScore / totalWeight) * 100);
  };

  const updateSyllabusUnitStatus = (subjectId: string, unitId: string, status: SyllabusStatus) => {
    if (!selectedSubjectForSyllabus) return;
    const currentSyllabus = selectedSubjectForSyllabus.syllabus || [];
    const updatedSyllabus = currentSyllabus.map(u => 
      u.id === unitId ? { ...u, status } : u
    );
    
    onUpdateSyllabus(subjectId, updatedSyllabus);
    setSelectedSubjectForSyllabus({
      ...selectedSubjectForSyllabus,
      syllabus: updatedSyllabus
    });
  };

  const deleteSyllabusUnit = (subjectId: string, unitId: string) => {
    if (!selectedSubjectForSyllabus) return;
    const currentSyllabus = selectedSubjectForSyllabus.syllabus || [];
    const updatedSyllabus = currentSyllabus.filter(u => u.id !== unitId)
      .map((u, i) => ({ ...u, order: i + 1 }));
    
    onUpdateSyllabus(subjectId, updatedSyllabus);
    setSelectedSubjectForSyllabus({
      ...selectedSubjectForSyllabus,
      syllabus: updatedSyllabus
    });
  };

  const addSyllabusUnit = (subjectId: string) => {
    const title = prompt("Enter Unit/Chapter Title:");
    if (!title) return;

    const currentSyllabus = selectedSubjectForSyllabus?.syllabus || [];
    const newUnit: SyllabusUnit = {
      id: `U-${Date.now()}`,
      title,
      description: 'Newly added course content.',
      status: 'PENDING',
      order: currentSyllabus.length + 1
    };

    const updatedSyllabus = [...currentSyllabus, newUnit];
    onUpdateSyllabus(subjectId, updatedSyllabus);
    setSelectedSubjectForSyllabus(prev => prev ? ({ ...prev, syllabus: updatedSyllabus }) : null);
  };

  // Handle reordering logic
  const onDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index || !selectedSubjectForSyllabus) return;
    
    const syllabus = [...(selectedSubjectForSyllabus.syllabus || [])].sort((a, b) => a.order - b.order);
    const itemToMove = syllabus[draggedIndex];
    syllabus.splice(draggedIndex, 1);
    syllabus.splice(index, 0, itemToMove);
    
    const reorderedSyllabus = syllabus.map((u, i) => ({ ...u, order: i + 1 }));
    
    onUpdateSyllabus(selectedSubjectForSyllabus.id, reorderedSyllabus);
    setSelectedSubjectForSyllabus({
      ...selectedSubjectForSyllabus,
      syllabus: reorderedSyllabus
    });
    setDraggedIndex(null);
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  if (isBatchAdding) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <AddSubjectFormBatch 
          onBack={() => setIsBatchAdding(false)} 
          onSubmit={(data) => {
            const newBatch: Subject[] = data.subjects.map((s: any) => ({
              id: `SUB-${Math.random().toString(36).substr(2, 9)}`,
              /* Fixed: Added tenantId to batch items */
              tenantId: activeTenant.id,
              name: s.name,
              grade: data.grade,
              teacher: s.teacher || 'Unassigned',
              progress: 0,
              syllabus: [],
              assessments: []
            }));
            setSubjects([...newBatch, ...subjects]);
            setIsBatchAdding(false);
          }}
          classes={CLASSES}
          staff={MOCK_TEACHERS.map((name, i) => ({ id: i.toString(), name }))}
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Academic Management</h2>
          <p className="text-slate-500 mt-1 font-medium">Coordinate curriculum delivery and institutional scheduling.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <button 
             onClick={() => setActiveTab(activeTab === 'SUBJECTS' ? 'CALENDAR' : 'SUBJECTS')}
             className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
           >
             {activeTab === 'SUBJECTS' ? <><CalendarIcon size={18} /> Calendar</> : <><BookOpen size={18} /> Subjects</>}
           </button>
           
           {activeTab === 'SUBJECTS' && (
             <button 
               onClick={() => setIsBatchAdding(true)}
               className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all"
             >
               <LayoutGrid size={18} /> Batch Add
             </button>
           )}

           <button 
             onClick={() => activeTab === 'SUBJECTS' ? setIsAddingSubject(true) : setIsAddingEvent(true)}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
           >
             <Plus size={18} /> {activeTab === 'SUBJECTS' ? 'Add Single' : 'Add Event'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AcademicCard icon={<BookOpen className="text-indigo-600" />} label="Active Subjects" value={subjects.length.toString()} color="indigo" />
        <AcademicCard icon={<Layers className="text-emerald-600" />} label="Grade Levels" value="12" color="emerald" />
        <AcademicCard icon={<CalendarIcon className="text-amber-600" />} label="Upcoming Events" value={events.length.toString()} color="amber" />
        <AcademicCard icon={<CheckCircle2 className="text-rose-600" />} label="Avg. Progress" value={`${Math.round(subjects.reduce((a, b) => a + b.progress, 0) / (subjects.length || 1))}%`} color="rose" />
      </div>

      {activeTab === 'SUBJECTS' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
             <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Curriculum Registry</h3>
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Search curriculum..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
             </div>
          </div>
          <div className="divide-y divide-slate-100">
            {subjects.map((sub) => (
              <div key={sub.id} className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between hover:bg-slate-50/50 transition-colors gap-6 group">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Book size={24} />
                   </div>
                   <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900">{sub.name}</h4>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 uppercase">{sub.grade}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter mt-0.5">{sub.teacher}</p>
                   </div>
                </div>
                <div className="w-full lg:max-w-xs">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syllabus Completion</span>
                      <span className="text-xs font-black text-indigo-600">{sub.progress}%</span>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${sub.progress}%` }}></div>
                   </div>
                </div>
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <button 
                    onClick={() => setSelectedSubjectForGrading(sub)}
                    className="flex-1 lg:flex-none px-6 py-2.5 text-xs font-black uppercase tracking-widest text-indigo-600 border border-indigo-100 hover:bg-indigo-50 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Award size={14} /> Grading
                  </button>
                  <button 
                    onClick={() => setSelectedSubjectForSyllabus(sub)}
                    className="flex-1 lg:flex-none px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    Syllabus
                  </button>
                  <button onClick={() => removeSubject(sub.id)} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {events.map((event) => (
            <div key={event.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                event.type === 'EVENT' ? 'bg-emerald-500' : event.type === 'EXAM' ? 'bg-amber-500' : 'bg-rose-500'
              }`}></div>
              <div className="shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                <span className="text-2xl font-black text-slate-900">{new Date(event.date).getDate()}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{event.title}</h4>
                  <button onClick={() => removeEvent(event.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2">{event.description}</p>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    event.type === 'EVENT' ? 'bg-emerald-50 text-emerald-600' : event.type === 'EXAM' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {event.type}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">All Day</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grading & Assessment Modal */}
      {selectedSubjectForGrading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedSubjectForGrading(null)}></div>
          <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                  <Award size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedSubjectForGrading.name} Grading</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedSubjectForGrading.grade} • {selectedSubjectForGrading.teacher}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setGradingTab('ASSESSMENTS')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${gradingTab === 'ASSESSMENTS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >Assessments</button>
                  <button 
                    onClick={() => setGradingTab('GRADEBOOK')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${gradingTab === 'GRADEBOOK' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >Gradebook</button>
                </div>
                <button onClick={() => setSelectedSubjectForGrading(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
               {gradingTab === 'ASSESSMENTS' ? (
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Assessments</h4>
                       <button 
                         onClick={() => setIsAddingAssessment(true)}
                         className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
                       >
                         <Plus size={14} /> New Assessment
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {(selectedSubjectForGrading.assessments || []).map(asm => (
                         <div key={asm.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                            <div className="flex items-center justify-between mb-4">
                               <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                 asm.type === 'EXAM' ? 'bg-rose-100 text-rose-600' : asm.type === 'QUIZ' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                               }`}>{asm.type}</span>
                               <span className="text-[10px] text-slate-400 font-bold">{asm.date}</span>
                            </div>
                            <h5 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{asm.title}</h5>
                            <div className="mt-4 flex items-center justify-between border-t border-slate-200/50 pt-4">
                               <div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Max Marks</p>
                                  <p className="text-sm font-black text-slate-900">{asm.maxMarks}</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Weightage</p>
                                  <p className="text-sm font-black text-indigo-600">{asm.weightage}%</p>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-sm bg-slate-50">
                       <table className="w-full text-left">
                          <thead className="bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                             <tr>
                                <th className="px-6 py-4 sticky left-0 bg-slate-100 z-10">Student Name</th>
                                {(selectedSubjectForGrading.assessments || []).map(asm => (
                                  <th key={asm.id} className="px-6 py-4 text-center">
                                    {asm.title.split(' ')[0]} 
                                    <span className="block text-[8px] opacity-60">/{asm.maxMarks}</span>
                                  </th>
                                ))}
                                <th className="px-6 py-4 text-right bg-indigo-50 text-indigo-600">Final Grade</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                             {students.filter(s => s.grade === selectedSubjectForGrading.grade).map(student => {
                               const overall = calculateOverallGrade(student.id, selectedSubjectForGrading);
                               return (
                                 <tr key={student.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">
                                             {student.name.charAt(0)}
                                          </div>
                                          <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{student.name}</span>
                                       </div>
                                    </td>
                                    {(selectedSubjectForGrading.assessments || []).map(asm => (
                                      <td key={asm.id} className="px-6 py-4">
                                         <div className="flex items-center justify-center">
                                            <input 
                                              type="number"
                                              max={asm.maxMarks}
                                              min={0}
                                              defaultValue={asm.scores[student.id] || ''}
                                              onBlur={(e) => handleScoreUpdate(asm.id, student.id, parseFloat(e.target.value) || 0)}
                                              className="w-16 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                         </div>
                                      </td>
                                    ))}
                                    <td className="px-6 py-4 text-right bg-indigo-50/30">
                                       <span className={`text-sm font-black ${overall >= 80 ? 'text-emerald-600' : overall >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                                          {overall}%
                                       </span>
                                    </td>
                                 </tr>
                               );
                             })}
                          </tbody>
                       </table>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Syllabus Management Modal */}
      {selectedSubjectForSyllabus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedSubjectForSyllabus(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                  <ListTodo size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedSubjectForSyllabus.name} Syllabus</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedSubjectForSyllabus.grade} • {selectedSubjectForSyllabus.teacher}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSubjectForSyllabus(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Curriculum Completion</p>
                    <p className="text-3xl font-black text-indigo-600">{selectedSubjectForSyllabus.progress}%</p>
                 </div>
                 <div className="w-16 h-16 rounded-full border-4 border-slate-200 relative flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-full" style={{ clipPath: `inset(${100 - selectedSubjectForSyllabus.progress}% 0 0 0)` }}></div>
                    <TrendingUp size={24} className="text-indigo-400" />
                 </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Course Units (Drag to reorder)</h4>
                   <button 
                     onClick={() => addSyllabusUnit(selectedSubjectForSyllabus.id)}
                     className="text-xs font-bold text-indigo-600 hover:underline"
                   >
                     + Add Unit
                   </button>
                </div>
                
                <div className="space-y-3">
                  {(selectedSubjectForSyllabus.syllabus || []).sort((a,b) => a.order - b.order).map((unit, index) => (
                    <div 
                      key={unit.id} 
                      draggable="true"
                      onDragStart={() => onDragStart(index)}
                      onDragOver={onDragOver}
                      onDrop={() => onDrop(index)}
                      className={`p-5 rounded-2xl border transition-all group flex items-start gap-4 ${
                        unit.status === 'COMPLETED' ? 'bg-emerald-50/50 border-emerald-100' : 
                        unit.status === 'IN_PROGRESS' ? 'bg-indigo-50/50 border-indigo-100' :
                        'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'
                      } ${draggedIndex === index ? 'opacity-40 scale-95' : 'opacity-100'}`}
                    >
                      <div className="mt-1 cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-500">
                        <GripVertical size={20} />
                      </div>
                      
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className={`font-bold text-sm ${unit.status === 'COMPLETED' ? 'text-emerald-900' : 'text-slate-900'}`}>
                            {unit.order}. {unit.title}
                          </h5>
                          <div className="flex items-center gap-1">
                             <button 
                               onClick={() => updateSyllabusUnitStatus(selectedSubjectForSyllabus.id, unit.id, 'PENDING')}
                               title="Mark as Pending"
                               className={`p-1.5 rounded-lg transition-colors ${unit.status === 'PENDING' ? 'bg-slate-200 text-slate-700' : 'text-slate-300 hover:bg-slate-100'}`}
                             >
                               <Circle size={14} />
                             </button>
                             <button 
                               onClick={() => updateSyllabusUnitStatus(selectedSubjectForSyllabus.id, unit.id, 'IN_PROGRESS')}
                               title="Mark as In Progress"
                               className={`p-1.5 rounded-lg transition-colors ${unit.status === 'IN_PROGRESS' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-100'}`}
                             >
                               <PlayCircle size={14} />
                             </button>
                             <button 
                               onClick={() => updateSyllabusUnitStatus(selectedSubjectForSyllabus.id, unit.id, 'COMPLETED')}
                               title="Mark as Completed"
                               className={`p-1.5 rounded-lg transition-colors ${unit.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:bg-slate-100'}`}
                             >
                               <Check size={14} />
                             </button>
                             <button 
                               onClick={() => deleteSyllabusUnit(selectedSubjectForSyllabus.id, unit.id)}
                               title="Delete Unit"
                               className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg ml-2"
                             >
                               <Trash2 size={14} />
                             </button>
                          </div>
                        </div>
                        <p className={`text-xs mt-1 font-medium ${unit.status === 'COMPLETED' ? 'text-emerald-600/70' : 'text-slate-500'}`}>
                          {unit.description}
                        </p>
                      </div>
                    </div>
                  ))}

                  {(selectedSubjectForSyllabus.syllabus || []).length === 0 && (
                    <div className="py-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No units defined yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals for Add Subject and Add Event */}
      {isAddingSubject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsAddingSubject(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl text-white"><BookOpen size={20} /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Register Subject</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">New Curriculum Entry</p>
                </div>
              </div>
              <button onClick={() => setIsAddingSubject(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddSubject} className="p-8 space-y-6">
              <FormGroup label="Subject Name"><input required placeholder="e.g. Advanced Calculus" value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} /></FormGroup>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Grade Level"><select className="w-full appearance-none" value={newSubject.grade} onChange={(e) => setNewSubject({ ...newSubject, grade: e.target.value })}>{CLASSES.map(g => <option key={g}>{g}</option>)}</select></FormGroup>
                <FormGroup label="Initial Progress"><input type="number" min="0" max="100" value={newSubject.progress} onChange={(e) => setNewSubject({ ...newSubject, progress: parseInt(e.target.value) || 0 })} /></FormGroup>
              </div>
              <FormGroup label="Assign Educator"><select required className="w-full appearance-none" value={newSubject.teacher} onChange={(e) => setNewSubject({ ...newSubject, teacher: e.target.value })}><option value="">Select educator</option>{MOCK_TEACHERS.map(t => <option key={t}>{t}</option>)}</select></FormGroup>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">Register Subject</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AcademicCard: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center gap-4 shadow-sm group hover:border-indigo-200 transition-all">
    <div className={`p-4 bg-slate-50 rounded-2xl group-hover:bg-${color}-50 transition-colors`}>{icon}</div>
    <div>
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-900 leading-tight">{value}</p>
    </div>
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

export default AcademicManagement;
