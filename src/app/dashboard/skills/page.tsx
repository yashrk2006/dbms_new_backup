'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Zap, Plus, Trash2, Search, BookOpen, Trophy, 
  Filter, CheckCircle2, Sparkles, TrendingUp, 
  Activity, Cpu, Terminal, Database, Layers, 
  ChevronRight, Target, Flame, Star, Lightbulb,
  ShieldCheck, BarChart3, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { supabase } from '@/lib/supabase';

interface Skill { skill_id: number; skill_name: string; category?: string; }
interface StudentSkill { skill_id: number; skill_name: string; proficiency_level: string; category?: string; }

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

const levelConfig: Record<string, { color: string, glow: string, bg: string, icon: any, progress: number }> = {
  'Beginner': { color: 'text-slate-400', glow: '', bg: 'bg-slate-100', icon: BookOpen, progress: 25 },
  'Intermediate': { color: 'text-amber-600', glow: 'shadow-amber-600/5', bg: 'bg-amber-50', icon: TrendingUp, progress: 50 },
  'Advanced': { color: 'text-amber-700', glow: 'shadow-amber-700/10', bg: 'bg-amber-100', icon: CheckCircle2, progress: 75 },
  'Expert': { color: 'text-amber-700', glow: 'shadow-amber-700/20', bg: 'bg-amber-200', icon: Trophy, progress: 100 },
};

