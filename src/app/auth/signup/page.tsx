'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  Loader2,
  Terminal,
  Cpu,
  Globe,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, type: 'student' })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('demo_student_id', data.user.id);
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Authentication Induction Failed');
      }
    } catch (e) {
      setError('System Failure: Induction process interrupted');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Immersive Background Layers */}
      <div className="fixed inset-0 bg-white opacity-50 pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      {/* Decorative tactical elements */}
      <div className="absolute top-10 left-10 flex flex-col gap-2 opacity-40 select-none pointer-events-none">
         <div className="text-[10px] font-mono text-amber-600 tracking-[0.3em]">SECURE_REGISTRATION_v4.2</div>
         <div className="text-[8px] font-mono text-slate-400 uppercase tracking-[0.4em]">Grid_ID: 0x88f21a</div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
            <motion.div 
               whileHover={{ rotate: 360, scale: 1.1 }}
               transition={{ duration: 1.5, type: "spring" }}
               className="size-16 rounded-[1.4rem] bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/20 mb-8 border border-white/10"
            >
               <Zap size={32} className="fill-white" />
            </motion.div>
            <h2 className="text-[10px] font-black uppercase tracking-[10px] text-amber-600 mb-4 antialiased">Professional Induction</h2>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight uppercase font-display leading-[0.8] mb-4">
              SkillSync<br />
              <span className="text-amber-600 leading-tight">Professional.</span>
            </h1>
        </div>

        <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-amber-600/10 pointer-events-none" />
          <div className="absolute top-8 right-12 flex gap-1 items-center">
             <div className="size-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(217,119,6,0.3)] animate-pulse" />
             <span className="text-[8px] font-black uppercase tracking-[3px] text-amber-600/60">System Ready</span>
          </div>

          <form onSubmit={handleSignup} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] flex items-center gap-3">
                      <User size={14} className="text-amber-600/40" /> Full Name
                   </label>
                   <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="YOUR FULL NAME"
                      required
                      className="w-full h-16 px-6 rounded-2xl border border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-[3px] text-slate-900 focus:border-amber-500/30 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none placeholder:text-slate-300"
                   />
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] flex items-center gap-3">
                      <Mail size={14} className="text-amber-600/40" /> Email Address
                   </label>
                   <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full h-16 px-6 rounded-2xl border border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-[3px] text-slate-900 focus:border-amber-500/30 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none placeholder:text-slate-300"
                   />
                </div>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] flex items-center gap-3">
                  <Lock size={14} className="text-amber-600/40" /> Password
               </label>
               <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-16 px-6 rounded-2xl border border-slate-200 bg-slate-50 text-[12px] font-black uppercase tracking-[5px] text-slate-900 focus:border-amber-500/30 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none placeholder:text-slate-300"
               />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 p-5 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500"
              >
                <AlertCircle size={18} />
                <span className="text-[10px] font-black uppercase tracking-[2px]">{error}</span>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(217,119,6,0.15)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-20 rounded-[1.5rem] bg-amber-600 text-white text-[12px] font-black uppercase tracking-[6px] shadow-lg flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative group"
            >
               <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
               {loading ? <Loader2 size={22} className="animate-spin text-white" /> : <ShieldCheck size={22} className="fill-white" />}
               {loading ? 'Processing...' : 'Register Now'}
            </motion.button>
          </form>

          <div className="mt-12 pt-10 border-t border-slate-100 grid grid-cols-2 gap-8">
              <div className="text-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[4px] block mb-2">Already a Member?</span>
                <Link href="/auth/login" className="text-[10px] font-black uppercase tracking-[3px] text-slate-900 hover:text-amber-600 transition-colors">Sign In &rarr;</Link>
              </div>
             <div className="text-center border-l border-slate-100">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[3px] block mb-2">System Status</span>
                <span className="text-[10px] font-black uppercase tracking-[3px] text-amber-600/60">Operational</span>
             </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center gap-12 opacity-40">
           <div className="flex items-center gap-3">
              <Globe size={14} className="text-slate-400" />
              <span className="text-[8px] font-black uppercase tracking-[4px] text-slate-400">Global Career Network</span>
           </div>
           <div className="flex items-center gap-3">
              <Activity size={14} className="text-slate-400" />
              <span className="text-[8px] font-black uppercase tracking-[4px] text-slate-400">Professional Matching Network</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
