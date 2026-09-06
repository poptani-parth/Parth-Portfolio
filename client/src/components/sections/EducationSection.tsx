import React from'react';
import { motion } from'motion/react';
import { Calendar, GraduationCap } from'lucide-react';
import { EducationDTO } from'../../types';

interface EducationSectionProps {
 education: EducationDTO[];
}

export const EducationSection: React.FC<EducationSectionProps> = ({ education }) => {
 return (
 <section id="education" className="py-20 border-b border-theme-border dark:border-zinc-800/50 bg-theme-card relative transition-colors duration-200">
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="max-w-2xl mb-10">
 <span className="text-[10px] tracking-[0.2em] text-theme-text-muted uppercase block mb-2 font-sans">
 Education &amp; Foundations
 </span>
 <h2 className="text-3xl font-bold text-theme-text tracking-tight font-['Syne',sans-serif]">
 Academic Roots &amp; Fundamentals
 </h2>
 <p className="mt-2 text-theme-text-secondary text-sm leading-relaxed font-light">
 Where I built my foundation in algorithms, operating systems, and distributed computing.
 </p>
 </div>

 <div className="space-y-4">
 {education.map((item, index) => (
 <motion.div
 key={item.id}
 initial={{ opacity: 0, y: 15 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.4, delay: index * 0.1 }}
 className="bg-theme-bg dark:bg-[#0e0e0e] border border-theme-border rounded-lg p-6 transition-all hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md"
 >
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-lg bg-theme-card dark:bg-[#141414] border border-theme-border flex items-center justify-center text-theme-text-secondary shadow-2xs">
 <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 </div>
 <div>
 <h3 className="text-base sm:text-lg font-bold text-theme-text font-['Syne',sans-serif]">
 {item.degree}
 </h3>
 <div className="text-xs font-sans text-theme-text-secondary mt-0.5 font-medium">
 {item.institution}
 </div>
 </div>
 </div>

 <div className="flex items-center gap-3 text-xs font-sans text-theme-text-muted">
 <span className="inline-flex items-center gap-1">
 <Calendar className="w-3.5 h-3.5 text-theme-text-muted" />
 <span>{item.startDate} — {item.endDate}</span>
 </span>
 {item.gpa && (
 <span className="px-2 py-0.5 rounded bg-theme-card dark:bg-[#141414] text-theme-text-secondary border border-theme-border">
 GPA: {item.gpa}
 </span>
 )}
 </div>
 </div>

 {item.description && (
 <p className="text-xs sm:text-sm text-theme-text-secondary leading-relaxed font-light mb-3">
 {item.description}
 </p>
 )}

 {item.achievements && item.achievements.length > 0 && (
 <div className="flex flex-wrap gap-2 pt-3 border-t border-theme-border dark:border-zinc-900">
 {item.achievements.map((ach, idx) => (
 <span key={idx} className="text-xs text-theme-text-secondary font-light bg-theme-card dark:bg-[#141414] px-2.5 py-1 rounded border border-theme-border dark:border-zinc-800/60">
 • {ach}
 </span>
 ))}
 </div>
 )}
 </motion.div>
 ))}
 </div>
 </div>
 </section>
 );
};
