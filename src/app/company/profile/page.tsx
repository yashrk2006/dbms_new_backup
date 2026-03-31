'use client';

import { useEffect, useState } from 'react';
import { 
  Building2, Globe, MapPin, FileText, Save, CheckCircle2, 
  Cpu, ShieldCheck, Camera, Activity, Laptop, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { supabase } from '@/lib/supabase';

interface CompanyProfile {
  name: string;
  industry: string;
  description: string;
  website: string;
  location: string;
}

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile>({
    name: '',
    industry: '',
    description: '',
    website: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      const companyId = session?.user?.id;
      if (!companyId) return;

      try {
        const res = await fetch(`/api/company/profile?companyId=${companyId}`);
        const data = await res.json();
        if (data.success) {
          setProfile(data.company);
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const companyId = session?.user?.id;
    if (!companyId) return;

    try {
      const res = await fetch('/api/company/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, profile })
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error('Failed to save profile:', e);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-8">
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-emerald-600"
      >
        <Building2 size={64} fill="currentColor" />
      </motion.div>
      <div className="text-center">
         <h2 className="text-[10px] font-bold uppercase tracking-[10px] text-emerald-600 mb-2">Syncing Identity</h2>
         <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[5px] animate-pulse">Accessing Secure Corporate Records</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      
      {/* Premium Hero Banner */}
      <AnimatedSection direction="up" distance={40}>
        <div className="relative h-60 rounded-[3rem] bg-white border border-slate-100 overflow-hidden shadow-sm flex items-end p-10 md:p-14">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-slate-50/30 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-10 w-full">
            <div className="relative group/avatar">
               <div className="size-32 rounded-[2.5rem] bg-emerald-50 border-4 border-white flex items-center justify-center text-emerald-600 shadow-xl group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
                  <span className="text-6xl font-black tracking-widest text-emerald-600/20">{profile.name ? profile.name.charAt(0).toUpperCase() : 'C'}</span>
               </div>
               <div className="absolute inset-0 bg-emerald-600/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center rounded-[2.5rem] cursor-pointer">
                  <Camera size={24} className="text-white" />
               </div>
            </div>
            <div className="flex-1 text-center md:text-left">
               <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-[5em] text-emerald-600">Company Intelligence</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase leading-[0.8] mb-4">
                 {profile.name || 'Organization'}<br />
                 <span className="text-emerald-600">Overview.</span>
               </h1>
            </div>
            
            {/* Status Card */}
            <div className="hidden lg:flex flex-col items-end gap-2 bg-slate-50/50 px-8 py-6 rounded-[2rem] border border-slate-100">
               <span className="text-[9px] font-black uppercase tracking-[3px] text-slate-400">Profile Status</span>
               <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">Verified</span>
               </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Sidebar Settings */}
        <div className="lg:col-span-1 space-y-8">
           <AnimatedSection direction="right">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                        <Activity size={18} />
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Organizational Alignment</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px]">Branding & Identity</p>
                    </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[3px] ml-1">Industry Vertical</label>
                      <input 
                        type="text" value={profile.industry} onChange={e => setProfile({...profile, industry: e.target.value})}
                        placeholder="e.g. Technology"
                        className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50 text-xs font-bold text-slate-900 focus:border-emerald-600/30 outline-none transition-all"
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[3px] ml-1">Headquarters</label>
                      <input 
                        type="text" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})}
                        placeholder="e.g. Bengaluru"
                        className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50 text-xs font-bold text-slate-900 focus:border-emerald-600/30 outline-none transition-all"
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[3px] ml-1">Website URL</label>
                      <div className="relative">
                        <input 
                            type="url" value={profile.website} onChange={e => setProfile({...profile, website: e.target.value})}
                            placeholder="https://company.com"
                            className="w-full h-14 pl-5 pr-12 rounded-2xl border border-slate-100 bg-slate-50 text-xs font-bold text-slate-900 focus:border-emerald-600/30 outline-none transition-all"
                        />
                        <Globe size={16} className="absolute right-5 top-4 text-slate-300" />
                      </div>
                   </div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <p className="text-[9px] font-bold text-emerald-800 leading-relaxed uppercase tracking-tight">Your company profile is shared with top talent to ensure organizational transparency.</p>
                </div>
              </div>
           </AnimatedSection>

           <AnimatedSection direction="right" delay={0.1}>
              <div className="bg-slate-950 rounded-[2.5rem] border border-white/5 p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Layout size={80} className="text-emerald-500" />
                  </div>
                  <div className="relative z-10 space-y-4">
                      <span className="text-[9px] font-black uppercase tracking-[4px] text-emerald-500">Recruitment Boost</span>
                      <h4 className="text-xl font-black text-white tracking-tight uppercase leading-none">Enhanced Brand Visibility</h4>
                      <p className="text-[10px] font-medium text-slate-400 leading-relaxed">Completed profiles attract <span className="text-emerald-500 font-bold">42% more</span> high-fidelity applicants on average.</p>
                  </div>
              </div>
           </AnimatedSection>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-10">
           <AnimatedSection direction="up">
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 md:p-12 border-b border-slate-50">
                    <div className="flex items-center gap-5 mb-8">
                        <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                            <FileText size={22} />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-xl font-black text-slate-950 uppercase tracking-tighter">Organizational Identity</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[3px]">Public Facing Description</p>
                        </div>
                    </div>

                    <div className="space-y-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] ml-1">Entity Official Name</label>
                          <input 
                            type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                            placeholder="e.g. Acme Corporation"
                            className="w-full h-16 px-8 rounded-2xl border border-slate-100 bg-slate-50 text-base font-bold text-slate-900 focus:border-emerald-600/30 outline-none transition-all shadow-inner"
                          />
                       </div>

                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] ml-1">About the Organization</label>
                          <textarea 
                            rows={8} value={profile.description} onChange={e => setProfile({...profile, description: e.target.value})}
                            placeholder="Describe your organizational mission, culture, and core values..."
                            className="w-full p-8 rounded-[2rem] border border-slate-100 bg-slate-50 text-sm font-medium text-slate-900 focus:border-emerald-600/30 outline-none transition-all shadow-inner leading-relaxed resize-none"
                          />
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] ml-2 italic">Professional descriptions lead to higher quality internship applications.</p>
                       </div>
                    </div>
                </div>

                <div className="p-8 md:p-12 bg-slate-50/70 border-t border-slate-100">
                    <AnimatePresence mode="wait">
                        <motion.button
                            key={saved ? 'saved' : 'save'}
                            type="submit" disabled={saving}
                            whileHover={{ scale: 1.01, boxShadow: "0 20px 40px rgba(5,150,105,0.15)" }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full h-20 rounded-[2rem] text-[11px] font-black uppercase tracking-[8px] shadow-xl flex items-center justify-center gap-5 transition-all duration-500 ${
                                saved ? "bg-emerald-600 text-white" : "bg-slate-950 text-white hover:bg-emerald-600"
                            }`}
                        >
                            {saving ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Cpu size={24} /></motion.div>
                            ) : saved ? (
                                <><CheckCircle2 size={24} /> Sync Successful</>
                            ) : (
                                <><Save size={24} /> Commit Changes</>
                            )}
                        </motion.button>
                    </AnimatePresence>
                    {saved && (
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="text-center text-[10px] font-black uppercase tracking-[4px] text-emerald-600 mt-6"
                        >
                            Organizational records have been successfully updated across the cluster.
                        </motion.p>
                    )}
                </div>
              </div>
           </AnimatedSection>
        </div>
      </form>
    </div>
  );
}
