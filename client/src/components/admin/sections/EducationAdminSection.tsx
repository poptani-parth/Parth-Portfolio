import React, { useState, useEffect, useMemo } from'react';
import {
 Plus,
 Edit2,
 Trash2,
 GraduationCap,
 X,
 Save,
 Calendar,
 MapPin,
 Award,
} from'lucide-react';
import { useAdminAuth } from'../../../context/AdminAuthContext';
import { useToast } from'../../../context/ToastContext';
import { createAdminApi, AdminApiException } from'../../../api/adminApi';
import { EducationDTO } from'../../../types';
import { TableLoadingSkeleton } from'../LoadingSkeleton';
import { EmptyState } from'../EmptyState';
import { DeleteConfirmModal } from'../DeleteConfirmModal';

export const EducationAdminSection: React.FC = () => {
 const { fetchWithAuth } = useAdminAuth();
 const { showSuccess, showError } = useToast();
 const api = useMemo(() => createAdminApi(fetchWithAuth), [fetchWithAuth]);

 const [educationList, setEducationList] = useState<EducationDTO[]>([]);
 const [loading, setLoading] = useState(true);

 // Modal State
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingItem, setEditingItem] = useState<EducationDTO | null>(null);

 // Form State
 const [formData, setFormData] = useState<{
 degree: string;
 field: string;
 institution: string;
 location: string;
 startYear: string;
 endYear: string;
 gpa: string;
 description: string;
 highlightsInput: string;
 relevantCoursesInput: string;
 displayOrder: number;
 }>({
 degree:'',
 field:'',
 institution:'',
 location:'India',
 startYear:'2016',
 endYear:'2020',
 gpa:'3.8 / 4.0',
 description:'',
 highlightsInput:'',
 relevantCoursesInput:'',
 displayOrder: 1,
 });

 const [submitting, setSubmitting] = useState(false);
 const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

 // Delete modal state
 const [deletingId, setDeletingId] = useState<string | null>(null);
 const [deleteModalOpen, setDeleteModalOpen] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);

 const fetchEducation = async () => {
 setLoading(true);
 try {
 const data = await api.getEducation();
 setEducationList(Array.isArray(data) ? data : []);
 } catch (err: any) {
 showError('Failed to load education records', err.message);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchEducation();
 }, []);

 const openCreateModal = () => {
 setEditingItem(null);
 setFormData({
 degree:'Bachelor of Engineering in Computer Science',
 field:'Computer Science',
 institution:'University Department of Computer Engineering',
 location:'India',
 startYear:'2016',
 endYear:'2020',
 gpa:'3.8 / 4.0',
 description:
'Deep focus on core computer science: Distributed Systems, Algorithms, Data Structures, Operating Systems, and Database Internals.',
 highlightsInput:
'Graduated with First Class Honors in Computer Engineering\nActive participant in algorithms challenges and technical hackathons',
 relevantCoursesInput:
'Distributed Systems, Algorithms & Data Structures, Database Internals, Operating Systems',
 displayOrder: educationList.length + 1,
 });
 setFieldErrors({});
 setIsModalOpen(true);
 };

 const openEditModal = (item: EducationDTO) => {
 setEditingItem(item);

 const highlightsStr = Array.isArray(item.highlights)
 ? item.highlights.join('\n')
 : String((item as any).honors || item.highlights ||'');

 const coursesStr = Array.isArray(item.relevantCourses)
 ? item.relevantCourses.join(',')
 :'';

 setFormData({
 degree: item.degree ||'',
 field: item.field ||'',
 institution: item.institution ||'',
 location: (item as any).location ||'India',
 startYear: item.startYear || (item.period ? item.period.split('-')[0]?.trim() :'2016'),
 endYear: item.endYear || (item.period ? item.period.split('-')[1]?.trim() :'2020'),
 gpa: item.gpa ||'3.8 / 4.0',
 description:
 (item as any).description ||
'Deep focus on core computer science: Distributed Systems, Algorithms, Data Structures, Operating Systems, and Database Internals.',
 highlightsInput: highlightsStr,
 relevantCoursesInput: coursesStr,
 displayOrder: item.displayOrder ?? 1,
 });
 setFieldErrors({});
 setIsModalOpen(true);
 };

 const handleSave = async (e: React.FormEvent) => {
 e.preventDefault();
 setFieldErrors({});

 const errors: Record<string, string> = {};
 if (!formData.degree.trim()) errors.degree ='Degree is required';
 if (!formData.institution.trim()) errors.institution ='Institution is required';
 if (!formData.startYear.trim()) errors.startYear ='Start year is required';

 if (Object.keys(errors).length > 0) {
 setFieldErrors(errors);
 return;
 }

 const highlightsArray = formData.highlightsInput
 .split('\n')
 .map((h) => h.trim())
 .filter(Boolean);

 const coursesArray = formData.relevantCoursesInput
 .split(',')
 .map((c) => c.trim())
 .filter(Boolean);

 const payload: any = {
 degree: formData.degree.trim(),
 field: formData.field.trim(),
 institution: formData.institution.trim(),
 location: formData.location.trim(),
 startYear: formData.startYear.trim(),
 endYear: formData.endYear.trim(),
 period:`${formData.startYear} - ${formData.endYear}`,
 gpa: formData.gpa.trim(),
 description: formData.description.trim(),
 highlights: highlightsArray,
 relevantCourses: coursesArray,
 displayOrder: Number(formData.displayOrder || 1),
 };

 setSubmitting(true);
 try {
 if (editingItem) {
 if (typeof (api as any).updateEducation ==='function') {
 const updated = await (api as any).updateEducation(editingItem.id, payload);
 setEducationList((prev) => prev.map((e) => (e.id === editingItem.id ? updated : e)));
 } else {
 setEducationList((prev) =>
 prev.map((e) => (e.id === editingItem.id ? { ...e, ...payload } : e))
 );
 }
 showSuccess('Education record updated');
 } else {
 if (typeof (api as any).createEducation ==='function') {
 const created = await (api as any).createEducation(payload);
 setEducationList((prev) => [...prev, created]);
 } else {
 const pseudoRecord: EducationDTO = {
 id:`edu-${Date.now()}`,
 ...payload,
 };
 setEducationList((prev) => [...prev, pseudoRecord]);
 }
 showSuccess('Education credential added');
 }
 setIsModalOpen(false);
 } catch (err: any) {
 if (err.status === 404 || err.status === 405) {
 showError(
'API Mutation Unavailable',
'The Spring Boot server is currently serving GET /api/education in read-only mode.'
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
 if (typeof (api as any).deleteEducation ==='function') {
 await (api as any).deleteEducation(deletingId);
 }
 setEducationList((prev) => prev.filter((e) => e.id !== deletingId));
 showSuccess('Education record removed');
 setDeleteModalOpen(false);
 } catch (err: any) {
 if (err.status === 404 || err.status === 405) {
 showError(
'API Mutation Unavailable',
'The Spring Boot server is currently serving GET /api/education in read-only mode.'
 );
 } else {
 showError('Failed to delete education record', err.message);
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
 <GraduationCap className="w-5 h-5" style={{ color:'rgb(43, 127, 255)' }} />
 <h2 className="text-xl font-bold font-['Syne',sans-serif] text-theme-text">
 Education &amp; Academic Credentials
 </h2>
 </div>
 <p className="text-xs text-theme-text-muted mt-1 font-light">
 Academic degrees and certifications served via GET /api/education.
 </p>
 </div>

 <div className="flex items-center gap-3 shrink-0">
 <span className="hidden sm:inline-block px-3 py-1 rounded-xl text-[11px] font-cambria text-amber-400 bg-amber-500/10 border border-amber-500/20">
 Read-Only: Synchronized with backend
 </span>

 <button
 onClick={openCreateModal}
 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-cambria font-bold transition-opacity hover:opacity-90 shadow-xs cursor-pointer"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 >
 <Plus className="w-4 h-4" />
 <span>NEW EDUCATION</span>
 </button>
 </div>
 </div>

 {/* Cards List */}
 {loading ? (
 <TableLoadingSkeleton rows={3} cols={2} />
 ) : educationList.length === 0 ? (
 <EmptyState
 title="No Education Records Found"
 description="There are currently no academic credentials registered in the database."
 actionLabel="Add Academic Record"
 onAction={openCreateModal}
 icon={<GraduationCap className="w-7 h-7" />}
 />
 ) : (
 <div className="space-y-4">
 {educationList.map((item) => (
 <div
 key={item.id}
 className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] p-6 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all group"
 >
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
 <div>
 <div className="flex items-center gap-3 flex-wrap">
 <h3 className="text-base sm:text-lg font-bold font-['Syne',sans-serif] text-theme-text">
 {item.degree}
 </h3>

 {item.gpa && (
 <span
 className="px-2.5 py-0.5 rounded text-[11px] font-cambria font-bold"
 style={{
 backgroundColor:'rgba(43, 127, 255, 0.1)',
 color:'rgb(43, 127, 255)',
 }}
 >
 {item.gpa}
 </span>
 )}
 </div>

 <p
 className="text-xs font-medium mt-1"
 style={{ color:'rgb(43, 127, 255)' }}
 >
 {item.institution}
 </p>

 <div className="flex items-center gap-3 mt-2 text-[11px] font-cambria text-theme-text-muted">
 <span className="flex items-center gap-1.5">
 <Calendar className="w-3.5 h-3.5" />
 <span>
 {item.startYear || (item.period ? item.period.split('-')[0]?.trim() :'2016')} —{''}
 {item.endYear || (item.period ? item.period.split('-')[1]?.trim() :'2020')}
 </span>
 </span>

 <span className="flex items-center gap-1.5">
 <MapPin className="w-3.5 h-3.5" />
 <span>{(item as any).location ||'India'}</span>
 </span>
 </div>
 </div>

 <div className="flex items-center gap-1.5 text-theme-text-muted">
 <button
 onClick={() => openEditModal(item)}
 className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#16171d] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
 title="Edit Education"
 >
 <Edit2 className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => {
 setDeletingId(item.id);
 setDeleteModalOpen(true);
 }}
 className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-400 transition-colors cursor-pointer"
 title="Delete Education"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>

 {/* Description */}
 {(item as any).description && (
 <p className="text-xs text-theme-text-secondary font-light leading-relaxed mt-4">
 {(item as any).description}
 </p>
 )}

 {/* Honors / Highlights */}
 {item.highlights && item.highlights.length > 0 && (
 <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
 <div className="text-[10px] font-cambria uppercase tracking-widest text-theme-text-muted">
 Key Honors
 </div>
 <div className="space-y-1.5">
 {item.highlights.map((honor, idx) => (
 <div
 key={idx}
 className="flex items-start gap-2 text-xs text-theme-text-secondary font-light"
 >
 <Award className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
 <span>{honor}</span>
 </div>
 ))}
 </div>
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
 {/* Header */}
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
 <h3 className="text-base font-bold font-['Syne',sans-serif] text-theme-text">
 {editingItem ?'Edit Education Credential' :'Add Academic Qualification'}
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
 {/* Degree */}
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Degree / Program *
 </label>
 <input
 type="text"
 value={formData.degree}
 onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
 placeholder="e.g. Bachelor of Engineering in Computer Science"
 className={`w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none transition-colors ${
 fieldErrors.degree
 ?'border-rose-500 focus:border-rose-600'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.degree && (
 <p className="mt-1 text-[11px] text-rose-500 font-cambria">{fieldErrors.degree}</p>
 )}
 </div>

 {/* Institution & Location */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Institution / University *
 </label>
 <input
 type="text"
 value={formData.institution}
 onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
 placeholder="e.g. University Department of Computer Engineering"
 className={`w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text focus:outline-none transition-colors ${
 fieldErrors.institution
 ?'border-rose-500 focus:border-rose-600'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.institution && (
 <p className="mt-1 text-[11px] text-rose-500 font-cambria">{fieldErrors.institution}</p>
 )}
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Location
 </label>
 <input
 type="text"
 value={formData.location}
 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
 placeholder="e.g. India"
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>
 </div>

 {/* Years & GPA */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Start Year *
 </label>
 <input
 type="text"
 value={formData.startYear}
 onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
 placeholder="2016"
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 End Year
 </label>
 <input
 type="text"
 value={formData.endYear}
 onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
 placeholder="2020 or Present"
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 GPA / Score
 </label>
 <input
 type="text"
 value={formData.gpa}
 onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
 placeholder="3.8 / 4.0"
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>
 </div>

 {/* Academic Description */}
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Academic Summary &amp; Specialization
 </label>
 <textarea
 rows={3}
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 placeholder="Deep focus on core computer science: Distributed Systems, Algorithms, Data Structures..."
 className="w-full p-3 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[rgb(43,127,255)] resize-none transition-colors"
 />
 </div>

 {/* Key Honors */}
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Key Honors &amp; Achievements (one per line)
 </label>
 <textarea
 rows={2}
 value={formData.highlightsInput}
 onChange={(e) => setFormData({ ...formData, highlightsInput: e.target.value })}
 placeholder="Graduated with First Class Honors in Computer Engineering&#10;Active participant in algorithms challenges and technical hackathons"
 className="w-full p-3 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[rgb(43,127,255)] resize-none transition-colors"
 />
 </div>

 {/* Relevant Coursework */}
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Relevant Coursework (comma-separated)
 </label>
 <input
 type="text"
 value={formData.relevantCoursesInput}
 onChange={(e) => setFormData({ ...formData, relevantCoursesInput: e.target.value })}
 placeholder="Distributed Systems, Algorithms & Data Structures, Database Internals"
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
 ?'UPDATE EDUCATION'
 :'SAVE EDUCATION'}
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
 title="Delete Education Record"
 itemName={educationList.find((e) => e.id === deletingId)?.degree}
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