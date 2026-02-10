
import React, { useState } from 'react';
import {
  Book,
  Search,
  Library,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Plus,
  Filter,
  User,
  Hash,
  AlertCircle,
  History,
  DollarSign,
  ChevronRight,
  MoreVertical,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

type Tab = 'INVENTORY' | 'CIRCULATION' | 'FINES';

interface BookRecord {
  id: string;
  title: string;
  author: string;
  category: string;
  status: 'Available' | 'Borrowed' | 'Reserved';
  isbn: string;
  dueDate?: string;
}

import { AdmissionStatus, AdmissionApplication, Student, Subject, Classroom, Staff, Assessment, SyllabusUnit, Tenant, AcademicStream, UserRole, Notification } from '../types';

interface LibraryProps {
  books: any[];
  loans: any[];
  fines: any[];
  activeTenant: Tenant;
}

const LibraryManagement: React.FC<LibraryProps> = ({ books, loans, fines, activeTenant }) => {
  const [activeTab, setActiveTab] = useState<Tab>('INVENTORY');
  const [searchQuery, setSearchQuery] = useState('');

  const inventory: BookRecord[] = books.map(b => ({
    id: b.id,
    title: b.title,
    author: b.author,
    category: b.category || 'General',
    status: b.status as any,
    isbn: b.isbn || 'N/A'
  }));

  const activeLoans = loans.map(l => ({
    student: l.students?.name || 'Unknown Student',
    book: l.books?.title || 'Unknown Book',
    borrowedDate: l.borrowed_date,
    dueDate: l.due_date,
    status: l.status
  }));

  const fineRecords = fines.map(f => ({
    student: f.students?.name || 'Unknown Student',
    reason: f.reason,
    amount: Number(f.amount),
    status: f.status
  }));

  const filteredBooks = inventory.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Library OS</h2>
          <p className="text-slate-500 font-medium">Digital inventory & circulation management system.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            <ArrowRightLeft size={18} className="text-indigo-600" /> Bulk Checkout
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
            <Plus size={18} /> Add New Title
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <LibStat label="Collection Size" value="4,285" delta="+12 this month" icon={<Library className="text-indigo-600" />} />
        <LibStat label="Active Loans" value="156" delta="82% return rate" icon={<ArrowUpRight className="text-amber-600" />} />
        <LibStat label="Late Returns" value="14" delta="Action required" icon={<AlertCircle className="text-rose-600" />} />
        <LibStat label="Revenue (Fines)" value="$1,420" delta="Last 30 days" icon={<DollarSign className="text-emerald-600" />} />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit mb-8 shadow-inner">
        {(['INVENTORY', 'CIRCULATION', 'FINES'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'INVENTORY' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by Title, Author, or ISBN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  />
                </div>
                <button className="p-3 bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-2xl transition-colors">
                  <Filter size={20} />
                </button>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {filteredBooks.map((book) => (
                    <div key={book.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-20 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-300 border border-slate-200 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                          <BookOpen size={28} />
                          <span className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">EDU</span>
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{book.title}</h4>
                          <p className="text-sm text-slate-500 font-medium">{book.author}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 uppercase tracking-widest">{book.category}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">ISBN: {book.isbn}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${book.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          book.status === 'Borrowed' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-indigo-50 text-indigo-600 border-indigo-100'
                          }`}>
                          {book.status}
                        </span>
                        <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                          <MoreVertical size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                <Hash size={120} className="absolute -bottom-10 -right-10 text-white/5" />
                <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                  <AlertCircle className="text-indigo-400" /> Critical Alert
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  System detected 8 overdue returns from Grade 10-B. Automated reminders have been dispatched to parents.
                </p>
                <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                  Resolve Issues
                </button>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center justify-between">
                  <span>Usage by Category</span>
                  <History size={16} className="text-slate-400" />
                </h3>
                <div className="space-y-4">
                  <CategoryUsage label="STEM" percentage={78} color="bg-indigo-500" />
                  <CategoryUsage label="Literature" percentage={42} color="bg-emerald-500" />
                  <CategoryUsage label="History" percentage={25} color="bg-amber-500" />
                  <CategoryUsage label="Arts" percentage={12} color="bg-rose-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'CIRCULATION' && (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5">Borrower</th>
                  <th className="px-8 py-5">Book Title</th>
                  <th className="px-8 py-5">Due Date</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeLoans.map((loan, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs">
                          {loan.student.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-900">{loan.student}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-600">{loan.book}</td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-500">{loan.dueDate}</td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${loan.status === 'OVERDUE' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-indigo-600 hover:bg-indigo-50 px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all">
                        Check In
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'FINES' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-5">Student</th>
                    <th className="px-8 py-5">Reason</th>
                    <th className="px-8 py-5">Amount</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fineRecords.map((fine, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-slate-900">{fine.student}</span>
                      </td>
                      <td className="px-8 py-5 text-xs text-slate-500 font-medium">{fine.reason}</td>
                      <td className="px-8 py-5 text-sm font-black text-slate-900">${fine.amount.toFixed(2)}</td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] font-black ${fine.status === 'PAID' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {fine.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {fine.status === 'UNPAID' ? (
                          <button className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all">
                            <ArrowDownLeft size={16} />
                          </button>
                        ) : (
                          <CheckCircle2 size={18} className="text-emerald-500 ml-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100">
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-indigo-600" /> Fine Policy
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Current rate is <span className="font-bold text-slate-900">$0.50 / day</span> for late returns. Items not returned within 30 days are marked as "Lost" and billed at original price.
              </p>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-indigo-600 hover:text-white transition-all group shadow-sm border border-indigo-100/50">
                  <span className="text-xs font-bold uppercase tracking-widest">Update Policy</span>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-white" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-indigo-600 hover:text-white transition-all group shadow-sm border border-indigo-100/50">
                  <span className="text-xs font-bold uppercase tracking-widest">Waiver Log</span>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LibStat: React.FC<{ label: string, value: string, delta: string, icon: React.ReactNode }> = ({ label, value, delta, icon }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-500/5">
    <div className="p-3 bg-slate-50 rounded-2xl w-fit mb-4 group-hover:bg-indigo-50 group-hover:scale-110 transition-all">
      {icon}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h4 className="text-3xl font-black text-slate-900 leading-none">{value}</h4>
    <p className="text-[10px] text-slate-500 font-bold mt-2 flex items-center gap-1">
      {delta}
    </p>
  </div>
);

const CategoryUsage: React.FC<{ label: string, percentage: number, color: string }> = ({ label, percentage, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1.5 px-1">
      <span className="text-[11px] font-bold text-slate-600">{label}</span>
      <span className="text-[10px] font-black text-slate-900">{percentage}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

export default LibraryManagement;
