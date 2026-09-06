import React from'react';
import { motion } from'motion/react';
import { 
 ArrowUpRight, 
 Github, 
 Layers, 
 Activity, 
 CheckCircle2, 
 Cpu, 
 ExternalLink,
 ChevronRight
} from'lucide-react';
import { ProjectDTO } from'../../types';

interface ProjectCardProps {
 project: ProjectDTO;
 index: number;
 onOpenDetails: (project: ProjectDTO) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onOpenDetails }) => {
 return (
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin:'-50px' }}
 transition={{ duration: 0.5, delay: index * 0.1 }}
 whileHover={{ y: -6 }}
 className="group relative flex flex-col justify-between rounded-2xl bg-theme-card dark:bg-[#121212] border border-theme-border hover:border-blue-400 dark:hover:border-blue-400/70 shadow-xs hover:shadow-2xl transition-all duration-300 overflow-hidden"
 >
 <div>
 {/* Top Image Preview Container */}
 <div 
 onClick={() => onOpenDetails(project)}
 className="relative h-56 sm:h-64 w-full overflow-hidden bg-theme-bg cursor-pointer"
 >
 <img
 src={
 project.imageUrl ||
`https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80&sig=${index}`
 }
 alt={project.title}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 dark:brightness-85 group-hover:brightness-100"
 />

 {/* Gradient Scrim */}
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

 {/* Top floating pill tags */}
 <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-theme-card/90 dark:bg-black/70 text-theme-text backdrop-blur-md border border-slate-200/50 dark:border-white/10 shadow-xs">
 <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
 {project.category}
 </span>

 {project.featured && (
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans uppercase tracking-wider font-bold bg-blue-500 text-white shadow-xs">
 Featured
 </span>
 )}
 </div>

 {/* Bottom Title on Image */}
 <div className="absolute bottom-4 left-4 right-4 z-10">
 <h3 className="text-xl sm:text-2xl font-bold font-['Syne',sans-serif] text-white tracking-tight flex items-center justify-between gap-2">
 <span>{project.title}</span>
 <span className="p-1.5 rounded-full bg-theme-card/20 dark:bg-white/10 text-white group-hover:bg-blue-400 group-hover:text-slate-900 transition-colors backdrop-blur-sm shrink-0">
 <ArrowUpRight className="w-4 h-4" />
 </span>
 </h3>
 </div>
 </div>

 {/* Card Content Area */}
 <div className="p-6">
 {/* Description */}
 <p className="text-sm text-theme-text-secondary line-clamp-2 mb-5 leading-relaxed font-light">
 {project.shortDescription || project.description}
 </p>

 {/* Performance Metrics Strip */}
 {project.metrics && project.metrics.length > 0 && (
 <div className="grid grid-cols-3 gap-2 p-3 mb-5 rounded-xl bg-theme-bg /70 border border-slate-200/80">
 {project.metrics.slice(0, 3).map((metric, mIdx) => (
 <div key={mIdx} className="text-center">
 <div className="text-[10px] font-sans uppercase text-theme-text-muted tracking-wider truncate">
 {metric.label}
 </div>
 <div className="text-xs sm:text-sm font-bold font-sans text-theme-text dark:text-blue-400 truncate">
 {metric.value}
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Key Architectural Highlights */}
 {project.keyFeatures && project.keyFeatures.length > 0 && (
 <div className="space-y-2 mb-5">
 {project.keyFeatures.slice(0, 2).map((feature, fIdx) => (
 <div key={fIdx} className="flex items-start gap-2 text-xs text-theme-text-secondary">
 <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
 <span className="line-clamp-1">{feature}</span>
 </div>
 ))}
 </div>
 )}

 {/* Tech Stack Pills */}
 <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100">
 {project.technologies.slice(0, 4).map((tech, tIdx) => (
 <span
 key={tIdx}
 className="text-[11px] font-sans px-2.5 py-1 rounded-md bg-theme-bg dark:bg-zinc-800/60 text-theme-text-secondary border border-slate-200/60 dark:border-zinc-700/50"
 >
 {tech}
 </span>
 ))}
 {project.technologies.length > 4 && (
 <span className="text-[11px] font-sans px-2 py-1 rounded-md bg-theme-bg text-theme-text-muted border border-dashed border-theme-border-subtle">
 +{project.technologies.length - 4}
 </span>
 )}
 </div>
 </div>
 </div>

 {/* Card Action Footer */}
 <div className="px-6 py-4 border-t border-slate-100 bg-theme-bg/50 /40 flex items-center justify-between gap-3">
 <button
 onClick={() => onOpenDetails(project)}
 className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-text hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
 >
 <Layers className="w-4 h-4 text-blue-500" />
 <span>View project details</span>
 </button>

 <div className="flex items-center gap-2">
 {project.githubUrl && (
 <a
 href={project.githubUrl}
 target="_blank"
 rel="noreferrer"
 aria-label={`View ${project.title} on GitHub`}
 className="p-2 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-theme-text-secondary transition-colors"
 >
 <Github className="w-4 h-4" />
 </a>
 )}
 {project.liveDemoUrl && (
 <a
 href={project.liveDemoUrl}
 aria-label={`Explore live demo for ${project.title}`}
 className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-blue-600 dark:text-blue-400 transition-colors border border-blue-200/60 dark:border-blue-800/60"
 >
 <ExternalLink className="w-4 h-4" />
 </a>
 )}
 </div>
 </div>
 </motion.div>
 );
};
