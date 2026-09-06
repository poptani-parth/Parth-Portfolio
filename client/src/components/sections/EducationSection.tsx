import React from 'react';
import { motion } from 'motion/react';
import { Calendar, GraduationCap } from 'lucide-react';
import { EducationDTO } from '../../types';

interface EducationSectionProps {
  education: EducationDTO[];
}

export const EducationSection: React.FC<EducationSectionProps> = ({ education }) => {
  return (
    <section id="education" className="py-20 border-b border-slate-200 dark:border-zinc-800/50 bg-white dark:bg-[#090909] relative transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <span className="text-[10px] tracking-[0.2em] text-slate-500 dark:text-zinc-500 uppercase block mb-2 font-sans">
            Education &amp; Foundations
          </span>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-['Syne',sans-serif]">
            Academic Roots &amp; Fundamentals
          </h2>
          <p className="mt-2 text-slate-600 dark:text-zinc-400 text-sm leading-relaxed font-light">
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
              className="bg-slate-50 dark:bg-[#0e0e0e] border border-slate-200 dark:border-zinc-800/80 rounded-lg p-6 transition-all hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#141414] border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-400 shadow-2xs">
                    <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Syne',sans-serif]">
                      {item.degree}
                    </h3>
                    <div className="text-xs font-sans text-slate-700 dark:text-zinc-400 mt-0.5 font-medium">
                      {item.institution}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-sans text-slate-500 dark:text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    <span>{item.startDate} — {item.endDate}</span>
                  </span>
                  {item.gpa && (
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#141414] text-slate-700 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
                      GPA: {item.gpa}
                    </span>
                  )}
                </div>
              </div>

              {item.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-light mb-3">
                  {item.description}
                </p>
              )}

              {item.achievements && item.achievements.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200 dark:border-zinc-900">
                  {item.achievements.map((ach, idx) => (
                    <span key={idx} className="text-xs text-slate-600 dark:text-zinc-400 font-light bg-white dark:bg-[#141414] px-2.5 py-1 rounded border border-slate-200 dark:border-zinc-800/60">
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
