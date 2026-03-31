'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Users, Briefcase, Plus, Search, Filter, 
  CheckCircle2, XCircle, Clock, ChevronRight, MessageSquare, 
  MoreVertical, Calendar, TrendingUp, Target, Sparkles, Brain, Award, Star, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Application as IApplication, Student as IStudent, MarketEquilibriumItem } from '@/types';
import { exportToCSV } from '@/lib/utils/export';
import { supabase } from '@/lib/supabase';

// Enriched application for the company view
interface EnrichedCompanyApplication extends IApplication {
  student_name: string;
  role_title: string;
  match_score: number;
  ai_interview_guide: string[];
}

interface TalentDiscoveryProfile {
  id: string;
  name: string;
  skills: string[];
  top_match: {
    role: string;
    score: number;
  };
}

const statusColors: Record<string, { color: string; bg: string; border: string }> = {
  'Pending':      { color: 'text-slate-500',  bg: 'bg-slate-50',   border: 'border-slate-100'  },
  'Under Review': { color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-100'  },
  'Interviewing': { color: 'text-indigo-600', bg: 'bg-indigo-50',  border: 'border-indigo-100' },
  'Accepted':     { color: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-100'},
  'Rejected':     { color: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-100'    },
};

export default function CompanyDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ activeRoles: 0, totalApplicants: 0, pendingReview: 0, interviewsScheduled: 0, isVerified: false });
  const [applications, setApplications] = useState<EnrichedCompanyApplication[]>([]);
  const [talentDiscovery, setTalentDiscovery] = useState<TalentDiscoveryProfile[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<EnrichedCompanyApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      const storedId = session?.user?.id;
      
      if (!storedId) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch(`/api/company/stats?companyId=${storedId}`);
        const result = await response.json();

        if (result.success) {
          setStats(result.stats);
          setApplications(result.applications);
          setTalentDiscovery(result.talentDiscovery);
        }
        setLoading(false);
      } catch (e) {
        console.error('Failed to load company dashboard:', e);
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExport = () => {
    const exportData = applications.map(app => ({
      'Application ID': app.application_id,
      'Student Name': app.student_name,
      'Role': app.role_title,
      'Match Score (%)': app.match_score,
      'Applied Date': new Date(app.applied_date).toLocaleDateString(),
      'Status': app.status
    }));
    exportToCSV(exportData, `applicants_${new Date().toISOString().split('T')[0]}.csv`);
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20 text-slate-400 gap-3">
      <div className="size-4 rounded-full border-2 border-emerald-600/30 border-t-emerald-600 animate-spin" />
      <span className="text-sm font-bold uppercase tracking-widest">Syndicating Company Intelligence...</span>
    </div>
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="size-2 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-[5px] text-slate-400">Recruitment Console • Live</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Talent Pipeline</h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage role matchings and AI-driven candidate assessments.</p>
        </div>
        <div className="relative group shrink-0">
          <button 
            disabled={!stats.isVerified}
            className={`px-8 py-4 rounded-2xl flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest shadow-lg ${
              stats.isVerified 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:-translate-y-0.5' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed grayscale'
            }`}
          >
            <Plus size={18} />
            Post New Role
          </button>
          {!stats.isVerified && (
            <div className="absolute top-full right-0 mt-3 p-3 bg-slate-900 text-white text-[10px] font-bold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-800 shadow-2xl">
              Verification Required
            </div>
          )}
        </div>
      </header>

      {!stats.isVerified && (
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative p-10 rounded-[3rem] bg-indigo-900 border border-indigo-500/30 overflow-hidden shadow-2xl shadow-indigo-900/40"
        >
          {/* Background Neural Detail */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
          <div className="absolute -top-20 -right-20 size-64 bg-emerald-500/10 blur-[100px] rounded-full" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="size-20 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white shrink-0 group">
              <Clock className="size-10 text-emerald-400 animate-pulse group-hover:scale-110 transition-transform" />
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/30">
                  Identity Pending
                </span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none">
                Neural Verification in Progress
              </h2>
              <p className="text-indigo-200/70 font-medium max-w-2xl leading-relaxed text-sm">
                Your corporate entity has been successfully registered. We are currently performing identity synthesis and administrative vetting. Recruitment tools will activate upon successful verification.
              </p>
            </div>

            <div className="shrink-0 flex flex-col gap-4">
              <button className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-xl">
                Synthesis Progress
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Roles', value: stats.activeRoles, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Applicants', value: stats.totalApplicants, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Pending Review', value: stats.pendingReview, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Interviews Scheduled', value: stats.interviewsScheduled, icon: Calendar, color: 'text-slate-700', bg: 'bg-slate-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">{stat.label}</span>
              <div className={`size-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
            <div className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Applicant Feed */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Candidates</h3>
            <div className="flex items-center gap-3">
              <button onClick={handleExport} className="px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
                <Download size={14} /> Export CSV
              </button>
              <button className="size-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"><Search size={16} /></button>
              <button className="px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-emerald-600 transition-all"><Filter size={14} /> Filter</button>
            </div>
          </div>

          <div className="space-y-4">
            {applications.map((app) => (
              <motion.div 
                key={app.application_id}
                onClick={() => setSelectedApplication(app)}
                layoutId={app.application_id}
                className={`p-6 bg-white border rounded-[2rem] transition-all cursor-pointer group hover:border-emerald-600/50 hover:shadow-xl ${selectedApplication?.application_id === app.application_id ? 'border-emerald-600 shadow-lg' : 'border-slate-100'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="size-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black uppercase shadow-lg group-hover:bg-emerald-600 transition-colors">
                      {app.student_name ? app.student_name.charAt(0) : '?'}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{app.student_name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.role_title}</span>
                        <div className="size-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applied {new Date(app.applied_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Proactive Intelligence: Match Score Indicator */}
                    <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                            <Brain size={12} className="text-indigo-500" />
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">AI Match Score</span>
                        </div>
                        <div className="text-2xl font-black text-slate-900 tracking-tighter">{app.match_score}%</div>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl border text-[9px] font-black uppercase tracking-[2px] ${statusColors[app.status]?.bg} ${statusColors[app.status]?.border} ${statusColors[app.status]?.color}`}>
                      {app.status}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Workspace Panel: Talent Discovery & Interview Guide */}
        <div className="xl:col-span-4 space-y-8">
            <AnimatePresence mode="wait">
                {selectedApplication ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="bg-slate-950 rounded-[3rem] p-10 text-white border border-white/5 relative overflow-hidden h-fit"
                    >
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <MessageSquare size={120} className="text-emerald-500" />
                        </div>
                        <div className="relative z-10 space-y-10">
                           <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <Sparkles size={14} className="text-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[4px]">AI Interview Guide</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Candidate Assessment</h3>
                                </div>
                                <button onClick={() => setSelectedApplication(null)} className="size-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white"><XCircle size={18} /></button>
                           </div>

                           <div className="space-y-6">
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-4">Targeted Technical Evaluation</span>
                                    <div className="space-y-5">
                                        {(selectedApplication.ai_interview_guide || []).map((q: string, i: number) => (
                                            <div key={i} className="flex gap-4 group">
                                                <span className="text-emerald-500 font-black text-xs leading-none">0{i+1}.</span>
                                                <p className="text-[11px] font-medium text-slate-400 group-hover:text-white transition-colors">{q}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button className="flex-1 py-4 bg-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-[3px] shadow-lg shadow-emerald-900/40 hover:bg-emerald-700 transition-all">Approve for Interview</button>
                                    <button className="size-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/50 hover:bg-white/10 transition-all"><XCircle size={20} /></button>
                                </div>
                           </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-white rounded-[3rem] border border-slate-100 p-10 h-fit"
                    >
                         <div className="flex items-center gap-3 mb-10">
                            <div className="size-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <TrendingUp size={20} />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Talent Discovery</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px]">AI Recommended Profiles</p>
                            </div>
                         </div>

                         <div className="space-y-6">
                            {talentDiscovery.map((talent) => (
                                <div key={talent.id} className="p-5 border border-slate-50 bg-slate-50/50 rounded-2xl group hover:bg-white hover:border-emerald-600/30 hover:shadow-xl transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{talent.name}</h4>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Predictor Match: <span className="text-emerald-600">{talent.top_match.role}</span></span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg">
                                            <Star size={10} className="fill-emerald-600" />
                                            <span className="text-[10px] font-black">{talent.top_match.score}%</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {talent.skills.slice(0, 3).map((s: string) => (
                                            <span key={s} className="text-[8px] font-black text-slate-500 bg-white border border-slate-100 px-2 py-0.5 rounded-md uppercase tracking-widest">{s}</span>
                                        ))}
                                    </div>
                                    <button className="w-full mt-4 py-2 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-black">Invite to Apply</button>
                                </div>
                            ))}
                         </div>

                         <div className="mt-8 p-5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-4">
                            <Brain size={24} className="text-indigo-600" />
                            <p className="text-[10px] font-bold text-indigo-700 leading-relaxed uppercase tracking-tight">AI has scanned 500+ profiles to find these high-relevance matches for your open roles.</p>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
