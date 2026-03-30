'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Zap, 
  User, 
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Globe,
  Activity,
  Cpu,
  Terminal,
  ChevronRight,
  UserCircle,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, subtitle: 'SECTION 01' },
  { href: '/dashboard/internships', label: 'Internships', icon: Briefcase, subtitle: 'SECTION 02' },
  { href: '/dashboard/applications', label: 'Applications', icon: FileText, subtitle: 'SECTION 03' },
  { href: '/dashboard/skills', label: 'My Skills', icon: Zap, subtitle: 'SECTION 04' },
  { href: '/dashboard/profile', label: 'Profile Settings', icon: User, subtitle: 'SECTION 05' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    
    const studentId = localStorage.getItem('demo_student_id');
    if (!studentId) {
      router.push('/auth/login');
      return;
    }
    setAuthorized(true);

    return () => window.removeEventListener("scroll", handler);
  }, [pathname, router]);

  async function handleSignOut() {
    // Premium Logout Sequence: Clear all intelligence caches
    localStorage.removeItem('demo_student_id');
    localStorage.removeItem('demo_company_id');
    localStorage.removeItem('demo_admin_id');
    router.push('/');
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 gap-8">
        <div className="size-20 rounded-3xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center text-amber-600 animate-pulse">
           <Shield size={40} />
        </div>
        <div className="text-center space-y-2">
            <h2 className="text-slate-900 text-xl font-black uppercase tracking-tighter">Synchronizing Profile</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[4px]">Accessing Personal Intelligence Suite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 relative selection:bg-amber-500/30 overflow-x-hidden" suppressHydrationWarning>
      {/* Visual Background Layers */}
      <div className="fixed inset-0 bg-white pointer-events-none z-0" suppressHydrationWarning />
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none z-0" suppressHydrationWarning />

      {/* Sidebar - Desktop Navigation */}
      <aside className="hidden lg:flex w-80 flex-col bg-white border-r border-slate-100 fixed top-0 left-0 h-screen z-50 transition-all duration-500 shadow-sm" suppressHydrationWarning>
        <div className="p-10" suppressHydrationWarning>
          <Link href="/dashboard" className="flex items-center gap-4 group no-underline" suppressHydrationWarning>
            <div className="size-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/20 group-hover:scale-110 transition-all duration-500" suppressHydrationWarning>
              <Shield size={24} className="text-white" />
            </div>
            <div className="flex flex-col" suppressHydrationWarning>
              <h2 className="text-slate-900 text-2xl font-black leading-none tracking-tighter uppercase font-display group-hover:text-amber-600 transition-colors">
                SkillSync
              </h2>
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em] mt-1">
                Professional Portfolio
              </span>
            </div>
          </Link>
        </div>

        <nav className="px-6 py-4 flex flex-col gap-3 pb-8" suppressHydrationWarning>
          <div className="px-4 mb-6 flex items-center gap-3" suppressHydrationWarning>
             <div className="h-px flex-1 bg-slate-100" />
             <span className="text-[9px] font-black uppercase tracking-[5px] text-slate-400">Navigation</span>
             <div className="h-px flex-1 bg-slate-100" />
          </div>

          <div className="space-y-2">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex items-center gap-5 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden border ${
                    active 
                      ? "bg-amber-600 border-amber-600 text-white shadow-[0_10px_30px_rgba(217,119,6,0.2)]" 
                      : "text-slate-500 border-transparent hover:border-amber-500/10 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`size-5 transition-all duration-500 ${
                    active ? "text-white" : "group-hover:text-amber-600 group-hover:scale-110"
                  }`} />
                  <div className="flex flex-col" suppressHydrationWarning>
                      <span className="text-[11px] font-black uppercase tracking-[3px]">{item.label}</span>
                      <span className={`text-[8px] font-bold uppercase tracking-widest leading-none mt-1 opacity-40 group-hover:opacity-60 transition-opacity ${
                          active ? "text-white" : "text-slate-400"
                      }`}>{item.subtitle}</span>
                  </div>
                  {active && (
                    <motion.div 
                      layoutId="active-nav-glow"
                      className="absolute inset-x-0 bottom-0 h-1 bg-white/20"
                    />
                  )}
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={12} className={active ? "text-white" : "text-amber-600/40"} />
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50">
          <div className="mb-8 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
             <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 flex-1">
                  <div className="size-8 rounded-lg bg-amber-600/10 flex items-center justify-center text-amber-600">
                    <UserCircle size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[2px] leading-tight text-slate-900">Student</p>
                  </div>
                </div>
             </div>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                SkillSync Platform v1.0<br />
                System Status: Production
             </p>
          </div>
          <button 
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-red-500/20 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all duration-500 group"
            onClick={handleSignOut}
          >
            <LogOut className="size-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-[11px] font-black uppercase tracking-[3px]">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Tactical Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-24 transition-all duration-700 flex items-center justify-between px-8 z-[100] ${
        isMobileMenuOpen || scrolled ? "bg-white/90 backdrop-blur-3xl border-b border-slate-100" : "bg-transparent"
      }`}>
        <Link href="/" className="flex items-center gap-4">
          <div className="size-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/20">
            <Zap size={22} className="fill-current" />
          </div>
          <span className="font-display font-black text-2xl text-slate-900 uppercase tracking-tighter">SkillSync</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 hover:bg-amber-600 hover:text-white transition-all duration-500 shadow-sm"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay - Full Screen Tactical */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="lg:hidden fixed inset-0 bg-white z-[90] pt-32 px-10 flex flex-col gap-4 overflow-y-auto"
          >
             {/* Background elements */}
            <div className="absolute inset-0 bg-slate-50 opacity-50 pointer-events-none" />
            
            <div className="mb-8 pl-4 flex items-center gap-3">
              <Zap size={12} className="text-amber-600" />
              <span className="text-[10px] font-black uppercase tracking-[6px] text-slate-400">Modules</span>
            </div>
            
            <div className="flex flex-col gap-3">
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <Link 
                    href={item.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-6 p-6 rounded-3xl transition-all border relative overflow-hidden ${
                      pathname === item.href 
                        ? "bg-amber-600 text-white border-amber-600 shadow-2xl shadow-amber-600/20" 
                        : "bg-white text-slate-500 border-slate-100 hover:border-amber-500/20 shadow-sm"
                    }`}
                  >
                    <item.icon size={28} className={pathname === item.href ? "text-white" : ""} />
                    <div className="flex flex-col">
                        <span className="text-sm font-black uppercase tracking-[4px]">{item.label}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 opacity-50 ${pathname === item.href ? "text-white" : "text-slate-400"}`}>
                            {item.subtitle}
                        </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto pb-12 pt-12">
               <button 
                className="w-full flex items-center justify-center gap-5 p-6 rounded-3xl bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-[4px] text-sm shadow-xl"
                onClick={handleSignOut}
              >
                <LogOut size={24} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area - Commander Frame */}
      <main className="flex-1 lg:ml-80 min-h-screen relative z-10 flex flex-col">
        {/* Top Header - Global Actions */}
        <header className="sticky top-0 z-40 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                  <Terminal size={14} className="text-amber-600" />
                  <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">System Link: Stable</span>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
              <Link href="/dashboard/profile" className="flex items-center gap-3 group">
                  <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-900 group-hover:text-amber-600 transition-colors">Arjun Sharma</span>
                      <span className="text-[8px] font-bold uppercase tracking-[1px] text-slate-400">Pro Member</span>
                  </div>
                  <div className="size-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden group-hover:border-amber-500 transition-all">
                      <div className="size-full bg-amber-600/10 flex items-center justify-center text-amber-600">
                          <User size={20} />
                      </div>
                  </div>
              </Link>
              
              <div className="h-8 w-[1px] bg-slate-100" />
              
              <button 
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white border border-red-100 text-red-500 hover:bg-red-50 transition-all group"
              >
                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[3px]">Secure Logout</span>
              </button>
           </div>
        </header>

        {/* Subtle content glow */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none z-[-1]" />
        
        <div className="max-w-7xl mx-auto p-8 lg:p-12 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
