"use client";

import * as React from "react";
import { 
    BookUp, 
    Download, 
    Loader2, 
    AlertCircle, 
    CheckCircle2, 
    Save, 
    ChevronDown,
    Check,
    AlertTriangle,
    FileSpreadsheet,
    UserCircle,
    ArrowDown,
    ArrowUp
} from "lucide-react";
import * as Papa from 'papaparse';

/**
 * Enhanced GradeInput with localized state and visual feedback
 */
const GradeInput = ({ 
    studentId, 
    initialValue, 
    onSave, 
    onKeyDown,
    index
}: { 
    studentId: string; 
    initialValue: string; 
    onSave: (val: string) => void;
    onKeyDown: (e: React.KeyboardEvent, index: number) => void;
    index: number;
}) => {
    const [localValue, setLocalValue] = React.useState(initialValue);
    const [status, setStatus] = React.useState<'idle' | 'saved' | 'error'>('idle');

    // Sync with external state changes (e.g., bulk import)
    React.useEffect(() => {
        setLocalValue(initialValue);
    }, [initialValue]);

    const handleBlur = () => {
        if (localValue === initialValue) return;
        
        const num = parseFloat(localValue);
        if (localValue !== "" && (isNaN(num) || num < 0 || num > 100)) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2000);
            return;
        }

        onSave(localValue);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
    };

    return (
        <div className="relative flex items-center justify-center">
            <input
                id={`score-${index}`}
                type="number"
                value={localValue}
                placeholder="--"
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => onKeyDown(e, index)}
                className={`w-20 px-3 py-2 text-center text-sm font-black rounded-xl border transition-all outline-none ${
                    status === 'saved' 
                        ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/10 text-emerald-700' 
                        : status === 'error'
                        ? 'bg-rose-50 border-rose-500 ring-4 ring-rose-500/10 text-rose-700'
                        : 'bg-white border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-800'
                }`}
            />
            {status === 'saved' && (
                <div className="absolute -right-7 text-emerald-500 animate-in fade-in zoom-in duration-300">
                    <Check size={16} strokeWidth={3} />
                </div>
            )}
            {status === 'error' && (
                <div className="absolute -right-7 text-rose-500 animate-in shake duration-300">
                    <AlertTriangle size={16} strokeWidth={3} />
                </div>
            )}
        </div>
    );
};

interface Exam {
    id: string;
    title: string;
    status: string;
    levelId?: string;
    subjectId?: string;
    classroomId?: string;
    subject?: { name: string };
    syllabusCoverage?: number;
}

interface Student {
    id: string;
    name: string;
    rollNumber?: string;
}

