'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CompanyGateway() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch('/api/company/list');
        const data = await res.json();
        if (data.success) {
          setCompanies(data.data || []);
        }
      } catch (e) {
        console.error('Failed to load companies:', e);
      } finally {
        setLoading(false);
      }
    }
    loadCompanies();
  }, []);

  const handleLogin = (companyId: string) => {
    // Session state for the demo
    localStorage.setItem('demo_company_id', companyId);
    router.push('/company');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500/10 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl w-full relative z-10 space-y-12">
        <div className="text-center space-y-4">
          <Link href="/auth/login" className="inline-flex items-center justify-center size-14 bg-white rounded-2xl shadow-sm text-amber-600 mb-4 hover:scale-105 transition-transform">
            <Building2 size={24} />
          </Link>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase font-display">
            Select Company
          </h1>
          <p className="text-xl text-slate-500 font-medium">Choose your corporate identity to bypass credential login.</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="size-6 rounded-full border-4 border-amber-600/30 border-t-amber-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company, i) => (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={company.company_id}
                onClick={() => handleLogin(company.company_id)}
                className="group relative bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="size-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-white/20 group-hover:text-white transition-colors">
                    <Building2 size={20} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-white transition-colors mb-2">
                    {company.company_name}
                  </h3>
                  <p className="text-slate-500 line-clamp-2 text-sm group-hover:text-amber-100 transition-colors h-10">
                    {company.description || "Corporate Partner"}
                  </p>
                  
                  <div className="mt-8 flex items-center justify-between text-sm font-bold uppercase tracking-widest text-amber-600 group-hover:text-white transition-colors">
                    Login
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
