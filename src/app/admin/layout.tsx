'use client';

import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { LayoutDashboard, GraduationCap, Briefcase, ArrowLeft, Crown, LogOut, BarChart3, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: GraduationCap },
  { href: '/admin/internships', label: 'Internships', icon: Briefcase },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const adminId = localStorage.getItem('demo_admin_id');
    if (!adminId) {
      router.push('/auth/login');
      return;
    }
    setAuthorized(true);
  }, [router]);

  const handleSignOut = async () => {
    localStorage.removeItem('demo_admin_id');
    localStorage.removeItem('clerk_user_id');
    router.push('/');
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-10 gap-8">
        <div className="size-20 rounded-3xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center text-amber-600 animate-pulse">
           <ShieldAlert size={40} />
        </div>
        <div className="text-center space-y-2">
            <h2 className="text-white text-xl font-black uppercase tracking-tighter">Validating Authority</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[4px]">Accessing Secure Admin Segment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
          <div className="size-9 rounded-xl bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-600/10">
            <Crown size={18} className="text-white" />
          </div>
          <span className="font-black text-lg uppercase tracking-tighter font-display text-slate-900">Admin Panel</span>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all text-sm font-semibold group"
            >
              <item.icon size={18} className="group-hover:text-amber-600 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all text-sm font-semibold"
          >
            <ArrowLeft size={18} />
            Back to App
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-50 transition-all text-sm font-semibold"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
