'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export function ToasterProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        className: 'bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest border border-white/10 rounded-2xl p-4 shadow-2xl',
        success: {
          iconTheme: { primary: '#10b981', secondary: '#fff' }
        }
      }}
    />
  );
}
