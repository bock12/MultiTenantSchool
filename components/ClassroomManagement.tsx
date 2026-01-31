
import React, { useState } from 'react';
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
  MoreVertical,
  ShieldCheck,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Classroom, Student, Subject, Staff } from '../types';

interface ClassroomManagementProps {
  classrooms: Classroom[];
  students: Student[];
  subjects: Subject[];
  staff: Staff[];
}

const ClassroomManagement: React.FC<ClassroomManagementProps> = ({ classrooms, students, subjects, staff }) => {
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'GRID' | 'LIST'>('GRID');

  const filteredClassrooms = classrooms.filter(c => 
    `${c.grade} ${c.section}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.roomNumber.includes(searchQuery)
  );

  const getEnrolledStudents = (grade: string, section: string) => {
    return students.filter(s => s.grade === grade && s.section === section);
  };

  const getClassTeacher = (teacherId?: string) => {
    return staff.find(s => s.id === teacherId);
  };

  const getGradeSubjects = (grade: string) => {
    return subjects.filter(s => s.grade === grade);
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Learning Spaces</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage physical and virtual classroom environments.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
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
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all">
            Assign Space
          </button>
        </div>
      </div>

      <div className="mb-8 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by grade, section or room..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-medium shadow-sm transition-all"
          />
        </div>
      </div>

      {viewType === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClassrooms.map((room) => {
            const classTeacher = getClassTeacher(room.classTeacherId);
            const studentCount = getEnrolledStudents(room.grade, room.section).length;
            const occupancyRate = Math.round((studentCount / room.capacity) * 100);

            return (
              <div 
                key={room.id}
                onClick={() => setSelectedClassroom(room)}
                className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">
                   <School size={120} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                        <span className="text-xs font-black text-slate-400 uppercase leading-none">{room.section}</span>
                        <span className="text-2xl font-black text-slate-900">{room.grade.split(' ')[1]}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">Room {room.roomNumber}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Wing • Floor 1</p>
                      </div>
                    </div>
                    <div className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                      <MoreVertical size={20} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden ring-2 ring-white">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Class Advisor</p>
                        <p className="text-sm font-bold text-slate-700">{classTeacher?.name || 'Unassigned'}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-600">{studentCount} Students</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{occupancyRate}% Full</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${occupancyRate > 90 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5">Grade / Section</th>
                  <th className="px-8 py-5">Room</th>
                  <th className="px-8 py-5">Class Teacher</th>
                  <th className="px-8 py-5">Occupancy</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClassrooms.map(room => {
                   const classTeacher = getClassTeacher(room.classTeacherId);
                   const studentCount = getEnrolledStudents(room.grade, room.section).length;
                   return (
                    <tr key={room.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setSelectedClassroom(room)}>
                      <td className="px-8 py-5">
                        <span className="font-black text-slate-900 uppercase tracking-tight">{room.grade} - {room.section}</span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-indigo-600 uppercase">Room {room.roomNumber}</td>
                      <td className="px-8 py-5 text-sm font-medium text-slate-600">{classTeacher?.name || 'Unassigned'}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-black">{studentCount} / {room.capacity}</span>
                           <span className="text-[10px] font-bold text-slate-400">Total</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <ChevronRight size={18} className="text-slate-300 ml-auto" />
                      </td>
                    </tr>
                   );
                })}
              </tbody>
           </table>
        </div>
      )}

      {/* Classroom Detail Sidebar/Modal */}
      {selectedClassroom && (
        <div className="fixed inset-0 z-[110] overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedClassroom(null)}></div>
          <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <DoorOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedClassroom.grade} • {selectedClassroom.section}</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Building A • Room {selectedClassroom.roomNumber}</p>
                  </div>
               </div>
               <button onClick={() => setSelectedClassroom(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                 <X size={24} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
               {/* Advisor Info */}
               <section className="bg-indigo-50/50 rounded-[2rem] p-6 border border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-2xl bg-white border border-indigo-100 overflow-hidden flex items-center justify-center text-indigo-300 shadow-sm">
                        <User size={32} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Class Advisor</p>
                        <h4 className="text-lg font-black text-slate-900">{getClassTeacher(selectedClassroom.classTeacherId)?.name || 'N/A'}</h4>
                     </div>
                  </div>
                  <button className="p-2.5 bg-white rounded-xl text-indigo-600 border border-indigo-100 hover:shadow-md transition-all">
                     <ArrowRight size={18} />
                  </button>
               </section>

               {/* Subjects in this Grade */}
               <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><BookOpen size={14} /> Taught Curriculum</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {getGradeSubjects(selectedClassroom.grade).map(sub => (
                      <div key={sub.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-all group">
                         <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{sub.name}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{sub.teacher.split(' ').slice(-1)}</p>
                         <div className="mt-3 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500/30" style={{ width: `${sub.progress}%` }}></div>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>

               {/* Student List */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Users size={14} /> Student Roster</h5>
                    <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-lg">{getEnrolledStudents(selectedClassroom.grade, selectedClassroom.section).length} Enrolled</span>
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-3xl overflow-hidden">
                    {getEnrolledStudents(selectedClassroom.grade, selectedClassroom.section).map(student => (
                      <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300 overflow-hidden ring-2 ring-white">
                              {student.profilePicture ? <img src={student.profilePicture} className="w-full h-full object-cover" /> : <User size={18} />}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-900">{student.name}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase">{student.admissionNo}</p>
                           </div>
                         </div>
                         <button className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-indigo-600 transition-all">
                            <ChevronRight size={18} />
                         </button>
                      </div>
                    ))}
                    {getEnrolledStudents(selectedClassroom.grade, selectedClassroom.section).length === 0 && (
                      <div className="py-10 text-center bg-slate-50/50">
                        <p className="text-xs font-bold text-slate-400">No students assigned to this section yet.</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-white shrink-0 grid grid-cols-2 gap-4">
               <button className="flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all">
                 <Calendar size={18} /> Schedule
               </button>
               <button className="flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all">
                 <ShieldCheck size={18} /> Attendance
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomManagement;
