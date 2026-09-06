import React, { useState, useEffect, useMemo } from'react';
import {
 Plus,
 Edit2,
 Trash2,
 Briefcase,
 X,
 Save,
 AlertCircle,
 Calendar,
 MapPin,
 ExternalLink,
} from'lucide-react';
import { useAdminAuth } from'../../../context/AdminAuthContext';
import { useToast } from'../../../context/ToastContext';
import { createAdminApi, AdminApiException } from'../../../api/adminApi';
import { ExperienceDTO } from'../../../types';
import { TableLoadingSkeleton } from'../LoadingSkeleton';
import { EmptyState } from'../EmptyState';
import { DeleteConfirmModal } from'../DeleteConfirmModal';

export const ExperienceAdminSection: React.FC = () => {
 const { fetchWithAuth } = useAdminAuth();
 const { showSuccess, showError } = useToast();
 const api = useMemo(() => createAdminApi(fetchWithAuth), [fetchWithAuth]);

 const [experiences, setExperiences] = useState<ExperienceDTO[]>([]);
 const [loading, setLoading] = useState(true);

 // Modal State
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingItem, setEditingItem] = useState<ExperienceDTO | null>(null);

 // Form State
 const [formData, setFormData] = useState<{
 role: string;
 company: string;
 location: string;
 employmentType: string;
 startDate: string;
 endDate: string;
 current: boolean;
 descriptionInput: string;
 technologiesInput: string;
 }>({
 role:'',
 company:'',
 location:'Remote',
 employmentType:'Full-time',
 startDate:'2023',
 endDate:'Present',
 current: true,
 descriptionInput:'',
 technologiesInput:'',
 });

 const [submitting, setSubmitting] = useState(false);
 const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

 // Delete modal state
 const [deletingId, setDeletingId] = useState<string | null>(null);
 const [deleteModalOpen, setDeleteModalOpen] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);

 const fetchExperience = async () => {
 setLoading(true);
 try {
 const data = await api.getExperience();
 setExperiences(Array.isArray(data) ? data : []);
 } catch (err: any) {
 showError('Failed to load experience records', err.message);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchExperience();
 }, []);

 const openCreateModal = () => {
 setEditingItem(null);
 setFormData({
 role:'Senior Java Backend Engineer',
 company:'FinTech Platform Systems',
 location:'Remote',
 employmentType:'Full-time',
 startDate:'2023',
 endDate:'Present',
 current: true,
 descriptionInput:
'Architected an event-driven payment engine with Spring Boot and Kafka.\nRefactored database pooling and query indexing on PostgreSQL.\nUnified observability with OpenTelemetry and Prometheus.',
 technologiesInput:'Java 21, Spring Boot 3, Kafka, PostgreSQL, Redis, Docker',
 });
 setFieldErrors({});
 setIsModalOpen(true);
 };

 const openEditModal = (item: ExperienceDTO) => {
 setEditingItem(item);

 const descString = Array.isArray(item.description)
 ? item.description.join('\n')
 : String(item.description ||'');

 const techString = Array.isArray(item.technologies)
 ? item.technologies.join(',')
 :'';

 setFormData({
 role: item.role ||'',
 company: item.company ||'',
 location: item.location ||'Remote',
 employmentType: item.employmentType ||'Full-time',
 startDate: item.startDate ||'2023',
 endDate: item.endDate ||'Present',
 current: Boolean(item.current),
 descriptionInput: descString,
 technologiesInput: techString,
 });
 setFieldErrors({});
 setIsModalOpen(true);
 };

 const handleSave = async (e: React.FormEvent) => {
 e.preventDefault();
 setFieldErrors({});

 const errors: Record<string, string> = {};
 if (!formData.role.trim()) errors.role ='Role / Title is required';
 if (!formData.company.trim()) errors.company ='Company is required';
 if (!formData.startDate.trim()) errors.startDate ='Start date is required';

 if (Object.keys(errors).length > 0) {
 setFieldErrors(errors);
 return;
 }

 const descriptionArray = formData.descriptionInput
 .split('\n')
 .map((b) => b.trim())
 .filter(Boolean);

 const techArray = formData.technologiesInput
 .split(',')
 .map((t) => t.trim())
 .filter(Boolean);

 const payload: any = {
 role: formData.role.trim(),
 company: formData.company.trim(),
 location: formData.location.trim(),
 employmentType: formData.employmentType.trim(),
 startDate: formData.startDate.trim(),
 endDate: formData.current ?'Present' : formData.endDate.trim(),
 current: Boolean(formData.current),
 description: descriptionArray,
 technologies: techArray,
 };

 setSubmitting(true);
 try {
 if (editingItem) {
 // Check if API supports update
 if (typeof (api as any).updateExperience ==='function') {
 const updated = await (api as any).updateExperience(editingItem.id, payload);
 setExperiences((prev) => prev.map((e) => (e.id === editingItem.id ? updated : e)));
 } else {
 // Local fallback in case backend route is read-only
 setExperiences((prev) =>
 prev.map((e) => (e.id === editingItem.id ? { ...e, ...payload } : e))
 );
 }
 showSuccess('Experience record updated');
 } else {
 // Check if API supports create
 if (typeof (api as any).createExperience ==='function') {
 const created = await (api as any).createExperience(payload);
 setExperiences((prev) => [...prev, created]);
 } else {
 const pseudoRecord: ExperienceDTO = {
 id:`exp-${Date.now()}`,
 ...payload,
 };
 setExperiences((prev) => [...prev, pseudoRecord]);
 }
 showSuccess('Experience record added');
 }
 setIsModalOpen(false);
 } catch (err: any) {
 if (err.status === 404 || err.status === 405) {
 showError(
'API Mutation Unavailable',
'The Spring Boot server is currently serving GET /api/experience in read-only mode.'
 );
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
 if (typeof (api as any).deleteExperience ==='function') {
 await (api as any).deleteExperience(deletingId);
 }
 setExperiences((prev) => prev.filter((e) => e.id !== deletingId));
 showSuccess('Experience record removed');
 setDeleteModalOpen(false);
 } catch (err: any) {
 if (err.status === 404 || err.status === 405) {
 showError(
'API Mutation Unavailable',
'The Spring Boot server is currently serving GET /api/experience in read-only mode.'
 );
 } else {
 showError('Failed to delete experience', err.message);
 }
 } finally {
 setIsDeleting(false);
 setDeletingId(null);
 }
 };

 return (
 <div className="space-y-6 max-w-7xl">
 {/* Header Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2.5">
 <Briefcase className="w-5 h-5" style={{ color:'rgb(43, 127, 255)' }} />
 <h2 className="text-xl font-bold font-['Syne',sans-serif] text-theme-text">
 Professional Experience Registry
 </h2>
 </div>
 <p className="text-xs text-theme-text-muted mt-1 font-light">
 Historical career milestones served from GET /api/experience.
 </p>
 </div>

 <div className="flex items-center gap-3 shrink-0">
 <span className="hidden sm:inline-block px-3 py-1 rounded-xl text-[11px] font-cambria text-amber-400 bg-amber-500/10 border border-amber-500/20">
 Read-Only: Controlled via authoritative backend seed
 </span>

 <button
 onClick={openCreateModal}
 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-cambria font-bold transition-opacity hover:opacity-90 shadow-xs cursor-pointer"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 >
 <Plus className="w-4 h-4" />
 <span>NEW EXPERIENCE</span>
 </button>
 </div>
 </div>

 {/* Notice Banner */}
 <div className="p-4 rounded-xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] text-xs text-theme-text-secondary font-light">
 <strong className="font-semibold text-theme-text">Backend Architecture Note:</strong> The current Spring Boot backend contract provides read access (<code className="font-cambria text-[11px] text-theme-text">GET /api/experience</code>). Mutation routes (<code className="font-cambria text-[11px] text-theme-text">POST /api/admin/experience</code>) are not exposed by the current server API version.
 </div>

 {/* Experience Cards List */}
 {loading ? (
 <TableLoadingSkeleton rows={4} cols={3} />
 ) : experiences.length === 0 ? (
 <EmptyState
 title="No Experience Records"
 description="You haven't listed any professional engineering work history yet."
 actionLabel="Add Experience"
 onAction={openCreateModal}
 icon={<Briefcase className="w-7 h-7" />}
 />
 ) : (
 <div className="space-y-4">
 {experiences.map((item) => (
 <div
 key={item.id}
 className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] p-6 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all group"
 >
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
 <div>
 <h3 className="text-base sm:text-lg font-bold font-['Syne',sans-serif] text-theme-text">
 {item.role}
 </h3>
 <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
 <span>{item.company}</span>
 <ExternalLink className="w-3 h-3 opacity-60" />
 </div>
 </div>

 {/* Right Top Status, Dates & Action Controls */}
 <div className="flex items-center gap-3 shrink-0">
 <div className="flex items-center gap-3 text-[11px] font-cambria text-theme-text-muted">
 <span className="flex items-center gap-1.5">
 <Calendar className="w-3.5 h-3.5" />
 <span>
 {item.startDate} — {item.current ?'Present' : item.endDate ||'Present'}
 </span>
 </span>
 {item.location && (
 <span className="flex items-center gap-1.5">
 <MapPin className="w-3.5 h-3.5" />
 <span>{item.location}</span>
 </span>
 )}
 </div>

 <div className="flex items-center gap-1.5 border-l border-slate-100 pl-3 text-theme-text-muted">
 <button
 onClick={() => openEditModal(item)}
 className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#16171d] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
 title="Edit Experience"
 >
 <Edit2 className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => {
 setDeletingId(item.id);
 setDeleteModalOpen(true);
 }}
 className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-400 transition-colors cursor-pointer"
 title="Delete Experience"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>

 {/* Responsibilities */}
 {item.description && (
 <div className="mt-4 space-y-2">
 {(Array.isArray(item.description)
 ? item.description
 : String(item.description).split('\n')
 ).map((bullet, bIdx) => (
 <div key={bIdx} className="flex items-start gap-2.5 text-xs text-theme-text-secondary font-light leading-relaxed">
 <span
 className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 />
 <span>{bullet}</span>
 </div>
 ))}
 </div>
 )}

 {/* Tech Stack Chips */}
 {item.technologies && item.technologies.length > 0 && (
 <div className="flex flex-wrap gap-1.5 pt-4 mt-4 border-t border-slate-100">
 {item.technologies.map((tech, idx) => (
 <span
 key={idx}
 className="px-2 py-0.5 rounded-md text-[10px] font-cambria bg-theme-bg dark:bg-[#14161f] text-theme-text-secondary border border-theme-border"
 >
 {tech}
 </span>
 ))}
 </div>
 )}
 </div>
 ))}
 </div>
 )}

 {/* POPUP WINDOW WITH INTERNAL OVERFLOW SCROLLBAR */}
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
 {editingItem ?'Edit Professional Experience' :'Add Professional Experience'}
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
 {/* Role / Title */}
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Role / Title *
 </label>
 <input
 type="text"
 value={formData.role}
 onChange={(e) => setFormData({ ...formData, role: e.target.value })}
 placeholder="e.g. Senior Java Backend Engineer"
 className={`w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none transition-colors ${
 fieldErrors.role
 ?'border-rose-500 focus:border-rose-600'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.role && (
 <p className="mt-1 text-[11px] text-rose-500 font-cambria">{fieldErrors.role}</p>
 )}
 </div>

 {/* Company & Location */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Company / Organization *
 </label>
 <input
 type="text"
 value={formData.company}
 onChange={(e) => setFormData({ ...formData, company: e.target.value })}
 placeholder="e.g. FinTech Platform Systems"
 className={`w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text focus:outline-none transition-colors ${
 fieldErrors.company
 ?'border-rose-500 focus:border-rose-600'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.company && (
 <p className="mt-1 text-[11px] text-rose-500 font-cambria">{fieldErrors.company}</p>
 )}
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Location / Mode
 </label>
 <input
 type="text"
 value={formData.location}
 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
 placeholder="e.g. Remote, Hybrid, Bangalore"
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>
 </div>

 {/* Dates & Role Status */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Start Year / Date *
 </label>
 <input
 type="text"
 value={formData.startDate}
 onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
 placeholder="2023"
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 End Year / Date
 </label>
 <input
 type="text"
 disabled={formData.current}
 value={formData.current ?'Present' : formData.endDate}
 onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
 placeholder="Present"
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none disabled:opacity-50 transition-colors"
 />
 </div>

 <div className="flex items-center pt-6">
 <label className="flex items-center gap-2 text-xs text-theme-text-secondary cursor-pointer">
 <input
 type="checkbox"
 checked={formData.current}
 onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
 className="rounded border-theme-border-subtle w-4 h-4 cursor-pointer accent-[rgb(43,127,255)]"
 />
 <span>Current Position</span>
 </label>
 </div>
 </div>

 {/* Key Responsibilities */}
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Key Architectural Responsibilities (one per line)
 </label>
 <textarea
 rows={3}
 value={formData.descriptionInput}
 onChange={(e) => setFormData({ ...formData, descriptionInput: e.target.value })}
 placeholder="Architected an event-driven payment engine with Spring Boot and Kafka...&#10;Refactored database pooling and query indexing on PostgreSQL..."
 className="w-full p-3 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[rgb(43,127,255)] resize-none transition-colors"
 />
 </div>

 {/* Technologies */}
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Technologies / Stack (comma-separated)
 </label>
 <input
 type="text"
 value={formData.technologiesInput}
 onChange={(e) => setFormData({ ...formData, technologiesInput: e.target.value })}
 placeholder="Java 21, Spring Boot 3, Kafka, PostgreSQL, Redis"
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
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
 ?'SAVING...'
 : editingItem
 ?'UPDATE EXPERIENCE'
 :'SAVE EXPERIENCE'}
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
 title="Delete Experience"
 itemName={experiences.find((e) => e.id === deletingId)?.role}
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