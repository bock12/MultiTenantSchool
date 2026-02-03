
import React from 'react';
import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  UserPlus,
  Wallet,
  FileText,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { View } from '../App';

const dataPerformance = [
  { name: 'G1', score: 85 },
  { name: 'G2', score: 78 },
  { name: 'G3', score: 82 },
  { name: 'G4', score: 90 },
  { name: 'G5', score: 75 },
  { name: 'G6', score: 88 },
];

const dataAttendance = [
  { day: 'Mon', present: 94, absent: 6 },
  { day: 'Tue', present: 96, absent: 4 },
  { day: 'Wed', present: 92, absent: 8 },
  { day: 'Thu', present: 95, absent: 5 },
  { day: 'Fri', present: 97, absent: 3 },
];

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

interface PrincipalDashboardProps {
  setCurrentView?: (view: View) => void;
}

const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({ setCurrentView }) => {
  return (
    <div className="p-4 md:p-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Institutional Analytics</h2>
          <p className="text-slate-500 mt-1 text-sm">Real-time performance and operational overview for Academic Year 2024-25.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
            <Filter size={16} /> Filter
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard 
          label="Total Students" 
          value="1,284" 
          change="+12% vs LY" 
          trend="up" 
          icon={<Users className="text-indigo-600" />} 
          color="indigo" 
        />
        <StatCard 
          label="Avg. Attendance" 
          value="94.8%" 
          change="-2% vs LM" 
          trend="down" 
          icon={<CheckCircle2 className="text-emerald-600" />} 
          color="emerald" 
        />
        <StatCard 
          label="Results Pipeline" 
          value="12 Pending" 
          change="Exam Office" 
          trend="neutral" 
          icon={<FileCheck className="text-amber-600" />} 
          color="amber" 
          onClick={() => setCurrentView?.('EXAMS_OFFICE')}
        />
        <StatCard 
          label="Outstanding Fees" 
          value="$14,200" 
          change="8% of rev" 
          trend="down" 
          icon={<Clock className="text-rose-600" />} 
          color="rose" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Attendance Trends */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <h3 className="font-bold text-slate-900">Daily Attendance Overview</h3>
            <select className="bg-slate-50 border-none rounded-lg text-sm font-medium py-1.5 px-3">
              <option>Last 7 Days</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataAttendance}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="present" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Student Distribution</h3>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'KG', value: 200 },
                    { name: 'Primary', value: 500 },
                    { name: 'Middle', value: 300 },
                    { name: 'High', value: 284 },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
             <LegendItem color={COLORS[0]} label="KG" value="200" />
             <LegendItem color={COLORS[1]} label="Primary" value="500" />
             <LegendItem color={COLORS[2]} label="Middle" value="300" />
             <LegendItem color={COLORS[3]} label="High" value="284" />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-900 mb-6">Academic Performance by Grade</h3>
           <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-slate-900">Recent Campus Activities</h3>
             <button className="text-indigo-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-5">
            <ActivityItem 
              title="New Admission" 
              desc="Sarah Connor - Grade 10" 
              time="2h ago" 
              icon={<UserPlus size={16} className="text-white" />} 
              iconBg="bg-indigo-500" 
            />
            <ActivityItem 
              title="Finance Alert" 
              desc="Payroll processing completed" 
              time="5h ago" 
              icon={<Wallet size={16} className="text-white" />} 
              iconBg="bg-emerald-500" 
            />
            <ActivityItem 
              title="Exam Result" 
              desc="G5 Math results uploaded" 
              time="1d ago" 
              icon={<FileText size={16} className="text-white" />} 
              iconBg="bg-amber-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, change: string, trend: 'up' | 'down' | 'neutral', icon: React.ReactNode, color: string, onClick?: () => void }> = ({ label, value, change, trend, icon, color, onClick }) => (
  <div onClick={onClick} className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group ${onClick ? 'cursor-pointer hover:border-indigo-400' : ''}`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl bg-${color}-50 group-hover:scale-110 transition-transform shrink-0`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-[10px] md:text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500'}`}>
        {trend === 'up' && <ArrowUpRight size={14} />}
        {trend === 'down' && <ArrowDownRight size={14} />}
        {change}
        {onClick && <ChevronRight size={12} className="ml-1 opacity-40 group-hover:translate-x-1 transition-transform" />}
      </div>
    </div>
    <p className="text-slate-500 text-xs font-medium uppercase tracking-tight">{label}</p>
    <h4 className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5">{value}</h4>
  </div>
);

const LegendItem: React.FC<{ color: string, label: string, value: string }> = ({ color, label, value }) => (
  <div className="flex items-center gap-2">
    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }}></div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] text-slate-500 uppercase font-semibold truncate">{label}</p>
      <p className="text-xs font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const ActivityItem: React.FC<{ title: string, desc: string, time: string, icon: React.ReactNode, iconBg: string }> = ({ title, desc, time, icon, iconBg }) => (
  <div className="flex gap-4">
    <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <h5 className="text-sm font-bold text-slate-900 truncate">{title}</h5>
        <span className="text-[10px] text-slate-400 shrink-0">{time}</span>
      </div>
      <p className="text-xs text-slate-500 mt-0.5 truncate">{desc}</p>
    </div>
  </div>
);

export default PrincipalDashboard;
