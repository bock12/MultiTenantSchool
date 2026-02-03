
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Book, 
  Plus, 
  Search, 
  BookOpen, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  Trash2, 
  Clock, 
  X,
  ChevronRight,
  User,
  Users,
  LayoutGrid,
  ListTodo,
  TrendingUp,
  Circle,
  Award,
  AlertCircle,
  GripVertical,
  CalendarDays,
  ChevronDown,
  CheckCircle,
  Target,
  Sparkles,
  Zap,
  Table as TableIcon,
  Check,
  Trophy,
  PlayCircle,
  Hash,
  ArrowDownWideLog,
  Flag,
  UserCog,
  FileSpreadsheet,
  Calculator,
  ShieldCheck,
  Medal,
  FileCheck
} from 'lucide-react';
import { AddSubjectFormBatch } from './AddSubjectFormBatch';
import { Subject, SyllabusUnit, Assessment, Student, SyllabusStatus, Tenant } from '../types';
import { View } from '../App';

interface AcademicManagementProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  onUpdateSyllabus: (subjectId: string, syllabus: SyllabusUnit[]) => void;
  onUpdateAssessments: (subjectId: string, assessments: Assessment[]) => void;
  students: Student[];
  activeTenant: Tenant;
  setCurrentView?: (view: View) => void;
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
const TERMS = ['FIRST', 'SECOND', 'THIRD'] as const;

/**
 * GradeInput sub-component for high-speed inline entry
 */
const GradeInput = ({ 
  initialValue, 
  onSave, 
  maxMarks = 100,
  isSmall = false,
  className = ""
}: { 
  initialValue: number | string, 
  onSave: (val: number) => void, 
  maxMarks?: number,
  isSmall?: boolean,
  className?: string
}) => {
  const [val, setVal] = useState(initialValue?.toString() || "");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setVal(initialValue?.toString() || "");
  }, [initialValue]);

  const handleBlur = () => {
    const numeric = parseFloat(val);
    if (isNaN(numeric)) {
      if (initialValue !== "" && initialValue !== undefined) onSave(0);
      return;
    }
    const clamped = Math.min(Math.max(0, numeric), maxMarks);
    if (clamped !== parseFloat(initialValue?.toString() || "-1")) {
      onSave(clamped);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <input 
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleBlur}
        placeholder="--"
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className={`${isSmall ? 'w-11 h-7 rounded-md text-[10px]' : 'w-14 h-8 rounded-lg text-xs'} px-1 text-center font-black outline-none transition-all border ${
          isSaved 
            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-700' 
            : 'bg-white border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700'
        }`}
      />
      {isSaved && (
        <div className={`absolute ${isSmall ? '-right-2.5' : '-right-4'} text-emerald-500 animate-in fade-in zoom-in duration-300`}>
          <Check size={isSmall ? 8 : 10} strokeWidth={4} />
        </div>
      )}
    </div>
  );
};

