'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export function LiquidProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 z-[110] origin-left shadow-[0_0_20px_rgba(245,158,11,0.5)]"
      style={{ scaleX }}
    >
        <div className="absolute top-full left-0 w-full h-[10px] bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none" />
    </motion.div>
  );
}
