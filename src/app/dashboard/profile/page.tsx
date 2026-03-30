'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  User, School, GraduationCap, FileText, Save, CheckCircle2,
  AlertCircle, Camera, Activity, Cpu, ShieldCheck, Link as LinkIcon,
  TrendingUp, Zap, BookOpen, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumCard from '@/components/ui/PremiumCard';
import AnimatedSection from '@/components/ui/AnimatedSection';

interface ProfileState {
  name: string;
  college: string;
  branch: string;
  graduation_year: string;
  resume_url: string;
}

interface CompletionStep {
  label: string;
  done: boolean;
  icon: any;
  hint: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileState>({ name: '', college: '', branch: '', graduation_year: '', resume_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [skillCount, setSkillCount] = useState(0);
  const [appCount, setAppCount] = useState(0);

  useEffect(() => {
    async function load() {
      const userId = localStorage.getItem('demo_student_id');
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/students/profile?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
          const student = data.data.profile;
          setProfile({
            name: student.name || '',
            college: student.college || '',
            branch: student.branch || '',
            graduation_year: student.graduation_year?.toString() || '',
            resume_url: student.resume_url || ''
          });
          setSkillCount(data.data.stats.skills || 0);
          setAppCount(data.data.stats.applications || 0);
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Dynamic completion checklist — recomputes whenever profile changes
  const completionSteps: CompletionStep[] = useMemo(() => [
    { label: 'Full Name', done: !!profile.name.trim(), icon: User, hint: 'Enter your full name so recruiters can identify you' },
    { label: 'University / College', done: !!profile.college.trim(), icon: School, hint: 'Add your institution for college placement tracking' },
    { label: 'Branch / Major', done: !!profile.branch.trim(), icon: BookOpen, hint: 'Your field of study helps match you with relevant roles' },
    { label: 'Graduation Year', done: !!profile.graduation_year, icon: GraduationCap, hint: 'Companies filter candidates by batch year' },
    { label: 'Portfolio / Resume Link', done: !!profile.resume_url.trim(), icon: FileText, hint: 'A direct link to your resume dramatically boosts visibility' },
    { label: 'At Least 3 Skills', done: skillCount >= 3, icon: Award, hint: 'Add skills in the Skills tab to get matched with suitable roles' },
    { label: 'First Application', done: appCount > 0, icon: Zap, hint: 'Apply to at least one internship to activate your tracking' },
  ], [profile, skillCount, appCount]);

  const completedCount = completionSteps.filter(s => s.done).length;
  const completionPct = Math.round((completedCount / completionSteps.length) * 100);

  const completionColor =
    completionPct >= 85 ? 'text-emerald-600' :
    completionPct >= 60 ? 'text-amber-600' : 'text-red-500';

  const completionBarColor =
    completionPct >= 85 ? 'bg-emerald-500' :
    completionPct >= 60 ? 'bg-amber-500' : 'bg-red-400';

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const userId = localStorage.getItem('demo_student_id');
    if (!userId) {
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/students/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, profile })
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
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
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-amber-600"
      >
        <User size={64} fill="currentColor" />
      </motion.div>
      <div className="text-center">
         <h2 className="text-[10px] font-bold uppercase tracking-[10px] text-amber-600 mb-2">Loading Profile</h2>
         <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[5px] animate-pulse">Syncing Profile Data &amp; Professional Records</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">

      {/* Hero Banner */}
      <AnimatedSection direction="up" distance={40}>
        <div className="relative h-52 rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden shadow-sm flex items-end p-8 md:p-12 group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 via-transparent to-slate-50/40 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-8 w-full">
            <div className="relative group/avatar">
               <div className="size-28 rounded-[2rem] bg-amber-50 border-4 border-white flex items-center justify-center text-amber-600 shadow-xl group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
                  <span className="text-5xl font-black tracking-widest text-amber-600/30">{profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}</span>
               </div>
               <div className="absolute inset-0 bg-amber-600/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center rounded-[2rem] cursor-pointer">
                  <Camera size={20} className="text-white" />
               </div>
            </div>
            <div className="flex-1 text-center md:text-left">
               <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={12} className="text-amber-600" />
                  <span className="text-[9px] font-black uppercase tracking-[5px] text-amber-600">Profile Active</span>
               </div>
               <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">
                 {profile.name || 'Anonymous'}<br />
                 <span className="text-amber-600">Professional.</span>
               </h1>
               <div className="flex flex-wrap gap-3 mt-4">
                 {profile.college && (
                   <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-100 text-[9px] font-bold uppercase tracking-[2px] text-slate-500 shadow-sm">
                     <School size={10} className="text-amber-600" />{profile.college}
                   </div>
                 )}
                 {profile.branch && (
                   <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-100 text-[9px] font-bold uppercase tracking-[2px] text-slate-500 shadow-sm">
                     <Cpu size={10} className="text-amber-600" />{profile.branch}
                   </div>
                 )}
               </div>
            </div>
            {/* Completion badge top-right */}
            <div className="hidden md:flex flex-col items-end gap-1">
               <span className="text-[8px] font-black uppercase tracking-[4px] text-slate-400">Completion</span>
               <span className={`text-4xl font-black tracking-tighter ${completionColor}`}>{completionPct}%</span>
               <span className="text-[8px] text-slate-300 uppercase font-bold tracking-widest">{completedCount}/{completionSteps.length} steps done</span>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left — Completion Sidebar */}
        <div className="lg:col-span-1 space-y-6">

          {/* Dynamic Profile Completion Widget */}
          <AnimatedSection direction="right">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Activity size={16} />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[4px] text-slate-400">Profile Strength</div>
                  <div className={`text-2xl font-black tracking-tighter ${completionColor}`}>{completionPct}% Complete</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPct}%` }}
                  transition={{ duration: 0.9, ease: 'circOut' }}
                  className={`h-full rounded-full shadow-sm ${completionBarColor}`}
                />
              </div>

              {/* Checklist */}
              <div className="space-y-3">
                {completionSteps.map((step) => (
                  <div key={step.label} className={`flex items-start gap-3 p-3 rounded-xl transition-all ${step.done ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100 hover:border-amber-100'}`}>
                    <div className={`size-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${step.done ? 'bg-emerald-100 text-emerald-600' : 'bg-white border border-slate-200 text-slate-300'}`}>
                      {step.done ? <CheckCircle2 size={13} /> : <step.icon size={12} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[10px] font-black uppercase tracking-[2px] ${step.done ? 'text-emerald-700 line-through opacity-60' : 'text-slate-700'}`}>
                        {step.label}
                      </div>
                      {!step.done && (
                        <div className="text-[9px] font-medium text-slate-400 mt-0.5 leading-relaxed">{step.hint}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recruiter boost message */}
              {completionPct < 100 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <TrendingUp size={12} className="text-amber-600" />
                    <span className="text-[9px] font-black uppercase tracking-[3px] text-amber-700">Visibility Boost</span>
                  </div>
                  <p className="text-[9px] font-medium text-amber-800/70 leading-relaxed">
                    Complete all steps to boost recruiter visibility by <span className="font-black text-amber-700">240%</span> and unlock Top Candidate status.
                  </p>
                </div>
              )}

              {completionPct === 100 && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                  <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[2px]">Profile fully optimised — you are a Top Candidate!</p>
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* Quick Stats */}
          <AnimatedSection direction="right" delay={0.1}>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Skills Added', value: skillCount, color: 'text-amber-600', icon: Award },
                { label: 'Applications', value: appCount, color: 'text-indigo-600', icon: Zap },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col gap-2">
                  <item.icon size={14} className={item.color} />
                  <div className={`text-2xl font-black tracking-tighter ${item.color}`}>{item.value}</div>
                  <div className="text-[9px] font-black uppercase tracking-[2px] text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>

        {/* Right — Edit Form */}
        <div className="lg:col-span-2">
          <AnimatedSection direction="up">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center gap-4">
                <div className="size-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <User size={16} />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[5px] text-slate-400">Edit Profile</div>
                  <div className="text-sm font-black text-slate-900">Personal &amp; Academic Details</div>
                </div>
              </div>

              <form onSubmit={saveProfile} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2">
                      <User size={11} /> Full Name
                    </label>
                    <input 
                      type="text" value={profile.name}
                      onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full h-14 px-5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/40 transition-all placeholder:text-slate-300 outline-none"
                    />
                  </div>

                  {/* Graduation Year */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2">
                      <GraduationCap size={11} /> Graduation Year
                    </label>
                    <input 
                      type="number" value={profile.graduation_year}
                      onChange={e => setProfile(p => ({ ...p, graduation_year: e.target.value }))}
                      placeholder="e.g. 2026" min="2020" max="2035"
                      className="w-full h-14 px-5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/40 transition-all placeholder:text-slate-300 outline-none"
                    />
                  </div>

                  {/* College */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2">
                      <School size={11} /> University / Institution
                    </label>
                    <input 
                      type="text" value={profile.college}
                      onChange={e => setProfile(p => ({ ...p, college: e.target.value }))}
                      placeholder="e.g. IIT Delhi"
                      className="w-full h-14 px-5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/40 transition-all placeholder:text-slate-300 outline-none"
                    />
                  </div>

                  {/* Branch */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2">
                      <Cpu size={11} /> Branch / Major
                    </label>
                    <input 
                      type="text" value={profile.branch}
                      onChange={e => setProfile(p => ({ ...p, branch: e.target.value }))}
                      placeholder="e.g. Computer Science"
                      className="w-full h-14 px-5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/40 transition-all placeholder:text-slate-300 outline-none"
                    />
                  </div>
                </div>

                {/* Resume URL */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2">
                    <LinkIcon size={11} /> Portfolio / Resume Link
                  </label>
                  <div className="relative">
                    <input 
                      type="url" value={profile.resume_url}
                      onChange={e => setProfile(p => ({ ...p, resume_url: e.target.value }))}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full h-14 pl-5 pr-14 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/40 transition-all placeholder:text-slate-300 outline-none"
                    />
                    <FileText size={18} className="absolute right-5 top-4 text-slate-300" />
                  </div>
                  <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[2px]">Supported: Google Drive · GitHub · Notion · Portfolio sites</p>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <AnimatePresence mode="wait">
                    <motion.button
                      key={saved ? 'saved' : 'save'}
                      type="submit"
                      disabled={saving}
                      whileHover={{ scale: 1.01, boxShadow: "0 20px 40px rgba(217,119,6,0.12)" }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full h-16 rounded-2xl text-[11px] font-black uppercase tracking-[5px] shadow-lg flex items-center justify-center gap-4 transition-all duration-500 ${
                        saved ? "bg-emerald-600 text-white" : "bg-slate-900 text-white hover:bg-amber-600"
                      }`}
                    >
                      {saving ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Cpu size={20} /></motion.div>
                      ) : saved ? (
                        <><CheckCircle2 size={20} /> Profile Updated</>
                      ) : (
                        <><Save size={20} /> Save Changes</>
                      )}
                    </motion.button>
                  </AnimatePresence>

                  {saved && (
                    <motion.p 
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="text-center text-[9px] font-bold uppercase tracking-[3px] text-emerald-600/70 mt-3"
                    >
                      Profile changes have been successfully saved.
                    </motion.p>
                  )}
                </div>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
