'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  MessageSquare, Sparkles, Cpu, Play, CheckCircle2, 
  ArrowRight, ShieldCheck, Zap, BarChart3, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AI_ENGINE } from '@/lib/ai-engine';
import { toast } from 'react-hot-toast';
import { NeuralCore3D } from '@/components/ui/NeuralCore3D';
import { supabase } from '@/lib/supabase';

export default function AIInterviewSimulator() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ score: number; notes: string } | null>(null);

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        router.push('/auth/login');
        return;
      }

      // Simulate fetching role requirements
      const mockRoleSkills = ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'];
      const mockUserSkills = ['React', 'JavaScript'];
      
      const generated = AI_ENGINE.generateSkillAssessment(mockUserSkills, mockRoleSkills);
      setQuestions(generated);
      setLoading(false);
    }
    loadSession();
  }, [applicationId, router]);

  const handleNext = () => {
    if (!currentAnswer.trim()) {
      toast.error('Please provide a response to proceed.', { icon: '✍️' });
      return;
    }
    
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      finishSimulation(newAnswers);
    }
  };

  const finishSimulation = (finalAnswers: string[]) => {
    setIsFinished(true);
    // AI Feedback Logic (Mock)
    const score = Math.floor(Math.random() * (95 - 75 + 1)) + 75; // 75-95
    const feedbackData = {
      score,
      notes: "Exceptional articulation of technical concepts. The SkillSync AI Engine detects high industrial maturity. Focus slightly more on architectural scalability in future responses.",
      timestamp: Date.now()
    };
    setFeedback(feedbackData);
    
    // Save to demo DB (Persist full object for Recruiter View)
    localStorage.setItem(`interview_results_${applicationId}`, JSON.stringify(feedbackData));
    toast.success('Performance Assessment Synchronized', { icon: '📊' });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-8">
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-amber-600"
      >
        <Cpu size={64} />
      </motion.div>
      <div className="text-center space-y-2">
        <h2 className="text-[10px] font-black uppercase tracking-[8px] text-slate-400">SkillSync Intelligence</h2>
        <p className="text-xl font-black text-slate-900 uppercase italic">Calibrating Interview Environment</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="p-8 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-lg">
             <Cpu size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">AI Interview Simulator</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[3px]">Powered by SkillSync AI Heuristics</p>
          </div>
        </div>
        <button 
          onClick={() => router.back()}
          className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
        >
          Terminate Session
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 pt-16 relative">
        {/* --- 3D INTERFACE WRAPPER --- */}
        <motion.div
           initial={{ perspective: 1500, rotateX: 5 }}
           animate={{ rotateX: 0 }}
           className="relative z-10"
        >
          {/* AI PERSONA (3D CORE) */}
          <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 opacity-60">
             <NeuralCore3D status={isFinished ? 'active' : (isStarted ? 'processing' : 'idle')} size={240} />
          </div>

          <AnimatePresence mode="wait">
          {!isStarted && !isFinished && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles size={16} className="text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[4px] text-amber-500">Immersive Practice Environment</span>
                </div>
                <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9] mb-8">
                  Validate Your Technical <span className="text-amber-600">Readiness.</span>
                </h2>
                <div className="text-slate-500 font-medium text-lg leading-relaxed space-y-6">
                  <p>You are about to undergo a <span className="text-slate-950 font-black italic">Targeted Technical Interrogation</span> based on the requirements of your active internship applications.</p>
                  <p>The SkillSync AI Engine will analyze your responses for technical accuracy, conceptual clarity, and industry alignment.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { icon: ShieldCheck, label: 'Standardized Audit', desc: 'Validated screening queries.' },
                   { icon: Zap, label: 'Real-time Analytics', desc: 'Predictive performance scoring.' },
                   { icon: MessageSquare, label: 'Concept Mapping', desc: 'Neural response evaluation.' }
                 ].map(i => (
                   <div key={i.label} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
                      <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-950">
                         <i.icon size={20} />
                      </div>
                      <div className="space-y-1">
                         <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{i.label}</div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px]">{i.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setIsStarted(true)}
                className="w-full md:w-auto px-12 py-5 rounded-[2rem] bg-indigo-600 text-white font-black uppercase text-sm tracking-[5px] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 group"
              >
                Initiate Interrogation <Play size={18} className="fill-white" />
              </motion.button>
            </motion.div>
          )}

          {isStarted && !isFinished && (
            <motion.div 
              key="process"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="size-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200">
                      <MessageSquare size={14} />
                   </div>
                   <span className="text-[11px] font-black text-slate-400 uppercase tracking-[4px]">Query 0{currentIdx + 1} of 0{questions.length}</span>
                </div>
                <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                    className="h-full bg-amber-600"
                   />
                </div>
              </div>

              <div className="p-12 rounded-[3rem] bg-slate-950 text-white border border-white/5 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-12 opacity-5">
                    <Sparkles size={120} className="text-amber-500" />
                 </div>
                 <h3 className="text-3xl font-black uppercase tracking-tight leading-none mb-4">The Assessment Engine Asks:</h3>
                 <p className="text-xl font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                   &quot;{questions[currentIdx]}&quot;
                 </p>
              </div>

              <div className="space-y-6">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Formulate your technical response here..."
                  className="w-full h-48 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 focus:border-amber-600/50 focus:bg-white transition-all text-slate-700 font-bold uppercase tracking-tight resize-none outline-none text-lg"
                />
                
                <div className="flex justify-between items-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[3px]">Character Count: {currentAnswer.length} / 500 Suggested</p>
                   <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="px-10 py-4 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-[4px] flex items-center gap-3 shadow-lg"
                  >
                    {currentIdx === questions.length - 1 ? 'Finalize Logic' : 'Next Integration'} <ArrowRight size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {isFinished && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-12 text-center"
            >
              <div className="size-24 rounded-[2rem] bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
                 <CheckCircle2 size={40} />
              </div>
              
              <div className="space-y-4">
                 <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Interrogation Complete.</h2>
                 <p className="text-slate-500 font-medium text-lg">Your response matrix has been analyzed and synchronized with the recruiter dashboard.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                 <div className="p-10 rounded-[3rem] bg-slate-950 text-white border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                       <BarChart3 size={80} className="text-amber-500" />
                    </div>
                    <div className="relative z-10 space-y-2">
                       <div className="text-[10px] font-black text-amber-500 uppercase tracking-[4px]">Performance Score</div>
                       <div className="text-6xl font-black text-white tracking-tighter">{feedback?.score}%</div>
                       <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Industrial Readiness Index</div>
                    </div>
                 </div>

                 <div className="p-10 rounded-[3rem] bg-indigo-50 border border-indigo-100 text-left space-y-6">
                    <div className="flex items-center gap-2">
                       <Zap size={14} className="text-indigo-600" />
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[4px]">AI Growth Vector</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 uppercase tracking-tight leading-relaxed italic">
                       &quot;{feedback?.notes}&quot;
                    </p>
                 </div>
              </div>

              <button 
                onClick={() => router.push('/dashboard/internships')}
                className="px-12 py-5 rounded-[2rem] bg-slate-900 text-white font-black uppercase text-[11px] tracking-[5px] hover:bg-slate-800 transition-all shadow-xl"
              >
                Return to Dashboard Hub
              </button>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>

        {/* --- BACKGROUND HUD OVERLAY --- */}
        <div className="fixed inset-0 pointer-events-none opacity-20 pointer-events-none overflow-hidden">
           <div className="absolute top-1/4 left-10 text-[9px] font-mono font-black text-amber-500/40 uppercase tracking-[4px] space-y-2 border-l border-amber-500/20 pl-4">
              <div>VOWEL_FOCUS: 82%</div>
              <div>SEMANTIC_LOCK: ACTIVE</div>
              <div>THOUGHT_LATENCY: 4.2MS</div>
           </div>
           <div className="absolute bottom-1/4 right-10 text-[9px] font-mono font-black text-indigo-500/40 uppercase tracking-[4px] text-right space-y-2 border-r border-indigo-500/20 pr-4">
              <div>CORE: HIFI_SYNC</div>
              <div>VECTOR: OPTIMIZING</div>
           </div>
           <div className="absolute inset-x-0 bottom-0 h-[30vh] bg-gradient-to-t from-amber-500/[0.04] to-transparent" />
        </div>
      </main>
    </div>
  );
}
