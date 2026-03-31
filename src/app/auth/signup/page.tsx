'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Briefcase, Zap, Info, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import AuthRoleCard from '@/components/auth/AuthRoleCard';
import GsapMagnetic from '@/components/ui/GsapMagnetic';
import { NeuralParticleField } from '@/components/ui/NeuralParticleField';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: 'student',
      title: 'Candidate Profile',
      description: 'Initialize your professional identity, track opportunities, and sync skills.',
      icon: GraduationCap,
      href: '/dashboard',
      tag: 'New Candidate'
    },
    {
      id: 'admin',
      title: 'Admin Authority',
      description: 'Manage college-wide placement systems and authority dashboards.',
      icon: ShieldCheck,
      href: '/admin',
      tag: 'New Authority'
    },
    {
      id: 'company',
      title: 'Corporate Hub',
      description: 'Join the hiring network, source talent, and manage recruitment cycles.',
      icon: Briefcase,
      href: '/company',
      tag: 'New Partner'
    }
  ];

  const handleAuth = async (roleId: string) => {
    setLoading(true);
    // Persist role intent
    document.cookie = `auth_role_intent=${roleId}; path=/; max-age=3600; SameSite=Lax`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/complete-profile`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <NeuralParticleField />
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.05),transparent_50%)] -z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl relative z-10"
      >
        <div className="text-center mb-16">
          <GsapMagnetic>
            <Link href="/">
              <div className="inline-flex size-14 rounded-2xl bg-amber-600 text-white items-center justify-center shadow-lg shadow-amber-600/20 mb-10 cursor-pointer">
                <Zap size={28} />
              </div>
            </Link>
          </GsapMagnetic>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase">
            Initialize <span className="text-amber-600">Sync</span> Profile
          </h1>
          <p className="text-slate-500 font-black uppercase tracking-[5px] text-[10px]">
             Create Neural Intelligence Identity • Select Activation Path
          </p>
        </div>

        {/* Step 1: Role Selection Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {roles.map((role) => (
            <AuthRoleCard
              key={role.id}
              role={role}
              isSelected={selectedRole === role.id}
              onSelect={() => setSelectedRole(role.id)}
              onAuth={() => handleAuth(role.id)}
              loading={loading && selectedRole === role.id}
              type="signup"
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-10">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 shadow-sm backdrop-blur-sm animate-pulse">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-300">
              One Identity • Multiple Workspaces • Zero Config
            </span>
          </div>

          <div className="space-y-4 text-center">
            <Link href="/auth/login">
              <span className="text-[11px] font-black uppercase tracking-[3px] text-slate-500 hover:text-white transition-colors cursor-pointer group">
                Already have a profile? <span className="text-white group-hover:underline">Access Intelligence Terminal &rarr;</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 text-center">
          <p className="text-slate-700 text-[9px] font-black uppercase tracking-[4px]">
             Secure Encryption • Global Synchronicity Protocol • v4.2
          </p>
        </div>
      </motion.div>
    </div>
  );
}
