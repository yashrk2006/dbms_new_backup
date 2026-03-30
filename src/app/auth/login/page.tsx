'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Briefcase, Zap, ArrowRight, Lock } from 'lucide-react';

export default function RoleSelector() {
  const router = useRouter();

  const roles = [
    {
      id: 'student',
      title: 'Student Portal',
      description: 'Access internships, track applications, and manage your skills profile.',
      icon: GraduationCap,
      href: '/dashboard',
      tag: 'Candidate',
      status: 'active',
      localStorageKey: 'demo_student_id',
      demoId: '00000000-0000-0000-0000-000000000000'
    },
    {
      id: 'admin',
      title: 'College Admin',
      description: 'Monitor student placement metrics, approve applications, and view analytics.',
      icon: ShieldCheck,
      href: '/admin',
      tag: 'Administrator',
      status: 'active',
      localStorageKey: 'demo_admin_id',
      demoId: '33333333-3333-3333-3333-333333333333'
    },
    {
      id: 'company',
      title: 'Company / HR',
      description: 'Post internship requirements and review matched student profiles.',
      icon: Briefcase,
      href: '/auth/company',
      tag: 'Partner',
      status: 'active',
      localStorageKey: 'demo_company_id',
      demoId: '11111111-1111-1111-1111-111111111111'
    }
  ];

  const handleRoleSelect = (role: any) => {
    if (role.status !== 'active') return;

    // Clear previous sessions for clean demo state
    localStorage.removeItem('demo_student_id');
    localStorage.removeItem('demo_company_id');
    localStorage.removeItem('demo_admin_id');
    localStorage.removeItem('clerk_user_id');

    // Set new demo ID
    localStorage.setItem(role.localStorageKey, role.demoId);
    
    // Force sync for Navbar and other components
    window.dispatchEvent(new Event('storage'));
    
    // Navigate
    router.push(role.href);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-100 to-transparent -z-10" />
      <div className="absolute -top-40 -right-40 size-[500px] bg-amber-600/5 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-40 -left-40 size-[500px] bg-amber-600/5 rounded-full blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl"
      >
        <div className="text-center mb-16">
          <Link href="/">
            <motion.div
              className="inline-flex items-center justify-center size-16 rounded-2xl bg-white border border-slate-200 shadow-sm text-amber-600 mb-6 group hover:bg-amber-600 hover:text-white transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap size={32} />
            </motion.div>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">
            Select Your Workspace
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto font-medium">
            Welcome to the SkillSync platform. Please select your operational role to access the corresponding dashboard.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role, idx) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleRoleSelect(role)}
              className="cursor-pointer"
            >
              <div
                className={`h-full bg-white rounded-3xl p-8 border transition-all duration-300 group relative overflow-hidden ${
                  role.status === 'active' 
                    ? "border-slate-200 hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1" 
                    : "border-slate-200 opacity-70 cursor-not-allowed"
                }`}
              >
                {role.status === 'active' && (
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
                    <ArrowRight size={20} className="text-amber-600" />
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-8">
                  <div className={`size-12 rounded-xl flex items-center justify-center transition-colors ${
                    role.status === 'active' ? "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    <role.icon size={24} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-[2px] px-3 py-1 rounded-full ${
                    role.status === 'active' ? "bg-slate-100 text-slate-500" : "bg-slate-100 text-slate-400"
                  }`}>
                    {role.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3">{role.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed min-h-[60px]">
                  {role.description}
                </p>

                {role.status === 'coming_soon' && (
                  <div className="mt-8 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    <Lock size={14} />
                    Coming Soon Phase II
                  </div>
                )}
                {role.status === 'active' && (
                  <div className="mt-8 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Initialize Workspace
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[3px] text-slate-400">
              ⚡ Demo Mode Active • Credential Bypass Enabled for Hackathon
            </p>
        </div>
      </motion.div>
    </div>
  );
}
