'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="size-10 rounded-xl bg-muted/20 animate-pulse" />;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative size-10 rounded-xl bg-card border border-border shadow-lg flex items-center justify-center text-foreground hover:border-primary/50 transition-colors group"
      aria-label="Toggle Theme"
    >
      <AnimatePresence mode="wait">
        {theme === 'dark' ? (
          <motion.div
            key="moon"
            initial={{ y: 20, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={20} className="text-emerald-400 group-hover:text-emerald-300" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 20, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -45 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={20} className="text-emerald-600 group-hover:text-emerald-700" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Visual Indicator */}
      <div className="absolute -top-1 -right-1 size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
    </motion.button>
  );
}
