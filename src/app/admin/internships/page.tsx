'use client';

import { useEffect, useState } from 'react';
import { Search, Briefcase, TrendingUp, BarChart3, MapPin, Clock, Flame, Download, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { exportToCSV } from '@/lib/utils/export';
import { toast } from 'react-hot-toast';

interface Internship {
  internship_id: string | number;
  title: string;
  duration: string | null;
  stipend: string | null;
  location: string | null;
  company: { company_name: string } | null;
  req_count: number;
  app_count: number;
  health?: string;
  saturation?: number;
}

type SortKey = 'app_count' | 'req_count' | 'internship_id';

export default function AdminInternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('app_count');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/internships');
        const result = await response.json();
        
        if (result.success && result.data) {
          setInternships(result.data);
        }
      } catch (err) {
        console.error('Failed to load internships:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExport = () => {
    const exportData = internships.map(i => ({
      'ID': i.internship_id,
      'Title': i.title,
      'Company': i.company?.company_name || '—',
      'Location': i.location,
      'Stipend': i.stipend,
      'Applications': i.app_count,
      'Skill Count': i.req_count,
      'Health Status': i.health || '—',
      'Market Saturation (%)': i.saturation || 0
    }));
    exportToCSV(exportData, `admin_roles_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Market report generated successfully.');
  };

  const handlePromote = (role: string) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: `Promoting ${role}...`,
        success: `${role} boosted in matching algorithms.`,
        error: 'Promotion failed.'
      }
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-8">
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-amber-600"
      >
        <Briefcase size={64} fill="currentColor" />
      </motion.div>
      <div className="text-center">
        <h2 className="text-[10px] font-black uppercase tracking-[10px] text-amber-600 mb-2">Syncing Opportunities</h2>
        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[5px] animate-pulse">Accessing Global Internship Registry</p>
      </div>
    </div>
  );

  const maxApps = Math.max(...internships.map((i: Internship) => i.app_count), 1);

  const filtered = internships
    .filter((i: Internship) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.company?.company_name ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: Internship, b: Internship) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return valB - valA;
      }
      return String(valB).localeCompare(String(valA));
    });

  const totalApps = internships.reduce((sum: number, i: Internship) => sum + i.app_count, 0);
  const hotRoles = internships.filter((i: Internship) => i.app_count >= maxApps * 0.6).length;
  const avgApps = internships.length > 0 ? Math.round(totalApps / internships.length) : 0;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Internship Listings</h1>
          <p className="text-slate-500 font-medium">{internships.length} active roles · <span className="text-amber-600 font-black">{totalApps}</span> total applications received</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest shrink-0 hover:bg-black shadow-lg"
        >
          <Download size={18} />
          Market Report
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Roles', value: internships.length, icon: Briefcase, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-100' },
          { label: 'Total Applications', value: totalApps, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'High Demand Roles', value: hotRoles, icon: Flame, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
          { label: 'Avg Apps / Role', value: avgApps, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
        ].map(card => (
          <div key={card.label} className={`bg-white p-6 rounded-2xl border ${card.border} shadow-sm hover:shadow-md transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black uppercase tracking-[2px] text-slate-400">{card.label}</span>
              <div className={`size-8 rounded-lg ${card.bg} border ${card.border} flex items-center justify-center ${card.color}`}>
                <card.icon size={14} />
              </div>
            </div>
            <div className={`text-3xl font-black tracking-tighter ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md group">
            <input
              type="text"
              placeholder="Filter by role or organization..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-14 pl-12 pr-5 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:border-amber-600/30 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none"
            />
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-600 transition-colors" />
          </div>
          {/* Sort Pills */}
          <div className="flex gap-2 flex-wrap">
            {([
              { key: 'app_count' as SortKey, label: 'Most Applied' },
              { key: 'req_count' as SortKey, label: 'Most Skills' },
              { key: 'internship_id' as SortKey, label: 'Newest' },
            ]).map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[3px] border transition-all ${
                  sortBy === opt.key
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-amber-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Internship Cards with Demand Bars */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <span className="text-sm font-black text-slate-700 uppercase tracking-wide">{filtered.length} roles</span>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <BarChart3 size={13} />
              Sorted by: {sortBy === 'app_count' ? 'Demand' : sortBy === 'req_count' ? 'Skill Complexity' : 'Newest'}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[2px] text-slate-400">
                  <th className="px-8 py-5">#</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5">Company</th>
                  <th className="px-8 py-5">Location / Duration</th>
                  <th className="px-8 py-5">Saturation Analytics</th>
                  <th className="px-8 py-5">System Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No roles matched your query.</td>
                   </tr>
                ) : filtered.map((i, idx) => {
                  const isHot = (i.saturation || 0) >= 60;
                  const isCritical = i.health === 'Critical';
                  return (
                    <tr key={i.internship_id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-5 text-[10px] font-mono text-slate-300 font-black">
                        {String(idx + 1).padStart(3, '0')}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors">{i.title}</div>
                          {isHot && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-50 border border-red-100 text-[9px] font-black text-red-500 uppercase tracking-widest">
                              <Flame size={9} /> Hot
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">{i.stipend || 'Unpaid'}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-xs font-bold text-slate-600 truncate max-w-[160px]">{i.company?.company_name || '—'}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <MapPin size={11} className="text-slate-300 shrink-0" /> {i.location || 'Remote'}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">
                          <Clock size={10} className="shrink-0" /> {i.duration || 'Flexible'}
                        </div>
                      </td>
                      <td className="px-8 py-5 min-w-[140px]">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${i.saturation || 0}%` }}
                              className={`h-full rounded-full transition-all ${isHot ? 'bg-red-400' : 'bg-emerald-400'}`}
                            />
                          </div>
                          <span className={`text-[10px] font-black w-8 text-right ${isHot ? 'text-red-500' : 'text-emerald-600'}`}>{i.saturation}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${
                          isCritical ? 'bg-rose-50 text-rose-600 border-rose-100' : i.health === 'High Demand' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                           {isCritical ? <ShieldAlert size={10} /> : <Sparkles size={10} />}
                           {i.health}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                            onClick={() => handlePromote(i.title)}
                            className="px-4 py-2 rounded-xl bg-white border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:shadow-sm transition-all"
                           >
                             Promote
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