export const DigitalGradebook = () => {
    const [exams, setExams] = React.useState<Exam[]>([]);
    const [selectedExamId, setSelectedExamId] = React.useState<string>("");
    const [students, setStudents] = React.useState<Student[]>([]);
    const [results, setResults] = React.useState<Record<string, { score: string, grade: string }>>({});
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [isDirty, setIsDirty] = React.useState(false);
    
    const selectedExam = exams.find(e => e.id === selectedExamId);

    const fetchExams = async () => {
        try {
            const res = await fetch('/api/exams');
            const json = await res.json();
            const entryReady = (json.data || []).filter((e: any) =>
                ['SCHEDULED', 'LOCKED', 'IN_PROGRESS', 'COMPLETED', 'RESULTS_APPROVED', 'PUBLISHED'].includes(e.status)
            );
            setExams(entryReady);
            if (entryReady.length > 0) setSelectedExamId(entryReady[0].id);
        } catch (error) {
            console.error("Failed to fetch exams", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchExamData = async (examId: string) => {
        setLoading(true);
        try {
            const exam = exams.find(e => e.id === examId);
            if (!exam) return;

            const resResults = await fetch(`/api/exams/${examId}/results`);
            const jsonResults = await resResults.json();
            const resultsMap: Record<string, { score: string, grade: string }> = {};
            (jsonResults.data || []).forEach((r: any) => {
                resultsMap[r.studentId] = { score: String(r.score), grade: r.grade };
            });
            setResults(resultsMap);

            let studentUrl = '/api/students';
            if (exam.classroomId) {
                studentUrl = `/api/classrooms/${exam.classroomId}/students`;
            } else if (exam.levelId) {
                studentUrl = `/api/students?levelId=${exam.levelId}`;
            }

            const resStudents = await fetch(studentUrl);
            const jsonStudents = await resStudents.json();
            setStudents(jsonStudents.data || []);
        } catch (error) {
            console.error("Failed to fetch exam data", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchExams();
    }, []);

    React.useEffect(() => {
        if (selectedExamId) {
            fetchExamData(selectedExamId);
        }
    }, [selectedExamId]);

    const calculateGrade = (score: number) => {
        if (isNaN(score)) return "-";
        if (score >= 70) return 'A';
        if (score >= 60) return 'B';
        if (score >= 50) return 'C';
        if (score >= 40) return 'D';
        return 'F';
    };

    const handleScoreChange = (studentId: string, score: string) => {
        const val = parseFloat(score);
        setIsDirty(true);
        setResults(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                score: score,
                grade: calculateGrade(val)
            }
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();
            const next = document.getElementById(`score-${index + 1}`);
            if (next) (next as HTMLInputElement).focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = document.getElementById(`score-${index - 1}`);
            if (prev) (prev as HTMLInputElement).focus();
        }
    };

    const handleSaveResults = async () => {
        if (!selectedExamId) return;
        setSaving(true);

        // Fix: Explicitly cast Object.entries to ensure 'data' properties are accessible without 'unknown' errors
        const payload = (Object.entries(results) as [string, { score: string; grade: string }][]).map(([studentId, data]) => ({
            studentId,
            score: parseFloat(data.score) || 0,
            grade: data.grade
        })).filter(r => !isNaN(r.score));

        try {
            const res = await fetch(`/api/exams/${selectedExamId}/results`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ results: payload })
            });

            if (!res.ok) throw new Error("Failed to save results");

            setIsDirty(false);
        } catch (error: any) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadTemplate = () => {
        const csvData = students.map(student => ({
            StudentID: student.id,
            StudentName: student.name,
            Score: results[student.id]?.score || ''
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${selectedExam?.title || 'Exam'}_Template.csv`);
        link.click();
    };

    if (loading && exams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Initializing Digital Ledger...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Institutional Gradebook</h2>
                    <p className="text-sm text-slate-500 font-medium mt-2">
                        Selective Coverage: <span className="text-indigo-600 font-bold">{selectedExam?.syllabusCoverage || 0}%</span> of total curriculum mapped.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[280px]">
                        <select 
                            value={selectedExamId} 
                            onChange={(e) => setSelectedExamId(e.target.value)}
                            className="w-full pl-4 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-bold shadow-sm appearance-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        >
                            <option value="">Select Examination</option>
                            {exams.map(e => (
                                <option key={e.id} value={e.id}>{e.title} ({e.status})</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                        <Download size={14} /> Template
                    </button>
                    <button
                        onClick={handleSaveResults}
                        disabled={!selectedExamId || saving}
                        className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-200 disabled:shadow-none transition-all"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isDirty ? "Sync Ledger *" : "Ledger Synced"}
                    </button>
                </div>
            </div>

            {!selectedExamId ? (
                <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Selection Detected</h3>
                    <p className="text-slate-400 mt-2 font-medium">Please select an active examination from the registry above.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-10 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                                <tr>
                                    <th className="px-8 py-6 w-[140px]">Roll No.</th>
                                    <th className="px-8 py-6 min-w-[280px]">Student Profile</th>
                                    <th className="px-8 py-6 text-center w-[180px]">Score (0-100)</th>
                                    <th className="px-8 py-6 text-center w-[120px]">Grade</th>
                                    <th className="px-8 py-6 text-right w-[160px]">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.map((student, idx) => {
                                    const result = results[student.id];
                                    const isMissing = !result?.score;
                                    return (
                                        <tr key={student.id} className={`hover:bg-indigo-50/30 transition-colors group ${isMissing ? 'bg-amber-50/20' : ''}`}>
                                            <td className="px-8 py-5">
                                                <span className="font-mono font-black text-slate-400 text-xs bg-slate-100 px-2 py-1 rounded-lg">
                                                    #{student.rollNumber || (idx + 1).toString().padStart(3, '0')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 shadow-inner">
                                                        <UserCircle size={22} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-slate-900 truncate leading-tight">{student.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {student.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <GradeInput 
                                                    index={idx}
                                                    studentId={student.id}
                                                    initialValue={result?.score || ""}
                                                    onSave={(val) => handleScoreChange(student.id, val)}
                                                    onKeyDown={handleKeyDown}
                                                />
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-black border transition-all ${
                                                    result?.grade === 'F' 
                                                        ? 'bg-rose-50 text-rose-600 border-rose-100' 
                                                        : result?.grade === 'A' 
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' 
                                                        : 'bg-slate-50 text-slate-700 border-slate-100'
                                                }`}>
                                                    {result?.grade || "-"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {isMissing ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-widest">
                                                        <AlertCircle size={10} /> Pending
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <CheckCircle2 size={10} /> Ready
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center">
                                            <FileSpreadsheet size={40} className="mx-auto text-slate-200 mb-4" />
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No student records found in this examination scope.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Visual Footer hint */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-indigo-900 rounded-[2rem] text-white overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20 -mr-16 -mt-16"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                        <ArrowDown className="text-indigo-300" size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest">Pro Entry Mode</h4>
                        <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest opacity-80">Use arrows or Enter for high-speed navigation</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10 text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Auto-Save Active</span>
                    <span className="flex items-center gap-2 opacity-50"><div className="w-2 h-2 rounded-full bg-indigo-400"></div> Ledger v2.5</span>
                </div>
            </div>
        </div>
    );
};
