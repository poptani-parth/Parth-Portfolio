import React from'react';
import { useParams, Link } from'react-router-dom';
import {
 ArrowLeft,
 Github,
 CheckCircle2,
 AlertTriangle,
 Sparkles,
 ExternalLink
} from'lucide-react';
import { useProject } from'../hooks/usePortfolioData';

const sanitizeSafeUrl = (url?: string | null): string => {
 if (!url) return'#';
 const trimmed = url.trim();
 if (/^(javascript|vbscript|data):/i.test(trimmed)) {
 return'#';
 }
 return trimmed;
};

export const ProjectDetailPage: React.FC = () => {
 const { id } = useParams<{ id: string }>();
 const { data: project, isLoading } = useProject(id ||'');

 if (isLoading) {
 return (
 <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-theme-card transition-colors duration-200">
 <div className="text-center font-sans text-xs text-theme-text-muted uppercase tracking-widest">
 <div className="w-6 h-6 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
 <span>Fetching system specs...</span>
 </div>
 </div>
 );
 }

 if (!project) {
 return (
 <div className="min-h-screen pt-32 pb-20 max-w-3xl mx-auto px-4 text-center bg-theme-card transition-colors duration-200">
 <h1 className="text-2xl font-bold text-theme-text mb-4 font-['Syne',sans-serif]">System Spec Not Found</h1>
 <p className="text-theme-text-secondary text-sm mb-6 font-light">
 Looks like this project spec was moved or is currently being updated.
 </p>
 <Link
 to="/projects"
 className="px-5 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-cambria text-xs uppercase tracking-wider font-bold inline-flex items-center gap-2 shadow-xs"
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 <span>Return to Catalog</span>
 </Link>
 </div>
 );
 }

 const features = (project as any).features || project.keyFeatures || [];
 const safeGithubUrl = sanitizeSafeUrl(project.githubUrl);
 const liveUrl = (project as any).liveUrl || (project as any).liveDemoUrl;
 const safeLiveUrl = sanitizeSafeUrl(liveUrl);

 return (
 <div className="min-h-screen pt-28 pb-24 bg-theme-bg/50 transition-colors duration-200">
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
 {/* Navigation Breadcrumb */}
 <div className="flex items-center gap-3 text-xs font-sans text-theme-text-muted uppercase tracking-wider mb-8">
 <Link to="/projects" className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
 <ArrowLeft className="w-3.5 h-3.5" />
 <span>Catalog</span>
 </Link>
 <span>/</span>
 <span className="text-theme-text-secondary">{project.category}</span>
 <span>/</span>
 <span className="text-theme-text font-semibold truncate">{project.title}</span>
 </div>

 {/* Header Block */}
 <div className="bg-theme-card dark:bg-[#0e0e0e] border border-theme-border rounded-lg p-6 sm:p-10 mb-10 relative overflow-hidden shadow-xs">
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
 <div>
 <div className="flex items-center gap-3 mb-3">
 <span className="text-[10px] font-sans uppercase tracking-widest px-2.5 py-1 rounded bg-theme-bg dark:bg-[#161616] text-theme-text-secondary border border-theme-border">
 {project.category}
 </span>
 {project.featured && (
 <span className="text-[10px] font-sans uppercase tracking-widest px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 font-semibold flex items-center gap-1">
 <Sparkles className="w-2.5 h-2.5" />
 <span>Production Architecture</span>
 </span>
 )}
 </div>

 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-theme-text font-['Syne',sans-serif] tracking-tight mb-4">
 {project.title}
 </h1>

 <p className="text-theme-text-secondary text-base sm:text-lg leading-relaxed max-w-3xl font-light">
 {project.description}
 </p>
 </div>

 {/* Links */}
 <div className="flex flex-wrap items-center gap-3 shrink-0">
 {project.githubUrl && safeGithubUrl !=='#' && (
 <a
 href={safeGithubUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#141414] dark:hover:bg-[#1c1c1c] dark:hover:text-white border border-slate-800 font-cambria text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors shadow-xs"
 >
 <Github className="w-3.5 h-3.5" />
 <span>Explore Repository</span>
 </a>
 )}
 {liveUrl && safeLiveUrl !=='#' && (
 <a
 href={safeLiveUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-cambria text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors shadow-xs"
 >
 <ExternalLink className="w-3.5 h-3.5" />
 <span>Live System</span>
 </a>
 )}
 </div>
 </div>

 {/* Metrics Matrix */}
 {(project.metrics || []).length > 0 && (
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-theme-bg dark:bg-[#121212] p-5 rounded-lg border border-theme-border">
 {(project.metrics || []).map((m, idx) => (
 <div key={idx} className="space-y-0.5">
 <div className="text-xl sm:text-2xl font-bold text-theme-text font-sans">{m.value}</div>
 <div className="text-[10px] text-theme-text-muted uppercase tracking-wider font-sans">{m.label}</div>
 </div>
 ))}
 </div>
 )}

 {/* Tech stack */}
 <div className="mt-6 flex flex-wrap gap-1.5">
 {project.technologies?.map((t, idx) => (
 <span
 key={idx}
 className="text-[10px] font-sans bg-theme-bg dark:bg-[#161616] text-theme-text-secondary px-2.5 py-1 rounded border border-theme-border"
 >
 {t}
 </span>
 ))}
 </div>
 </div>

 {/* Content Layout */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
 <div className="lg:col-span-7 space-y-8">
 {/* Features Block */}
 {features.length > 0 && (
 <div className="bg-theme-card dark:bg-[#0e0e0e] border border-theme-border rounded-lg p-6 sm:p-8 shadow-xs">
 <h2 className="text-xl font-bold text-theme-text font-['Syne',sans-serif] mb-4 flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 <span>Key Capabilities &amp; Highlights</span>
 </h2>
 <div className="space-y-3">
 {features.map((feat: string, idx: number) => (
 <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-theme-text-secondary font-light">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
 <span className="leading-relaxed">{feat}</span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Challenges */}
 {(project.challenges || []).length > 0 && (
 <div className="bg-theme-card dark:bg-[#0e0e0e] border border-theme-border rounded-lg p-6 sm:p-8 shadow-xs">
 <h2 className="text-xl font-bold text-theme-text font-['Syne',sans-serif] mb-4 flex items-center gap-2">
 <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
 <span>Engineering Challenges &amp; Mitigations</span>
 </h2>
 <div className="space-y-3">
 {project.challenges?.map((chal, idx) => (
 <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-theme-text-secondary font-light">
 <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
 <span className="leading-relaxed">{chal}</span>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>

 <div className="lg:col-span-5 space-y-6">
 <div className="bg-slate-900 dark:bg-[#080808] border border-slate-800 rounded-lg p-5 font-sans text-xs text-slate-200 shadow-xs">
 <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-theme-text-muted">
 <span className="text-[10px] uppercase tracking-wider">GET /api/projects/{project.id}</span>
 <span className="text-emerald-400 text-[10px]">200 OK</span>
 </div>
 <pre className="text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-950/60 dark:bg-[#101010] rounded-md max-h-60 scrollbar-thin">
 {JSON.stringify(project, null, 2)}
 </pre>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};