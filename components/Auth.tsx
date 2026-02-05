import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { BrainCircuit, Mail, Lock, User, School, ArrowRight } from 'lucide-react';
import { Tenant } from '../types';

interface AuthProps {
    mode: 'login' | 'signup';
    tenants: Tenant[];
    onSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ mode: initialMode, tenants, onSuccess }) => {
    const [mode, setMode] = useState(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [selectedTenantId, setSelectedTenantId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            tenant_id: selectedTenantId || null,
                            role: 'TEACHER' // Default role
                        }
                    }
                });
                if (error) throw error;
                alert('Verification email sent! Please check your inbox.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-800/50 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center mb-10">
                    <div className="p-4 rounded-3xl bg-indigo-500/10 mb-6 border border-indigo-500/20 shadow-inner">
                        <BrainCircuit size={48} className="text-indigo-400" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
                        {mode === 'login' ? 'Welcome Back' : 'Join EduNexus'}
                    </h1>
                    <p className="text-slate-400 text-sm font-medium tracking-tight">
                        {mode === 'login' ? 'Institutional OS Access Point' : 'Initialize your professional profile'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'signup' && (
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-indigo-500/50 transition-all outline-none"
                                required
                            />
                        </div>
                    )}

                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input
                            type="email"
                            placeholder="Institutional Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-indigo-500/50 transition-all outline-none"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input
                            type="password"
                            placeholder="Security Key"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-indigo-500/50 transition-all outline-none"
                            required
                        />
                    </div>

                    {mode === 'signup' && (
                        <div className="relative group">
                            <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            <select
                                value={selectedTenantId}
                                onChange={(e) => setSelectedTenantId(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-indigo-500/50 transition-all outline-none appearance-none"
                            >
                                <option value="" className="bg-slate-900">Select Institution (Optional)</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                    >
                        {loading ? 'Processing...' : mode === 'login' ? 'Authorize Session' : 'Initialize Account'}
                        {!loading && <ArrowRight size={14} />}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-indigo-400 transition-colors"
                    >
                        {mode === 'login' ? "Don't have an account? Sign Up" : "Already registered? Log In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
