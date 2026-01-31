
import React, { useState } from 'react';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  BellRing, 
  ShieldCheck, 
  Zap, 
  Activity, 
  BarChart3, 
  Send, 
  Layers, 
  RefreshCcw,
  SmartphoneNfc,
  QrCode,
  Users,
  Settings2,
  Lock,
  MessageSquare,
  Clock,
  History,
  CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type MobileTab = 'GATEWAY' | 'NOTIFICATIONS' | 'OFFLINE_SYNC';

const API_TRAFFIC_DATA = [
  { time: '00:00', mobile: 120, web: 450 },
  { time: '04:00', mobile: 80, web: 120 },
  { time: '08:00', mobile: 1200, web: 2100 },
  { time: '12:00', mobile: 850, web: 1800 },
  { time: '16:00', mobile: 1100, web: 1400 },
  { time: '20:00', mobile: 400, web: 800 },
];

const MobileSync: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MobileTab>('GATEWAY');
  const [notificationTarget, setNotificationTarget] = useState('ALL');
  const [msgSent, setMsgSent] = useState(false);

  const handleSendNotification = () => {
    setMsgSent(true);
    setTimeout(() => setMsgSent(false), 3000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Smartphone size={24} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Mobile Ecosystem</h2>
          </div>
          <p className="text-slate-500 font-medium">Manage API gateways, push notification delivery, and offline data sync protocols.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            <QrCode size={18} /> Pair Device
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all">
            <RefreshCcw size={18} /> Global Re-sync
          </button>
        </div>
      </div>

      {/* KPI Overlays */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <SyncStat label="Active Mobile App Users" value="842" delta="+12% today" icon={<Users className="text-indigo-600" />} />
        <SyncStat label="API Gateway Latency" value="42ms" delta="P99: 118ms" icon={<Zap className="text-amber-600" />} />
        <SyncStat label="Notification Delivery" value="99.2%" delta="Last 24h" icon={<BellRing className="text-emerald-600" />} />
        <SyncStat label="Offline Data Weight" value="1.4 GB" delta="Avg. 12MB/user" icon={<Layers className="text-rose-600" />} />
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit mb-10 shadow-inner">
        {(['GATEWAY', 'NOTIFICATIONS', 'OFFLINE_SYNC'] as MobileTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Content View */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeTab === 'GATEWAY' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-slate-900">Traffic Distribution (Mobile vs Web)</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Web</span>
                    </div>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={API_TRAFFIC_DATA}>
                      <defs>
                        <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="web" stroke="#e2e8f0" strokeWidth={2} fillOpacity={0} />
                      <Area type="monotone" dataKey="mobile" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMobile)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Connected Mobile Devices</h3>
                  <button className="text-indigo-600 text-xs font-bold hover:underline">Revoke All</button>
                </div>
                <div className="divide-y divide-slate-100">
                  <DeviceItem name="iPhone 15 Pro" user="Principal Sarah J." lastSync="2 mins ago" status="Online" icon={<SmartphoneNfc />} />
                  <DeviceItem name="Samsung Galaxy S24" user="Teacher Michael B." lastSync="14 mins ago" status="Online" icon={<Smartphone />} />
                  <DeviceItem name="iPad Air" user="Registrar Office" lastSync="1h ago" status="Idle" icon={<Layers />} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                <Lock size={120} className="absolute -bottom-10 -right-10 text-white/10" />
                <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                  <ShieldCheck className="text-indigo-300" /> Security Protocol
                </h3>
                <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                  API endpoints are protected with OAuth 2.0 and JWT. Rolling certificate update scheduled for next Sunday.
                </p>
                <div className="space-y-3">
                  <div className="p-3 bg-white/10 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-medium">SSL/TLS Version</span>
                    <span className="text-xs font-black">1.3 (Active)</span>
                  </div>
                  <div className="p-3 bg-white/10 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-medium">Payload Encryption</span>
                    <span className="text-xs font-black">AES-256-GCM</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center justify-between uppercase tracking-widest">
                  API Health Log
                </h3>
                <div className="space-y-4">
                  <HealthLog label="GET /api/v1/attendance" status="SUCCESS" time="0.04s" />
                  <HealthLog label="POST /api/v1/notifications" status="SUCCESS" time="0.12s" />
                  <HealthLog label="GET /api/v1/syllabus" status="SUCCESS" time="0.08s" />
                  <HealthLog label="PUT /api/v1/user/profile" status="SUCCESS" time="0.09s" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'NOTIFICATIONS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <MessageSquare size={24} className="text-indigo-600" /> Compose Institutional Alert
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                      <select 
                        value={notificationTarget}
                        onChange={(e) => setNotificationTarget(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold"
                      >
                        <option value="ALL">Global (All Users)</option>
                        <option value="PARENTS">Parents Only</option>
                        <option value="STAFF">Teaching Staff</option>
                        <option value="STUDENTS">Students (Grades 9-12)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
                      <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold">
                        <option>Normal (Standard)</option>
                        <option>Urgent (Bypass DND)</option>
                        <option>Critical (Emergency)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notification Title</label>
                    <input type="text" placeholder="e.g. Mid-term Results Published" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Payload</label>
                    <textarea rows={4} placeholder="Type your notification message here..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium resize-none"></textarea>
                  </div>
                  <button 
                    onClick={handleSendNotification}
                    disabled={msgSent}
                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                      msgSent ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200'
                    }`}
                  >
                    {msgSent ? <><CheckCircle2 size={24} /> Broadcast Dispatched</> : <><Send size={24} /> Dispatch Push Notification</>}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 relative overflow-hidden">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Device Preview</h3>
                <div className="w-full max-w-[240px] mx-auto aspect-[9/19] bg-slate-900 rounded-[2.5rem] border-[6px] border-slate-800 p-4 shadow-2xl relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-800 rounded-full"></div>
                  <div className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 bg-indigo-600 rounded-lg text-[6px] text-white font-bold">EN</div>
                      <span className="text-[8px] font-black text-white/80 uppercase">EduNexus Alert</span>
                    </div>
                    <p className="text-[10px] font-bold text-white leading-tight mb-1 truncate">Mid-term Results Published</p>
                    <p className="text-[8px] text-white/60 leading-tight line-clamp-2">Academic results for the Spring term are now available in the mobile...</p>
                  </div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/20 rounded-full"></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center justify-between uppercase tracking-widest">
                  Recent History
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Fee Reminder (Q3)</p>
                      <p className="text-[10px] text-slate-400 font-medium">To: Parents • 2h ago</p>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500">SENT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Faculty Meeting Update</p>
                      <p className="text-[10px] text-slate-400 font-medium">To: Staff • 5h ago</p>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500">SENT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'OFFLINE_SYNC' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <WifiOff size={24} className="text-rose-500" /> Offline Synchronization Policies
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-10">
                Configure which institutional modules are cached locally on user devices. This ensures functionality even in low-connectivity zones but increases initial sync load times.
              </p>
              
              <div className="space-y-6">
                <SyncToggle 
                  label="Student Attendance Logs" 
                  desc="Teachers can mark attendance offline; syncs upon reconnection." 
                  weight="2.4 MB" 
                  enabled={true} 
                />
                <SyncToggle 
                  label="Academic Syllabi & Resources" 
                  desc="Documents and curricula available for offline reading." 
                  weight="142 MB" 
                  enabled={true} 
                />
                <SyncToggle 
                  label="Institutional Finance Ledger" 
                  desc="Financial summaries (Admin only). Sensitive data encrypted." 
                  weight="0.8 MB" 
                  enabled={false} 
                />
                <SyncToggle 
                  label="Gradebook & Results" 
                  desc="Cache student results for quick offline lookups." 
                  weight="12.5 MB" 
                  enabled={true} 
                />
                <SyncToggle 
                  label="Library Catalog" 
                  desc="Search book inventory without active internet." 
                  weight="4.2 MB" 
                  enabled={false} 
                />
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden">
                <History size={150} className="absolute -bottom-10 -right-10 text-white/5" />
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                  <RefreshCcw className="text-indigo-400 animate-spin-slow" /> Data Integrity Summary
                </h3>
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400">Total Offline Data Pushed</span>
                    <span className="text-sm font-black">1.2 TB / week</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400">Last Global Delta Update</span>
                    <span className="text-sm font-black">04:12 AM Today</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400">Conflict Resolution Rate</span>
                    <span className="text-sm font-black text-emerald-400">100% Automated</span>
                  </div>
                  <div className="pt-4">
                    <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-900/50">
                      View Delta Audit Logs
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-8 rounded-[3rem] border border-amber-100">
                <h3 className="text-sm font-black text-amber-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                  <Settings2 size={16} /> Device Throttling
                </h3>
                <p className="text-amber-700 text-xs leading-relaxed font-medium">
                  To prevent server saturation during morning peak hours (08:00 - 09:00), mobile sync is limited to 2-minute polling intervals for non-administrative roles.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SyncStat: React.FC<{ label: string, value: string, delta: string, icon: React.ReactNode }> = ({ label, value, delta, icon }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-500/5">
    <div className="p-3 bg-slate-50 rounded-2xl w-fit mb-4 group-hover:bg-indigo-50 transition-colors">
      {icon}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
    <h4 className="text-3xl font-black text-slate-900 leading-none tracking-tight">{value}</h4>
    <p className="text-[10px] text-slate-500 font-bold mt-2 flex items-center gap-1">
       {delta}
    </p>
  </div>
);

const DeviceItem: React.FC<{ name: string, user: string, lastSync: string, status: string, icon: React.ReactNode }> = ({ name, user, lastSync, status, icon }) => (
  <div className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-slate-100 rounded-2xl text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-900">{name}</h4>
        <p className="text-xs text-slate-500 font-medium">Owned by: {user}</p>
      </div>
    </div>
    <div className="text-right">
      <div className="flex items-center gap-2 justify-end mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{status}</span>
      </div>
      <p className="text-[10px] text-slate-400 font-bold">Synced {lastSync}</p>
    </div>
  </div>
);

const HealthLog: React.FC<{ label: string, status: string, time: string }> = ({ label, status, time }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
    <span className="text-[11px] font-bold text-slate-600 font-mono truncate mr-4">{label}</span>
    <div className="flex items-center gap-3 shrink-0">
      <span className="text-[10px] font-black text-emerald-500">{status}</span>
      <span className="text-[10px] font-bold text-slate-400">{time}</span>
    </div>
  </div>
);

const SyncToggle: React.FC<{ label: string, desc: string, weight: string, enabled: boolean }> = ({ label, desc, weight, enabled }) => (
  <div className="flex items-center justify-between gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all group">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-1">
        <h4 className="text-sm font-black text-slate-900">{label}</h4>
        <span className="text-[10px] font-black text-indigo-500 uppercase bg-white px-2 py-0.5 rounded-lg shadow-sm">{weight}</span>
      </div>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
    <div className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>
       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
    </div>
  </div>
);

export default MobileSync;
