
import React from 'react';
import { GraduationCap, Phone, MapPin, ShieldCheck, QrCode, Printer, X } from 'lucide-react';
import { Student, Staff } from '../types';

interface IDCardGeneratorProps {
  data: Student | Staff;
  type: 'STUDENT' | 'STAFF';
  onClose: () => void;
}

const IDCardGenerator: React.FC<IDCardGeneratorProps> = ({ data, type, onClose }) => {
  const isStudent = type === 'STUDENT';
  const student = data as Student;
  const staff = data as Staff;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md no-print" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl bg-slate-50 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-300 no-print">
        <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Identity Credential Generator</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">CR80 Standard • 300 DPI Rendering</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all"
            >
              <Printer size={18} /> Print Card
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
              <X size={28} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 justify-items-center">
            {/* FRONT OF CARD */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Front View</p>
              <div id="id-card-front" className="cr80-card bg-white rounded-[1rem] shadow-2xl relative overflow-hidden border border-slate-200 flex flex-col">
                {/* Header Branding */}
                <div className="h-16 bg-slate-900 flex items-center px-6 justify-between relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-full bg-indigo-600 skew-x-[30deg] translate-x-12 opacity-20"></div>
                  <div className="flex items-center gap-2 z-10">
                    <GraduationCap className="text-indigo-400" size={24} />
                    <span className="text-white font-black tracking-tight text-lg">EduNexus</span>
                  </div>
                  <span className="text-indigo-300 text-[8px] font-black uppercase tracking-[0.3em] z-10">
                    {isStudent ? 'Student Pass' : 'Staff Pass'}
                  </span>
                </div>

                <div className="flex-1 p-6 flex flex-col items-center text-center">
                  {/* Portrait */}
                  <div className="w-28 h-28 rounded-2xl border-4 border-slate-50 shadow-lg overflow-hidden mb-4 bg-slate-100 ring-1 ring-slate-200">
                    {(isStudent ? student.profilePicture : '') ? (
                      <img src={isStudent ? student.profilePicture : ''} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShieldCheck size={40} />
                      </div>
                    )}
                  </div>

                  <h4 className="text-xl font-black text-slate-900 leading-tight mb-1">{data.name}</h4>
                  <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mb-4">
                    {isStudent ? student.grade : staff.role}
                  </p>

                  <div className="w-full mt-auto flex justify-between items-end border-t border-slate-100 pt-4">
                    <div className="text-left">
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Identification No</p>
                      <p className="text-xs font-black text-slate-900 font-mono">
                        {isStudent ? student.admissionNo : 'STF-2024-' + staff.id.padStart(3, '0')}
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Valid Until</p>
                       <p className="text-[10px] font-black text-slate-900 uppercase">Aug 2025</p>
                    </div>
                  </div>
                </div>
                
                {/* Bottom Strip */}
                <div className="h-2 bg-indigo-600 w-full"></div>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Back View</p>
              <div id="id-card-back" className="cr80-card bg-white rounded-[1rem] shadow-2xl relative overflow-hidden border border-slate-200 p-6 flex flex-col">
                <div className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Institutional Terms</h5>
                    <p className="text-[7px] text-slate-500 leading-relaxed font-medium">
                      This card remains the property of EduNexus Institutional Systems. It must be carried at all times while on campus. If found, please return to the Registrar's Office or contact the number below.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Group</p>
                      <p className="text-[10px] font-black text-slate-900">{isStudent ? student.bloodGroup || 'N/A' : 'Not Set'}</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Issue</p>
                      <p className="text-[10px] font-black text-slate-900">May 15, 2024</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-[8px] font-bold text-slate-600">
                      <Phone size={10} className="text-indigo-500" />
                      <span>+1 (555) 900-EDU-HELP</span>
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-bold text-slate-600">
                      <MapPin size={10} className="text-indigo-500" />
                      <span>100 Innovation Way, Tech Campus</span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="w-24 h-6 border-b border-slate-300"></div>
                      <span className="text-[6px] font-black text-slate-400 uppercase">Auth. Signature</span>
                    </div>
                    <div className="p-1 bg-white border border-slate-100 rounded-lg">
                      <QrCode size={40} className="text-slate-900" />
                    </div>
                  </div>
                </div>

                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[4rem] -mr-8 -mt-8 -z-0"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cr80-card {
          width: 85.6mm;
          height: 53.98mm;
          min-width: 85.6mm;
          min-height: 53.98mm;
          background-color: white;
          color: black;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          #id-card-front, #id-card-back {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          #id-card-back {
            top: 60mm; /* Space between cards when printing */
          }
          @page {
            size: 86mm 120mm;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default IDCardGenerator;
