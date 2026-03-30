import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-900 border-slate-200",
    primary: "bg-amber-600/10 text-amber-600 border-amber-600/20",
    secondary: "bg-slate-200 text-slate-800 border-slate-300",
    success: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    warning: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    danger: "bg-red-500/10 text-red-600 border-red-500/20",
    outline: "bg-transparent border-slate-200 text-slate-600",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
