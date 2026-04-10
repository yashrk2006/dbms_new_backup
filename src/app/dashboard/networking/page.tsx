'use client';

import { motion } from 'framer-motion';
import { Users, Search, Globe, ChevronRight } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { toast } from 'react-hot-toast';

export default function NetworkingPage() {
  return (
    <div className="space-y-12 p-6 lg:p-10 max-w-7xl mx-auto pb-24">
      <AnimatedSection direction="up" distance={40}>
        <div className="flex items-center gap-4 mb-4">
           <div className="size-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shadow-sm border border-cyan-100">
              <Globe size={18} />
           </div>
           <h2 className="text-[10px] font-black uppercase tracking-[8px] text-slate-400">Global Pulse</h2>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-950 tracking-tight uppercase leading-[0.9]">
          Cyber<br /><span className="text-cyan-600">Net.</span>
        </h1>
        <p className="max-w-xl text-slate-500 font-medium text-lg leading-relaxed mt-6 uppercase tracking-tight">Expand your operational reach and connect with high-value peers.</p>
      </AnimatedSection>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-soft">
         <div className="flex flex-col items-center justify-center p-20 text-center">
             <div className="relative mb-8">
                 <div className="absolute inset-0 bg-cyan-100/50 rounded-full blur-3xl animate-pulse" />
                 <Globe size={64} className="text-cyan-500 relative z-10" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Comm-Link Establishing</h3>
             <p className="text-sm text-slate-400 font-medium mt-4 max-w-sm uppercase tracking-widest leading-relaxed">SkillSync is currently calibrating your synchronization nodes. Check back soon for active peers.</p>
             <button onClick={() => toast("Networking module live soon!", { icon: "🔗" })} className="mt-8 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[4px] shadow-sm flex items-center gap-3">
                 <Search size={16} /> Find Peers
             </button>
         </div>
      </div>
    </div>
  );
}
