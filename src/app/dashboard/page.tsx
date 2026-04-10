'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Student, Application } from '@/types';
import { toast } from 'react-hot-toast';
import { AI_ENGINE } from '@/lib/ai-engine';
import { Sparkles, Zap, Cpu, ShieldCheck } from 'lucide-react';

// Helper component for Material Symbols Icons
const Icon = ({ name, className = "", style = {} }: { name: string, className?: string, style?: any }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [stats, setStats] = useState({ applications: 0, skills: 0, internships: 0, accepted: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [completionPct, setCompletionPct] = useState(0);
  const [courses, setCourses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<{label: string, val: number, color: string}[]>([]);
  
  // UX State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // AI Agent States
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [aiJobs, setAiJobs] = useState<any[] | null>(null);
  const [aiRoadmap, setAiRoadmap] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        setLoading(false);
        return; // Layout will handle redirect
      }

      try {
        const response = await fetch(`/api/dashboard/stats?userId=${userId}`);
        const data = await response.json();
        if (data.success) {
          const student = data.student as Student;
          if (!student) { setLoading(false); return; }
          setUserName(student.name.split(' ')[0]);
          setRollNo(student.roll_no || '');
          setStats(data.stats);
          setRecentApplications(data.recentApplications);

          if (data.student?.skills && data.student.skills.length > 0) {
            const colors = ['bg-emerald-400', 'bg-purple-500', 'bg-orange-400', 'bg-cyan-400', 'bg-[#575a93]'];
            setSkills(data.student.skills.slice(0,3).map((sk: any, i: number) => ({
              label: sk.skill_name || 'Skill',
              val: sk.level === 'Advanced' ? 90 : sk.level === 'Intermediate' ? 60 : sk.level === 'Expert' ? 95 : 30,
              color: colors[i % colors.length]
            })));
          } else {
            setSkills([]);
          }

          const checks = [!!student.name, !!student.college, !!student.email, data.stats.skills >= 3];
          setCompletionPct(Math.round((checks.filter(Boolean).length / checks.length) * 100));

          // Resume Intelligence: Load saved analysis results
          if (student.ai_resume_analysis) {
            setResumeAnalysis(student.ai_resume_analysis);
          }
        }

        // Fetch Live Learning & Calendar Context
        const [learnRes, calRes, notifRes] = await Promise.all([
           fetch('/api/dashboard/learning'),
           fetch(`/api/dashboard/calendar?userId=${userId}`),
           fetch(`/api/notifications?userId=${userId}`)
        ]);
        const learnData = await learnRes.json();
        const calData = await calRes.json();
        const notifData = await notifRes.json();
        
        if (learnData.success) setCourses(learnData.courses.slice(0, 3));
        if (calData.success) setEvents(calData.events.slice(0, 3));
        if (notifData.success) setNotifications(notifData.data);

        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return null;

  const handleUploadResume = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const file = selectedFile || fileInputRef.current?.files?.[0];
    if (!file) return toast.error("Please select a PDF file first");

    setUploadedFileName(file.name);
    setIsUploadModalOpen(false);
    toast.loading("AI Agent parsing resume...", { id: "resume-toast" });
    setIsAnalyzing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return toast.error("Auth session expired. Please re-login.");

      // Use the unified AI Resume Pipeline
      const formData = new FormData();
      formData.append('file', file);
      formData.append('studentId', userId);

      const res = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
         setResumeAnalysis(data.analysis);
         toast.success(`Success! Extracted ${data.skills_extracted} skills.`, { id: "resume-toast" });
         
         // Refresh dashboard metrics
         const statsRes = await fetch(`/api/dashboard/stats?userId=${userId}`);
         const statsData = await statsRes.json();
         if (statsData.success) {
            setStats(statsData.stats);
            // Update skills display locally if skills were returned in stats
            if (statsData.student?.skills) {
               const colors = ['bg-emerald-400', 'bg-purple-500', 'bg-orange-400', 'bg-cyan-400', 'bg-[#575a93]'];
               setSkills(statsData.student.skills.slice(0,3).map((sk: any, i: number) => ({
                 label: sk.skill_name || 'Skill',
                 val: sk.level === 'Advanced' ? 90 : 60,
                 color: colors[i % colors.length]
               })));
            }
         }
      } else {
         toast.error(data.error || "Analysis failed", { id: "resume-toast" });
      }
    } catch(e: any) { 
      console.error("Dashboard Intelligence Critical Error:", e);
      toast.error("Processing error. Ensure you have a valid PDF format.", { id: "resume-toast" }); 
    }
    setIsAnalyzing(false);
  };

  const handleMatchJobs = async () => {
     if(!resumeAnalysis || !resumeAnalysis.skills) return toast.error("Please generate resume profile first!");
     toast.loading("AI Agent matching jobs...", { id: "jobs-toast" });
     try {
       const res = await fetch('/api/dashboard/ai/match-jobs', {
          method: 'POST', body: JSON.stringify({ skills: resumeAnalysis.skills })
       });
       
       if (!res.headers.get("content-type")?.includes("application/json")) throw new Error("Recruitment API Outage (Non-JSON)");
       
       const data = await res.json();
       if(data.success) {
           setAiJobs(data.data.internships);
           toast.success("Strategic Match-making Complete!", { id: "jobs-toast" });
       }
     } catch(e: any) { 
       console.error("Job Match Error:", e);
       toast.error(e.message || "Neural Matcher Error: Critical System Outage", { id: "jobs-toast" }); 
     }
  };

  const handleSkillGap = async () => {
     if(!resumeAnalysis) return toast.error("Needs resume profile first");
     toast.loading("AI Agent detecting skill gaps...", { id: "gap-toast" });
     try {
       const res = await fetch('/api/dashboard/ai/skill-gap', {
          method: 'POST', body: JSON.stringify({ studentSkills: resumeAnalysis.skills, requiredSkills: ['System Design', 'SQL', ...(resumeAnalysis.missing||[])] })
       });
       
       if (!res.headers.get("content-type")?.includes("application/json")) throw new Error("Intelligence API Desync (Non-JSON)");

       const data = await res.json();
       if(data.success){
         setAiRoadmap(data.data);
         toast.success("Competency Roadmap Operationalized", { id: "gap-toast" });
       }
     } catch(e: any) {
         console.error("Skill Gap Error:", e);
         toast.error(e.message || "Roadmap Generation Failure", { id: "gap-toast" });
     }
  };

  const handleSyncSkills = async () => {
    if (!resumeAnalysis || !resumeAnalysis.skills) return;

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return toast.error("Session identity lost.");

    toast.loading("Syncing to Official Profile...", { id: "sync-toast" });
    try {
      const res = await fetch('/api/dashboard/ai/sync-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, skills: resumeAnalysis.skills })
      });
      
      if (!res.headers.get("content-type")?.includes("application/json")) throw new Error("Sync Engine Offline");

      const data = await res.json();
      if (data.success) {
        toast.success("Skills Merged into Inventory!", { id: "sync-toast" });
        // Refresh local stats to reflect new skills count
        const response = await fetch(`/api/dashboard/stats?userId=${userId}`);
        if (response.ok) {
           const result = await response.json();
           if (result.success) setStats(result.stats);
        }
      } else {
        toast.error(data.error || "Sync calibration failed", { id: "sync-toast" });
      }
    } catch (e: any) {
      console.error("Sync Error:", e);
      toast.error(e.message || "Sync failed", { id: "sync-toast" });
    }
  };

  const handleClearAnalysis = async () => {
    setResumeAnalysis(null);
    setAiJobs(null);
    setAiRoadmap(null);
    if (typeof window !== 'undefined') {
       localStorage.removeItem(`resume_analysis_${userName}`);
    }
    toast.success("Intelligence Cache Cleared. Ready for new upload.", { icon: "🧹" });
  };

  return (
    <>
      {/* ------------------------------------------------------------------
          DESKTOP VIEW (1:1 PORT FROM STICH DESKTOP)
          ------------------------------------------------------------------ */}
      <div className="hidden lg:flex flex-col xl:flex-row gap-6 font-sans bg-slate-50/30 min-h-screen">
        <div className="flex-1 flex flex-col gap-6">
          <header className="flex flex-col md:flex-row items-center justify-between bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 shadow-glass animate-in slide-in-from-top duration-700 gap-6">
            <div className="relative w-full md:max-w-md group">
              <div className="absolute inset-0 bg-[#575a93]/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Icon name="search" className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-[#575a93] transition-colors" />
              <input 
                className="w-full bg-white/50 border-white/60 border rounded-[1.5rem] py-4 pl-16 pr-8 focus:ring-2 focus:ring-[#575a93]/10 focus:border-[#575a93]/20 text-[15px] font-semibold placeholder-slate-400 shadow-inner transition-all" 
                placeholder="Filter recruitment repository..." 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-8">
              <button onClick={() => {toast("AI Assistant active", { icon: "✨" }); router.push('/dashboard/chat');}} className="relative overflow-hidden group/ai bg-slate-950 px-8 py-3.5 rounded-full font-black text-[10px] uppercase tracking-[3px] text-white flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-slate-950/20 active:scale-95">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-purple-500/20 to-emerald-400/20 animate-gradient-x bg-[length:200%_100%]" />
                <span className="relative z-10 flex items-center gap-3">AI Assistant <Sparkles className="size-3 text-emerald-400 animate-pulse" /></span>
              </button>
              <div className="flex items-center gap-6">
                <button onClick={() => toast("Dark mode rendering engine initializing...", { icon: "🌙" })} className="w-12 h-12 bg-white rounded-2xl shadow-soft border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400 hover:text-[#575a93]"><Icon name="wb_sunny" className="text-xl" /></button>
                <div className="relative group">
                  <button onClick={() => router.push('/dashboard/notifications')} className="w-12 h-12 bg-white rounded-2xl shadow-soft border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400 hover:text-[#575a93]"><Icon name="notifications" className="text-xl" /></button>
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#575a93] text-white text-[10px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-lg">
                      {notifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                </div>
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-premium cursor-pointer hover:scale-110 transition-transform active:scale-95" onClick={() => router.push('/dashboard/profile')}>
                  <img 
                    alt="User" 
                    className="w-full h-full object-cover" 
                    src="/assets/user_avatar.png" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${userName}&background=575a93&color=fff&bold=true`;
                    }}
                  />
                </div>
                {rollNo && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-[#575a93] uppercase tracking-[2px]">ID: {rollNo}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Institutional Profile</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-premium border border-white/50 relative hover:-translate-y-2 transition-all duration-500 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="font-black text-[13px] uppercase tracking-[4px] text-slate-400">Lessons Catalog</h3>
                <button className="text-[10px] font-black bg-slate-950 text-white px-6 py-2.5 rounded-full uppercase tracking-[2px] hover:bg-orange-500 transition-all shadow-lg active:scale-95">Catalog</button>
              </div>
              <div className="flex items-end justify-between relative z-10">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl md:text-6xl font-black tracking-tighter leading-none text-slate-950">{stats.accepted > 0 ? (stats.accepted * 12) + 4 : (stats.skills * 4) + 2}</span>
                    <div className="flex items-center text-xs font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md mb-2">
                      <Icon name="arrow_downward" className="text-sm mr-1" />7%
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 font-black uppercase tracking-[3px]">Active Modules</p>
                </div>
                <div className="w-36 mb-6">
                  <svg className="w-full drop-shadow-lg" viewBox="0 0 100 40">
                    <path className="stroke-orange-500 stroke-[4] fill-none" d="M0,30 C10,32 15,10 25,15 C35,20 40,35 50,30 C60,25 70,5 85,10 C95,15 100,20 100,20" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-premium border border-white/50 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="font-black text-[13px] uppercase tracking-[4px] text-slate-400">Skill Competency</h3>
              </div>
              <div className="flex gap-12 relative z-10">
                <div className="flex flex-col justify-end">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-black text-slate-950 leading-none tracking-tighter">{Math.floor(stats.skills * 14.5)}h</span>
                    <div className="text-xs font-black text-emerald-500 flex items-center bg-emerald-50 px-2 py-0.5 rounded-md mb-1">
                      <Icon name="arrow_upward" className="text-sm mr-1" />{(stats.skills * 4)}%
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-black uppercase tracking-[3px] mt-2">Skill Progression</p>
                </div>
                <div className="flex-1 space-y-6">
                  {skills.map((s) => (
                    <div key={s.label}>
                      <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest">
                        <span className="text-slate-400">{s.label}</span>
                        <span className="text-slate-950">{s.val}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.val}%` }} className={`h-full ${s.color} rounded-full shadow-lg`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="bg-[#0c0f10] p-8 rounded-[2.2rem] text-white relative flex flex-col min-h-[220px] shadow-soft hover:-translate-y-1 transition-transform group">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.05em] mb-6 opacity-60">Job Feed</h3>
              <div className="relative flex-1">
                <div className="bg-white rounded-[1.5rem] p-5 text-[#2d3335] relative z-10 shadow-xl min-h-[140px] flex flex-col justify-center">
                  {aiJobs && aiJobs[0] ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center p-1 bg-amber-50 rounded-lg text-amber-600">
                          <Icon name="bolt" className="text-xl" />
                        </div>
                        <h4 className="font-bold text-[13px] leading-tight tracking-tight uppercase">{aiJobs[0].title || 'SkillSync Intern'}</h4>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{aiJobs[0].company_name}</p>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{aiJobs[0].match_score}% Match</span>
                      </div>
                    </div>
                  ) : recentApplications[0] ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center p-1 bg-slate-50 rounded-lg">
                          <img 
                            alt="G" 
                            className="w-full h-full object-contain" 
                            src="/assets/company_logo.png" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Company&background=f1f5f9&color=64748b";
                            }}
                          />
                        </div>
                        <h4 className="font-bold text-[14px] leading-tight tracking-tight">{recentApplications[0].role_title}</h4>
                      </div>
                      <p className="text-[12px] font-bold text-slate-400 uppercase">Latest Application</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 gap-4 opacity-40 group-hover:opacity-60 transition-opacity">
                       <div className="size-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                         <Icon name="radar" className="text-3xl text-[#575a93]" />
                       </div>
                       <div className="text-center">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Scanning for matches</p>
                         <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-1">Intelligence engine active</p>
                       </div>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-[#575a93]/20 rounded-[1.5rem] rotate-2 translate-x-2 translate-y-2 blur-sm" />
              </div>

              {aiJobs ? (
                 <div className="mt-8 flex gap-2">
                   <button onClick={() => toast("Applied to Top AI Match!", { icon: "✅" })} className="bg-emerald-400 text-white w-full py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 transition-colors">🚀 Apply Match</button>
                   <button onClick={handleSkillGap} className="bg-amber-400 text-white w-full py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500 transition-colors">🧠 Skill Gap</button>
                 </div>
              ) : resumeAnalysis ? (
                 <button onClick={handleMatchJobs} className="mt-8 bg-amber-500 text-white shadow-lg w-full py-3.5 rounded-2xl text-[10px] font-bold flex items-center justify-center gap-2 uppercase tracking-widest hover:bg-amber-600 transition-colors">🔍 Match Jobs</button>
              ) : (
                 <button onClick={() => {toast("Generating Application payload...", { icon: "🚀" }); router.push('/dashboard/internships');}} className="mt-8 bg-white/10 w-full py-3.5 rounded-2xl text-[10px] font-bold flex items-center justify-center gap-2 uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">💡 Tap to apply</button>
              )}
            </div>

            <div className="bg-white p-8 rounded-[2.2rem] shadow-soft flex flex-col justify-between hover:-translate-y-1 transition-transform group">
              <div className="flex items-center gap-2 mb-4">
                <img 
                  className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm" 
                  src="/assets/user_avatar.png" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${userName}&background=575a93&color=fff`;
                  }}
                />
                <span className="text-slate-200">»</span>
                <div className="bg-[#cde5ff] text-[#004369] text-[9px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 uppercase tracking-widest">
                  <Icon name="description" className="text-[12px]" /> OFFER
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-extrabold text-[15px] leading-tight mb-2 tracking-[-0.02em]">Try out our Mock<br />Interview tool</h4>
                <p className="text-[11px] text-[#717171] leading-normal font-medium">Handle interviews easy with no stress</p>
              </div>
              <div className="flex justify-between items-center mt-auto">
                <button onClick={() => router.push('/dashboard/interview')} className="text-[12px] font-bold text-[#575a93] uppercase tracking-widest">Open Hub</button>
                <button onClick={() => router.push('/dashboard/interview/simulation')} className="w-9 h-9 bg-slate-50 text-[#575a93] rounded-xl flex items-center justify-center group-hover:bg-[#575a93] group-hover:text-white transition-colors">
                  <Icon name="chevron_right" className="text-lg" />
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.2rem] shadow-soft flex flex-col items-center text-center hover:-translate-y-1 transition-transform group relative overflow-hidden">
              {resumeAnalysis ? (
                 <>
                   <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 font-black text-xs px-4 py-2 rounded-bl-2xl">ATS {resumeAnalysis.score}%</div>
                   <h4 className="font-extrabold text-[15px] mb-1 tracking-[-0.02em] text-emerald-600">Resume Analyzed</h4>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Icon name="check_circle" className="text-[12px] text-emerald-500" />
                     {uploadedFileName || "Current Active Profile"}
                   </p>
                    <div className="text-left w-full mt-2 space-y-4">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
                            Found Competencies
                            <span className="text-[8px] opacity-40">{resumeAnalysis.skills?.length || 0} Matched</span>
                        </p>
                         <div className="flex flex-wrap gap-1.5 opacity-90">{(resumeAnalysis.skills||[]).map((s:string)=><span key={s} className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-1 rounded-lg font-black border border-emerald-100/50">{s}</span>)}</div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toast.error("Document link unavailable in this session. Check Profile page.")}
                          className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 flex items-center justify-center gap-2"
                        >
                          <Icon name="visibility" className="text-sm" /> View doc.
                        </button>
                        <button 
                          onClick={() => setIsUploadModalOpen(true)}
                          className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 flex items-center justify-center gap-2"
                        >
                          <Icon name="upload_file" className="text-sm" /> Update
                        </button>
                      </div>
                      <div>
                        <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
                            System Gaps
                            <span className="text-[8px] opacity-40">High Priority</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5 opacity-90">{(resumeAnalysis.missing||[]).map((s:string)=><span key={s} className="bg-rose-50 text-rose-600 text-[10px] px-2.5 py-1 rounded-lg font-black border border-rose-100/50">{s}</span>)}</div>
                      </div>
                      <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                         <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                             <Icon name="lightbulb" className="text-xs" /> Strategic Enhancements
                         </p>
                         <ul className="space-y-1.5">
                            {(resumeAnalysis.suggestions || []).slice(0, 2).map((s: string, i: number) => (
                               <li key={i} className="text-[10px] text-slate-600 font-medium leading-tight flex items-start gap-1.5">
                                  <div className="size-1 rounded-full bg-amber-400 mt-1" />
                                  {s}
                               </li>
                            ))}
                         </ul>
                      </div>
                      <div className="flex flex-col gap-2 pt-2">
                       <button 
                         onClick={handleSyncSkills}
                         className="w-full mt-4 py-2.5 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                       >
                         <Icon name="sync" className="text-[12px]" /> Sync to Profile
                       </button>
                       <button 
                         onClick={handleClearAnalysis}
                         className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center gap-2"
                       >
                         <Icon name="refresh" className="text-[12px]" /> Re-Analyze Experience
                       </button>
                     </div>
                   </div>
                 </>
              ) : (
                 <>
                   <h4 className="font-extrabold text-[15px] mb-2 tracking-[-0.02em]">Upload your CV</h4>
                   <p className="text-[11px] text-[#717171] leading-tight mb-6 font-medium">Receive curator recommendations</p>
                   <div onClick={() => setIsUploadModalOpen(true)} className="w-full flex-1 bg-slate-50 rounded-[1.8rem] flex flex-col items-center justify-center gap-3 p-6 group-hover:bg-[#F4F7FF] transition-colors cursor-pointer">
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                       <Icon name="folder" className="text-[#575a93] text-3xl" />
                     </div>
                     <p className="text-[10px] font-bold text-[#575a93] uppercase tracking-widest">Drag & Drop file</p>
                   </div>
                 </>
              )}
            </div>
          </div>

          <div className="pb-10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-extrabold text-xl tracking-tight uppercase">SkillSync Paths</h3>
              <button onClick={() => router.push('/dashboard/learning')} className="text-[12px] font-bold text-[#575a93]">View all</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.length > 0 ? courses.map(c => (
                <div 
                  key={c.course_id} 
                  onClick={() => router.push(`/dashboard/learning`)}
                  className="bg-white/60 backdrop-blur-md p-7 rounded-[2.2rem] relative border border-white hover:border-[#575a93]/30 transition-all group cursor-pointer shadow-soft active:scale-[0.98]"
                >
                  <button className="absolute top-6 right-6 text-slate-300 group-hover:text-[#575a93] transition-colors"><Icon name="more_vert" /></button>
                  <div className="w-full h-32 flex items-center justify-center mb-6 relative">
                    <div className="relative w-20 h-20">
                      <div className="absolute top-0 right-0 w-10 h-10 bg-orange-400 rounded-full shadow-lg z-10" />
                      <div className="absolute bottom-4 left-0 w-12 h-12 bg-purple-500 rounded-2xl rotate-12 shadow-xl" />
                      <div className="absolute bottom-0 right-4 w-10 h-10 bg-cyan-400 rounded-full shadow-lg" />
                    </div>
                  </div>
                  <h4 className="font-extrabold text-[17px] mb-2">{c.title}</h4>
                  <p className="text-[11px] text-[#717171] mb-6 font-medium uppercase tracking-tight line-clamp-2">{c.description || 'Expert training protocols'}</p>
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.category || 'Tech'}</span>
                     <Icon name="arrow_forward" className="text-[#575a93] text-sm opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </div>
                </div>
              )) : (
                [1,2,3].map(i => (
                  <div key={i} className="bg-white/30 backdrop-blur-sm p-7 rounded-[2.2rem] border border-white/50 animate-pulse h-64" />
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="w-full xl:w-[340px] flex flex-col gap-8">
          <div className="bg-white p-8 rounded-[2.2rem] shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-8">
              <button className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100"><Icon name="menu" className="text-xl" /></button>
              <div className="bg-slate-50 rounded-xl px-4 py-2 flex items-center gap-2 cursor-pointer border border-slate-100">
                <Icon name="calendar_today" className="text-[14px]" />
                <span className="text-[11px] font-bold uppercase tracking-wider">{new Date().toLocaleString('en-us', { month: 'short' })}</span>
                <Icon name="expand_more" className="text-[14px]" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-y-4 text-center">
              {['S','M','T','W','T','F','S'].map((d, i) => <span key={i} className="text-[10px] font-bold text-slate-400">{d}</span>)} 
              {(function getCalendarDays() {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                const firstDay = startOfMonth.getDay();
                const days = [];
                
                // Days from prev month
                const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
                for (let i = firstDay - 1; i >= 0; i--) {
                  days.push({ val: prevMonthEnd - i, current: false, month: now.getMonth() - 1 });
                }
                // Days from current month
                for (let i = 1; i <= endOfMonth.getDate(); i++) {
                  days.push({ val: i, current: true, month: now.getMonth() });
                }
                // Days from next month
                while (days.length < 42) {
                  days.push({ val: days.length - (firstDay + endOfMonth.getDate()) + 1, current: false, month: now.getMonth() + 1 });
                }
                return days;
              })().map((dateObj, i) => {
                const now = new Date();
                const isToday = dateObj.val === now.getDate() && dateObj.current && dateObj.month === now.getMonth();
                const isSelected = selectedDate?.getDate() === dateObj.val && selectedDate?.getMonth() === dateObj.month;
                
                const dayEvents = events.filter(e => {
                   const d = new Date(e.start_time);
                   return d.getDate() === dateObj.val && d.getMonth() === dateObj.month;
                });
                const hasEvent = dayEvents.length > 0;
                return (
                  <span 
                    key={`date-${i}`} 
                    onClick={() => {
                      if (dateObj.current) {
                        const newDate = new Date(now.getFullYear(), dateObj.month, dateObj.val);
                        setSelectedDate(isSelected ? null : newDate);
                      }
                    }}
                    className={`text-[12px] font-bold relative flex items-center justify-center w-8 h-8 mx-auto transition-all cursor-pointer rounded-full ${
                      isSelected ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg' : 
                      hasEvent ? 'bg-[#575a93] text-white shadow-md' : 
                      isToday ? 'border-2 border-[#575a93] text-[#575a93]' : 
                      'hover:bg-slate-50'
                    } ${!dateObj.current ? 'opacity-20' : ''}`}
                  >
                    {dateObj.val}
                    {hasEvent && !isSelected && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full" />}
                  </span>
                );
              })}
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[2.2rem] shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-[15px] uppercase tracking-tight">Active Schedule</h3>
              <button onClick={() => router.push('/dashboard/calendar')} className="text-[11px] font-bold text-[#9395D3] hover:text-[#575a93] transition-colors">View all</button>
            </div>
            <div className="flex flex-col gap-4">
               {(selectedDate 
                 ? events.filter(e => {
                     const d = new Date(e.start_time);
                     return d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth();
                   })
                 : events
               ).length === 0 ? (
                 <div className="py-10 text-center space-y-3 opacity-40">
                   <Icon name="event_upcoming" className="text-4xl text-slate-300" />
                   <p className="text-[10px] font-black uppercase tracking-widest">{selectedDate ? "No signals for this date" : "No upcoming signals"}</p>
                 </div>
               ) : (selectedDate 
                 ? events.filter(e => {
                     const d = new Date(e.start_time);
                     return d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth();
                   })
                 : events
               ).map(e => (
                 <div key={e.event_id || e.id} className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 group hover:border-[#575a93]/20 transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                        <Icon name="groups" className="text-4xl text-slate-950" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-1.5 text-orange-400 group-hover:text-[#575a93] transition-colors">
                        <Icon name="event" className="text-lg" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[2px] text-[#575a93] bg-[#575a93]/5 px-3 py-1 rounded-full">Recruitment Signal</span>
                    </div>
                    <h4 className="text-[17px] font-black mb-1 leading-tight group-hover:text-[#575a93] transition-colors">{e.title}</h4>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[#575a93] shadow-sm">
                            <Icon name="person" className="text-sm" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase">{(e as any).recruiter_name || "Institutional Advisor"}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">{(e as any).recruiter_role || "Corporate Recruiter"}</p>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight font-black uppercase tracking-wider flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl border border-slate-100/50 w-fit">
                      <Icon name="schedule" className="text-[14px] text-[#575a93]" />
                      {new Date(e.start_time).toLocaleString('en-us', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
               ))}
            </div>
          </div>
          
          <div className="bg-slate-950 p-8 rounded-[2.2rem] shadow-soft flex items-center justify-between border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-1 tracking-tighter text-white">1350+</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[2px]">SkillSync Community</p>
            </div>
            <button className="relative z-10 px-6 py-2.5 bg-white text-slate-950 rounded-xl text-[10px] font-black hover:scale-105 transition-all active:scale-95 uppercase tracking-widest shadow-xl">Join</button>
          </div>
        </aside>
      </div>

      {aiRoadmap && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in max-h-screen overflow-y-auto">
          <div className="bg-white rounded-[2rem] p-8 max-w-xl w-full shadow-2xl relative">
             <button onClick={() => setAiRoadmap(null)} className="absolute top-6 right-6 text-slate-400 hover:text-black"><Icon name="close" /></button>
             <h2 className="text-2xl font-black uppercase mb-2">AI Skill Gap Roadmap</h2>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-6">Personalized path to target role</p>
             
             <div className="bg-slate-50 p-6 rounded-2xl mb-6 border border-slate-100">
               <h3 className="font-bold mb-2">Target Summary</h3>
               <p className="text-sm font-medium text-slate-700">{aiRoadmap.summary}</p>
             </div>

             <div className="space-y-4">
               <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">Recommended Path</h3>
               {(aiRoadmap.roadmap||[]).map((step: string, i: number) => (
                 <div key={i} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">{i+1}</div>
                    <p className="text-sm font-medium pt-1 text-slate-700">{step}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* UPLOAD RESUME MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative text-center">
             <button onClick={() => { setIsUploadModalOpen(false); setSelectedFile(null); }} className="absolute top-6 right-6 text-slate-400 hover:text-black"><Icon name="close" /></button>
             <div className="w-16 h-16 bg-[#575a93]/10 text-[#575a93] rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="upload_file" className="text-3xl" />
             </div>
             <h2 className="text-2xl font-black mb-2 tracking-tight">Upload Resume</h2>
             <p className="text-sm font-medium text-slate-500 mb-8">Deploy your resume for deep AI analysis and contextual job mapping.</p>
             
             <div 
               onClick={() => fileInputRef.current?.click()}
               onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#575a93]', 'bg-[#575a93]/5'); }}
               onDragLeave={(e) => { e.currentTarget.classList.remove('border-[#575a93]', 'bg-[#575a93]/5'); }}
               onDrop={(e) => {
                 e.preventDefault();
                 e.currentTarget.classList.remove('border-[#575a93]', 'bg-[#575a93]/5');
                 const file = e.dataTransfer.files?.[0];
                 if (file && file.type === 'application/pdf') {
                   setSelectedFile(file);
                   toast.success(`Ready: ${file.name}`);
                 } else if (file) {
                   toast.error('Please drop a PDF file only.');
                 }
               }}
               className="border-2 border-dashed border-slate-200 rounded-2xl p-8 mb-6 hover:border-[#575a93] hover:bg-slate-50 transition-all cursor-pointer select-none"
             >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      toast.success(`Selected: ${file.name}`);
                    }
                  }}
                />
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="picture_as_pdf" className="text-3xl text-[#575a93] mb-1" />
                    <p className="text-sm font-black text-[#575a93] tracking-tight truncate max-w-full px-4">{selectedFile.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {(selectedFile.size / 1024).toFixed(0)} KB — Ready to Analyze
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="cloud_upload" className="text-3xl text-slate-300 mb-1" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Drag & Drop or Click</p>
                    <p className="text-[10px] font-medium text-slate-300">PDF files only</p>
                  </div>
                )}
             </div>

             <button 
               onClick={() => handleUploadResume()} 
               disabled={!selectedFile}
               className="w-full bg-[#575a93] text-white font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-[#434575] transition-colors shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
             >
               {selectedFile ? 'Analyze Resume ⚡' : 'Select a PDF First'}
             </button>
          </div>
        </div>
      )}


      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#575a93] flex items-center justify-center text-white shadow-lg shadow-[#575a93]/20">
            <Sparkles className="size-5" />
          </div>
          <span className="font-black text-xs uppercase tracking-[3px] text-slate-900">SkillSync</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
             <button onClick={() => router.push('/dashboard/notifications')} className="text-slate-400"><Icon name="notifications" className="text-2xl" /></button>
             {notifications.filter(n => !n.is_read).length > 0 && (
               <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#575a93] text-white text-[8px] flex items-center justify-center rounded-full font-black border border-white">
                 {notifications.filter(n => !n.is_read).length}
               </span>
             )}
          </div>
          <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-100 shadow-sm" onClick={() => router.push('/dashboard/profile')}>
            <img src="/assets/user_avatar.png" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${userName}&background=575a93&color=fff`} />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          MOBILE VIEW (1:1 PORT FROM STICH MOBILE)
          ------------------------------------------------------------------ */}
      <main className="lg:hidden pt-24 pb-32 px-6 space-y-4 animate-in fade-in duration-500 bg-slate-50/30">
        
        <section className="space-y-1 py-2">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">Welcome back,<br />{userName}! 👋</h2>
          <div className="flex items-center gap-3">
            <div className="h-2 w-full max-w-[140px] bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: `${completionPct}%` }} className="h-full bg-[#575a93] rounded-full shadow-lg" />
            </div>
            <span className="text-[10px] font-black text-[#575a93] uppercase tracking-widest">{completionPct}% Score</span>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-5 rounded-3xl shadow-soft flex flex-col justify-between aspect-square active:scale-95 transition-transform border border-slate-50">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#5a6062]">Applications</p>
              <h3 className="text-4xl font-extrabold text-[#2d3335] mt-2 tracking-[-0.04em]">{stats.applications}</h3>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-center text-emerald-600 font-bold text-xs">
                <Icon name="trending_up" className="text-sm" /> +{stats.accepted}
              </div>
              <div className="w-16 h-8">
                <svg className="w-full h-full stroke-emerald-500 fill-none stroke-2 outline-none" viewBox="0 0 100 40">
                  <path d="M0,35 Q25,30 40,20 T70,25 T100,5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-soft flex flex-col aspect-square active:scale-95 transition-transform border border-slate-50">
            <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#5a6062] mb-4">Skill tracker</p>
            <div className="space-y-4">
              {stats.skills > 0 ? (
                // Use actual skills from API
                skills.slice(0, 3).map((s, i) => {
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="uppercase tracking-[0.05em] opacity-60 truncate block w-[80px]">{s.label}</span>
                        <span className="text-[#575a93]">{s.val}%</span>
                      </div>
                      <div className="h-1 bg-slate-50 rounded-full">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.val}%` }} className={`h-full ${s.color} rounded-full`} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-4">No skills indexed</p>
              )}
            </div>
          </div>
        </div>

        {/* Job Feed Card */}
        <div className="cursor-pointer bg-slate-950 text-white p-6 rounded-3xl relative overflow-hidden active:scale-[0.98] transition-transform shadow-premium">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#575a93]/20 blur-3xl -mr-10 -mt-10" />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="bg-white p-2 rounded-xl"><Icon name="token" className="text-black" /></div>
            <div className="bg-[#575a93]/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10">Recent Match</div>
          </div>

          {aiJobs ? (
              <div className="space-y-3 relative z-10">
                 <h4 className="text-lg font-bold text-emerald-400 uppercase tracking-widest mb-1">Top Internships</h4>
                 {aiJobs.slice(0,2).map((j, i) => (
                    <div key={i} className="bg-white/10 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                       <div><p className="text-sm font-bold">{j.role}</p><p className="text-[10px] opacity-60">{j.company}</p></div>
                       <div className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded text-xs">{j.match_percentage}%</div>
                    </div>
                 ))}
                 <div className="pt-2 flex gap-2">
                   <button onClick={handleSkillGap} className="w-full bg-amber-400 text-black font-bold text-[10px] py-2 rounded-lg tracking-widest uppercase">Skill Gap Roadmap</button>
                 </div>
              </div>
          ) : (
             <>
               <div className="space-y-1 mb-6 relative z-10">
                 <h4 className="text-lg font-bold leading-tight tracking-tight">{recentApplications[0]?.role_title || "Pending Assessment"}</h4>
                 <p className="text-xs text-white/50 tracking-wide font-medium">{recentApplications[0]?.company_name || "Syncing Context..."}</p>
               </div>
               <div className="flex items-center justify-between mb-8 relative z-10 font-bold text-xl tracking-tight">
                 {resumeAnalysis ? resumeAnalysis.score : (recentApplications[0]?.ai_match_score || 0)}% <span className="text-xs font-normal opacity-50 uppercase tracking-widest ml-2">AI SCORE</span>
               </div>
               <div className="pt-4 border-t border-white/10 flex justify-center">
                 {resumeAnalysis ? (
                    <button onClick={handleMatchJobs} className="text-amber-400 text-[9px] uppercase font-black tracking-[0.1em] hover:text-amber-300">🔍 Find Matches</button>
                 ) : (
                    <span className="opacity-40 text-[9px] uppercase font-black tracking-[0.1em]">Upload CV above to match</span>
                 )}
               </div>
             </>
          )}
        </div>

        {/* Mock Interview */}
        <div className="bg-[#cde5ff] text-[#004369] p-6 rounded-3xl relative flex flex-col gap-4 overflow-hidden active:scale-95 transition-transform shadow-soft">
          <div className="space-y-1">
            <h4 className="text-lg font-extrabold tracking-tight">Try out our Mock Interview tool</h4>
            <p className="text-sm opacity-80 font-medium">Practice with AI or live mentors</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-3">
              {events.length > 0 ? (
                events.slice(0, 3).map((e, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#cde5ff] bg-[#31638a] flex items-center justify-center text-[10px] font-black text-white uppercase shadow-lg">
                    {e.title.charAt(0)}
                  </div>
                ))
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-[#cde5ff] bg-white/20 flex items-center justify-center text-[10px] font-black text-[#31638a] uppercase">SS</div>
              )}
            </div>
            <button onClick={() => toast("AI Match Interview Scheduled!", { icon: "📅" })} className="bg-[#31638a] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-[#31638a]/20 uppercase tracking-widest cursor-pointer">Schedule</button>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-10"><Icon name="forum" className="text-8xl" style={{ fontVariationSettings: "'FILL' 1" }} /></div>
        </div>

        {/* Upload CV */}
        <div className="bg-white rounded-3xl p-6 shadow-soft active:scale-[0.99] transition-transform border border-slate-50">
           {resumeAnalysis ? (
                 <div className="space-y-3">
                   <div className="flex justify-between items-center mb-2">
                       <h4 className="font-extrabold text-[15px] tracking-tight text-emerald-600">CV Analyzed</h4>
                   <span className="bg-emerald-100 text-emerald-700 font-black text-[10px] px-2 py-1 rounded">Score: {resumeAnalysis.score}</span>
                 </div>
                 <div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Found Skills</p>
                   <div className="flex flex-wrap gap-1">{(resumeAnalysis.skills||[]).map((s:string)=><span key={s} className="bg-slate-100 text-xs px-2 py-1 rounded font-medium">{s}</span>)}</div>
                 </div>
                 <div>
                   <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1">Missing Keywords</p>
                   <div className="flex flex-wrap gap-1">{(resumeAnalysis.missing||[]).map((s:string)=><span key={s} className="bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded font-medium">{s}</span>)}</div>
                 </div>
                 <div className="flex flex-col gap-2 mt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={handleSyncSkills}
                        className="py-2.5 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <Icon name="sync" className="text-[12px]" /> Sync
                      </button>
                      <button 
                        onClick={handleMatchJobs}
                        className="py-2.5 rounded-xl border border-amber-100 bg-amber-50 text-amber-700 text-[9px] font-black uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <Icon name="bolt" className="text-[12px]" /> Match
                      </button>
                    </div>
                    <button 
                      onClick={handleClearAnalysis}
                      className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Icon name="refresh" className="text-[12px]" /> Re-Analyze Experience
                    </button>
                  </div>
               </div>
           ) : (
               <div onClick={() => setIsUploadModalOpen(true)} className="flex flex-col items-center justify-center text-center gap-3 cursor-pointer">
                 <div className="w-12 h-12 bg-[#575a93]/10 rounded-full flex items-center justify-center text-[#575a93]"><Icon name="upload_file" className="text-3xl" /></div>
                 <div className="space-y-1">
                   <h5 className="text-[15px] font-bold tracking-tight">Upload your CV</h5>
                   <p className="text-[11px] text-[#5a6062] px-6 font-medium">Receive curator recommendations</p>
                 </div>
               </div>
           )}
        </div>

        {/* AI Recommendations */}
        <section className="space-y-4 pb-10">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-extrabold tracking-[-0.02em]">Career Growth Map</h3>
            <span onClick={() => router.push('/dashboard/learning')} className="text-xs font-bold text-[#575a93] uppercase tracking-widest cursor-pointer">View All</span>
          </div>
          <div className="space-y-3">
            {resumeAnalysis?.missingKeywords && resumeAnalysis.missingKeywords.length > 0 ? (
              resumeAnalysis.missingKeywords.slice(0, 3).map((skill: string, i: number) => (
                <div key={i} className="bg-white p-5 rounded-[1.8rem] flex items-center gap-4 shadow-soft active:scale-95 transition-transform border border-slate-50">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Icon name="bolt" className="text-2xl" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-black uppercase tracking-tight">{skill}</h4>
                      <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-widest">Recommended</span>
                    </div>
                    <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-600" style={{ width: i === 0 ? '40%' : i === 1 ? '25%' : '15%' }} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Index your CV to activate maps</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}


