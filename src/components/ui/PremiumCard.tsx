'use client';

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  title?: string;
  subtitle?: string;
  variant?: "glass" | "outline" | "flat";
  hoverable?: boolean;
  delay?: number;
  duration?: number;
}

export default function PremiumCard({
  children,
  className = "",
  icon,
  title,
  subtitle,
  variant = "glass",
  hoverable = true,
  delay = 0,
  duration = 0.5,
}: PremiumCardProps) {
  const baseClasses = `p-6 rounded-2xl border transition-all duration-300 ${className}`;
  const variantClasses = {
    glass: "glass-panel",
    outline: "border-border/50 bg-background/50",
    flat: "bg-muted/30 border-transparent",
  };
  const hoverClasses = hoverable ? "card-hover cursor-pointer" : "";

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      whileHover={hoverable ? { y: -8, scale: 1.01 } : {}}
      transition={{ 
        duration, 
        delay, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className={`group relative ${baseClasses} ${variantClasses[variant]} ${hoverClasses}`}
    >
      {/* Premium Corner Highlight */}
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="size-3 border-t-2 border-r-2 border-primary/20" />
      </div>

      {(icon || title || subtitle) && (
        <div className="mb-6">
          {icon && (
            <div className="size-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-600/20 transition-all duration-500">
              {icon}
            </div>
          )}
          {title && (
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter font-display mb-1 group-hover:text-amber-600 transition-colors">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900/50 group-hover:text-slate-900 transition-colors">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="relative z-10 text-slate-600 font-medium text-xs leading-relaxed group-hover:text-slate-800 transition-colors">
        {children}
      </div>

      {/* Premium Bottom Mesh Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent group-hover:via-secondary/40 transition-all duration-700" />
    </motion.div>
  );
}
