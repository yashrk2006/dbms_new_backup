'use client';

import Link from 'next/link';
import { ReactNode, useState, useEffect } from 'react';
import { LayoutDashboard, Users, Briefcase, ArrowLeft, Building2, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/company', label: 'Company Overview', icon: LayoutDashboard },
  { href: '/company/postings', label: 'Job Postings', icon: Briefcase },
  { href: '/company/applicants', label: 'Review Candidates', icon: Users },
  { href: '/company/profile', label: 'Company Profile', icon: Settings },
];

export default function CompanyLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState<string>("Loading...");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function initSession() {
      const storedId = localStorage.getItem('demo_company_id');
      if (!storedId) {
        router.push('/auth/login');
        return;
      }
      setAuthorized(true);
      
      try {
        const res = await fetch(`/api/company/profile?companyId=${storedId}`);
        const data = await res.json();
        if (data.success) {
          setCompanyName(data.company.name);
        } else {
          setCompanyName("Corporate HR");
        }
      } catch (e) {
        setCompanyName("Corporate HR");
      }
    }
    initSession();
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 gap-8">
        <div className="size-20 rounded-3xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center text-amber-600 animate-bounce">
           <Building2 size={40} />
        </div>
        <div className="text-center space-y-2">
            <h2 className="text-slate-900 text-xl font-black uppercase tracking-tighter">Initializing Corporate Secure</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[4px]">Connecting to Business IQ Network...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    localStorage.removeItem('demo_company_id');
    localStorage.removeItem('clerk_user_id');
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col shadow-sm sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
          <div className="size-9 rounded-xl bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-600/10 shrink-0">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="font-black text-lg uppercase tracking-tighter font-display text-slate-900 line-clamp-1" title={companyName}>
            {companyName}
          </span>
        </div>

        <nav className="p-4 flex flex-col gap-1 pb-8 border-b border-slate-50">
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
            href="/auth/login"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all text-sm font-semibold"
          >
            <ArrowLeft size={18} />
            Change Role
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