const AcademicManagement: React.FC<AcademicManagementProps> = ({ subjects, setSubjects, onUpdateSyllabus, onUpdateAssessments, students, activeTenant, setCurrentView }) => {
  const [activeTab, setActiveTab] = useState<'SUBJECTS' | 'GRADEBOOK' | 'CALENDAR'>('SUBJECTS');
  const [gradingTab, setGradingTab] = useState<'ASSESSMENTS' | 'LEDGER'>('LEDGER');
  const [events, setEvents] = useState<SchoolEvent[]>(INITIAL_EVENTS);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isBatchAdding, setIsBatchAdding] = useState(false);
  const [selectedSubjectForSyllabus, setSelectedSubjectForSyllabus] = useState<Subject | null>(null);
  const [selectedGradebookSubjectId, setSelectedGradebookSubjectId] = useState<string>("");
  const [selectedStudentForGrades, setSelectedStudentForGrades] = useState<Student | null>(null);

  // Syllabus Interaction State
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [draggedUnitIndex, setDraggedUnitIndex] = useState<number | null>(null);
  const [unitForm, setUnitForm] = useState({ title: '', description: '', status: 'PENDING' as SyllabusStatus });

  // --- Ledger Calculation Helpers ---

  const getStudentScore = (subjectId: string, term: string, subType: 'TEST' | 'EXAM', studentId: string) => {
    const sub = subjects.find(s => s.id === subjectId);
    const asm = sub?.assessments?.find(a => a.term === term && a.subType === subType);
    if (!asm) return null;
    return { score: asm.scores[studentId], maxMarks: asm.maxMarks, id: asm.id };
  };

  const calculateTermAverage = (subjectId: string, studentId: string, term: string) => {
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub) return 0;
    
    const test = sub.assessments?.find(a => a.term === term && a.subType === 'TEST');
    const exam = sub.assessments?.find(a => a.term === term && a.subType === 'EXAM');
    
    if (!test && !exam) return 0;
    
    // (Test + Exam) / 2 as per "Architecture" request
    const testScore = test?.scores[studentId] ?? 0;
    const examScore = exam?.scores[studentId] ?? 0;

    return Math.round((testScore + examScore) / 2);
  };

  const calculateYearlyAverage = (subjectId: string, studentId: string) => {
    const t1 = calculateTermAverage(subjectId, studentId, 'FIRST');
    const t2 = calculateTermAverage(subjectId, studentId, 'SECOND');
    const t3 = calculateTermAverage(subjectId, studentId, 'THIRD');
    return Math.round((t1 + t2 + t3) / 3);
  };

  // Ranking Logic
  const getRankings = useMemo(() => {
    if (!selectedGradebookSubjectId) return {};
    const sub = subjects.find(s => s.id === selectedGradebookSubjectId);
    if (!sub) return {};

    const gradeStudents = students.filter(s => s.grade === sub.grade);
    
    // Total Year Rank
    const yearSorted = [...gradeStudents].sort((a, b) => 
      calculateYearlyAverage(sub.id, b.id) - calculateYearlyAverage(sub.id, a.id)
    );
    
    // Term specific ranks
    const termRanks: Record<string, Record<string, number>> = {
      'FIRST': {}, 'SECOND': {}, 'THIRD': {}, 'YEARLY': {}
    };

    TERMS.forEach(term => {
      const termSorted = [...gradeStudents].sort((a, b) => 
        // Fixed: Pass the current term as the third argument to calculateTermAverage
        calculateTermAverage(sub.id, b.id, term) - calculateTermAverage(sub.id, a.id, term)
      );
      termSorted.forEach((s, idx) => termRanks[term][s.id] = idx + 1);
    });

    yearSorted.forEach((s, idx) => termRanks['YEARLY'][s.id] = idx + 1);

    return termRanks;
  }, [selectedGradebookSubjectId, subjects, students]);

  const handleScoreUpdate = (subjectId: string, assessmentId: string, studentId: string, score: number) => {
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub) return;
    const updatedAssessments = (sub.assessments || []).map(asm => {
      if (asm.id === assessmentId) {
        return { ...asm, scores: { ...asm.scores, [studentId]: score } };
      }
      return asm;
    });
    onUpdateAssessments(subjectId, updatedAssessments);
  };

  const handleInitializeGrades = (subjectId: string) => {
    const baseAssessments: Assessment[] = [];
    TERMS.forEach(term => {
      baseAssessments.push({
        id: `ASM-${term}-TEST-${Date.now()}`,
        title: `${term} Term Test`,
        type: 'ASSIGNMENT',
        term: term,
        subType: 'TEST',
        maxMarks: 100, // Strict 100 as per architecture
        weightage: 50,
        date: new Date().toISOString().split('T')[0],
        scores: {}
      });
      baseAssessments.push({
        id: `ASM-${term}-EXAM-${Date.now()}`,
        title: `${term} Term Exam`,
        type: 'EXAM',
        term: term,
        subType: 'EXAM',
        maxMarks: 100, // Strict 100 as per architecture
        weightage: 50,
        date: new Date().toISOString().split('T')[0],
        scores: {}
      });
    });
    onUpdateAssessments(subjectId, baseAssessments);
  };

  const handleAddSyllabusUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectForSyllabus) return;

    const currentSyllabus = selectedSubjectForSyllabus.syllabus || [];
    const newUnit: SyllabusUnit = {
      id: `UNIT-${Date.now()}`,
      title: unitForm.title,
      description: unitForm.description,
      status: unitForm.status,
      order: currentSyllabus.length + 1
    };

    const updatedSyllabus = [...currentSyllabus, newUnit];
    onUpdateSyllabus(selectedSubjectForSyllabus.id, updatedSyllabus);
    setSelectedSubjectForSyllabus({ ...selectedSubjectForSyllabus, syllabus: updatedSyllabus });
    setUnitForm({ title: '', description: '', status: 'PENDING' });
    setIsAddingUnit(false);
  };

  const handleUpdateUnitStatus = (unitId: string, status: SyllabusStatus) => {
    if (!selectedSubjectForSyllabus) return;
    const updatedSyllabus = (selectedSubjectForSyllabus.syllabus || []).map(u => 
      u.id === unitId ? { ...u, status } : u
    );
    onUpdateSyllabus(selectedSubjectForSyllabus.id, updatedSyllabus);
    setSelectedSubjectForSyllabus({ ...selectedSubjectForSyllabus, syllabus: updatedSyllabus });
  };

  const handleDeleteUnit = (unitId: string) => {
    if (!selectedSubjectForSyllabus) return;
    const updatedSyllabus = (selectedSubjectForSyllabus.syllabus || [])
      .filter(u => u.id !== unitId)
      .map((u, i) => ({ ...u, order: i + 1 }));
    onUpdateSyllabus(selectedSubjectForSyllabus.id, updatedSyllabus);
    setSelectedSubjectForSyllabus({ ...selectedSubjectForSyllabus, syllabus: updatedSyllabus });
  };

  const handleDragStart = (index: number) => setDraggedUnitIndex(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (index: number) => {
    if (draggedUnitIndex === null || draggedUnitIndex === index || !selectedSubjectForSyllabus) return;
    
    const syllabus = [...(selectedSubjectForSyllabus.syllabus || [])].sort((a, b) => a.order - b.order);
    const [movedItem] = syllabus.splice(draggedUnitIndex, 1);
    syllabus.splice(index, 0, movedItem);
    
    const reorderedSyllabus = syllabus.map((u, i) => ({ ...u, order: i + 1 }));
    onUpdateSyllabus(selectedSubjectForSyllabus.id, reorderedSyllabus);
    setSelectedSubjectForSyllabus({ ...selectedSubjectForSyllabus, syllabus: reorderedSyllabus });
    setDraggedUnitIndex(null);
  };

  const removeSubject = (id: string) => setSubjects(subjects.filter(s => s.id !== id));
  const removeEvent = (id: string) => setEvents(events.filter(e => e.id !== id));

  if (isBatchAdding) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <AddSubjectFormBatch 
          onBack={() => setIsBatchAdding(false)} 
          onSubmit={(data) => {
            const newBatch: Subject[] = data.subjects.map((s: any) => ({
              id: `SUB-${Math.random().toString(36).substr(2, 9)}`,
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

  const activeSubject = subjects.find(s => s.id === selectedGradebookSubjectId);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Academic Management</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Term Ledger & Curriculum Control</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
           <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex shrink-0">
             <button onClick={() => setActiveTab('SUBJECTS')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'SUBJECTS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}>Subjects</button>
             <button onClick={() => setActiveTab('GRADEBOOK')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'GRADEBOOK' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}>Gradebook</button>
             <button onClick={() => setActiveTab('CALENDAR')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'CALENDAR' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}>Calendar</button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AcademicCard icon={<BookOpen className="text-indigo-600" />} label="Active Subjects" value={subjects.length.toString()} color="indigo" />
        <AcademicCard icon={<Award className="text-emerald-600" />} label="Avg. Score" value="74%" color="emerald" />
        <AcademicCard icon={<CalendarIcon className="text-amber-600" />} label="Events" value={events.length.toString()} color="amber" />
        <AcademicCard icon={<CheckCircle2 className="text-rose-600" />} label="Completion" value={`${Math.round(subjects.reduce((a, b) => a + b.progress, 0) / (subjects.length || 1))}%`} color="rose" />
      </div>

      {activeTab === 'SUBJECTS' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
             <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Curriculum Registry</h3>
             <div className="flex items-center gap-3">
               <button onClick={() => setIsBatchAdding(true)} className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                  <LayoutGrid size={14} /> Batch Add
               </button>
               <button onClick={() => setIsAddingSubject(true)} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
                  <Plus size={14} /> Single
               </button>
             </div>
          </div>
          <div className="divide-y divide-slate-100">
            {subjects.map((sub) => (
              <div key={sub.id} className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between hover:bg-slate-50/50 transition-colors gap-6 group">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                      <Book size={24} />
                   </div>
                   <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900">{sub.name}</h4>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 uppercase tracking-tighter">{sub.grade}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{sub.teacher}</p>
                   </div>
                </div>
                <div className="w-full lg:max-w-xs">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Syllabus Progress</span>
                      <span className="text-xs font-black text-indigo-600">{sub.progress}%</span>
                   </div>
                   <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${sub.progress}%` }}></div>
                   </div>
                </div>
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <button 
                    onClick={() => { setSelectedGradebookSubjectId(sub.id); setActiveTab('GRADEBOOK'); }}
                    className="flex-1 lg:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-100 hover:bg-indigo-50 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <TableIcon size={14} /> Ledger
                  </button>
                  <button 
                    onClick={() => setSelectedSubjectForSyllabus(sub)}
                    className="flex-1 lg:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
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
      )}

      {activeTab === 'GRADEBOOK' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-indigo-600 rounded-[1.5rem] text-white shadow-xl shadow-indigo-100">
                    <Award size={32} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight">Institutional Ledger</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">AY 2024-25 | Performance OS</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative min-w-[320px] w-full md:w-auto">
                  <select 
                    value={selectedGradebookSubjectId}
                    onChange={(e) => setSelectedGradebookSubjectId(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none pr-12 transition-all shadow-sm"
                  >
                    <option value="">Select Subject Registry</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
           </div>

           {!selectedGradebookSubjectId ? (
              <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                 <Search size={64} className="mx-auto text-slate-100 mb-6" />
                 <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Please select a subject ledger to begin entry</p>
              </div>
           ) : (
              <div className="space-y-8">
                 {!(activeSubject?.assessments?.length) && (
                   <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                         <Zap className="text-indigo-600" size={24} />
                         <div>
                            <p className="text-sm font-black text-slate-900 uppercase">Architecture Missing</p>
                            <p className="text-xs text-slate-500 font-medium">This subject requires the standard 3-term assessment pairing (Test + Exam).</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleInitializeGrades(selectedGradebookSubjectId)}
                        className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                      >
                        Initialize Term Architecture
                      </button>
                   </div>
                 )}

                 {activeSubject?.assessments?.length > 0 && (
                   <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden relative">
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                         <div className="flex items-center gap-2">
                           <FileCheck size={18} className="text-emerald-500" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Consensus Pipeline</span>
                         </div>
                         <button 
                           onClick={() => setCurrentView?.('EXAMS_OFFICE')}
                           className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                         >
                           Submit for Exam Office Verification <ChevronRight size={14} />
                         </button>
                      </div>
                      <div className="overflow-x-auto custom-scrollbar">
                         <table className="w-full text-left border-collapse min-w-[1400px]">
                            <thead>
                               <tr className="bg-slate-900 text-white border-b border-slate-800">
                                  <th rowSpan={2} className="px-8 py-6 border-r border-slate-800 sticky left-0 bg-slate-900 z-20 w-64 min-w-[280px]">Student Registry</th>
                                  {TERMS.map(term => (
                                    <th key={term} colSpan={4} className="px-6 py-4 text-center border-r border-slate-800 uppercase text-[10px] font-black tracking-[0.2em] bg-slate-800/30">
                                       {term} TERM
                                    </th>
                                  ))}
                                  <th colSpan={3} className="px-6 py-4 text-center uppercase text-[10px] font-black tracking-[0.2em] bg-indigo-900">YEARLY AGGREGATE</th>
                               </tr>
                               <tr className="bg-slate-50 border-b border-slate-200">
                                  {TERMS.map(term => (
                                    <React.Fragment key={`${term}-sub`}>
                                       <th className="px-3 py-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-tighter border-r border-slate-200">Test</th>
                                       <th className="px-3 py-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-tighter border-r border-slate-200">Exam</th>
                                       <th className="px-3 py-3 text-center text-[9px] font-black text-indigo-600 uppercase tracking-tighter border-r border-slate-200 bg-indigo-50/50">MN</th>
                                       <th className="px-3 py-3 text-center text-[9px] font-black text-amber-600 uppercase tracking-tighter border-r border-slate-200 bg-amber-50/50">RNK</th>
                                    </React.Fragment>
                                  ))}
                                  <th className="px-6 py-3 text-center text-[9px] font-black text-indigo-900 uppercase tracking-widest border-r border-indigo-100 bg-indigo-50/70">Mean</th>
                                  <th className="px-6 py-3 text-center text-[9px] font-black text-indigo-900 uppercase tracking-widest border-r border-indigo-100 bg-indigo-50/70">Rank</th>
                                  <th className="px-6 py-3 text-center text-[9px] font-black text-indigo-900 uppercase tracking-widest bg-indigo-50/70">Status</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                               {students.filter(s => s.grade === activeSubject?.grade).map(student => {
                                 const yearlyAvg = calculateYearlyAverage(selectedGradebookSubjectId, student.id);
                                 const isPromoted = yearlyAvg >= 50;

                                 return (
                                   <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                                      <td className="px-8 py-4 border-r border-slate-100 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-sm">
                                         <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                                                 {student.name.charAt(0)}
                                              </div>
                                              <div className="min-w-0">
                                                 <p className="text-xs font-black text-slate-900 truncate leading-tight">{student.name}</p>
                                                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{student.admissionNo}</p>
                                              </div>
                                            </div>
                                            <button 
                                              onClick={() => setSelectedStudentForGrades(student)}
                                              className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                              <UserCog size={16} />
                                            </button>
                                         </div>
                                      </td>
                                      
                                      {TERMS.map(term => {
                                         const testData = getStudentScore(selectedGradebookSubjectId, term, 'TEST', student.id);
                                         const examData = getStudentScore(selectedGradebookSubjectId, term, 'EXAM', student.id);
                                         const termAvg = calculateTermAverage(selectedGradebookSubjectId, student.id, term);
                                         const termRank = getRankings[term]?.[student.id] || '-';

                                         return (
                                            <React.Fragment key={`${term}-cells`}>
                                               <td className="px-2 py-4 border-r border-slate-100">
                                                  {testData ? (
                                                    <GradeInput 
                                                       initialValue={testData.score ?? ""}
                                                       maxMarks={100}
                                                       onSave={(v) => handleScoreUpdate(selectedGradebookSubjectId, testData.id, student.id, v)}
                                                    />
                                                  ) : <div className="text-center opacity-10 text-[8px] font-black">--</div>}
                                               </td>
                                               <td className="px-2 py-4 border-r border-slate-100">
                                                  {examData ? (
                                                    <GradeInput 
                                                       initialValue={examData.score ?? ""}
                                                       maxMarks={100}
                                                       onSave={(v) => handleScoreUpdate(selectedGradebookSubjectId, examData.id, student.id, v)}
                                                    />
                                                  ) : <div className="text-center opacity-10 text-[8px] font-black">--</div>}
                                               </td>
                                               <td className="px-2 py-4 border-r border-slate-100 bg-indigo-50/10 text-center">
                                                  <span className={`text-[11px] font-black ${termAvg >= 50 ? 'text-indigo-600' : 'text-rose-500'}`}>{termAvg}%</span>
                                               </td>
                                               <td className="px-2 py-4 border-r border-slate-100 bg-amber-50/10 text-center">
                                                  <span className="text-[10px] font-black text-amber-600">#{termRank}</span>
                                               </td>
                                            </React.Fragment>
                                         );
                                      })}

                                      <td className="px-6 py-4 text-center border-r border-indigo-100 bg-indigo-50/30">
                                         <span className="text-sm font-black text-indigo-900">{yearlyAvg}%</span>
                                      </td>
                                      <td className="px-6 py-4 text-center border-r border-indigo-100 bg-indigo-50/30">
                                         <span className="text-xs font-black text-amber-600">#{getRankings['YEARLY']?.[student.id] || '-'}</span>
                                      </td>
                                      <td className="px-6 py-4 text-center bg-indigo-50/30">
                                         <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isPromoted ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                                            {isPromoted ? <><CheckCircle size={10} /> Promoted</> : <><X size={10} /> Retained</>}
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
           )}
        </div>
      )}

      {activeTab === 'CALENDAR' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                   <CalendarDays size={24} />
                </div>
                <div>
                   <h3 className="font-black text-slate-900 uppercase tracking-tight">Institutional Calendar</h3>
                   <p className="text-xs text-slate-500 font-medium">Global academic timeline.</p>
                </div>
             </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${event.type === 'EVENT' ? 'bg-emerald-500' : event.type === 'EXAM' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
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
                  <p className="text-sm text-slate-500 font-medium mb-4">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Syllabus Management Modal */}
      {selectedSubjectForSyllabus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => { setSelectedSubjectForSyllabus(null); setIsAddingUnit(false); }}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                  <ListTodo size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedSubjectForSyllabus.name} Syllabus</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedSubjectForSyllabus.grade} Registry • {selectedSubjectForSyllabus.teacher}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedSubjectForSyllabus(null); setIsAddingUnit(false); }} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              {/* Progress Summary */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                 <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Curriculum Delivery Integrity</p>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-black text-indigo-600">{selectedSubjectForSyllabus.progress}%</span>
                      <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${selectedSubjectForSyllabus.progress}%` }}></div>
                      </div>
                    </div>
                 </div>
                 <button 
                  onClick={() => setIsAddingUnit(!isAddingUnit)}
                  className="ml-6 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2"
                >
                  {isAddingUnit ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Unit</>}
                </button>
              </div>

              {/* Add Unit Sub-Form */}
              {isAddingUnit && (
                <form onSubmit={handleAddSyllabusUnit} className="p-8 bg-white border-2 border-indigo-100 rounded-[2rem] space-y-6 animate-in slide-in-from-top-4 duration-300">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Specification (Title)</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Fundamental Trigonometry" 
                        value={unitForm.title}
                        onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Learning Objectives / Description</label>
                      <textarea 
                        rows={3}
                        placeholder="Outline the core concepts and student takeaways..." 
                        value={unitForm.description}
                        onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 resize-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Milestone Status</label>
                          <select 
                            value={unitForm.status}
                            onChange={(e) => setUnitForm({ ...unitForm, status: e.target.value as SyllabusStatus })}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-black uppercase appearance-none"
                          >
                            <option value="PENDING">Pending Approval</option>
                            <option value="IN_PROGRESS">Actively Teaching</option>
                            <option value="COMPLETED">Delivery Confirmed</option>
                          </select>
                       </div>
                       <div className="flex items-end">
                         <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98]">
                           Register Curriculum Unit
                         </button>
                       </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Units Ledger with Drag & Drop */}
              <div className="space-y-4" onDragOver={handleDragOver}>
                {(selectedSubjectForSyllabus.syllabus || []).sort((a,b) => a.order - b.order).map((unit, index) => (
                  <div 
                    key={unit.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDrop={() => handleDrop(index)}
                    className={`group p-6 rounded-[2rem] border transition-all flex items-start gap-5 relative ${
                      unit.status === 'COMPLETED' ? 'bg-emerald-50/40 border-emerald-100 shadow-sm' : 
                      unit.status === 'IN_PROGRESS' ? 'bg-indigo-50/40 border-indigo-100 shadow-sm' : 
                      'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'
                    } ${draggedUnitIndex === index ? 'opacity-30' : 'opacity-100'}`}
                  >
                    {/* Drag Handle */}
                    <div className="mt-1 cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0">
                      <GripVertical size={22} />
                    </div>
                    
                    {/* Unit Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                         <span className="text-[10px] font-black w-6 h-6 rounded-lg bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0 shadow-sm">
                            {unit.order}
                         </span>
                         <h5 className="text-base font-black text-slate-900 truncate uppercase tracking-tight">{unit.title}</h5>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{unit.description || 'No objectives defined for this module.'}</p>
                      
                      {/* Interactive Progress Toggle Bar */}
                      <div className="flex items-center gap-2 mt-5">
                         <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-inner">
                            <button 
                              onClick={() => handleUpdateUnitStatus(unit.id, 'PENDING')}
                              title="Set Pending"
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${unit.status === 'PENDING' ? 'bg-slate-100 text-slate-700 shadow-sm' : 'text-slate-300 hover:text-slate-400'}`}
                            ><Circle size={12} strokeWidth={3} /> Pending</button>
                            <button 
                              onClick={() => handleUpdateUnitStatus(unit.id, 'IN_PROGRESS')}
                              title="Set In Progress"
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${unit.status === 'IN_PROGRESS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:text-indigo-400'}`}
                            ><PlayCircle size={12} strokeWidth={3} /> Teaching</button>
                            <button 
                              onClick={() => handleUpdateUnitStatus(unit.id, 'COMPLETED')}
                              title="Set Completed"
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${unit.status === 'COMPLETED' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-300 hover:text-emerald-500'}`}
                            ><CheckCircle size={12} strokeWidth={3} /> Finished</button>
                         </div>
                         <div className="flex-1"></div>
                         <button 
                           onClick={() => handleDeleteUnit(unit.id)}
                           className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                           title="Purge Unit"
                         ><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}

                {(selectedSubjectForSyllabus.syllabus || []).length === 0 && !isAddingUnit && (
                  <div className="py-24 text-center bg-slate-50/50 border-4 border-dashed border-slate-100 rounded-[3rem]">
                    <ListTodo size={64} className="mx-auto text-slate-100 mb-4" />
                    <p className="text-sm font-black text-slate-300 uppercase tracking-[0.3em]">Curriculum Void Detected</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">Initialize this subject by adding the first syllabus unit.</p>
                    <button 
                      onClick={() => setIsAddingUnit(true)}
                      className="mt-6 px-8 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all"
                    >Initialize Curriculum</button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <Target size={18} className="text-indigo-400" />
                   <span>Sequential Curriculum Integrity Mode</span>
                </div>
                <button 
                  onClick={() => { setSelectedSubjectForSyllabus(null); setIsAddingUnit(false); }}
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  Finalize & Persist
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Termly Grade Entry Dialog */}
      {selectedStudentForGrades && activeSubject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedStudentForGrades(null)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/20">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg">
                    <Calculator size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Student Performance Entry</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedStudentForGrades.name} • {activeSubject.name}</p>
                  </div>
               </div>
               <button onClick={() => setSelectedStudentForGrades(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                 <X size={24} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
               {/* Calculations Summary */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500 rounded-full blur-[40px] opacity-20 -mr-12 -mt-12"></div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">Subject Yearly Mean</p>
                     <p className="text-3xl font-black">{calculateYearlyAverage(activeSubject.id, selectedStudentForGrades.id)}%</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Rank & Promotion</p>
                     <div className="flex items-center gap-2">
                        {calculateYearlyAverage(activeSubject.id, selectedStudentForGrades.id) >= 50 ? (
                           <span className="text-emerald-500 font-black flex items-center gap-1.5 text-sm uppercase tracking-tighter"><CheckCircle size={16} /> PROMOTED</span>
                        ) : (
                           <span className="text-rose-500 font-black flex items-center gap-1.5 text-sm uppercase tracking-tighter"><AlertCircle size={16} /> RETAINED</span>
                        )}
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                        <span className="text-amber-500 font-black text-sm">#{getRankings['YEARLY']?.[selectedStudentForGrades.id] || '-'}</span>
                     </div>
                  </div>
               </div>

               {/* Term Sections */}
               <div className="space-y-6">
                  {TERMS.map(term => {
                    const test = getStudentScore(activeSubject.id, term, 'TEST', selectedStudentForGrades.id);
                    const exam = getStudentScore(activeSubject.id, term, 'EXAM', selectedStudentForGrades.id);
                    const termAvg = calculateTermAverage(activeSubject.id, selectedStudentForGrades.id, term);

                    return (
                      <div key={term} className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-6 space-y-5">
                         <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{term} TERM LEDGER</h4>
                            <div className="flex items-center gap-3">
                               <span className={`text-[10px] font-black px-3 py-1 rounded-full ${termAvg >= 50 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>MN: {termAvg}%</span>
                               <span className="text-[10px] font-black px-3 py-1 rounded-full bg-amber-50 text-amber-600">RNK: #{getRankings[term]?.[selectedStudentForGrades.id] || '-'}</span>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                               <div className="flex items-center justify-between px-1">
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Test (100)</span>
                               </div>
                               {test && (
                                 <GradeInput 
                                    className="w-full"
                                    initialValue={test.score ?? ""}
                                    maxMarks={100}
                                    onSave={(v) => handleScoreUpdate(activeSubject.id, test.id, selectedStudentForGrades.id, v)}
                                 />
                               )}
                            </div>
                            <div className="space-y-3">
                               <div className="flex items-center justify-between px-1">
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Exam (100)</span>
                               </div>
                               {exam && (
                                 <GradeInput 
                                    className="w-full"
                                    initialValue={exam.score ?? ""}
                                    maxMarks={100}
                                    onSave={(v) => handleScoreUpdate(activeSubject.id, exam.id, selectedStudentForGrades.id, v)}
                                 />
                               )}
                            </div>
                         </div>
                      </div>
                    );
                  })}
               </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <ShieldCheck size={18} className="text-emerald-500" />
                   <span>Ledger Consistency Verified</span>
                </div>
                <button 
                  onClick={() => setSelectedStudentForGrades(null)}
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  Finished Entry
                </button>
            </div>
          </div>
        </div>
      )}

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
            <form className="p-8 space-y-6">
              <p className="text-center text-slate-400 text-xs italic">Subject registry form implementation pending API integration...</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function AcademicCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center gap-4 shadow-sm group hover:border-indigo-200 transition-all">
      <div className={`p-4 bg-slate-50 rounded-2xl group-hover:bg-${color}-50 transition-colors`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}

export default AcademicManagement;
