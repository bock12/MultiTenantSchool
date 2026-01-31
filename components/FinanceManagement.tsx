
import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, CreditCard, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FinanceManagement: React.FC = () => {
  const dataRevenue = [
    { month: 'Jan', rev: 45000 },
    { month: 'Feb', rev: 52000 },
    { month: 'Mar', rev: 48000 },
    { month: 'Apr', rev: 61000 },
    { month: 'May', rev: 55000 },
    { month: 'Jun', rev: 67000 },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Financial Management</h2>
          <p className="text-slate-500 mt-1">Track institutional cash flow, fee collections, and staff payroll.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50">View Ledger</button>
           <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">Record Expense</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <FinanceKPI label="Total Revenue (YTD)" value="$428,500" change="+12.4%" color="indigo" />
        <FinanceKPI label="Operating Expenses" value="$182,300" change="-2.1%" color="rose" />
        <FinanceKPI label="Fee Collection Rate" value="92.4%" change="+4.5%" color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-900 mb-6">Revenue Growth</h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataRevenue}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="rev" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Pending Fee Actions</h3>
              <button className="text-indigo-600 text-xs font-bold hover:underline">Send Reminders</button>
           </div>
           <div className="space-y-4">
              <FeeItem name="Peter Parker" grade="Grade 11" amount="$1,200" days="12 days overdue" />
              <FeeItem name="Bruce Wayne" grade="Grade 4" amount="$850" days="5 days overdue" />
              <FeeItem name="Clark Kent" grade="Grade 9" amount="$1,100" days="22 days overdue" />
              <FeeItem name="Diana Prince" grade="Grade 12" amount="$1,400" days="Today" />
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
