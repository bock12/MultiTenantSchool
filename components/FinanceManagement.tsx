import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, CreditCard, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AdmissionStatus, AdmissionApplication, Student, Subject, Classroom, Staff, Assessment, SyllabusUnit, Tenant, AcademicStream, UserRole, Notification } from '../types';

interface FinanceProps {
  fees: any[];
  transactions: any[];
  activeTenant: Tenant;
}

const FinanceManagement: React.FC<FinanceProps> = ({ fees, transactions, activeTenant }) => {
  const totalRevenue = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const pendingFees = fees.filter(f => f.status === 'PENDING').length;
  const collectionRate = fees.length > 0
    ? ((fees.filter(f => f.status === 'PAID').length / fees.length) * 100).toFixed(1) + '%'
    : '0%';

  const dataRevenue = [
    { month: 'Jan', rev: totalRevenue * 0.1 },
    { month: 'Feb', rev: totalRevenue * 0.2 },
    { month: 'Mar', rev: totalRevenue * 0.4 },
    { month: 'Apr', rev: totalRevenue * 0.6 },
    { month: 'May', rev: totalRevenue * 0.8 },
    { month: 'Jun', rev: totalRevenue },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Financial Management</h2>
          <p className="text-slate-500 mt-1">Track institutional cash flow, fee collections, and staff payroll for {activeTenant.name}.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50">View Ledger</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">Record Expense</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <FinanceKPI label="Total Revenue (YTD)" value={`$${totalRevenue.toLocaleString()}`} change="+0.0%" color="indigo" />
        <FinanceKPI label="Operating Expenses" value={`$${totalExpenses.toLocaleString()}`} change="-0.0%" color="rose" />
        <FinanceKPI label="Fee Collection Rate" value={collectionRate} change="+0.0%" color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Revenue Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataRevenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="rev" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Pending Fee Actions ({pendingFees})</h3>
            <button className="text-indigo-600 text-xs font-bold hover:underline">Send Reminders</button>
          </div>
          <div className="space-y-4">
            {fees.filter(f => f.status === 'PENDING').slice(0, 4).map(fee => (
              <FeeItem key={fee.id} name={fee.student_name || 'Student'} grade={fee.grade || 'N/A'} amount={`$${fee.amount}`} days="Pending" />
            ))}
            {fees.filter(f => f.status === 'PENDING').length === 0 && (
              <p className="text-slate-500 text-sm text-center py-10">No pending fee actions.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FinanceKPI: React.FC<{ label: string, value: string, change: string, color: string }> = ({ label, value, change, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
        <TrendingUp size={20} />
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {change}
      </span>
    </div>
    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
    <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const FeeItem: React.FC<{ name: string, grade: string, amount: string, days: string }> = ({ name, grade, amount, days }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-sm">
        {name.charAt(0)}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{name}</p>
        <p className="text-xs text-slate-500">{grade}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-bold text-slate-900">{amount}</p>
      <p className={`text-[10px] font-bold uppercase tracking-tight ${days.includes('overdue') ? 'text-rose-500' : 'text-slate-400'}`}>{days}</p>
    </div>
  </div>
);

export default FinanceManagement;