export default function SkillsPage() {
  const router = useRouter();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [mySkills, setMySkills] = useState<StudentSkill[]>([]);
  const [adding, setAdding] = useState(false);
  const [selectedSkillName, setSelectedSkillName] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<typeof LEVELS[number]>('Beginner');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiInsights, setAiInsights] = useState<{ marketReach: number, nextBestSkill: any } | null>(null);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const storedUserId = session?.user?.id;
    
    if (!storedUserId) {
      setLoading(false);
      router.push('/auth/login');
      return;
    }
    try {
      const resp = await fetch(`/api/skills?userId=${storedUserId}`);
      const result = await resp.json();
      if (result.success) {
        setAllSkills(result.allSkills || []);
        setMySkills(result.studentSkills || []);
        setAiInsights(result.aiInsights);
      }
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const skillAnalytics = useMemo(() => {
    if (mySkills.length === 0) return null;
    const order = { 'Expert': 4, 'Advanced': 3, 'Intermediate': 2, 'Beginner': 1 };
    const sorted = [...mySkills].sort((a, b) => 
      order[b.proficiency_level as keyof typeof order] - order[a.proficiency_level as keyof typeof order]
    );
    const categories: Record<string, number> = {};
    mySkills.forEach(s => {
      const cat = s.category || 'General';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    const topCategory = Object.entries(categories).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Professional';
    return {
      topSkill: sorted[0],
      topCategory,
      skillCount: mySkills.length,
      strengthScore: Math.min(Math.round((mySkills.length / 8) * 100), 100)
    };
  }, [mySkills]);

  async function handleAddSkill() {
    if (!selectedSkillName) return;
    setAdding(true);
    const { data: { session } } = await supabase.auth.getSession();
    const storedUserId = session?.user?.id;
    
    if (!storedUserId) {
      setAdding(false);
      router.push('/auth/login');
      return;
    }
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: storedUserId,
          skillName: selectedSkillName,
          proficiencyLevel: selectedLevel,
          action: 'upsert'
        })
      });
      const result = await response.json();
      if (result.success) {
        setMySkills(result.data);
        setSelectedSkillName('');
      }
    } catch (err) {
      console.error('Add skill error:', err);
    } finally {
      setAdding(false);
    }
  }

  async function removeSkill(skillName: string) {
    const { data: { session } } = await supabase.auth.getSession();
    const storedUserId = session?.user?.id;
    if (!storedUserId) return;
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: storedUserId,
          skillName,
          action: 'delete'
        })
      });
      const result = await response.json();
      if (result.success) {
        setMySkills(result.data);
      }
    } catch (err) {
      console.error('Remove skill error:', err);
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-10">
      <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="text-amber-600">
        <Cpu size={80} className="fill-amber-600/10" />
      </motion.div>
      <div className="text-center">
         <h2 className="text-xs font-black uppercase tracking-[12px] text-amber-600 mb-4 antialiased">Calibrating Attributes</h2>
         <p className="text-slate-500 text-[10px] font-black uppercase tracking-[6px] animate-pulse">Syncing Professional Intelligence Records</p>
      </div>
    </div>
  );

  const availableSkills = allSkills
    .filter(s => s.skill_name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a,b) => a.skill_name.localeCompare(b.skill_name));

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 pb-12 border-b border-slate-100">
        <AnimatedSection direction="up" distance={40} className="max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
             <div className="size-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                <Cpu size={18} className="animate-pulse" />
             </div>
             <h2 className="text-[10px] font-black uppercase tracking-[8px] text-slate-400">Competitive Edge Center</h2>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-950 tracking-tight uppercase leading-[0.9] mb-6">
            Skill<br /><span className="text-amber-600">Inventory.</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed uppercase tracking-tight">Manage verified competencies and align with organizational demand.</p>
        </AnimatedSection>
        
        <AnimatedSection direction="up" className="flex items-center gap-8 bg-slate-900 px-10 py-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group" delay={0.2}>
           <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent opacity-50 pointer-events-none" />
           <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center text-amber-500 border border-white/5 shadow-inner"><Target size={28} /></div>
           <div className="flex flex-col relative z-10">
              <span className="text-[9px] font-black uppercase tracking-[4px] text-white/40 mb-1">Market Reach Score</span>
              <span className="text-3xl font-black tracking-tighter text-white">{aiInsights?.marketReach || 0}%</span>
              <div className="flex items-center gap-2 mt-2">
                <div className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-[2px] text-white/60">AI Intelligence Optimized</span>
              </div>
           </div>
        </AnimatedSection>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
         <div className="xl:col-span-1 space-y-10">
            <AnimatedSection direction="up" className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-amber-600 shadow-sm"><Plus size={20} /></div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Inventory Management</h2>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] ml-1">Search & Select</label>
                        <select value={selectedSkillName} onChange={e => setSelectedSkillName(e.target.value)} className="w-full h-16 pl-6 pr-12 rounded-2xl border border-slate-100 bg-slate-50 text-[11px] font-black uppercase tracking-[2px] focus:border-amber-500/30 outline-none appearance-none">
                            <option value="">Select competency...</option>
                            {availableSkills.map(s => <option key={s.skill_id} value={s.skill_name}>{s.skill_name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] ml-1">Proficiency Level</label>
                        <div className="grid grid-cols-2 gap-3">
                            {LEVELS.map(level => (
                                <button key={level} onClick={() => setSelectedLevel(level)} className={`px-4 py-4 rounded-xl border text-[9px] font-black uppercase tracking-[2px] transition-all ${selectedLevel === level ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/20 scale-105" : "bg-white border-slate-100 text-slate-400 hover:border-amber-200"}`}>{level}</button>
                            ))}
                        </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={handleAddSkill} disabled={!selectedSkillName || adding} className={`w-full h-16 rounded-2xl text-[10px] font-black uppercase tracking-[4px] flex items-center justify-center gap-4 transition-all shadow-xl ${!selectedSkillName || adding ? "bg-slate-50 text-slate-300 cursor-not-allowed" : "bg-slate-900 text-white"}`}>
                        {adding ? <Activity className="animate-spin size-4" /> : <Zap size={16} className="fill-current" />}
                        {adding ? 'Processing...' : 'SECURE COMPETENCY'}
                    </motion.button>
                </div>
            </AnimatedSection>

            <AnimatedSection direction="up" delay={0.2} className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm"><Lightbulb size={20} /></div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Market Alignment</h2>
                </div>
                <div className="p-8 bg-slate-950 rounded-[2.5rem] border border-white/5 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-[3px] text-amber-500">Gap Intelligence</span>
                    </div>
                    <div className="space-y-4">
                        {aiInsights?.nextBestSkill ? (
                             <div className="p-5 bg-white/5 rounded-2xl border border-white/10 border-l-amber-600/50">
                                <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                                    Acquiring <span className="text-amber-500">{aiInsights.nextBestSkill.name}</span> will increase your market reach by <span className="text-amber-500">{aiInsights.nextBestSkill.boost}%</span>.
                                </p>
                             </div>
                        ) : (
                            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 border-l-emerald-600/50">
                                <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                                    Your current stack has maximum market compatibility.
                                </p>
                             </div>
                        )}
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">AI has detected emerging demand for <span className="text-amber-500">Distributed Systems</span>.</p>
                        </div>
                    </div>
                </div>
            </AnimatedSection>
         </div>

         <div className="xl:col-span-2 space-y-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-slate-50 text-slate-700 border border-slate-100 flex items-center justify-center shadow-sm"><Layers size={18} /></div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Skill Matrix</h2>
                </div>
                <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[3px] text-slate-400">{mySkills.length} Verified Entries</span>
                </div>
            </div>

            {mySkills.length === 0 ? (
                <div className="p-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <Database size={48} className="text-slate-200 mx-auto mb-8 animate-pulse" />
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 text-slate-950 font-black">Empty Repository</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence mode="popLayout">
                        {mySkills.map((ms, index) => {
                            const config = levelConfig[ms.proficiency_level] || levelConfig['Beginner'];
                            return (
                                <motion.div key={ms.skill_name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.05 }} className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-amber-500/30 transition-all duration-500 shadow-sm hover:shadow-xl">
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="space-y-4">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${config.bg} ${config.color} border-transparent shadow-sm`}>
                                                <config.icon size={11} className="animate-pulse" />
                                                <span className="text-[9px] font-black uppercase tracking-[2px]">{ms.proficiency_level}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter group-hover:text-amber-600 transition-colors leading-none">{ms.skill_name}</h3>
                                        </div>
                                        <button onClick={() => removeSkill(ms.skill_name)} className="size-10 rounded-xl flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all"><Trash2 size={16} /></button>
                                    </div>
                                    <div className="space-y-3 mb-10">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-[2px] text-slate-400">
                                            <span>Proficiency Index</span>
                                            <span>{config.progress}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${config.progress}%` }} className={`h-full rounded-full ${ms.proficiency_level === 'Expert' ? 'bg-amber-600' : ms.proficiency_level === 'Advanced' ? 'bg-amber-500' : ms.proficiency_level === 'Intermediate' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                                        </div>
                                    </div>
                                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${ms.proficiency_level === 'Expert' ? 'bg-amber-600' : 'bg-slate-100'}`} />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
         </div>
      </div>
    </div>
  );
}
