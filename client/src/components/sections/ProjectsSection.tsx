import React, { useState } from'react';
import { Link } from'react-router-dom';
import { motion, AnimatePresence } from'motion/react';
import {
 ArrowRight,
 Github,
 ExternalLink,
 Sparkles,
 Layers,
} from'lucide-react';
import { ProjectDTO } from'../../types';

interface ProjectsSectionProps {
 projects: ProjectDTO[];
}

const sanitizeSafeUrl = (url?: string | null): string => {
 if (!url) return'#';
 const trimmed = url.trim();
 if (/^(javascript|vbscript|data):/i.test(trimmed)) {
 return'#';
 }
 return trimmed;
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects = [] }) => {
 const [activeCategory, setActiveCategory] = useState<string>('All');

 const categories = [
'All',
 ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean))),
 ];

 const filteredProjects = projects.filter((p) => {
 if (activeCategory ==='All') return true;
 return p.category?.toLowerCase() === activeCategory.toLowerCase();
 });

 return (
 <section id="projects" className="py-20 bg-theme-bg/50 relative transition-colors duration-200">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
 <div className="max-w-2xl">
 <span className="text-[10px] tracking-[0.2em] text-theme-text-muted uppercase block mb-3 font-sans">
 Featured Work &amp; Systems
 </span>
 <h2 className="text-3xl sm:text-4xl font-bold text-theme-text tracking-tight font-['Syne',sans-serif]">
 Architected for Performance &amp; Security
 </h2>
 <p className="mt-3 text-theme-text-secondary text-sm sm:text-base leading-relaxed font-light">
 High-throughput microservices, distributed persistence layers, and cloud architectures.
 </p>
 </div>

 <Link
 to="/projects"
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-slate-900 text-xs font-sans font-bold transition-all shadow-xs shrink-0 self-start md:self-end"
 >
 <span>View Full Archive</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </Link>
 </div>

 {/* Category Filter Chips */}
 {categories.length > 2 && (
 <div className="flex flex-wrap gap-2 mb-10">
 {categories.map((cat) => (
 <button
 key={cat}
 type="button"
 onClick={() => setActiveCategory(cat)}
 className={`px-3.5 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
 activeCategory === cat
 ?'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
 :'bg-theme-card text-theme-text-secondary hover:text-slate-950 border border-theme-border dark:bg-[#121212] dark:hover:text-white font-medium'
 }`}
 >
 {cat}
 </button>
 ))}
 </div>
 )}

 {/* Projects Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 <AnimatePresence>
 {filteredProjects.map((project) => {
 const safeGithub = sanitizeSafeUrl(project.githubUrl);
 const liveUrl = (project as any).liveUrl || (project as any).liveDemoUrl;
 const safeLive = sanitizeSafeUrl(liveUrl);

 return (
 <motion.div
 key={project.id}
 layout
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.98 }}
 whileHover={{ y: -4 }}
 transition={{ duration: 0.2 }}
 className="bg-theme-card dark:bg-[#0e0e0e] border border-theme-border rounded-2xl p-6 hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
 >
 <div>
 <div className="flex items-center justify-between gap-2 mb-3">
 <span className="text-[10px] font-sans uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-theme-bg dark:bg-[#161616] text-theme-text-secondary border border-theme-border font-bold">
 {project.category}
 </span>
 {project.featured && (
 <span className="text-[10px] font-sans uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-semibold flex items-center gap-1">
 <Sparkles className="w-2.5 h-2.5" />
 <span>Featured</span>
 </span>
 )}
 </div>

 <h3 className="text-xl font-bold text-theme-text font-['Syne',sans-serif] mb-2">
 {project.title}
 </h3>

 <p className="text-xs sm:text-sm text-theme-text-secondary leading-relaxed mb-5 font-light line-clamp-3">
 {(project as any).shortDescription || project.description}
 </p>
 </div>

 <div>
 {/* Tech Tags */}
 <div className="flex flex-wrap gap-1.5 mb-6">
 {project.technologies?.slice(0, 4).map((tech, idx) => (
 <span
 key={idx}
 className="text-[10px] font-sans bg-theme-bg dark:bg-[#141414] text-theme-text-secondary px-2.5 py-1 rounded-md border border-theme-border"
 >
 {tech}
 </span>
 ))}
 {project.technologies && project.technologies.length > 4 && (
 <span className="text-[10px] font-sans text-theme-text-muted self-center">
 +{project.technologies.length - 4}
 </span>
 )}
 </div>

 {/* Action Bar */}
 <div className="flex items-center justify-between pt-4 border-t border-slate-100">
 <Link
 to={`/projects/${(project as any).slug || project.id}`}
 className="text-xs font-sans uppercase tracking-wider text-theme-text-secondary hover:text-slate-950 dark:hover:text-white flex items-center gap-1.5 transition-colors font-bold"
 >
 <span>Specifications</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </Link>

 <div className="flex items-center gap-2">
 {safeGithub !=='#' && (
 <a
 href={safeGithub}
 target="_blank"
 rel="noopener noreferrer"
 className="p-1.5 text-theme-text-muted hover:text-slate-950 dark:hover:text-white rounded-lg bg-theme-bg hover:bg-slate-100 dark:bg-[#141414] dark:hover:bg-[#1c1c1c] border border-theme-border transition-colors"
 title="GitHub Repository"
 >
 <Github className="w-3.5 h-3.5" />
 </a>
 )}
 {safeLive !=='#' && (
 <a
 href={safeLive}
 target="_blank"
 rel="noopener noreferrer"
 className="p-1.5 text-theme-text-muted hover:text-slate-950 dark:hover:text-white rounded-lg bg-theme-bg hover:bg-slate-100 dark:bg-[#141414] dark:hover:bg-[#1c1c1c] border border-theme-border transition-colors"
 title="Live Demo"
 >
 <ExternalLink className="w-3.5 h-3.5" />
 </a>
 )}
 </div>
 </div>
 </div>
 </motion.div>
 );
 })}
 </AnimatePresence>
 </div>

 {filteredProjects.length === 0 && (
 <div className="text-center py-16 bg-theme-card dark:bg-[#0e0e0e] rounded-2xl border border-theme-border">
 <Layers className="w-8 h-8 text-theme-text-muted mx-auto mb-3" />
 <p className="text-sm font-bold text-theme-text font-sans">
 No projects in this category yet
 </p>
 </div>
 )}
 </div>
 </section>
 );
};