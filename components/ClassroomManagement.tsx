import React, { useState, useMemo } from 'react';
import {
  School,
  Users,
  User,
  BookOpen,
  Search,
  ChevronRight,
  X,
  Clock,
  MapPin,
  DoorOpen,
  LayoutGrid,
  List,
  MoreHorizontal,
  ShieldCheck,
  Calendar,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  PlusCircle,
  Plus,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Palette,
  Briefcase,
  Crown,
  Filter,
  Settings2,
  ChevronDown
} from 'lucide-react';
import { Classroom, Student, Subject, Staff, Tenant, AcademicStream } from '../types';
import { supabase } from '../lib/supabase';

interface ClassroomManagementProps {
  classrooms: Classroom[];
  setClassrooms: React.Dispatch<React.SetStateAction<Classroom[]>>;
  students: Student[];
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  staff: Staff[];
  activeTenant: Tenant;
}

const ClassroomManagement: React.FC<ClassroomManagementProps> = ({ classrooms, setClassrooms, students, subjects, setSubjects, staff, activeTenant }) => {
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'GRID' | 'LIST' | 'DEPARTMENT'>('DEPARTMENT');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManagingSubjects, setIsManagingSubjects] = useState(false);

  const [newClassForm, setNewClassForm] = useState({
    grade: 'JSS1',
    section: '',
    roomNumber: '',
    capacity: 30,
    classTeacherId: '',
    schoolSection: 'JUNIOR' as 'JUNIOR' | 'SENIOR',
    shift: 'MORNING' as 'MORNING' | 'AFTERNOON',
    stream: 'GENERAL' as AcademicStream
  });

  const filteredClassrooms = classrooms.filter(c =>
    `${c.grade} ${c.stream !== 'GENERAL' ? c.stream : ''} ${c.section}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.roomNumber.includes(searchQuery)
  );

  const groupedClassrooms = useMemo(() => {
    const groups: Record<string, Classroom[]> = {
      'JUNIOR_ACADEMY': [],
      'SCIENCE': [],
      'ART': [],
      'COMMERCIAL': [],
      'GENERAL_SENIOR': []
    };

    filteredClassrooms.forEach(c => {
      if (c.schoolSection === 'JUNIOR') {
        groups['JUNIOR_ACADEMY'].push(c);
      } else {
        const stream = c.stream || 'GENERAL';
        if (groups[stream]) {
          groups[stream].push(c);
        } else {
          groups['GENERAL_SENIOR'].push(c);
        }
      }
    });

    return groups;
  }, [filteredClassrooms]);

  const getEnrolledStudents = (grade: string, section: string, stream?: AcademicStream) => {
    return students.filter(s => s.grade === grade && (s.section === section || (s.stream === stream && s.section === section)));
  };

  const getClassTeacher = (teacherId?: string) => {
    return staff.find(s => s.id === teacherId);
  };

  const getHOD = (department: string) => {
    return staff.find(s => s.isHOD && s.department === department);
  };

  const getGradeSubjects = (grade: string) => {
    return subjects.filter(s => s.grade === grade);
  };

  const handleLevelChange = (level: string) => {
    const update: any = { grade: level };
    if (level.startsWith('JSS')) {
      update.schoolSection = 'JUNIOR';
      update.shift = 'MORNING';
      update.stream = 'GENERAL';
    } else {
      update.schoolSection = 'SENIOR';
      update.shift = 'AFTERNOON';
      update.stream = 'SCIENCE';
    }
    setNewClassForm(prev => ({ ...prev, ...update }));
  };

  const handleAddClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempId = `C${Date.now()}`;
    const newClass: Classroom = {
      id: tempId,
      tenantId: activeTenant.id,
      grade: newClassForm.grade,
      section: newClassForm.section || '1',
      roomNumber: newClassForm.roomNumber || 'TBD',
      capacity: newClassForm.capacity,
      classTeacherId: newClassForm.classTeacherId || undefined,
      schoolSection: newClassForm.schoolSection,
      shift: newClassForm.shift,
      stream: newClassForm.stream
    };

    // Optimistic Update
    setClassrooms(prev => [...prev, newClass]);
    setIsAddModalOpen(false);

    // Supabase Sync
    const { data, error } = await supabase
      .from('classrooms')
      .insert({
        tenant_id: activeTenant.id,
        grade: newClass.grade,
        section: newClass.section,
        room_number: newClass.roomNumber,
        capacity: newClass.capacity,
        class_teacher_id: newClass.classTeacherId,
        school_section: newClass.schoolSection,
        stream: newClass.stream
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add classroom:', error);
    } else if (data) {
      setClassrooms(prev => prev.map(c => c.id === tempId ? { ...c, id: data.id } : c));
    }

    setNewClassForm({
      grade: 'JSS1',
      section: '',
      roomNumber: '',
      capacity: 30,
      classTeacherId: '',
      schoolSection: 'JUNIOR',
      shift: 'MORNING',
      stream: 'GENERAL'
    });
  };

  const handleUpdateSubjectTeacher = async (subjectId: string, teacherId: string) => {
    const teacher = staff.find(s => s.id === teacherId);
    if (!teacher) return;

    // Optimistic Update
    setSubjects(prev => prev.map(s =>
      s.id === subjectId ? { ...s, teacherId, teacher: teacher.name } : s
    ));

    // Supabase Sync
    const { error } = await supabase
      .from('subjects')
      .update({ teacher_id: teacherId })
      .eq('id', subjectId);

    if (error) console.error('Failed to update subject teacher:', error);
  };

  const getStreamColor = (stream?: AcademicStream) => {
    switch (stream) {
      case 'SCIENCE': return 'indigo';
      case 'ART': return 'rose';
      case 'COMMERCIAL': return 'amber';
      default: return 'slate';
    }
  };

  const getStreamIcon = (stream?: AcademicStream) => {
    switch (stream) {
      case 'SCIENCE': return <FlaskConical size={14} />;
      case 'ART': return <Palette size={14} />;
      case 'COMMERCIAL': return <Briefcase size={14} />;
      default: return <School size={14} />;
    }
  };

  const filteredStaffForAssignment = useMemo(() => {
    if (newClassForm.schoolSection === 'JUNIOR' || newClassForm.stream === 'GENERAL') {
      return staff;
    }
    return staff.filter(s => s.department === newClassForm.stream);
  }, [staff, newClassForm.stream, newClassForm.schoolSection]);

  const getFilteredStaffForSubject = (stream?: AcademicStream) => {
    if (!stream || stream === 'GENERAL') return staff;
    return staff.filter(s => s.department === stream);
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Institutional Registry</h2>
          <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-500 opacity-70">
            Hierarchy: Academy • Streams • Departments • Sections
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex shrink-0">
            <button
              onClick={() => setViewType('DEPARTMENT')}
              className={`px-3 md:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewType === 'DEPARTMENT' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              Departments
            </button>
            <button
              onClick={() => setViewType('GRID')}
              className={`p-2 rounded-lg transition-all ${viewType === 'GRID' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewType('LIST')}
              className={`p-2 rounded-lg transition-all ${viewType === 'LIST' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <List size={18} />
            </button>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <PlusCircle size={16} /> New Section
          </button>
        </div>
      </div>

      <div className="mb-10 relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by department, stream, or educator..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-medium shadow-sm transition-all"
        />
      </div>

      {viewType === 'DEPARTMENT' ? (
        <div className="space-y-16">
          {(Object.entries(groupedClassrooms) as [string, Classroom[]][]).map(([groupKey, groupClassrooms]) => {
            if (groupClassrooms.length === 0) return null;

            const isJunior = groupKey === 'JUNIOR_ACADEMY';
            const departmentName = isJunior ? 'Junior Academy' : `${groupKey} DEPARTMENT`;
            const hod = isJunior ? null : getHOD(groupKey);
            const streamColor = isJunior ? 'indigo' : getStreamColor(groupKey as AcademicStream);

            return (
              <div key={groupKey} className="animate-in slide-in-from-bottom-4 duration-700">
                <div className={`mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 md:p-8 rounded-[2.5rem] bg-${streamColor}-50/30 border border-${streamColor}-100`}>
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] md:rounded-[1.8rem] bg-${streamColor}-600 flex items-center justify-center text-white shadow-xl shadow-${streamColor}-200 shrink-0`}>
                      {isJunior ? <School size={28} /> : getStreamIcon(groupKey as AcademicStream)}
                    </div>
                    <div>
                      <h3 className={`text-xl md:text-2xl font-black text-${streamColor}-900 tracking-tighter uppercase leading-tight`}>{departmentName}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{groupClassrooms.length} Active Sections</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">AY 2024/25</span>
                      </div>
                    </div>
                  </div>

                  {!isJunior && (
                    <div className="bg-white/70 backdrop-blur-md p-4 rounded-[1.5rem] border border-white flex items-center gap-4 shadow-sm lg:min-w-[300px]">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-${streamColor}-100 flex items-center justify-center text-${streamColor}-600 relative shrink-0`}>
                        <Crown size={20} />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[8px] md:text-[9px] font-black text-${streamColor}-600 uppercase tracking-widest leading-none mb-1`}>Head of Department</p>
                        <p className="text-sm font-black text-slate-900 truncate">{hod?.name || 'Vacant Position'}</p>
                      </div>
                      <button className={`px-4 py-2 rounded-xl bg-${streamColor}-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-tighter hover:bg-${streamColor}-700 transition-all`}>
                        Report
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupClassrooms.map(room => {
                    const classTeacher = getClassTeacher(room.classTeacherId);
                    const enrolled = getEnrolledStudents(room.grade, room.section, room.stream);
                    const utilization = Math.round((enrolled.length / room.capacity) * 100);

                    return (
                      <div
                        key={room.id}
                        onClick={() => setSelectedClassroom(room)}
                        className="group bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-2xl hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4">
                          <span className={`bg-slate-50 text-slate-400 group-hover:text-indigo-600 transition-colors`}>
                            <ChevronRight size={20} />
                          </span>
                        </div>

                        <div className="space-y-5">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-${streamColor}-50 text-${streamColor}-600 border border-${streamColor}-100`}>
                                {room.grade}
                              </span>
                              <span className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-slate-50 text-slate-500 border border-slate-200">
                                Section {room.section}
                              </span>
                            </div>
                            <h4 className="text-lg font-black text-slate-900 uppercase">Room {room.roomNumber}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Shift: {room.shift || 'MORNING'}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                              <User size={20} />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Class Teacher</p>
                              <p className="text-sm font-bold text-slate-700">{classTeacher?.name || 'Unassigned'}</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-50">
                            <div className="flex justify-between items-center mb-1.5 px-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase">Enrolled</span>
                              <span className={`text-[10px] font-black ${utilization > 90 ? 'text-rose-500' : 'text-indigo-600'}`}>{enrolled.length} / {room.capacity}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${utilization > 90 ? 'bg-rose-500' : 'bg-indigo-600'} transition-all duration-1000 ease-out`}
                                style={{ width: `${utilization}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={viewType === 'GRID' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredClassrooms.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <School size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching classrooms found</p>
            </div>
          )}
          {filteredClassrooms.map((room) => {
            const streamColor = getStreamColor(room.stream);
            const enrolled = getEnrolledStudents(room.grade, room.section, room.stream);
            const utilization = Math.round((enrolled.length / room.capacity) * 100);

            if (viewType === 'GRID') {
              return (
                <div key={room.id} onClick={() => setSelectedClassroom(room)} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl bg-${streamColor}-50 text-${streamColor}-600`}>
                      {getStreamIcon(room.stream)}
                    </div>
                    <MoreHorizontal size={20} className="text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase">{room.grade} • {room.section}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Room {room.roomNumber} • {room.stream || 'GENERAL'}</p>
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Enrolled: {enrolled.length} / {room.capacity}</span>
                      <span className={`text-[10px] font-black ${utilization > 90 ? 'text-rose-500' : 'text-indigo-600'}`}>{utilization}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className={`h-full ${utilization > 90 ? 'bg-rose-500' : 'bg-indigo-500'} transition-all duration-700`} style={{ width: `${utilization}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={room.id} onClick={() => setSelectedClassroom(room)} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-${streamColor}-50 flex items-center justify-center text-${streamColor}-600`}>
                    {getStreamIcon(room.stream)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase">{room.grade} - {room.section}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Room {room.roomNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <p className={`text-xs font-black ${utilization > 90 ? 'text-rose-600' : 'text-slate-700'}`}>{enrolled.length} / {room.capacity}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Enrollment</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register Classroom Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[95vh] flex flex-col">
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30 shrink-0">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2.5 md:p-3 bg-indigo-600 rounded-xl md:rounded-2xl text-white shadow-lg shrink-0">
                  <PlusCircle size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tighter leading-tight truncate">Register Classroom</h3>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5 truncate">Institutional Expansion Registry</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddClassSubmit} className="p-6 md:p-8 space-y-5 md:space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade Level</label>
                  <div className="relative">
                    <select
                      value={newClassForm.grade}
                      onChange={(e) => handleLevelChange(e.target.value)}
                      className="w-full px-4 md:px-5 py-3.5 md:py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] md:rounded-2xl outline-none text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none pr-10"
                    >
                      {['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3', 'Grade 10', 'Grade 11', 'Grade 12'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Section No.</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 1 or 2"
                    value={newClassForm.section}
                    onChange={(e) => setNewClassForm({ ...newClassForm, section: e.target.value })}
                    className="w-full px-4 md:px-5 py-3.5 md:py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] md:rounded-2xl outline-none text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-4">
                {newClassForm.schoolSection === 'SENIOR' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Stream</label>
                    <div className="relative">
                      <select
                        value={newClassForm.stream}
                        onChange={(e) => setNewClassForm({ ...newClassForm, stream: e.target.value as AcademicStream })}
                        className="w-full px-4 md:px-5 py-3.5 md:py-4 bg-indigo-50 border border-indigo-100 rounded-[1.2rem] md:rounded-2xl outline-none text-sm font-black text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none pr-10"
                      >
                        <option value="SCIENCE">SCIENCE</option>
                        <option value="ART">ART</option>
                        <option value="COMMERCIAL">COMMERCIAL</option>
                        <option value="GENERAL">GENERAL</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Reference</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 101"
                    value={newClassForm.roomNumber}
                    onChange={(e) => setNewClassForm({ ...newClassForm, roomNumber: e.target.value })}
                    className="w-full px-4 md:px-5 py-3.5 md:py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] md:rounded-2xl outline-none text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Class Teacher (Stream Filtered)</label>
                <div className="relative">
                  <select
                    value={newClassForm.classTeacherId}
                    onChange={(e) => setNewClassForm({ ...newClassForm, classTeacherId: e.target.value })}
                    className="w-full px-4 md:px-5 py-3.5 md:py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] md:rounded-2xl outline-none text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none pr-10"
                  >
                    <option value="">Select Educator</option>
                    {filteredStaffForAssignment.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deployment Shift</label>
                  <div className="relative">
                    <select
                      value={newClassForm.shift}
                      onChange={(e) => setNewClassForm({ ...newClassForm, shift: e.target.value as any })}
                      className="w-full px-3 py-3 bg-slate-100 border-none rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 transition-all appearance-none pr-10"
                    >
                      <option value="MORNING">Morning (Standard)</option>
                      <option value="AFTERNOON">Afternoon (Ext.)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Capacity</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="100"
                    value={newClassForm.capacity}
                    onChange={(e) => setNewClassForm({ ...newClassForm, capacity: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-3 bg-slate-100 border-none rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </form>

            <div className="p-6 md:p-8 border-t border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row gap-3 md:gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors order-2 sm:order-1"
              >
                Abort Entry
              </button>
              <button
                onClick={handleAddClassSubmit}
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-[1.2rem] md:rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                <CheckCircle2 size={16} /> Finalize Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Subject Teachers Modal */}
      {isManagingSubjects && selectedClassroom && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setIsManagingSubjects(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[95vh] flex flex-col">
            <div className="p-6 md:p-8 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className="p-2.5 md:p-3 bg-indigo-600 rounded-xl md:rounded-2xl text-white shadow-lg shrink-0">
                  <Settings2 size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tighter truncate leading-tight">Subject Faculty Assignment</h3>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5 truncate">Filtering by {selectedClassroom.stream || 'GENERAL'} Department</p>
                </div>
              </div>
              <button onClick={() => setIsManagingSubjects(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/20">
              <div className="space-y-4">
                {getGradeSubjects(selectedClassroom.grade).map(sub => (
                  <div key={sub.id} className="p-4 md:p-5 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shrink-0">
                        {sub.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 uppercase truncate leading-tight">{sub.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate mt-0.5">Current: {sub.teacher}</p>
                      </div>
                    </div>
                    <div className="w-full sm:w-64 relative">
                      <select
                        value={sub.teacherId || ''}
                        onChange={(e) => handleUpdateSubjectTeacher(sub.id, e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold appearance-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      >
                        <option value="">Select Stream Educator</option>
                        {getFilteredStaffForSubject(selectedClassroom.stream).map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                ))}
                {getGradeSubjects(selectedClassroom.grade).length === 0 && (
                  <div className="py-16 text-center">
                    <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No subjects defined for {selectedClassroom.grade}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-slate-100 bg-white flex justify-end shrink-0">
              <button
                onClick={() => setIsManagingSubjects(false)}
                className="w-full sm:w-auto px-12 py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Apply Assignments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Classroom Detail Sidebar */}
      {selectedClassroom && (
        <div className="fixed inset-0 z-[110] overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedClassroom(null)}></div>
          <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-${getStreamColor(selectedClassroom.stream)}-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0`}>
                  {getStreamIcon(selectedClassroom.stream)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase truncate leading-tight">{selectedClassroom.grade} • {selectedClassroom.stream !== 'GENERAL' ? `${selectedClassroom.stream} ` : ''}{selectedClassroom.section}</h3>
                  <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] truncate">Room {selectedClassroom.roomNumber} • {selectedClassroom.schoolSection || 'GENERAL'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedClassroom(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-10">
              {selectedClassroom.stream !== 'GENERAL' && (
                <section className={`bg-${getStreamColor(selectedClassroom.stream)}-50/50 rounded-[2rem] p-5 md:p-6 border border-${getStreamColor(selectedClassroom.stream)}-100 shadow-sm`}>
                  <h5 className={`text-[10px] font-black text-${getStreamColor(selectedClassroom.stream)}-400 uppercase tracking-widest mb-4 flex items-center gap-2`}>
                    <ShieldCheck size={14} /> Departmental Leadership
                  </h5>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-300 font-black text-sm shrink-0">
                        {getHOD(selectedClassroom.stream || '')?.name.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-tight truncate">HOD ({selectedClassroom.stream})</p>
                        <p className="text-xs md:text-sm font-bold text-slate-900 truncate leading-tight">{getHOD(selectedClassroom.stream || '')?.name || 'Vacant Position'}</p>
                      </div>
                    </div>
                    <button className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase hover:underline shrink-0">Contact HOD</button>
                  </div>
                </section>
              )}

              <section className="bg-slate-50/80 rounded-[2rem] p-6 md:p-8 border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.5rem] bg-white border border-slate-100 overflow-hidden flex items-center justify-center text-indigo-300 shadow-sm relative shrink-0">
                    <User size={32} />
                    <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">Class Educator</p>
                    <h4 className="text-lg md:text-xl font-black text-slate-900 leading-tight truncate">{getClassTeacher(selectedClassroom.classTeacherId)?.name || 'Unassigned'}</h4>
                    <p className="text-[9px] md:text-[10px] font-bold text-indigo-300 uppercase tracking-widest mt-1 truncate">Assigned to {selectedClassroom.stream} Dept.</p>
                  </div>
                </div>
                <button className="p-2.5 md:p-3 bg-white rounded-xl text-indigo-600 border border-indigo-100 hover:shadow-md transition-all shrink-0">
                  <ArrowRight size={20} />
                </button>
              </section>

              <div className="space-y-5">
                <div className="flex items-center justify-between px-2">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <BookOpen size={14} /> Assigned Curriculum
                  </h5>
                  <button
                    onClick={() => setIsManagingSubjects(true)}
                    className="text-[10px] font-black text-indigo-600 uppercase hover:underline"
                  >Manage Faculty</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getGradeSubjects(selectedClassroom.grade).length > 0 ? getGradeSubjects(selectedClassroom.grade).map(sub => (
                    <div key={sub.id} className="p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:border-indigo-200 transition-all group">
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate leading-tight">{sub.name}</p>
                        <span className="text-[10px] font-black text-indigo-500 shrink-0">{sub.progress}%</span>
                      </div>
                      <div className="flex items-center gap-2 mb-4 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                          {sub.teacher.charAt(0)}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{sub.teacher}</p>
                      </div>
                      <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${sub.progress}%` }}></div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-1 sm:col-span-2 p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <AlertCircle size={24} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No subjects defined for this level</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between px-2">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Users size={14} /> Enrolled Students
                  </h5>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{getEnrolledStudents(selectedClassroom.grade, selectedClassroom.section, selectedClassroom.stream).length} / {selectedClassroom.capacity}</span>
                    <button className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                      <TrendingUp size={14} />
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-[2rem] overflow-hidden bg-slate-50/30 shadow-inner">
                  {getEnrolledStudents(selectedClassroom.grade, selectedClassroom.section, selectedClassroom.stream).map(student => (
                    <div key={student.id} className="p-4 md:p-5 flex items-center justify-between hover:bg-white transition-all group">
                      <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-300 overflow-hidden shadow-sm group-hover:scale-105 transition-transform shrink-0">
                          {student.profilePicture ? <img src={student.profilePicture} className="w-full h-full object-cover" alt={student.name} /> : <User size={20} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate leading-tight">{student.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate mt-0.5">{student.admissionNo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">Active</span>
                        <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {getEnrolledStudents(selectedClassroom.grade, selectedClassroom.section, selectedClassroom.stream).length === 0 && (
                    <div className="py-12 md:py-16 text-center px-4">
                      <Users size={40} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No deployments detected in this sector.</p>
                      <button className="mt-4 text-xs font-bold text-indigo-600 hover:underline">Deploy Students</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-slate-100 bg-white shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 shadow-2xl relative z-10">
              <button className="flex items-center justify-center gap-2 py-3.5 md:py-4 bg-slate-50 text-slate-600 rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all border border-slate-100">
                <Calendar size={18} /> Class Schedule
              </button>
              <button className="flex items-center justify-center gap-2 py-3.5 md:py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all border border-indigo-500">
                <ShieldCheck size={18} /> Mark Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomManagement;
