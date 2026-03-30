'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Users, Briefcase, 
  Target, Globe, Zap, Sparkles,
  ArrowUpRight, BarChart3, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

// Types for Analytics
interface PlacementData {
  month: string;
  applications: number;
  placements: number;
}

interface SkillDemand {
  name: string;
  demand: number;
  supply: number;
}

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    totalInternships: 0,
    activePlacements: 0
  });

  const [placementData, setPlacementData] = useState<PlacementData[]>([]);
  const [skillDemand, setSkillDemand] = useState<SkillDemand[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<PieDataItem[]>([]);

  useEffect(() => {
    setMounted(true);
    async function loadAnalytics() {
      try {
        const response = await fetch('/api/admin/analytics');
        const data = await response.json();

        if (data.success) {
          setStats(data.stats);
          setPlacementData(data.placementData);
          setSkillDemand(data.skillDemand);
          setStatusDistribution(data.statusDistribution);
        }
        setLoading(false);
      } catch (e) {
        console.error('Failed to load analytics:', e);
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading || !mounted) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-8">
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-amber-600"
      >
        <BarChart3 size={64} fill="currentColor" />
      </motion.div>
      <div className="text-center">
        <h2 className="text-[10px] font-black uppercase tracking-[10px] text-amber-600 mb-2">Processing Analytics</h2>
        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[5px] animate-pulse">Syncing Big Data Intelligence Records</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <TrendingUp size={14} />
                </div>
                <h2 className="text-[10px] font-black uppercase tracking-[6px] text-slate-400">Intelligence Hub</h2>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Platform Analytics</h1>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                <div className="size-2 rounded-full bg-amber-600 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[3px] text-amber-900">Live Telemetry</span>
            </div>
            <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[3px] text-slate-400">
                Data Precision: Active
            </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: Users, trend: '+12%', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Growth Scale', value: stats.activePlacements, icon: Briefcase, trend: '+28%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Partner Access', value: stats.totalCompanies, icon: Globe, trend: '+5%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Market Demand', value: stats.totalInternships, icon: Zap, trend: '+15%', color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
                <div className={`size-12 rounded-2xl ${kpi.bg} flex items-center justify-center ${kpi.color} border border-transparent group-hover:border-current transition-all`}>
                    <kpi.icon size={20} />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">
                    <ArrowUpRight size={12} />
                    <span className="text-[10px] font-black">{kpi.trend}</span>
                </div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 mb-2">{kpi.label}</div>
            <div className="text-4xl font-black text-slate-900 tracking-tighter">{kpi.value.toLocaleString()}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Placement Funnel */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Placement Velocity</h3>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[3px] mt-1">Hiring funnel efficiency metrics</p>
            </div>
            <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-slate-100 text-[9px] font-black text-slate-400 uppercase">
                    <div className="size-1.5 rounded-full bg-indigo-500" />
                    Applications
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-slate-100 text-[9px] font-black text-slate-400 uppercase">
                    <div className="size-1.5 rounded-full bg-amber-500" />
                    Placements
                </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart data={placementData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}
                />
                <Area type="monotone" dataKey="applications" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                <Area type="monotone" dataKey="placements" stroke="#D97706" strokeWidth={3} fillOpacity={1} fill="url(#colorPlacements)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Student States</h3>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[3px] mb-8">Current workforce allocation</p>
            
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="99%" height="100%">
                    <PieChart>
                        <Pie
                            data={statusDistribution}
                            cx="50%" cy="50%"
                            innerRadius={80}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                        >
                            {statusDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="space-y-4 mt-6">
                {statusDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/30">
                        <div className="flex items-center gap-3">
                            <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-600">{item.name}</span>
                        </div>
                        <span className="text-[11px] font-black text-slate-900">{((item.value / 1240) * 100).toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skill Demand vs Supply */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Labor Market Gap</h3>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[3px] mt-1">Skill demand vs available talent</p>
                </div>
                <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Target size={18} />
                </div>
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="99%" height="100%">
                    <BarChart data={skillDemand} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis 
                            type="category" 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }} 
                            width={100}
                        />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                        <Bar dataKey="demand" fill="#D97706" radius={[0, 4, 4, 0]} barSize={20} name="Required" />
                        <Bar dataKey="supply" fill="#94A3B8" radius={[0, 4, 4, 0]} barSize={20} name="Available" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>

        {/* Predictive Intelligence */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-10 bg-slate-900 rounded-[2.5rem] relative overflow-hidden group shadow-2xl"
        >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[100px] rounded-full group-hover:bg-amber-500/20 transition-all duration-700" />
            
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-500">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Predictive Outlook</h3>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[3px] mt-1">AI-driven quarterly forecast</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {[
                        { label: 'Q3 Placement Forecast', value: '420 Units', confidence: '94%', progress: 85 },
                        { label: 'Market Saturation Index', value: 'Low Risk', confidence: '89%', progress: 32 },
                        { label: 'Skill Match Reliability', value: 'High Accuracy', confidence: '98%', progress: 98 },
                    ].map((item, i) => (
                        <div key={item.label} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <div className="text-[9px] font-black text-white/30 uppercase tracking-[3px] mb-1">{item.label}</div>
                                    <div className="text-xl font-black text-white">{item.value}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] font-black text-white/30 uppercase tracking-[3px] mb-1">Confidence</div>
                                    <div className="text-sm font-black text-amber-500">{item.confidence}</div>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${item.progress}%` }}
                                    className="h-full bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.5)]"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex items-center gap-4 p-4 rounded-xl bg-amber-600/10 border border-amber-600/20">
                    <AlertCircle className="text-amber-500 size-5" />
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-relaxed">
                        Data indicates 15% surplus in Frontend roles for Q3. Advise shifting recruitment focus to Backend/DevOps.
                    </p>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
