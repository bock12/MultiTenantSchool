
import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  BookOpen, 
  CalendarDays, 
  Clock, 
  Award, 
  CheckCircle2, 
  Library, 
  User, 
  FileText,
  Download,
  IdCard,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  ShieldCheck,
  Star,
  MapPin,
  Flame,
  ArrowRight,
  Target,
  AlertCircle
} from 'lucide-react';
import { Student, Subject, Tenant } from '../types';
import IDCardGenerator from './IDCardGenerator';

interface StudentPortalProps {
  student: Student;
  subjects: Subject[];
  activeTenant: Tenant;
  allStudents: Student[];
}

const StudentPortal: React.FC<StudentPortalProps> = ({ student, subjects, activeTenant, allStudents }) => {
  const [showIDCard, setShowIDCard] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PERFORMANCE' | 'SYLLABUS'>('OVERVIEW');

  // Mock data for behavioral stats
  const attendancePercentage = 96.4;
  const overdueBooks = 1;
  const behaviorPoints = 1250;

  const TERMS = ['FIRST', 'SECOND', 'THIRD'] as const;

  // --- Performance Calculation Logic ---

  const calculateStudentPerformance = useMemo(() => {
    return subjects.map(sub => {
      const perfMap: Record<string, any> = {
        subject: sub.name,
        teacher: sub.teacher,
        progress: sub.progress,
        terms: {} as Record<string, { test: number | string, exam: number | string, mean: number | string, rank: number | string }>,
        yearlyMean: 0,
        yearlyRank: '-' as string | number
      };

      let yearlyTotal = 0;
      let validTermCount = 0;

      // Calculate for each term
      TERMS.forEach(term => {
        const test = sub.assessments?.find(a => a.term === term && a.subType === 'TEST')?.scores[student.id];
        const exam = sub.assessments?.find(a => a.term === term && a.subType === 'EXAM')?.scores[student.id];
        
        let mean: number | string = '--';
        let rank: number | string = '--';

        if (test !== undefined || exam !== undefined) {
          const tScore = test || 0;
          const eScore = exam || 0;
          mean = Math.round((tScore + eScore) / 2);
          yearlyTotal += mean;
          validTermCount++;

          // Rank Logic: Compare this student's mean against others in the same class for this subject/term
          const classmates = allStudents.filter(s => s.grade === student.grade);
          const classmateMeans = classmates.map(s => {
            const ct = sub.assessments?.find(a => a.term === term && a.subType === 'TEST')?.scores[s.id] || 0;
            const ce = sub.assessments?.find(a => a.term === term && a.subType === 'EXAM')?.scores[s.id] || 0;
            return Math.round((ct + ce) / 2);
          }).sort((a, b) => b - a);

          rank = classmateMeans.indexOf(mean) + 1;
        }

        perfMap.terms[term] = {
          test: test !== undefined ? test : '--',
          exam: exam !== undefined ? exam : '--',
          mean,
          rank
        };
      });

      perfMap.yearlyMean = validTermCount > 0 ? Math.round(yearlyTotal / validTermCount) : 0;
      
      // Calculate Yearly Rank
      if (validTermCount > 0) {
        const classmates = allStudents.filter(s => s.grade === student.grade);
        const classmateYearlyMeans = classmates.map(s => {
          let sTotal = 0;
          let sTerms = 0;
          TERMS.forEach(term => {
            const st = sub.assessments?.find(a => a.term === term && a.subType === 'TEST')?.scores[s.id] || 0;
            const se = sub.assessments?.find(a => a.term === term && a.subType === 'EXAM')?.scores[s.id] || 0;
            if (st || se) {
              sTotal += Math.round((st + se) / 2);
              sTerms++;
            }
          });
          return sTerms > 0 ? Math.round(sTotal / sTerms) : 0;
        }).sort((a, b) => b - a);
        perfMap.yearlyRank = classmateYearlyMeans.indexOf(perfMap.yearlyMean) + 1;
      }

      return perfMap;
    });
  }, [subjects, student, allStudents]);

  const getGrade = (mean: number | string) => {
    if (typeof mean === 'string') return '-';
    if (mean >= 80) return 'A+';
    if (mean >= 70) return 'A';
    if (mean >= 60) return 'B';
    if (mean >= 50) return 'C';
    if (mean >= 40) return 'D';
    return 'F';
  };

  const getGradeColor = (mean: number | string) => {
    if (typeof mean === 'string') return 'text-slate-300';
    if (mean >= 70) return 'text-emerald-500';
    if (mean >= 50) return 'text-indigo-500';
    if (mean >= 40) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header Profile Section */}
      <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20 -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600 rounded-full blur-[100px] opacity-10 -ml-32 -mb-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] bg-white/10 backdrop-blur-md border-4 border-white/20 overflow-hidden shadow-2xl">
              {student.profilePicture ? (
                <img src={student.profilePicture} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40"><User size={64} /></div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-3 rounded-2xl border-4 border-slate-900 shadow-xl">
              <ShieldCheck size={20} className="text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
               <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">Welcome back, {student.name.split(' ')[0]}!</h2>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                  <span className="px-4 py-1.5 bg-white/10 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest">{student.grade} • Section {student.section}</span>
                  <span className="px-4 py-1.5 bg-indigo-500 text-white rounded-full text-xs font-black uppercase tracking-widest">{student.stream || 'General'} Stream</span>
                  <span className="flex items-center gap-2 text-indigo-300 font-bold text-xs"><Flame size={16} /> 12 Day Study Streak</span>
               </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
               <HeaderMetric label="Admission No" value={student.admissionNo} icon={<Fingerprint size={14} />} />
               <HeaderMetric label="Attendance" value={`${attendancePercentage}%`} icon={<CheckCircle2 size={14} />} />
               <HeaderMetric label="Library Status" value={overdueBooks > 0 ? `${overdueBooks} Overdue` : 'Clear'} icon={<Library size={14} />} color={overdueBooks > 0 ? 'rose' : 'emerald'} />
               <HeaderMetric label="Behavior" value={behaviorPoints.toLocaleString()} icon={<Star size={14} />} />
            </div>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
             <button onClick={() => setShowIDCard(true)} className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all shadow-xl">
                <IdCard size={18} /> Digital ID Pass
             </button>
             <button className="flex items-center justify-center gap-3 px-8 py-4 bg-white/10 border border-white/10 backdrop-blur-md text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest hover:bg-white/20 transition-all">
                <Download size={18} /> Report Card
             </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit mx-auto shadow-sm">
        <button onClick={() => setActiveTab('OVERVIEW')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'OVERVIEW' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>My Journey</button>
        <button onClick={() => setActiveTab('PERFORMANCE')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'PERFORMANCE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Academic Ledger</button>
        <button onClick={() => setActiveTab('SYLLABUS')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SYLLABUS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Curriculum</button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               {/* Performance Summary Cards */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-indigo-300 transition-all">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Overall Performance Index</p>
                     <div className="flex items-end gap-3">
                        <h3 className="text-5xl font-black text-slate-900 tracking-tighter">88%</h3>
                        <span className="text-emerald-500 font-bold text-sm mb-1.5 flex items-center gap-1"><TrendingUp size={16} /> +4.2%</span>
                     </div>
                     <p className="text-xs text-slate-500 mt-4 font-medium italic">Highest performance in Mathematics & Physics.</p>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-indigo-300 transition-all">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Current Class Standing</p>
                     <div className="flex items-end gap-3">
                        <h3 className="text-5xl font-black text-indigo-600 tracking-tighter">#04</h3>
                        <span className="text-slate-400 font-bold text-sm mb-1.5 uppercase tracking-widest">of {allStudents.filter(s => s.grade === student.grade).length} Students</span>
                     </div>
                     <p className="text-xs text-slate-500 mt-4 font-medium italic">Projected to hit Top 3 by end of term.</p>
                  </div>
               </div>

               {/* My Subjects Summary */}
               <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                     <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Current Courseware</h3>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subjects.length} Active Subjects</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                     {subjects.map((sub, idx) => (
                       <div key={sub.id} className={`p-8 border-slate-100 hover:bg-indigo-50/30 transition-colors group ${idx % 2 === 0 ? 'sm:border-r' : ''} ${idx < subjects.length - 2 ? 'border-b' : ''}`}>
                          <div className="flex items-center justify-between mb-6">
                             <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:scale-110 transition-transform">
                                <BookOpen size={24} />
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syllabus</p>
                                <p className="text-sm font-black text-indigo-600">{sub.progress}% Complete</p>
                             </div>
                          </div>
                          <h4 className="text-lg font-black text-slate-900 uppercase mb-1">{sub.name}</h4>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Teacher: {sub.teacher}</p>
                          <div className="mt-6 flex gap-2">
                             <button className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Materials</button>
                             <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600 hover:border-indigo-100 transition-all"><ArrowRight size={14} /></button>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               {/* AI Personal Tutor Bridge */}
               <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                  <BrainCircuit className="text-indigo-200 mb-6" size={48} />
                  <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase leading-tight">Nexus AI Tutor</h3>
                  <p className="text-indigo-100/70 text-sm leading-relaxed mb-8 font-medium">
                    "Hey {student.name.split(' ')[0]}, I've noticed you're doing great in Math! Need help prepping for the Science mid-term?"
                  </p>
                  <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                    Open AI Consultant
                  </button>
               </div>

               {/* Achievement Board */}
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <Award size={18} className="text-amber-500" /> Recent Badges
                    </h3>
                    <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">View All</button>
                  </div>
                  <div className="flex gap-4">
                     <BadgeIcon color="emerald" label="Perfect Attendance" />
                     <BadgeIcon color="amber" label="Math Wizard" />
                     <BadgeIcon color="rose" label="Team Leader" />
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'PERFORMANCE' && (
          <div className="space-y-8">
             <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Institutional Gradebook</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Student ID: {student.admissionNo} • AY 2024-25</p>
                   </div>
                   <div className="flex gap-3">
                      <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all hover:bg-slate-50"><Download size={14} /> PDF Transcript</button>
                      <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"><Target size={14} /> Request Re-marking</button>
                   </div>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                   <table className="w-full text-left border-collapse min-w-[1200px]">
                      <thead>
                         <tr className="bg-slate-900 text-white border-b border-slate-800">
                            <th rowSpan={2} className="px-8 py-6 border-r border-slate-800 uppercase text-[10px] font-black tracking-widest sticky left-0 bg-slate-900 z-10 w-64">Subject Registry</th>
                            {TERMS.map(term => (
                               <th key={term} colSpan={4} className="px-6 py-4 text-center border-r border-slate-800 uppercase text-[9px] font-black tracking-[0.2em] bg-slate-800/30">
                                  {term} TERM
                               </th>
                            ))}
                            <th colSpan={2} className="px-6 py-4 text-center uppercase text-[10px] font-black tracking-widest bg-indigo-900">YEARLY AGGREGATE</th>
                         </tr>
                         <tr className="bg-slate-50 text-slate-400 border-b border-slate-200 text-center">
                            {TERMS.map(term => (
                               <React.Fragment key={`${term}-subs`}>
                                  <th className="px-4 py-2 border-r border-slate-200 text-[8px] font-black uppercase">Test</th>
                                  <th className="px-4 py-2 border-r border-slate-200 text-[8px] font-black uppercase">Exam</th>
                                  <th className="px-4 py-2 border-r border-slate-200 text-[8px] font-black uppercase bg-indigo-50 text-indigo-600">MN</th>
                                  <th className="px-4 py-2 border-r border-slate-200 text-[8px] font-black uppercase bg-amber-50 text-amber-600">RNK</th>
                               </React.Fragment>
                            ))}
                            <th className="px-6 py-3 text-[9px] font-black uppercase border-r border-indigo-100 bg-indigo-50 text-indigo-900">Mean Score</th>
                            <th className="px-6 py-3 text-[9px] font-black uppercase bg-indigo-50 text-indigo-900">Overall Pos.</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {calculateStudentPerformance.map((perf, i) => (
                           <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="px-8 py-5 border-r border-slate-100 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-sm">
                                 <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">{perf.subject}</p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Instructor: {perf.teacher}</p>
                              </td>
                              
                              {TERMS.map(term => (
                                 <React.Fragment key={`${term}-cells`}>
                                    <td className="px-4 py-5 text-center border-r border-slate-100 font-bold text-slate-600 text-xs">
                                       {perf.terms[term].test}
                                    </td>
                                    <td className="px-4 py-5 text-center border-r border-slate-100 font-bold text-slate-600 text-xs">
                                       {perf.terms[term].exam}
                                    </td>
                                    <td className="px-4 py-5 text-center border-r border-slate-100 bg-indigo-50/20 font-black text-indigo-600 text-sm">
                                       {perf.terms[term].mean}%
                                    </td>
                                    <td className="px-4 py-5 text-center border-r border-slate-100 bg-amber-50/20 font-black text-amber-600 text-xs">
                                       {perf.terms[term].rank !== '--' ? `#${perf.terms[term].rank}` : '--'}
                                    </td>
                                 </React.Fragment>
                              ))}

                              <td className="px-6 py-5 text-center border-r border-indigo-100 bg-indigo-50/50">
                                 <div className="flex flex-col items-center">
                                    <span className={`text-base font-black ${getGradeColor(perf.yearlyMean)}`}>{perf.yearlyMean}%</span>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border mt-1 ${
                                       perf.yearlyMean >= 50 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>Grade {getGrade(perf.yearlyMean)}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-5 text-center bg-indigo-50/50">
                                 <span className="text-sm font-black text-amber-600">
                                    {perf.yearlyRank !== '-' ? `#${String(perf.yearlyRank).padStart(2, '0')}` : '-'}
                                 </span>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
                
                {/* Result Caveat */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
                   <div className="p-3 bg-white rounded-2xl border border-slate-200 text-amber-500 shadow-sm">
                      <AlertCircle size={20} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">Provisional Results Protocol</p>
                      <p className="text-[10px] text-slate-500 font-medium">These marks are provisional and subject to Exam Office verification. Final transcripts will be available 7 days after the Third Term consensus.</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'SYLLABUS' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map(sub => (
                <div key={sub.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 group hover:border-indigo-300 transition-all">
                   <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <BookOpen size={24} />
                      </div>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">{sub.progress}%</span>
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{sub.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Instructor: {sub.teacher}</p>
                   </div>
                   <div className="space-y-3">
                      {(sub.syllabus || []).slice(0, 3).map((unit, i) => (
                        <div key={i} className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full shrink-0 ${unit.status === 'COMPLETED' ? 'bg-emerald-500' : unit.status === 'IN_PROGRESS' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-200'}`}></div>
                           <p className={`text-[11px] font-bold truncate ${unit.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{unit.title}</p>
                        </div>
                      ))}
                      {(!sub.syllabus || sub.syllabus.length === 0) && <p className="text-[10px] text-slate-300 italic">No syllabus units registered yet.</p>}
                   </div>
                   <button className="w-full py-3.5 bg-slate-50 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Explore Curriculum</button>
                </div>
              ))}
           </div>
        )}
      </div>

      {showIDCard && (
        <IDCardGenerator type="STUDENT" data={student} onClose={() => setShowIDCard(false)} />
      )}
    </div>
  );
};

const HeaderMetric: React.FC<{ label: string, value: string, icon: React.ReactNode, color?: string }> = ({ label, value, icon, color = 'white' }) => (
  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
    <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2 mb-1.5 opacity-60">
       {icon} {label}
    </p>
    <p className={`text-sm font-black text-${color}`}>{value}</p>
  </div>
);

const BadgeIcon: React.FC<{ color: string, label: string }> = ({ color, label }) => (
  <div className="flex flex-col items-center gap-2 shrink-0">
     <div className={`w-12 h-12 rounded-full bg-${color}-50 border border-${color}-100 flex items-center justify-center text-${color}-600 shadow-sm`}>
        <Award size={24} />
     </div>
     <p className="text-[8px] font-black text-slate-400 uppercase text-center max-w-[60px] leading-tight">{label}</p>
  </div>
);

const Fingerprint: React.FC<{ size: number, className?: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12c0-4.4 3.6-8 8-8s8 3.6 8 8" /><path d="M5 12c0-2.8 2.2-5 5-5s5 2.2 5 5" /><path d="M8 12c0-1.1.9-2 2-2s2 .9 2 2" /><path d="M10 20c-4.4 0-8-3.6-8-8" /><path d="M10 20c4.4 0 8-3.6 8-8" /><path d="M20 12c0 5.5-4.5 10-10 10" />
  </svg>
);

export default StudentPortal;
