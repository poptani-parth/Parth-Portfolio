import React, { useState, useMemo } from'react';
import { Link, useSearchParams } from'react-router-dom';
import { motion, AnimatePresence } from'motion/react';
import {
 Search,
 ArrowRight,
 Github,
 X,
 ArrowLeft,
 Sparkles
} from'lucide-react';
import { useProjects } from'../hooks/usePortfolioData';

const sanitizeSafeUrl = (url?: string | null): string => {
 if (!url) return'#';
 const trimmed = url.trim();
 if (/^(javascript|vbscript|data):/i.test(trimmed)) {
 return'#';
 }
 return trimmed;
};

export const ProjectsCatalogPage: React.FC = () => {
 const [searchParams, setSearchParams] = useSearchParams();
 const activeCategory = searchParams.get('category') ||'All';
 const activeTech = searchParams.get('tech') ||'';
 const [searchTerm, setSearchTerm] = useState('');

 const { data: projects = [] } = useProjects({
 category: activeCategory !=='All' ? activeCategory : undefined,
 tech: activeTech || undefined
 });

 const categories = ['All','Full Stack','Distributed Systems','Backend','Security','Cloud'];

 const allTechnologies = useMemo(() => {
 const set = new Set<string>();
 (projects || []).forEach((p) => {
 p.technologies?.forEach((t) => set.add(t));
 });
 return Array.from(set).sort();
 }, [projects]);

 const handleCategoryChange = (cat: string) => {
 const newParams = new URLSearchParams(searchParams);
 if (cat ==='All') {
 newParams.delete('category');
 } else {
 newParams.set('category', cat);
 }
 setSearchParams(newParams);
 };

 const handleTechToggle = (tech: string) => {
 const newParams = new URLSearchParams(searchParams);
 if (activeTech.toLowerCase() === tech.toLowerCase()) {
 newParams.delete('tech');
 } else {
 newParams.set('tech', tech);
 }
 setSearchParams(newParams);
 };

 const clearFilters = () => {
 setSearchParams(new URLSearchParams());
 setSearchTerm('');
 };

 const filteredProjects = useMemo(() => {
 return (projects || []).filter((p) => {
 if (!searchTerm.trim()) return true;
 const q = searchTerm.toLowerCase();
 return (
 p.title.toLowerCase().includes(q) ||
 p.description.toLowerCase().includes(q) ||
 p.technologies?.some((t) => t.toLowerCase().includes(q))
 );
 });
 }, [projects, searchTerm]);

 return (
 <div className="min-h-screen pt-28 pb-20 bg-theme-bg/50 transition-colors duration-200">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <Link
 to="/"
 className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-theme-text-muted hover:text-slate-950 dark:hover:text-white mb-6 transition-colors"
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 <span>Back to Portfolio</span>
 </Link>

 <div className="max-w-3xl mb-10">
 <span className="text-[10px] tracking-[0.2em] text-theme-text-muted uppercase block mb-3 font-sans">
 Project Archive &amp; Deep Dives
 </span>
 <h1 className="text-3xl sm:text-5xl font-bold text-theme-text tracking-tight font-['Syne',sans-serif]">
 Architectures &amp; Backend Systems
 </h1>
 <p className="mt-3 text-theme-text-secondary text-base leading-relaxed font-light">
 Take a deep dive into distributed services, secure caching models, and production APIs.
 </p>
 </div>

 {/* Filter Bar */}
 <div className="bg-theme-card dark:bg-[#0e0e0e] border border-theme-border rounded-lg p-6 mb-8 space-y-6 shadow-xs">
 <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
 <div className="relative flex-1">
 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" />
 <input
 type="text"
 placeholder="Search by keywords, frameworks, or architectural features..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full bg-theme-bg dark:bg-[#121212] border border-theme-border rounded-lg pl-9 pr-3 py-2 text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-500 transition-colors font-sans"
 />
 </div>

 {(activeCategory !=='All' || activeTech || searchTerm) && (
 <button
 onClick={clearFilters}
 className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-theme-bg hover:bg-slate-200 text-theme-text dark:bg-zinc-800 border border-theme-border-subtle text-xs uppercase tracking-wider transition-colors shrink-0 font-semibold cursor-pointer"
 >
 <X className="w-3.5 h-3.5" />
 <span>Reset Filters</span>
 </button>
 )}
 </div>

 <div>
 <div className="text-[10px] font-sans text-theme-text-muted uppercase tracking-widest mb-2.5">
 Domain / Architecture:
 </div>
 <div className="flex flex-wrap gap-2">
 {categories.map((cat) => (
 <button
 key={cat}
 onClick={() => handleCategoryChange(cat)}
 className={`px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer ${
 activeCategory === cat
 ?'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-xs'
 :'bg-theme-card text-theme-text-secondary hover:text-slate-950 border border-theme-border hover:border-slate-300 dark:bg-[#121212] dark:hover:text-white font-medium'
 }`}
 >
 {cat}
 </button>
 ))}
 </div>
 </div>

 {allTechnologies.length > 0 && (
 <div>
 <div className="text-[10px] font-sans text-theme-text-muted uppercase tracking-widest mb-2.5">
 Filter by Technology:
 </div>
 <div className="flex flex-wrap gap-1.5">
 {allTechnologies.map((tech) => (
 <button
 key={tech}
 onClick={() => handleTechToggle(tech)}
 className={`px-2.5 py-1 rounded-md text-[10px] transition-colors uppercase tracking-wider cursor-pointer ${
 activeTech.toLowerCase() === tech.toLowerCase()
 ?'bg-slate-900 text-white dark:bg-white dark:text-black font-bold'
 :'bg-theme-bg text-theme-text-secondary hover:text-slate-950 border border-theme-border dark:bg-[#121212] dark:hover:text-zinc-200 font-medium'
 }`}
 >
 {tech}
 </button>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Project Results Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 <AnimatePresence>
 {filteredProjects.map((project) => {
 const safeGithub = sanitizeSafeUrl(project.githubUrl);
 return (
 <motion.div
 key={project.id}
 layout
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.98 }}
 whileHover={{ y: -4 }}
 transition={{ duration: 0.2 }}
 className="bg-theme-card dark:bg-[#0e0e0e] border border-theme-border rounded-lg p-6 hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
 >
 <div>
 <div className="flex items-center justify-between gap-2 mb-3">
 <span className="text-[10px] font-sans uppercase tracking-widest px-2 py-0.5 rounded bg-theme-bg dark:bg-[#161616] text-theme-text-secondary border border-theme-border">
 {project.category}
 </span>
 {project.featured && (
 <span className="text-[10px] font-sans uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 font-semibold flex items-center gap-1">
 <Sparkles className="w-2.5 h-2.5" />
 <span>Featured</span>
 </span>
 )}
 </div>

 <h2 className="text-xl font-bold text-theme-text font-['Syne',sans-serif] hover:text-emerald-600 dark:hover:text-zinc-200 transition-colors mb-2.5">
 {project.title}
 </h2>

 <p className="text-xs sm:text-sm text-theme-text-secondary leading-relaxed mb-5 font-light">
 {(project as any).shortDescription || project.description}
 </p>
 </div>

 <div>
 <div className="flex flex-wrap gap-1.5 mb-6">
 {project.technologies?.map((tech, tIdx) => (
 <span
 key={tIdx}
 className="text-[10px] font-sans bg-theme-bg dark:bg-[#141414] text-theme-text-secondary px-2 py-0.5 rounded border border-theme-border"
 >
 {tech}
 </span>
 ))}
 </div>

 <div className="flex items-center justify-between pt-4 border-t border-slate-100">
 <Link
 to={`/projects/${(project as any).slug || project.id}`}
 className="text-xs uppercase tracking-wider text-theme-text-secondary hover:text-slate-950 dark:hover:text-white flex items-center gap-1.5 transition-colors font-semibold"
 >
 <span>Explore Details</span>
 <ArrowRight className="w-3.5 h-3.5 text-theme-text-muted" />
 </Link>

 {project.githubUrl && safeGithub !=='#' && (
 <a
 href={safeGithub}
 target="_blank"
 rel="noopener noreferrer"
 className="p-1.5 text-theme-text-muted hover:text-slate-950 dark:hover:text-white rounded bg-theme-bg hover:bg-slate-100 dark:bg-[#141414] dark:hover:bg-[#1c1c1c] border border-theme-border transition-colors"
 title="GitHub Repository"
 >
 <Github className="w-3.5 h-3.5" />
 </a>
 )}
 </div>
 </div>
 </motion.div>
 );
 })}
 </AnimatePresence>
 </div>

 {filteredProjects.length === 0 && (
 <div className="text-center py-20 bg-theme-card dark:bg-[#0e0e0e] rounded-lg border border-theme-border shadow-xs">
 <p className="text-theme-text-secondary text-sm mb-4 font-light">
 No projects found for the selected combination of filters.
 </p>
 <button
 onClick={clearFilters}
 className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs uppercase tracking-wider font-bold shadow-xs cursor-pointer"
 >
 Reset Filters
 </button>
 </div>
 )}
 </div>
 </div>
 );
};