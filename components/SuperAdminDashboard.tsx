
import React from 'react';
import { 
  Building2, 
  Users, 
  Wallet, 
  ShieldAlert, 
  Server, 
  Plus, 
  ChevronRight, 
  Globe, 
  Activity,
  Zap,
  LayoutGrid
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Tenant } from '../types';

interface SuperAdminDashboardProps {
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
}

const GLOBAL_TRAFFIC = [
  { name: 'Mon', requests: 45000 },
  { name: 'Tue', requests: 52000 },
  { name: 'Wed', requests: 61000 },
  { name: 'Thu', requests: 58000 },
  { name: 'Fri', requests: 63000 },
  { name: 'Sat', requests: 25000 },
  { name: 'Sun', requests: 18000 },
];

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ tenants, onSelectTenant }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Global Nexus Command</h2>
          <p className="text-slate-500 font-medium mt-2">EduNexus Cloud Infrastructure Management v2.5</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Server size={18} /> Node Status
          </button>
          <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">
            <Plus size={18} /> Provision Tenant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <NexusCard label="Active Tenants" value={tenants.length.toString()} sub="Global Instances" icon={<Building2 />} color="indigo" />
        <NexusCard label="Total Users" value="45.2k" sub="Students & Faculty" icon={<Users />} color="emerald" />
        <NexusCard label="System Load" value="14%" sub="Normal Operation" icon={<Zap />} color="amber" />
        <NexusCard label="Global Revenue" value="$2.4M" sub="Subscription ARR" icon={<Wallet />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Instance Traffic Distribution</h3>
                <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-2">
                   <Activity size={12} /> Live API Consumption
                </span>
             </div>
             <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={GLOBAL_TRAFFIC}>
                      <defs>
                         <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorReq)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Tenant Directory</h3>
               <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">View Global Registry</button>
            </div>
            <div className="divide-y divide-slate-100">
               {tenants.map(tenant => (
                 <div key={tenant.id} onClick={() => onSelectTenant(tenant)} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-slate-100 shrink-0 group-hover:scale-105 transition-transform" style={{ backgroundColor: tenant.primaryColor }}>
                        <Building2 size={28} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900">{tenant.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{tenant.subdomain}.edunexus.io • {tenant.region}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-12">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-slate-900">{tenant.studentCount.toLocaleString()}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Enrolled Students</p>
                      </div>
                      <ChevronRight size={24} className="text-slate-300 group-hover:text-indigo-600 transition-colors group-hover:translate-x-1" />
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-indigo-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-30 -mr-20 -mt-20"></div>
              <ShieldAlert className="text-indigo-300 mb-6" size={48} />
              <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase leading-tight">System Compliance</h3>
              <p className="text-indigo-100/70 text-sm leading-relaxed mb-8">
                All 24 instances are currently compliant with FERPA and GDPR data isolation protocols. Encrypted backup sync completed at 03:00 UTC.
              </p>
              <div className="space-y-3">
                 <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Status</span>
                    <span className="text-xs font-black text-emerald-400">ENCRYPTED</span>
                 </div>
                 <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all shadow-xl">
                   Run Security Audit
                 </button>
              </div>
           </div>

           <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-200">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <Globe size={14} /> Edge Network Status
              </h4>
              <div className="space-y-4">
                 <NetworkItem label="US-East Region" latency="24ms" status="HEALTHY" />
                 <NetworkItem label="EU-West Region" latency="38ms" status="HEALTHY" />
                 <NetworkItem label="Asia-Pacific" latency="112ms" status="DEGRADED" color="rose" />
                 <NetworkItem label="Africa-South" latency="45ms" status="HEALTHY" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const NexusCard: React.FC<{ label: string, value: string, sub: string, icon: React.ReactNode, color: string }> = ({ label, value, sub, icon, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all hover:shadow-xl">
    <div className={`w-14 h-14 rounded-2xl bg-${color}-50 flex items-center justify-center text-${color}-600 group-hover:scale-110 transition-transform mb-6`}>
      {icon}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h4 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</h4>
    <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">{sub}</p>
  </div>
);

const NetworkItem: React.FC<{ label: string, latency: string, status: string, color?: string }> = ({ label, latency, status, color = 'emerald' }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
     <div>
        <p className="text-xs font-black text-slate-900">{label}</p>
        <p className="text-[9px] font-bold text-slate-400">{latency}</p>
     </div>
     <span className={`text-[8px] font-black uppercase tracking-widest text-${color}-600 bg-${color}-50 px-2 py-0.5 rounded-lg`}>{status}</span>
  </div>
);

export default SuperAdminDashboard;
