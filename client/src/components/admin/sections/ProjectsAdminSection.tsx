import React, { useState, useEffect, useMemo } from'react';
import {
 Plus,
 Edit2,
 Trash2,
 Search,
 X,
 Layers,
 ExternalLink,
 Github,
 Star,
 Save,
 CheckCircle2,
 Eye,
} from'lucide-react';
import { useAdminAuth } from'../../../context/AdminAuthContext';
import { useToast } from'../../../context/ToastContext';
import { createAdminApi, AdminApiException } from'../../../api/adminApi';
import { ProjectDTO } from'../../../types';
import { TableLoadingSkeleton } from'../LoadingSkeleton';
import { EmptyState } from'../EmptyState';
import { DeleteConfirmModal } from'../DeleteConfirmModal';

const SAFE_URL_REGEX = /^(https?:\/\/|mailto:|tel:|\/)/i;

const validateSafeUrl = (url?: string): boolean => {
 if (!url || !url.trim()) return true;
 const trimmed = url.trim();
 if (/^(javascript|vbscript|data):/i.test(trimmed)) {
 return false;
 }
 return SAFE_URL_REGEX.test(trimmed);
};

export const ProjectsAdminSection: React.FC = () => {
 const { fetchWithAuth } = useAdminAuth();
 const { showSuccess, showError } = useToast();
 const api = useMemo(() => createAdminApi(fetchWithAuth), [fetchWithAuth]);

 const [projects, setProjects] = useState<ProjectDTO[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');

 // Modals
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingProject, setEditingProject] = useState<ProjectDTO | null>(null);
 const [inspectingProject, setInspectingProject] = useState<ProjectDTO | null>(null);

 // Form State
 const [formData, setFormData] = useState<{
 title: string;
 category: string;
 architecturalRole: string;
 description: string;
 technologiesInput: string;
 keyFeaturesInput: string;
 githubUrl: string;
 liveDemoUrl: string;
 displayOrder: number;
 featured: boolean;
 active: boolean;
 }>({
 title:'',
 category:'Distributed Systems',
 architecturalRole:'Backend Architect',
 description:'',
 technologiesInput:'Java, Spring Boot, PostgreSQL',
 keyFeaturesInput:'',
 githubUrl:'',
 liveDemoUrl:'',
 displayOrder: 1,
 featured: false,
 active: true,
 });

 const [submitting, setSubmitting] = useState(false);
 const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

 // Delete modal state
 const [deletingId, setDeletingId] = useState<string | null>(null);
 const [deleteModalOpen, setDeleteModalOpen] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);

 const fetchProjects = async () => {
 setLoading(true);
 try {
 const data = await api.getProjects();
 setProjects(Array.isArray(data) ? data : []);
 } catch (err: any) {
 showError('Failed to load projects', err.message);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchProjects();
 }, []);

 const openCreateModal = () => {
 setEditingProject(null);
 setFormData({
 title:'',
 category:'Distributed Systems',
 architecturalRole:'Backend Architect',
 description:'',
 technologiesInput:'Java 21, Spring Boot 3, Kafka, Redis, PostgreSQL',
 keyFeaturesInput:'Sub-50ms p99 response time\nDistributed saga pattern for transaction rollback',
 githubUrl:'https://github.com/poptani-parth',
 liveDemoUrl:'',
 displayOrder: projects.length + 1,
 featured: true,
 active: true,
 });
 setFieldErrors({});
 setIsModalOpen(true);
 };

 const openEditModal = (project: ProjectDTO) => {
 setEditingProject(project);

 const techString = Array.isArray(project.technologies)
 ? project.technologies.join(',')
 :'';

 const featuresString = Array.isArray((project as any).keyFeatures)
 ? (project as any).keyFeatures.join('\n')
 :'';

 setFormData({
 title: project.title ||'',
 category: project.category ||'Distributed Systems',
 architecturalRole: (project as any).role || (project as any).architecturalRole ||'Backend Architect',
 description: project.description ||'',
 technologiesInput: techString,
 keyFeaturesInput: featuresString,
 githubUrl: project.githubUrl ||'',
 liveDemoUrl: (project as any).liveDemoUrl || (project as any).liveUrl ||'',
 displayOrder: project.displayOrder ?? 1,
 featured: project.featured ?? false,
 active: project.active ?? true,
 });
 setFieldErrors({});
 setIsModalOpen(true);
 };

 const handleSave = async (e: React.FormEvent) => {
 e.preventDefault();
 setFieldErrors({});

 const errors: Record<string, string> = {};
 if (!formData.title.trim()) errors.title ='Project Title is required';
 if (!formData.category.trim()) errors.category ='Category is required';
 if (!formData.description.trim()) errors.description ='Architecture Overview is required';

 const techArray = formData.technologiesInput
 .split(',')
 .map((t) => t.trim())
 .filter(Boolean);

 if (techArray.length === 0) {
 errors.technologiesInput ='Provide at least one technology';
 }

 if (!validateSafeUrl(formData.githubUrl)) {
 errors.githubUrl ='Unsafe URL protocol detected';
 }
 if (!validateSafeUrl(formData.liveDemoUrl)) {
 errors.liveDemoUrl ='Unsafe URL protocol detected';
 }

 if (Object.keys(errors).length > 0) {
 setFieldErrors(errors);
 return;
 }

 const keyFeaturesArray = formData.keyFeaturesInput
 .split('\n')
 .map((f) => f.trim())
 .filter(Boolean);

 const payload: any = {
 title: formData.title.trim(),
 category: formData.category.trim(),
 description: formData.description.trim(),
 technologies: techArray,
 githubUrl: formData.githubUrl.trim(),
 liveUrl: formData.liveDemoUrl.trim(),
 displayOrder: Number(formData.displayOrder || 1),
 featured: Boolean(formData.featured),
 active: Boolean(formData.active),
 keyFeatures: keyFeaturesArray,
 architecturalRole: formData.architecturalRole.trim(),
 };

 setSubmitting(true);
 try {
 if (editingProject) {
 const updated = await api.updateProject(editingProject.id, payload);
 setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? updated : p)));
 showSuccess('Project updated successfully');
 } else {
 const created = await api.createProject(payload);
 setProjects((prev) => [created, ...prev]);
 showSuccess('Project published successfully');
 }
 setIsModalOpen(false);
 } catch (err: any) {
 if (err.status === 404) {
 showError('Not found — it may have been deleted');
 fetchProjects();
 setIsModalOpen(false);
 } else if (err instanceof AdminApiException && err.fieldErrors) {
 setFieldErrors(err.fieldErrors);
 } else {
 showError('Operation failed', err.message);
 }
 } finally {
 setSubmitting(false);
 }
 };

 const handleDeleteConfirm = async () => {
 if (!deletingId) return;
 setIsDeleting(true);
 try {
 await api.deleteProject(deletingId);
 setProjects((prev) => prev.filter((p) => p.id !== deletingId));
 showSuccess('Project deleted successfully');
 setDeleteModalOpen(false);
 } catch (err: any) {
 if (err.status === 404) {
 showError('Not found — it may have been deleted');
 fetchProjects();
 setDeleteModalOpen(false);
 } else {
 showError('Failed to delete project', err.message);
 }
 } finally {
 setIsDeleting(false);
 setDeletingId(null);
 }
 };

 const filteredProjects = useMemo(() => {
 const q = searchQuery.toLowerCase().trim();
 if (!q) return projects;
 return projects.filter(
 (p) =>
 p.title.toLowerCase().includes(q) ||
 p.category.toLowerCase().includes(q) ||
 p.technologies.some((t) => t.toLowerCase().includes(q))
 );
 }, [projects, searchQuery]);

 return (
 <div className="space-y-6 max-w-7xl">
 {/* Header Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2.5">
 <Layers className="w-5 h-5" style={{ color:'rgb(43, 127, 255)' }} />
 <h2 className="text-xl font-bold font-['Syne',sans-serif] text-theme-text">
 Projects &amp; System Architectures
 </h2>
 </div>
 <p className="text-xs text-theme-text-muted mt-1 font-light">
 Manage production system designs, technical case studies, and code repositories.
 </p>
 </div>

 <button
 onClick={openCreateModal}
 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-cambria font-bold transition-opacity hover:opacity-90 shadow-xs cursor-pointer shrink-0"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 >
 <Plus className="w-4 h-4" />
 <span>NEW PROJECT</span>
 </button>
 </div>

 {/* Search Bar */}
 <div className="relative w-full">
 <Search className="w-4 h-4 text-theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search by project name or domain..."
 className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-theme-bg dark:bg-[#0c0d10] border border-theme-border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 {searchQuery && (
 <button
 onClick={() => setSearchQuery('')}
 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-theme-text-muted hover:text-white"
 >
 <X className="w-3.5 h-3.5" />
 </button>
 )}
 </div>

 {/* Grid Canvas */}
 {loading ? (
 <TableLoadingSkeleton rows={4} cols={2} />
 ) : filteredProjects.length === 0 ? (
 <EmptyState
 title="No Projects Found"
 description="There are currently no architecture projects matching your filter criteria."
 actionLabel="Publish Project"
 onAction={openCreateModal}
 icon={<Layers className="w-7 h-7" />}
 />
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {filteredProjects.map((project) => (
 <div
 key={project.id}
 onClick={() => setInspectingProject(project)}
 className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-md transition-all cursor-pointer group"
 >
 <div>
 {/* Card Top Row: Category + Badges + Action Buttons */}
 <div className="flex items-center justify-between gap-3 mb-3">
 <div className="flex items-center gap-2 flex-wrap">
 <span
 className="px-2 py-0.5 rounded text-[10px] font-cambria font-bold uppercase tracking-wider"
 style={{
 backgroundColor:'rgba(43, 127, 255, 0.1)',
 color:'rgb(43, 127, 255)',
 }}
 >
 {project.category}
 </span>

 {project.featured && (
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-cambria font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
 <Star className="w-2.5 h-2.5 fill-current" />
 <span>Featured</span>
 </span>
 )}
 </div>

 <div className="flex items-center gap-1.5 text-theme-text-muted">
 <button
 onClick={(e) => {
 e.stopPropagation();
 openEditModal(project);
 }}
 className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#16171d] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
 title="Edit Project"
 >
 <Edit2 className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={(e) => {
 e.stopPropagation();
 setDeletingId(project.id);
 setDeleteModalOpen(true);
 }}
 className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-400 transition-colors cursor-pointer"
 title="Delete Project"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>

 {/* Project Title */}
 <h3 className="text-base sm:text-lg font-bold font-['Syne',sans-serif] text-theme-text mb-2 group-hover:text-[rgb(43,127,255)] transition-colors">
 {project.title}
 </h3>

 {/* Description */}
 <p className="text-xs text-theme-text-secondary font-light leading-relaxed mb-5 line-clamp-2">
 {project.description}
 </p>

 {/* Tech Chips */}
 <div className="flex flex-wrap gap-1.5 mb-5">
 {project.technologies.slice(0, 5).map((tech, idx) => (
 <span
 key={idx}
 className="px-2 py-1 rounded-md text-[10px] font-cambria bg-theme-bg dark:bg-[#14161f] text-theme-text-secondary border border-theme-border"
 >
 {tech}
 </span>
 ))}
 {project.technologies.length > 5 && (
 <span className="px-1.5 py-1 text-[10px] font-cambria text-theme-text-muted self-center">
 +{project.technologies.length - 5}
 </span>
 )}
 </div>
 </div>

 {/* Bottom Card Footer: Order & Links */}
 <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
 <span className="font-cambria text-[11px] text-theme-text-muted">
 Order: #{project.displayOrder ?? 1}
 </span>

 <div className="flex items-center gap-2">
 {project.githubUrl && (
 <a
 href={project.githubUrl}
 target="_blank"
 rel="noopener noreferrer"
 onClick={(e) => e.stopPropagation()}
 className="p-1.5 text-theme-text-muted hover:text-slate-900 dark:hover:text-white transition-colors"
 title="GitHub"
 >
 <Github className="w-3.5 h-3.5" />
 </a>
 )}
 {(project.liveUrl || (project as any).liveDemoUrl) && (
 <a
 href={project.liveUrl || (project as any).liveDemoUrl}
 target="_blank"
 rel="noopener noreferrer"
 onClick={(e) => e.stopPropagation()}
 className="p-1.5 text-theme-text-muted hover:text-slate-900 dark:hover:text-white transition-colors"
 title="Live System"
 >
 <ExternalLink className="w-3.5 h-3.5" />
 </a>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* 1. PROJECT SPECIFICATION / INFORMATION INSPECTOR POPUP */}
 {inspectingProject && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
 <div
 className="fixed inset-0 bg-black/75 backdrop-blur-xs"
 onClick={() => setInspectingProject(null)}
 />

 <div className="relative w-full max-w-2xl bg-theme-card dark:bg-[#0c0d10] rounded-2xl border border-theme-border shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden">
 {/* Header */}
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
 <div className="flex items-center gap-2">
 <span
 className="px-2 py-0.5 rounded text-[10px] font-cambria font-bold uppercase tracking-wider"
 style={{
 backgroundColor:'rgba(43, 127, 255, 0.1)',
 color:'rgb(43, 127, 255)',
 }}
 >
 {inspectingProject.category}
 </span>
 <span className="text-[11px] font-cambria text-theme-text-muted">
 Specification Inspector
 </span>
 </div>
 <button
 onClick={() => setInspectingProject(null)}
 className="text-theme-text-muted hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Scrollable Inspector Body */}
 <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
 {/* Title & Status */}
 <div>
 <div className="flex items-center gap-2 mb-1">
 <h2 className="text-xl sm:text-2xl font-bold font-['Syne',sans-serif] text-theme-text">
 {inspectingProject.title}
 </h2>
 </div>
 <div className="flex items-center gap-2 text-[11px] font-cambria text-theme-text-muted">
 <span>Role: {(inspectingProject as any).architecturalRole || (inspectingProject as any).role ||'Backend Architect'}</span>
 <span>•</span>
 <span>Order: #{inspectingProject.displayOrder ?? 1}</span>
 <span>•</span>
 <span className={inspectingProject.active !== false ?'text-[rgb(43,127,255)]' :'text-zinc-500'}>
 {inspectingProject.active !== false ?'Active & Visible' :'Hidden'}
 </span>
 </div>
 </div>

 {/* Architecture Overview */}
 <div className="space-y-1.5">
 <div className="text-[10px] font-cambria uppercase tracking-widest text-theme-text-muted font-bold">
 Architecture Overview
 </div>
 <div className="p-4 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text-secondary leading-relaxed font-light">
 {inspectingProject.description}
 </div>
 </div>

 {/* Technologies */}
 <div className="space-y-1.5">
 <div className="text-[10px] font-cambria uppercase tracking-widest text-theme-text-muted font-bold">
 Technologies &amp; Protocols
 </div>
 <div className="flex flex-wrap gap-1.5">
 {inspectingProject.technologies?.map((tech, idx) => (
 <span
 key={idx}
 className="px-2.5 py-1 rounded-lg text-xs font-cambria bg-theme-bg dark:bg-[#14161f] text-theme-text border border-theme-border"
 >
 {tech}
 </span>
 ))}
 </div>
 </div>

 {/* Key Features (if available) */}
 {Array.isArray((inspectingProject as any).keyFeatures) && (inspectingProject as any).keyFeatures.length > 0 && (
 <div className="space-y-1.5">
 <div className="text-[10px] font-cambria uppercase tracking-widest text-theme-text-muted font-bold">
 Key Technical Features
 </div>
 <div className="p-4 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border space-y-2">
 {(inspectingProject as any).keyFeatures.map((feat: string, idx: number) => (
 <div key={idx} className="flex items-start gap-2 text-xs text-theme-text-secondary font-cambria">
 <CheckCircle2 className="w-3.5 h-3.5 text-[rgb(43,127,255)] shrink-0 mt-0.5" />
 <span>{feat}</span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Endpoints & Links */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
 <div className="p-3 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs">
 <span className="text-[10px] font-cambria text-theme-text-muted block mb-1">
 GITHUB REPOSITORY
 </span>
 {inspectingProject.githubUrl ? (
 <a
 href={inspectingProject.githubUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="text-[rgb(43,127,255)] hover:underline flex items-center gap-1.5 truncate font-cambria text-[11px]"
 >
 <Github className="w-3.5 h-3.5 shrink-0" />
 <span className="truncate">{inspectingProject.githubUrl}</span>
 </a>
 ) : (
 <span className="text-theme-text-muted font-cambria text-[11px]">—</span>
 )}
 </div>

 <div className="p-3 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs">
 <span className="text-[10px] font-cambria text-theme-text-muted block mb-1">
 LIVE SYSTEM / DOCS
 </span>
 {(inspectingProject.liveUrl || (inspectingProject as any).liveDemoUrl) ? (
 <a
 href={inspectingProject.liveUrl || (inspectingProject as any).liveDemoUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="text-[rgb(43,127,255)] hover:underline flex items-center gap-1.5 truncate font-cambria text-[11px]"
 >
 <ExternalLink className="w-3.5 h-3.5 shrink-0" />
 <span className="truncate">{inspectingProject.liveUrl || (inspectingProject as any).liveDemoUrl}</span>
 </a>
 ) : (
 <span className="text-theme-text-muted font-cambria text-[11px]">—</span>
 )}
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-theme-card dark:bg-[#0c0d10] shrink-0">
 <button
 type="button"
 onClick={() => setInspectingProject(null)}
 className="px-4 py-2 rounded-xl text-xs text-theme-text-secondary hover:text-slate-900 dark:hover:text-white"
 >
 Close
 </button>

 <button
 type="button"
 onClick={() => {
 const target = inspectingProject;
 setInspectingProject(null);
 openEditModal(target);
 }}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-cambria font-bold transition-opacity hover:opacity-90 shadow-xs cursor-pointer"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 >
 <Edit2 className="w-3.5 h-3.5" />
 <span>EDIT SPECIFICATION</span>
 </button>
 </div>
 </div>
 </div>
 )}

 {/* 2. CREATE / EDIT POPUP MODAL */}
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
 <div
 className="fixed inset-0 bg-black/75 backdrop-blur-xs"
 onClick={() => setIsModalOpen(false)}
 />

 <div className="relative w-full max-w-2xl bg-theme-card dark:bg-[#0c0d10] rounded-2xl border border-theme-border shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden">
 {/* Modal Fixed Header */}
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
 <h3 className="text-base font-bold font-['Syne',sans-serif] text-theme-text">
 {editingProject ?'Edit Architecture Case Study' :'Publish Architecture Case Study'}
 </h3>
 <button
 onClick={() => setIsModalOpen(false)}
 className="text-theme-text-muted hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Scrollable Form Body Box */}
 <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
 <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Project Title *
 </label>
 <input
 type="text"
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 placeholder="e.g. Distributed Order Engine"
 className={`w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none transition-colors ${
 fieldErrors.title
 ?'border-rose-500 focus:border-rose-600'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.title && (
 <p className="mt-1 text-[11px] text-rose-500 font-cambria">{fieldErrors.title}</p>
 )}
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Category *
 </label>
 <input
 type="text"
 value={formData.category}
 onChange={(e) => setFormData({ ...formData, category: e.target.value })}
 placeholder="Distributed Systems"
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Architectural Role
 </label>
 <input
 type="text"
 value={formData.architecturalRole}
 onChange={(e) => setFormData({ ...formData, architecturalRole: e.target.value })}
 placeholder="Backend Architect"
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Architecture Overview / Description *
 </label>
 <textarea
 rows={3}
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 placeholder="Explain the problem space, architectural trade-offs, and throughput metrics..."
 className={`w-full p-3 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none resize-none transition-colors ${
 fieldErrors.description
 ?'border-rose-500 focus:border-rose-600'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.description && (
 <p className="mt-1 text-[11px] text-rose-500 font-cambria">{fieldErrors.description}</p>
 )}
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Technologies (comma-separated)
 </label>
 <input
 type="text"
 value={formData.technologiesInput}
 onChange={(e) => setFormData({ ...formData, technologiesInput: e.target.value })}
 placeholder="Java, Spring Boot, PostgreSQL"
 className={`w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none transition-colors ${
 fieldErrors.technologiesInput
 ?'border-rose-500'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.technologiesInput && (
 <p className="mt-1 text-[11px] text-rose-500 font-cambria">{fieldErrors.technologiesInput}</p>
 )}
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Key Technical Features (one per line)
 </label>
 <textarea
 rows={2}
 value={formData.keyFeaturesInput}
 onChange={(e) => setFormData({ ...formData, keyFeaturesInput: e.target.value })}
 placeholder="Sub-50ms p99 response time&#10;Distributed saga pattern for transaction rollback"
 className="w-full p-3 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[rgb(43,127,255)] resize-none transition-colors font-cambria"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 GitHub URL
 </label>
 <input
 type="url"
 value={formData.githubUrl}
 onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
 placeholder="https://github.com/..."
 className={`w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none transition-colors ${
 fieldErrors.githubUrl
 ?'border-rose-500'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.githubUrl && (
 <p className="mt-1 text-[11px] text-rose-500 font-cambria">{fieldErrors.githubUrl}</p>
 )}
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Live Demo / Docs URL
 </label>
 <input
 type="url"
 value={formData.liveDemoUrl}
 onChange={(e) => setFormData({ ...formData, liveDemoUrl: e.target.value })}
 placeholder="https://..."
 className={`w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none transition-colors ${
 fieldErrors.liveDemoUrl
 ?'border-rose-500'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.liveDemoUrl && (
 <p className="mt-1 text-[11px] text-rose-500 font-cambria">{fieldErrors.liveDemoUrl}</p>
 )}
 </div>
 </div>

 <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
 <div className="flex items-center gap-5">
 <label className="flex items-center gap-2 text-xs text-theme-text-secondary cursor-pointer">
 <input
 type="checkbox"
 checked={formData.featured}
 onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
 className="rounded border-theme-border-subtle w-4 h-4 cursor-pointer accent-[rgb(43,127,255)]"
 />
 <span>Featured Project</span>
 </label>

 <label className="flex items-center gap-2 text-xs text-theme-text-secondary cursor-pointer">
 <input
 type="checkbox"
 checked={formData.active}
 onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
 className="rounded border-theme-border-subtle w-4 h-4 cursor-pointer accent-[rgb(43,127,255)]"
 />
 <span>Active &amp; Visible</span>
 </label>
 </div>

 <div className="flex items-center gap-2">
 <span className="text-xs text-theme-text-muted">Order:</span>
 <input
 type="number"
 min={1}
 value={formData.displayOrder}
 onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
 className="w-16 px-2 py-1 rounded-lg bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-center text-theme-text focus:outline-none focus:border-[rgb(43,127,255)]"
 />
 </div>
 </div>
 </div>

 {/* Modal Fixed Footer Bar */}
 <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-theme-card dark:bg-[#0c0d10] shrink-0">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="px-4 py-2 rounded-xl text-xs text-theme-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={submitting}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-cambria font-bold transition-opacity hover:opacity-90 shadow-xs cursor-pointer disabled:opacity-50"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 >
 {submitting ? (
 <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
 ) : (
 <Save className="w-3.5 h-3.5" />
 )}
 <span>
 {submitting
 ?'PUBLISHING...'
 : editingProject
 ?'UPDATE PROJECT'
 :'PUBLISH PROJECT'}
 </span>
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 <DeleteConfirmModal
 isOpen={deleteModalOpen}
 title="Delete Project"
 itemName={projects.find((p) => p.id === deletingId)?.title}
 isDeleting={isDeleting}
 onConfirm={handleDeleteConfirm}
 onCancel={() => {
 setDeleteModalOpen(false);
 setDeletingId(null);
 }}
 />
 </div>
 );
};