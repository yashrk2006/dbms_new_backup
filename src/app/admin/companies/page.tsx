'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, ShieldCheck, ShieldAlert, Search, 
  ExternalLink, Mail, MapPin, Calendar, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface Company {
  company_id: string;
  name: string;
  email: string;
  industry: string;
  location: string;
  website: string;
  is_verified: boolean;
  created_at: string;
}

export default function AdminCompanies() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      try {
        const res = await fetch('/api/admin/companies');
        const data = await res.json();
        if (data.success) {
          setCompanies(data.data);
        }
      } catch (e) {
        toast.error("Failed to fetch organizations");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const toggleVerification = async (companyId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, is_verified: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setCompanies(prev => prev.map(c => c.company_id === companyId ? { ...c, is_verified: newStatus } : c));
        toast.success(newStatus ? "Organization Verified" : "Verification Revoked", {
          icon: newStatus ? "🛡️" : "⚠️"
        });
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="size-8 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <button 
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-amber-600 transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Back to Insights
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Corporate Governance</h1>
          <p className="text-slate-500 font-medium">Provision and audit SkillSync partner organizations.</p>
        </div>
        
        <div className="relative group w-full md:w-96">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-amber-600/10 focus:border-amber-600 outline-none font-bold text-sm shadow-sm transition-all"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCompanies.map((company) => (
            <motion.div 
              key={company.company_id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-soft hover:shadow-md transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <Building2 size={100} />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    <div className="size-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{company.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{company.industry || 'Technology'}</span>
                        <div className="size-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined {new Date(company.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[2px] ${company.is_verified ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-500'}`}>
                    {company.is_verified ? 'Verified' : 'Unverified'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                      <Mail size={14} className="text-slate-300" /> {company.email}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                      <MapPin size={14} className="text-slate-300" /> {company.location || 'Remote'}
                    </div>
                  </div>
                  <div className="flex justify-end items-end">
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="size-11 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex gap-3">
                  <button 
                    onClick={() => toggleVerification(company.company_id, company.is_verified)}
                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[30%] transition-all flex items-center justify-center gap-3 ${
                      company.is_verified 
                        ? 'bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-100' 
                        : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700'
                    }`}
                  >
                    {company.is_verified ? (
                      <><ShieldAlert size={14} /> Revoke Access</>
                    ) : (
                      <><ShieldCheck size={14} /> Provision Org</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCompanies.length === 0 && (
        <div className="py-32 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
          <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest leading-none mb-4">No organizations found</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[3px]">Audit repository empty</p>
        </div>
      )}
    </div>
  );
}
