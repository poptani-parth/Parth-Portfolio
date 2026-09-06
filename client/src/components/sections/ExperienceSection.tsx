import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { ExperienceDTO } from '../../types';

interface ExperienceSectionProps {
  experience: ExperienceDTO[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experience }) => {
  return (
    <section id="experience" className="py-20 border-b border-slate-200 dark:border-zinc-800/50 bg-white dark:bg-[#090909] relative transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <span className="text-[10px] tracking-[0.2em] text-slate-500 dark:text-zinc-500 uppercase block mb-2 font-sans">
            Where I&apos;ve Worked
          </span>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-['Syne',sans-serif]">
            Teams &amp; Systems Scaled
          </h2>
          <p className="mt-2 text-slate-600 dark:text-zinc-400 text-sm leading-relaxed font-light">
            A look at the projects I&apos;ve collaborated on, problems solved, and backend services shipped to production.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-l border-slate-200 dark:border-zinc-800 ml-2 sm:ml-4 pl-6 sm:pl-8 space-y-10">
          {/* ADDED: Optional chaining (?.) to prevent crash if experience is undefined */}
          {experience?.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative"
            >
              {/* Timeline marker */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex items-center justify-center">
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 ${
                    item.isCurrent
                      ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/20'
                      : 'bg-slate-300 dark:bg-[#090909] border-slate-400 dark:border-zinc-600'
                  }`}
                />
              </div>

              {/* Card */}
              <div className="bg-slate-50 dark:bg-[#0e0e0e] border border-slate-200 dark:border-zinc-800/80 rounded-lg p-5 sm:p-6 transition-all hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Syne',sans-serif]">
                        {item.role}
                      </h3>
                      {item.isCurrent && (
                        <span className="text-[9px] font-sans uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 font-semibold">
                          Current Role
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-sans text-slate-700 dark:text-zinc-400 mt-0.5 font-medium">
                      {item.company}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-sans text-slate-500 dark:text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                      <span>{item.startDate}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                      <span>{item.location}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mb-4 leading-relaxed font-light">
                  {item.description}
                </p>

                {/* Highlights */}
                <div className="space-y-2 mb-4">
                  {/* ADDED: Optional chaining (?.) for highlights array */}
                  {item.highlights?.map((highlight, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-light">{highlight}</span>
                    </div>
                  ))}
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200 dark:border-zinc-900">
                  {/* ADDED: Optional chaining (?.) for technologies array */}
                  {item.technologies?.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] font-sans bg-white dark:bg-[#141414] text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800/60"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};