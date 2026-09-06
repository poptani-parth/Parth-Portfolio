import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Github, 
  ExternalLink, 
  Layers, 
  Zap, 
  ShieldCheck, 
  AlertCircle,
  Activity,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { ProjectDTO } from '../../types';

interface ProjectModalProps {
  project: ProjectDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'challenges'>('architecture');

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-3xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]"
          >
            {/* Header with Project Image Banner */}
            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-900 shrink-0">
              <img
                src={project.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'}
                alt={project.title}
                className="w-full h-full object-cover opacity-60 filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white/90 transition-colors backdrop-blur-md"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Category & Status Overlay */}
              <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-sans font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    {project.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white font-['Syne',sans-serif]">
                    {project.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Metrics Ribbon */}
            {(project.metrics || []).length > 0 && <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-zinc-800 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 py-3 px-4 shrink-0">
              {(project.metrics || []).map((metric, idx) => (
                <div key={idx} className="text-center px-2">
                  <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 truncate">
                    {metric.label}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 font-sans">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>}

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-zinc-800 px-6 shrink-0 bg-white dark:bg-[#121212]">
              <button
                onClick={() => setActiveTab('architecture')}
                className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'architecture'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                Architecture &amp; Features
              </button>

              <button
                onClick={() => setActiveTab('challenges')}
                className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'challenges'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                Challenges Solved
              </button>
            </div>

            {/* Tab Body - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-zinc-300">
              {activeTab === 'architecture' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-2">
                      System Overview
                    </h4>
                    <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-zinc-200">
                      {project.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-3">
                      Core Key Capabilities
                    </h4>
                    <div className="space-y-2.5">
                      {project.keyFeatures?.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-2.5">
                      Technology Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-sans px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'challenges' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                    Distributed Systems Problems &amp; Architectural Solutions
                  </h4>
                  <div className="space-y-3">
                    {(project.challenges || []).map((challenge, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-zinc-200"
                      >
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                              Challenge #{idx + 1}
                            </div>
                            <p className="text-xs sm:text-sm leading-relaxed">
                              {challenge}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 text-xs sm:text-sm font-bold transition-colors shadow-xs"
                  >
                    <Github className="w-4 h-4" />
                    GitHub Repo
                  </a>
                )}
                {project.liveDemoUrl && (
                  <a
                    href={project.liveDemoUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs sm:text-sm font-bold transition-colors border border-blue-200 dark:border-blue-800/40"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live System Demo
                  </a>
                )}
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs sm:text-sm font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
