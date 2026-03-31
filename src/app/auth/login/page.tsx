'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Briefcase, Zap, Info, ArrowRight, Mail, KeyRound, Fingerprint, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import AuthRoleCard from '@/components/auth/AuthRoleCard';
import GsapMagnetic from '@/components/ui/GsapMagnetic';
import { NeuralParticleField } from '@/components/ui/NeuralParticleField';

type AuthStep = 'role' | 'identity' | 'verify' | 'otp' | 'success';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('role');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  // Identity State
  const [rollNo, setRollNo] = useState('');
  const [studentData, setStudentData] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

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

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    if (roleId === 'student') {
      setStep('identity');
    } else {
      // Default to Google for Admin/Company for now, or expand as needed
      handleGoogleAuth(roleId);
    }
  };

  const handleGoogleAuth = async (roleId: string) => {
    setLoading(true);
    document.cookie = `auth_role_intent=${roleId}; path=/; max-age=3600; SameSite=Lax`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/complete-profile`,
      }
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleIdentityLookup = async () => {
    if (!rollNo) return toast.error('Enter your Roll Number');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/directory/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: rollNo })
      });

      const data = await res.json();
      if (data.success) {
        setStudentData(data.student);
        setStep('verify');
      } else {
        toast.error(data.error || 'Student not found in institutional batch');
      }
    } catch (e) {
      toast.error('Identity server unreachable');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
      if (!email) return toast.error('Email required for verification');
      setLoading(true);

      try {
          const res = await fetch('/api/auth/otp/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ roll_no: rollNo, email })
          });

          const data = await res.json();
          if (data.success) {
              setStep('otp');
              toast.success('Verification code dispatched to your email');
          } else {
              toast.error(data.error);
          }
      } catch (e) {
          toast.error('Failed to dispatch OTP');
      } finally {
          setLoading(false);
      }
  };

  const handleVerifyOTP = async () => {
      if (otp.length < 6) return toast.error('Enter valid 6-digit code');
      setLoading(true);

      try {
          const res = await fetch('/api/auth/otp/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ roll_no: rollNo, email, otp })
          });

          const data = await res.json();
          if (data.success) {
              // Permanent Handshake: Sign in with the forced institutional credential
              const { error: signInError } = await supabase.auth.signInWithPassword({
                  email: data.email,
                  password: data.sync_password
              });

              if (signInError) throw signInError;

              toast.success('Institutional Identity Synchronized');
              setStep('success');
              
              // Force hard redirect to clear middleware cache
              setTimeout(() => {
                  window.location.href = '/dashboard';
              }, 1500);
          } else {
              toast.error(data.error);
          }
      } catch (e) {
          toast.error('Verification failed');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <NeuralParticleField />
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(234,88,12,0.03),transparent_50%)] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="text-center mb-16">
          <GsapMagnetic>
            <Link href="/">
              <div className="inline-flex size-14 rounded-2xl bg-slate-900 text-white items-center justify-center shadow-lg shadow-slate-950/20 mb-10 cursor-pointer">
                <Zap size={28} />
              </div>
            </Link>
          </GsapMagnetic>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
            {step === 'role' ? 'Sync Terminal' : 'Institutional Access'}
          </h1>
          <p className="text-slate-400 font-black uppercase tracking-[5px] text-[10px]">
             {step === 'role' ? 'Secure Neural Authentication • Select Identity Path' : 'Verified Onboarding Protocol Active'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'role' && (
            <motion.div 
              key="role"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid md:grid-cols-3 gap-8 mb-16"
            >
              {roles.map((role) => (
                <AuthRoleCard
                  key={role.id}
                  role={role}
                  isSelected={selectedRole === role.id}
                  onSelect={() => handleRoleSelect(role.id)}
                  onAuth={() => handleRoleSelect(role.id)}
                  loading={loading && selectedRole === role.id}
                  type="login"
                />
              ))}
            </motion.div>
          )}

          {step === 'identity' && (
            <motion.div 
              key="identity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto bg-white rounded-3xl p-10 shadow-xl shadow-slate-200 border border-slate-100"
            >
               <div className="mb-8 flex justify-center">
                  <div className="size-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Fingerprint size={32} />
                  </div>
               </div>
               <h2 className="text-2xl font-black text-slate-900 text-center mb-2">Identify Yourself</h2>
               <p className="text-slate-500 text-center text-sm mb-10 uppercase tracking-widest font-bold">Step 01: Batch Entry</p>
               
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Institutional Roll Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 24/70001"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                  
                  <button 
                    disabled={loading}
                    onClick={handleIdentityLookup}
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-600 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Verify Credentials <ArrowRight size={18} /></>}
                  </button>
                  
                  <button onClick={() => setStep('role')} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">
                    Go Back
                  </button>
               </div>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div 
              key="verify"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto bg-white rounded-3xl p-10 shadow-xl shadow-slate-200 border border-slate-100"
            >
               <div className="text-center mb-10">
                  <div className="size-20 rounded-full bg-green-50 text-green-600 mx-auto mb-6 flex items-center justify-center ring-8 ring-green-50/50">
                      <GraduationCap size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Hello, {studentData?.name}!</h2>
                  <p className="text-slate-500 text-sm italic">Verified {studentData?.course} student (Batch of {studentData?.batch_year})</p>
               </div>

               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Link your Personal Email</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>
                  
                  <button 
                    disabled={loading}
                    onClick={handleSendOTP}
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-600 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Request Secure OTP <KeyRound size={18} /></>}
                  </button>
               </div>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div 
              key="otp"
              className="max-w-md mx-auto bg-white rounded-3xl p-10 shadow-xl shadow-slate-200 border border-slate-100"
            >
               <h2 className="text-2xl font-black text-slate-900 text-center mb-2">Verification Sent</h2>
               <p className="text-slate-500 text-center text-xs mb-10">Check <span className="font-bold">{email}</span> for your 6-digit sync code.</p>
               
               <div className="space-y-8">
                  <div className="flex justify-center">
                    <input 
                      type="text" 
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="000 000"
                      className="w-full h-20 text-center text-4xl font-black tracking-[12px] bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                  
                  <button 
                    disabled={loading || otp.length < 6}
                    onClick={handleVerifyOTP}
                    className="w-full h-14 bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-900 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Synchronize Identity'}
                  </button>
               </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
               <div className="size-24 rounded-full bg-green-500 text-white mx-auto mb-8 flex items-center justify-center shadow-lg shadow-green-200">
                  <Zap size={40} />
               </div>
               <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase">Sync Success</h2>
               <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Redirecting to Your Neural Dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-20 pt-10 border-t border-slate-100 text-center">
          <p className="text-slate-300 text-[9px] font-black uppercase tracking-[4px]">
             SkillSync Federated Auth Protocol • Institutional Grade
          </p>
        </div>
      </motion.div>
    </div>
  );
}
