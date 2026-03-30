'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, Users, Building2, Briefcase, ClipboardList, 
  TrendingDown, BarChart3, Target, ArrowUpRight, Cpu 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketEquilibriumItem, Skill } from '@/types';
import { ThreeDCard } from '@/components/ui/ThreeDCard';
import { AI_ENGINE } from '@/lib/ai-engine';
import { toast } from 'react-hot-toast';

interface AtRiskStudent {
  student_id: string;
  name: string;
  reason: string;
}

export default function AdminOverview() {
  const router = useRouter();
  const [stats, setStats] = useState({ students: 0, companies: 0, internships: 0, applications: 0 });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [marketIntelligence, setMarketIntelligence] = useState<MarketEquilibriumItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Corporate Health Metrics (AI Driven)
  const healthMetrics = AI_ENGINE.analyzeCompanyHealth(recentActivity);

  useEffect(() => {
    async function load() {
      const storedId = localStorage.getItem('demo_admin_id');
      if (!storedId) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch('/api/admin/stats');
        const result = await response.json();

        if (result.success && result.data) {
          const { stats, skills, atRisk, marketEquilibrium, recentActivity } = result.data;
          setStats(stats);
          setSkills(skills);
          setAtRiskStudents(atRisk);
          setMarketIntelligence(marketEquilibrium || []);
          setRecentActivity(recentActivity || []);
        }
        setLoading(false);
      } catch (e) {
        console.error('Failed to load admin stats:', e);
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-8">
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-amber-600"
      >
        <BarChart3 size={64} fill="currentColor" />
      </motion.div>
      <div className="text-center">
        <h2 className="text-[10px] font-black uppercase tracking-[10px] text-amber-600 mb-2">Syncing Admin Console</h2>
        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[5px] animate-pulse">Aggregating System Intelligence & Records</p>
      </div>
    </div>
  );

  const kpiCards = [
    { label: 'Total Students', value: stats.students, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Partner Companies', value: stats.companies, icon: Building2, color: 'text-slate-700', bg: 'bg-slate-300', border: 'border-slate-100' },
    { label: 'Active Internships', value: stats.internships, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Total Applications', value: stats.applications, icon: ClipboardList, color: 'text-slate-700', bg: 'bg-slate-300', border: 'border-slate-100' },
  ];

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Intelligence Dashboard</h1>
        <p className="text-slate-500 font-medium tracking-tight">SkillSync Intelligence Ecosystem • Professional Governance Environment.</p>
      </header>

      {/* KPI Cards with 3D Perspective */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map(stat => (
          <ThreeDCard key={stat.label} className="h-full">
            <div className={`bg-white h-full p-8 rounded-[2rem] border ${stat.border} shadow-sm group hover:shadow-md transition-all`}>
              <div className="flex items-center justify-between mb-6">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">{stat.label}</div>
                <div className={`size-9 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={16} />
                </div>
              </div>
              <div className={`text-4xl font-black ${stat.color} tracking-tighter`}>
                {stat.value.toLocaleString('en-IN')}
              </div>
            </div>
          </ThreeDCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Market Intelligence Panel - AI Driven */}
        <div className="lg:col-span-8 bg-slate-950 rounded-[3rem] p-10 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <BarChart3 size={120} className="text-emerald-500" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="size-6 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                <Target size={14} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">Market Equilibrium Analytics</span>
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Skill Supply vs. Industrial Demand</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                         {marketIntelligence.slice(0, 3).map((item, idx) => (
                            <div key={item.name} className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-black text-white uppercase tracking-widest">{item.name}</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[2px]">
                                        Match Gap: {item.gap > 0 ? `-${item.gap} Supply` : `+${Math.abs(item.gap)} Surplus`}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.supply / (item.supply + item.demand + 1)) * 100}%` }}
                                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                    />
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.demand / (item.supply + item.demand + 1)) * 100}%` }}
                                        className="h-full bg-slate-800"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Corporate Health Diagnostic Card */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 space-y-6">
                         <div className="flex items-center gap-2">
                             <Cpu size={14} className="text-amber-500" />
                             <span className="text-[10px] font-black text-amber-500 uppercase tracking-[3px]">Corporate Health Diagnostic</span>
                         </div>
                         
                         <div className="space-y-4">
                             <div>
                                 <div className="flex justify-between mb-2">
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Responsiveness</span>
                                     <span className="text-xs font-black text-white">{healthMetrics.responsiveness}%</span>
                                 </div>
                                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500" style={{ width: `${healthMetrics.responsiveness}%` }} />
                                 </div>
                             </div>
                             <div>
                                 <div className="flex justify-between mb-2">
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Decision Accuracy</span>
                                     <span className="text-xs font-black text-white">{healthMetrics.accuracy}%</span>
                                 </div>
                                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${healthMetrics.accuracy}%` }} />
                                 </div>
                             </div>
                         </div>
                         
                         <p className="text-[9px] font-medium text-slate-500 leading-relaxed uppercase tracking-widest italic">
                            System status: <span className="text-emerald-500 font-black">Optimal</span>. AI Engine detecting high placement velocity within technical sectors.
                         </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Placement Intervention Radar */}
        <div className="lg:col-span-4 bg-slate-900 rounded-[3rem] p-10 border border-white/5 flex flex-col relative overflow-hidden group/radar">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/radar:rotate-12 transition-transform">
            <TrendingDown size={100} className="text-rose-500" />
          </div>
          <div className="flex items-center gap-3 mb-8">
            <div className="size-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
              <AlertTriangle size={18} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Placement Risk Radar</h3>
          </div>
          
          <div className="space-y-4 flex-1">
            {atRiskStudents.map((student, i) => (
              <div key={student.student_id} className="p-5 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black text-white text-sm uppercase tracking-tight">{student.name}</h4>
                  <span className="text-[8px] font-black bg-rose-500/20 text-rose-500 px-2 py-1 rounded-md border border-rose-500/20 uppercase tracking-widest">At Risk</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 italic">&quot;{student.reason}&quot;</p>
                <button 
                  onClick={() => {
                    toast.success(`AI Mentor Assigned to ${student.name}`, { icon: '🤖' });
                    // Globally activate mentorship flag for demo purposes
                    localStorage.setItem('ai_mentorship_active', 'true');
                    // Simulate system update in local view
                    setAtRiskStudents(prev => prev.filter(s => s.student_id !== student.student_id));
                  }}
                  className="w-full py-2.5 rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2"
                >
                  Assign AI Mentor <ArrowUpRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 overflow-hidden relative">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Recent Intellectual Activity</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live System Audit Trace</p>
          </div>
          <button className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline">View Full Logs</button>
        </div>

        <div className="space-y-1">
          {recentActivity.length === 0 ? (
            <div className="py-20 text-center border border-dashed rounded-[2rem] border-slate-200">
              <div className="text-slate-300 font-black uppercase tracking-widest text-xs">No Recent Activity Detected</div>
            </div>
          ) : (
            recentActivity.map((activity, idx) => (
              <div key={activity.id} className={`flex items-center justify-between p-6 rounded-2xl transition-all hover:bg-slate-50 group ${idx !== recentActivity.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <div className="flex items-center gap-6">
                  <div className="size-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-slate-900/20 group-hover:bg-amber-600 group-hover:shadow-amber-600/20 transition-all shrink-0">
                    {activity.type.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-2">{activity.title}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px]">{new Date(activity.timestamp).toLocaleString()}</span>
                      <div className="size-1 rounded-full bg-slate-200" />
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">{activity.type}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-1.5 rounded-lg bg-slate-100 text-[8px] font-black text-slate-500 uppercase tracking-widest group-hover:bg-white group-hover:shadow-sm transition-all">
                  {activity.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dynamic Skill Inventory */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8">Role-Based Skill Taxonomy</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map(s => (
            <span key={s.skill_name} className="px-5 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-600 uppercase tracking-wider hover:border-amber-600/30 hover:bg-amber-50/30 transition-colors cursor-default">
              {s.skill_name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

