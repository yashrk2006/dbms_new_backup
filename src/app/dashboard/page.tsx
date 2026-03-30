'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ClipboardList, Zap, Briefcase, ArrowRight, TrendingUp, Clock,
  CheckCircle2, AlertCircle, Search, UserCircle, ChevronRight,
  Activity, Target, BookOpen, Cpu, Star, BarChart3, Sparkles,
  MessageSquare, Flame, Award, Globe, Code, ShieldCheck, Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ThreeDCard } from '@/components/ui/ThreeDCard';
import { AI_ENGINE } from '@/lib/ai-engine';

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  'Pending':      { color: 'text-slate-500',  bg: 'bg-slate-50',   border: 'border-slate-100',  icon: Clock         },
  'Under Review': { color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-100',  icon: Search        },
  'Interviewing': { color: 'text-indigo-600', bg: 'bg-indigo-50',  border: 'border-indigo-100', icon: MessageSquare },
  'Accepted':     { color: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-100',icon: CheckCircle2  },
  'Rejected':     { color: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-100',    icon: AlertCircle   },
};

import { Student, Application } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({ applications: 0, skills: 0, internships: 0, accepted: 0 });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [completionPct, setCompletionPct] = useState(0);
  const [marketIntelligence, setMarketIntelligence] = useState<{ marketReach: number, highImpact: { name: string, boost: number } | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [readinessData, setReadinessData] = useState<{ label: string, value: number }[]>([]);
  const [isMentorshipActive, setIsMentorshipActive] = useState(false);
  const [successScore, setSuccessScore] = useState(100);

  useEffect(() => {
    async function load() {
      const userId = localStorage.getItem('demo_student_id');
      if (!userId) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch(`/api/dashboard/stats?userId=${userId}`);
        const data = await response.json();

        if (data.success) {
          const student = data.student as Student;
          setUserName(student.name);
          setStats(data.stats);
          setRecentApplications(data.recentApplications);
          setMarketIntelligence({
            marketReach: student.market_reach || 0,
            highImpact: (student as any).high_impact_skill || null
          });

          // Calculate Readiness Radar Data
          const skills = student.skills.map(s => s.skill_name.toLowerCase());
          const categories = [
            { label: 'Frontend', keywords: ['react', 'next', 'tailwind', 'css', 'javascript', 'typescript', 'frontend'] },
            { label: 'Backend', keywords: ['node', 'express', 'python', 'django', 'fastapi', 'backend', 'api'] },
            { label: 'Data/AI', keywords: ['sql', 'postgres', 'mongodb', 'tensorflow', 'pytorch', 'ml', 'ai', 'data'] },
            { label: 'DevOps', keywords: ['docker', 'kubernetes', 'aws', 'cicd', 'linux', 'cloud'] },
            { label: 'Logic', keywords: ['dsa', 'algorithms', 'java', 'c++', 'rust', 'go'] }
          ];

          const readiness = categories.map(cat => ({
            label: cat.label,
            value: Math.min(100, Math.round((cat.keywords.filter(k => skills.some(s => s.includes(k))).length / 3) * 100) || 5) // Min 5 for radar shape
          }));
          setReadinessData(readiness);

          // Completion Calculation
          const checks = [
            !!student.name,
            !!student.college,
            !!student.email,
            data.stats.skills >= 3,
            data.stats.applications > 0,
          ];
          setCompletionPct(Math.round((checks.filter(Boolean).length / checks.length) * 100));

          // Sync AI Intelligence State
          const mentorshipFlag = localStorage.getItem('ai_mentorship_active') === 'true';
          setIsMentorshipActive(mentorshipFlag);
          const prob = AI_ENGINE.calculateSuccessProbability(student.market_reach || 0, data.stats.applications);
          setSuccessScore(prob);
        } else {
          setUserName('Professional');
        }
        setLoading(false);
      } catch (e) {
        console.error('Failed to load student dashboard:', e);
        setLoading(false);
      }
    }
    load();
  }, []);

  const firstName = userName.split(' ')[0] || 'Professional';

  // Radar Chart Helper
  const RadarChart = ({ data }: { data: { label: string, value: number }[] }) => {
    const size = 200;
    const center = size / 2;
    const radius = size * 0.4;
    const angleStep = (Math.PI * 2) / data.length;

    const points = data.map((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + (radius * (d.value / 100)) * Math.cos(angle);
      const y = center + (radius * (d.value / 100)) * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative size-[200px] flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="size-full overflow-visible">
          {/* Grid Background */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
            <circle key={i} cx={center} cy={center} r={radius * r} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200" strokeDasharray="2 2" />
          ))}
          {/* Axis */}
          {data.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="currentColor" strokeWidth="0.5" className="text-slate-100" />;
          })}
          {/* Data Shape */}
          <motion.polygon
            points={points}
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="2"
            className="text-amber-500"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          {/* Labels */}
          {data.map((d, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + (radius + 20) * Math.cos(angle);
            const y = center + (radius + 20) * Math.sin(angle);
            return (
              <text key={i} x={x} y={y} textAnchor="middle" className="text-[10px] font-black fill-slate-400 uppercase tracking-tighter">
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-8">
      <motion.div
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="size-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-lg"
      >
        <Zap size={32} className="fill-amber-600" />
      </motion.div>
      <div className="text-center space-y-2">
        <h2 className="text-[10px] font-black uppercase tracking-[10px] text-amber-600">Loading Dashboard</h2>
        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[4px] animate-pulse">Syncing your career intelligence...</p>
      </div>
    </div>
  );

  const successRate = stats.applications > 0 ? Math.round((stats.accepted / stats.applications) * 100) : 0;
  const completionColor = completionPct >= 85 ? 'text-emerald-600' : completionPct >= 60 ? 'text-amber-600' : 'text-red-500';
  const completionBar = completionPct >= 85 ? 'bg-emerald-500' : completionPct >= 60 ? 'bg-amber-500' : 'bg-red-400';

  return (
    <div className="space-y-12 pb-24 max-w-6xl mx-auto">

      {/* Hero Welcome */}
      <div className="relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-indigo-50/30 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex-1 flex flex-col lg:flex-row lg:items-center gap-12">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[5px] text-slate-400">Career Intelligence • Live</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight uppercase leading-[0.9] mb-4">
                Hello,<br />
                <span className="text-amber-600">{firstName}.</span>
              </h1>
              
              {/* AI Skill Evolution Predictor Widget */}
              {marketIntelligence && (
                <ThreeDCard className="max-w-md mt-8">
                  <div className="p-6 rounded-2xl bg-slate-950 text-white border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                      <TrendingUp size={60} className="text-amber-400" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-400" />
                        <span className="text-[9px] font-black uppercase tracking-[3px] text-amber-400">Skill Evolution Predictor</span>
                      </div>
                      <div>
                        <div className="text-3xl font-black tracking-tighter text-white">{marketIntelligence.marketReach}%</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Market Reach Potential</div>
                      </div>
                      {marketIntelligence.highImpact && (
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-[10px] font-medium text-slate-400 leading-relaxed capitalize">
                            Adding <span className="text-white font-black">{marketIntelligence.highImpact.name}</span> will increase your interview match rate by <span className="text-emerald-400">+{marketIntelligence.highImpact.boost}%</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </ThreeDCard>
              )}
            </div>

            {/* Technical Readiness Radar */}
            <ThreeDCard>
              <div className="shrink-0 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-6 relative group overflow-hidden">
                  <div className="absolute top-4 left-4">
                     <div className="flex items-center gap-2">
                        <Cpu size={12} className="text-amber-500" />
                        <span className="text-[8px] font-black uppercase tracking-[3px] text-slate-400">Readiness Radar</span>
                     </div>
                  </div>
                  {readinessData.length > 0 && <RadarChart data={readinessData} />}
              </div>
            </ThreeDCard>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-[3px] text-slate-400">Profile Strength</span>
              <span className={`text-xl font-black tracking-tighter ${completionColor}`}>{completionPct}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${completionPct}%` }}
                  className={`h-full rounded-full ${completionBar}`}
                />
            </div>
            <Link href="/dashboard/internships">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-[4px] shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-colors"
              >
                <Zap size={14} className="fill-white" />
                Browse Market Roles
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2025 Modern Tech Roadmap */}
      <section className="space-y-6">
         <div className="flex items-center justify-between">
            <div className="space-y-1">
               <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">2025 Industrial Tech Spectrum</h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Predictive Roadmap by SkillSync AI</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
               <Globe size={14} />
               <span className="text-[9px] font-black uppercase tracking-widest">Global Standards</span>
            </div>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AI_ENGINE.getModernFrontendStack().map((tech, i) => (
              <ThreeDCard key={tech.name}>
                <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:border-amber-500/50 transition-all flex flex-col gap-4 h-full relative overflow-hidden group">
                   <div className="absolute -top-4 -right-4 size-20 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="flex justify-between items-start">
                      <div className="size-8 rounded-lg bg-slate-950 text-white flex items-center justify-center shadow-lg">
                         <Code size={14} />
                      </div>
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{tech.impact}% Match</span>
                   </div>
                   <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">{tech.name}</h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[2px]">{tech.category}</p>
                   </div>
                </div>
              </ThreeDCard>
            ))}
         </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Applications', value: stats.applications, icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Skills Added', value: stats.skills, icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          { label: 'Open Market Roles', value: stats.internships, icon: Briefcase, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-100' },
          { label: 'Growth Score', value: `${marketIntelligence?.marketReach || 0}%`, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black uppercase tracking-[2px] text-slate-400">{stat.label}</span>
              <div className={`size-8 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon size={14} />
              </div>
            </div>
            <div className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* AI Mentorship Hub - Reactive based on Predictive Performance */}
      {(isMentorshipActive || successScore < 40) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-[3rem] bg-rose-50 border border-rose-100 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Zap size={100} className="text-rose-500" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="size-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
               <ShieldCheck size={32} />
            </div>
            <div className="flex-1 space-y-2">
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-[4px]">AI Mentorship Activated</span>
                  <div className="h-px w-12 bg-rose-200" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Strategic Career Pivot Required</h3>
               <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-2xl">
                 Based on current industrial demand and your match matrix, we recommend a rapid sprint in <span className="text-rose-600 font-black italic">Server-Side Architectures</span>. {isMentorshipActive ? "An administrator has flagged your profile for expert-AI guidance." : `Your current success probability is ${successScore}% (Lower Than Optimal).`}
               </p>
            </div>
            <div className="flex flex-col gap-2">
               <Link href="/dashboard/skills">
                  <button className="px-8 py-4 rounded-2xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-[3px] shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all w-full">
                    Begin AI Corrective Sprint
                  </button>
               </Link>
               {isMentorshipActive && (
                  <button 
                    onClick={() => { localStorage.removeItem('ai_mentorship_active'); setIsMentorshipActive(false); }}
                    className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                  >
                    Mark as Resolved
                  </button>
               )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <div className="xl:col-span-2 space-y-6">
           <div className="p-8 rounded-[2.5rem] bg-indigo-50 border border-indigo-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-9 rounded-xl bg-white border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Target size={16} />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Growth Roadmap</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-indigo-100">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block mb-2">Next Best Skill</span>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-lg uppercase tracking-tight">{marketIntelligence?.highImpact?.name || 'Loading...'}</span>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">+{marketIntelligence?.highImpact?.boost}% Match</span>
                  </div>
                </div>
                <Link href="/dashboard/skills">
                  <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[3px] hover:bg-slate-800 transition-colors">
                    Update Skill Inventory
                  </button>
                </Link>
              </div>
           </div>
        </div>

        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Application Feed</h3>
            <Link href="/dashboard/applications" className="text-[9px] font-black text-amber-600 uppercase tracking-[3px] hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {recentApplications.map((app, i) => {
              const cfg = statusConfig[app.status] || statusConfig['Pending'];
              const Icon = cfg.icon;
              return (
                <div key={app.application_id} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-5 hover:shadow-md transition-all">
                    <div className={`size-11 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center ${cfg.color} shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-slate-900 truncate">{app.role_title || 'Role'}</h4>
                      <p className="text-[10px] font-bold text-slate-400">{app.company_name || 'Organization'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                      {app.status}
                    </span>
                    <Link href={`/dashboard/interview/${app.application_id}`}>
                      <motion.button 
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="p-3 rounded-xl bg-slate-900 text-white hover:bg-amber-600 transition-colors shadow-sm"
                        title="Start AI Practice Interview"
                      >
                        <Play size={14} className="fill-white" />
                      </motion.button>
                    </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

