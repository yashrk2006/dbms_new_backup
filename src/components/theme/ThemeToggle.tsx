'use client';

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="size-10 rounded-xl bg-muted/20 border border-border/50" />
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative size-10 rounded-xl bg-background/50 border border-border/50 flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-all group overflow-hidden shadow-sm"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.div
            key="moon"
            initial={{ y: 20, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -45 }}
            transition={{ duration: 0.3, ease: "circOut" }}
          >
            <Moon size={18} className="text-primary group-hover:scale-110 transition-transform" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 20, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.3, ease: "circOut" }}
          >
            <Sun size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}
