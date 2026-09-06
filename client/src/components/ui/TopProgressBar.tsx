import React from'react';
import { motion, AnimatePresence, useScroll, useSpring } from'motion/react';

export const TopProgressBar: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
 const { scrollYProgress } = useScroll();
 const scaleX = useSpring(scrollYProgress, {
 stiffness: 100,
 damping: 30,
 restDelta: 0.001
 });

 return (
 <>
 {/* Global Scroll Progress Bar */}
 <motion.div
 id="scroll-progress-bar"
 style={{ scaleX }}
 className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-500 via-white to-zinc-300 z-50 origin-left pointer-events-none"
 />

 {/* Async Loading Bar Indicator */}
 <AnimatePresence>
 {isLoading && (
 <motion.div
 id="top-loading-bar"
 initial={{ scaleX: 0, opacity: 0 }}
 animate={{ scaleX: 1, opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.5, ease:'easeInOut' }}
 className="fixed top-0 left-0 right-0 h-[3px] bg-theme-card z-50 origin-left shadow-[0_0_12px_rgba(255,255,255,0.8)]"
 />
 )}
 </AnimatePresence>
 </>
 );
};

