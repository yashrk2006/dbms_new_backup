'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Briefcase, Zap, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import AuthRoleCard from '@/components/auth/AuthRoleCard';
import GsapMagnetic from '@/components/ui/GsapMagnetic';
import { NeuralParticleField } from '@/components/ui/NeuralParticleField';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: 'student',
      title: 'Student Portal',
      description: 'Access internships, track applications, and manage your skills profile.',
      icon: GraduationCap,
      href: '/dashboard',
      tag: 'Candidate'
    },
    {
      id: 'admin',
      title: 'College Admin',
      description: 'Monitor placement metrics, approve companies, and analyze performance.',
      icon: ShieldCheck,
      href: '/admin',
      tag: 'Authority'
    },
    {
      id: 'company',
      title: 'Company Hub',
      description: 'Find top talent, post requirements, and review matched profiles.',
      icon: Briefcase,
      href: '/company',
      tag: 'Partner'
    }
  ];

  const handleAuth = async (roleId: string) => {
    setLoading(true);
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <NeuralParticleField />
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.03),transparent_50%)] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl relative z-10"
      >
        <div className="text-center mb-16">
          <GsapMagnetic>
            <Link href="/">
              <div className="inline-flex size-14 rounded-2xl bg-slate-900 text-white items-center justify-center shadow-lg shadow-slate-950/20 mb-10 cursor-pointer">
                <Zap size={28} />
              </div>
            </Link>
          </GsapMagnetic>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
            Access <span className="text-amber-600">Sync</span> Terminal
          </h1>
          <p className="text-slate-400 font-black uppercase tracking-[5px] text-[10px]">
             Secure Neural Authentication • Select Identity Path
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
              type="login"
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-10">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-50 border border-slate-100 shadow-sm animate-pulse">
            <Info size={14} className="text-amber-600" />
            <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-500">
              Identity persistence active for this device
            </span>
          </div>

          <div className="space-y-4 text-center">
            <Link href="/auth/signup">
              <span className="text-[11px] font-black uppercase tracking-[3px] text-slate-400 hover:text-amber-600 transition-colors cursor-pointer group">
                New to the platform? <span className="text-amber-600 group-hover:underline">Create a Synchronized Profile &rarr;</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-slate-50 text-center">
          <p className="text-slate-300 text-[9px] font-black uppercase tracking-[4px]">
             SkillSync Enterprise v4.2 • End-to-End Encryption
          </p>
        </div>
      </motion.div>
    </div>
  );
}
