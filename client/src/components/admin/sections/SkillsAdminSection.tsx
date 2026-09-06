import React, { useState, useEffect, useMemo } from'react';
import { Plus, Edit2, Trash2, Code2, X, Save, Search, Filter } from'lucide-react';
import { useAdminAuth } from'../../../context/AdminAuthContext';
import { useToast } from'../../../context/ToastContext';
import { createAdminApi, AdminApiException } from'../../../api/adminApi';
import { SkillDTO, SkillCategoryDTO } from'../../../types';
import { TableLoadingSkeleton } from'../LoadingSkeleton';
import { EmptyState } from'../EmptyState';
import { DeleteConfirmModal } from'../DeleteConfirmModal';

export const SkillsAdminSection: React.FC = () => {
 const { fetchWithAuth } = useAdminAuth();
 const { showSuccess, showError } = useToast();
 const api = useMemo(() => createAdminApi(fetchWithAuth), [fetchWithAuth]);

 const [skills, setSkills] = useState<SkillDTO[]>([]);
 const [categories, setCategories] = useState<SkillCategoryDTO[]>([]);
 const [loading, setLoading] = useState(true);

 const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingItem, setEditingItem] = useState<SkillDTO | null>(null);

 const [isBulkMode, setIsBulkMode] = useState(false);
 const [bulkSkills, setBulkSkills] = useState<Partial<SkillDTO>[]>([]);

 const [formData, setFormData] = useState<Partial<SkillDTO>>({
 name:'',
 category:'',
 displayOrder: 1,
 overview:'',
 knowledgePercentage: 85,
 yearsOfExperience: 2.0,
 active: true
 });

 const [submitting, setSubmitting] = useState(false);
 const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

 const [deletingId, setDeletingId] = useState<string | null>(null);
 const [deleteModalOpen, setDeleteModalOpen] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);

 const fetchData = async () => {
 setLoading(true);
 try {
 const [skillsData, catsData] = await Promise.all([
 api.getSkills(),
 api.getSkillCategories()
 ]);
 setSkills(Array.isArray(skillsData) ? skillsData : []);
 setCategories(Array.isArray(catsData) ? catsData : []);
 } catch (err: any) {
 showError('Failed to load skills', err.message);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchData();
 }, []);

 const openCreateModal = () => {
 setEditingItem(null);
 setFormData({
 name:'',
 category: categories[0]?.name ||'Language',
 displayOrder: skills.length + 1,
 overview:'',
 knowledgePercentage: 85,
 yearsOfExperience: 3,
 active: true
 });
 setFieldErrors({});
 setIsModalOpen(true);
 };

 const openEditModal = (item: SkillDTO) => {
 setEditingItem(item);
 setFormData({
 ...item,
 overview: item.overview ||'',
 knowledgePercentage: item.knowledgePercentage ?? 85,
 yearsOfExperience: item.yearsOfExperience ?? 2.0,
 displayOrder: item.displayOrder ?? 0,
 active: item.active ?? true
 });
 setFieldErrors({});
 setIsModalOpen(true);
 };

 const openBulkModal = () => {
 const emptyRow: Partial<SkillDTO> = {
 name:'',
 category: categories[0]?.name ||'',
 overview:'',
 yearsOfExperience: 0,
 knowledgePercentage: 0,
 displayOrder: 0,
 active: true
 };

 let initialData: Partial<SkillDTO>[] = [...skills];
 const rowsToAdd = 5 - initialData.length;
 for (let i = 0; i < rowsToAdd; i++) {
 initialData.push({ ...emptyRow });
 }

 setBulkSkills(initialData);
 setIsBulkMode(true);
 };

 const handleAddBulkRow = () => {
 setBulkSkills([
 ...bulkSkills,
 { name:'', category: categories[0]?.name ||'', overview:'', yearsOfExperience: 0, knowledgePercentage: 0, displayOrder: 0, active: true }
 ]);
 };

 const handleBulkChange = (index: number, field: string, value: any) => {
 const updated = [...bulkSkills];
 updated[index] = { ...updated[index], [field]: value };
 setBulkSkills(updated);
 };

 const handleSave = async (e: React.FormEvent) => {
 e.preventDefault();
 setFieldErrors({});

 const errors: Record<string, string> = {};
 if (!formData.name?.trim()) errors.name ='Skill name is required';
 if (!formData.category) errors.category ='Category selection is required';

 const isDuplicate = skills.some(s =>
 s.name.trim().toLowerCase() === formData.name?.trim().toLowerCase() &&
 s.id !== editingItem?.id
 );

 if (isDuplicate) {
 errors.name ='A skill with this name already exists!';
 }

 if (Object.keys(errors).length > 0) {
 setFieldErrors(errors);
 return;
 }

 setSubmitting(true);
 try {
 const payload = {
 name: formData.name!.trim(),
 category: formData.category!.trim(),
 displayOrder: Number(formData.displayOrder || 0),
 overview: formData.overview ||'',
 yearsOfExperience: Number(formData.yearsOfExperience || 0),
 knowledgePercentage: Number(formData.knowledgePercentage || 0),
 active: formData.active ?? true
 };

 if (editingItem) {
 const updated = await api.updateSkill(editingItem.id, payload);
 setSkills(prev => prev.map(s => (s.id === editingItem.id ? updated : s)));
 showSuccess('Skill updated successfully');
 } else {
 const created = await api.createSkill(payload);
 setSkills(prev => [...prev, created]);
 showSuccess('Skill created successfully');
 }
 setIsModalOpen(false);
 } catch (err: any) {
 if (err.status === 404) {
 showError('Not found — it may have been deleted');
 fetchData();
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

 const handleBulkSave = async () => {
 setSubmitting(true);
 try {
 const validSkills = bulkSkills.filter(s => s.name && s.name.trim() !=='');

 const names = validSkills.map(s => String(s.name).trim().toLowerCase());
 const uniqueNames = new Set(names);

 if (names.length !== uniqueNames.size) {
 showError('Duplicate Found','You have entered the same skill multiple times in the table.');
 setSubmitting(false);
 return;
 }

 const newSkills = validSkills
 .filter(s => !s.id)
 .map(skill => ({
 name: String(skill.name).trim(),
 category: String(skill.category).trim(),
 overview: String(skill.overview ||'').trim(),
 yearsOfExperience: Number(skill.yearsOfExperience || 0),
 knowledgePercentage: Number(skill.knowledgePercentage || 0),
 displayOrder: Number(skill.displayOrder || 0),
 active: skill.active ?? true
 }));

 const existingSkills = validSkills.filter(s => s.id);

 if (newSkills.length > 0) {
 await api.createBulkSkills(newSkills);
 }

 for (const skill of existingSkills) {
 const payload = {
 name: String(skill.name).trim(),
 category: String(skill.category).trim(),
 overview: String(skill.overview ||'').trim(),
 yearsOfExperience: Number(skill.yearsOfExperience || 0),
 knowledgePercentage: Number(skill.knowledgePercentage || 0),
 displayOrder: Number(skill.displayOrder || 0),
 active: skill.active ?? true
 };
 await api.updateSkill(skill.id!, payload);
 }

 showSuccess('All skills saved successfully!');
 setIsBulkMode(false);
 fetchData();
 } catch (err: any) {
 if (err.message && (err.message.toLowerCase().includes('exist') || err.message.toLowerCase().includes('duplicate'))) {
 showError('Duplicate Detected', err.message);
 } else {
 showError('Bulk save failed', err.message ||'An unexpected error occurred');
 }
 } finally {
 setSubmitting(false);
 }
 };

 const handleDeleteConfirm = async (): Promise<void> => {
 if (!deletingId) return;
 setIsDeleting(true);
 try {
 await api.deleteSkill(deletingId);
 setSkills(prev => prev.filter(s => s.id !== deletingId));
 showSuccess('Skill deleted successfully');
 setDeleteModalOpen(false);
 } catch (err: any) {
 showError('Failed to delete skill', err.message);
 } finally {
 setIsDeleting(false);
 setDeletingId(null);
 }
 };

 const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
 const typedName = e.target.value.trim().toLowerCase();
 if (!typedName) return;

 const isDuplicate = skills.some(s =>
 s.name.trim().toLowerCase() === typedName &&
 s.id !== editingItem?.id
 );

 if (isDuplicate) {
 setFieldErrors(prev => ({ ...prev, name:'A skill with this name already exists!' }));
 } else {
 setFieldErrors(prev => {
 const updated = { ...prev };
 delete updated.name;
 return updated;
 });
 }
 };

 const filteredSkills = useMemo(() => {
 return skills.filter(skill => {
 const matchesSearch =
 skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (skill.category && skill.category.toLowerCase().includes(searchQuery.toLowerCase()));

 const matchesCategory =
 selectedCategory ==='All Categories' ||
 skill.category?.toLowerCase() === selectedCategory.toLowerCase();

 return matchesSearch && matchesCategory;
 });
 }, [skills, searchQuery, selectedCategory]);

 const categoryFilterOptions = useMemo(() => {
 const existingCats = Array.from(new Set(skills.map(s => s.category).filter(Boolean)));
 const configuredCats = categories.map(c => c.name);
 const merged = Array.from(new Set([...configuredCats, ...existingCats]));
 return ['All Categories', ...merged];
 }, [skills, categories]);

 return (
 <div className="space-y-6 max-w-7xl">
 {/* Header Section */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2.5">
 <Code2 className="w-5 h-5" style={{ color:'rgb(43, 127, 255)' }} />
 <h2 className="text-xl font-bold font-['Syne',sans-serif] text-theme-text">
 Skills Management
 </h2>
 </div>
 <p className="text-xs text-theme-text-muted mt-1 font-light">
 Create, update, and organize technical proficiencies synchronized via Spring Boot REST APIs.
 </p>
 </div>

 <div className="flex items-center gap-2.5">
 <button
 onClick={openBulkModal}
 className="px-4 py-2 rounded-xl border border-theme-border bg-theme-card hover:bg-slate-50 dark:hover:bg-[#181920] text-theme-text-secondary text-xs font-cambria font-medium transition-colors cursor-pointer shadow-xs"
 >
 Bulk Manage
 </button>
 <button
 onClick={openCreateModal}
 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-cambria font-bold transition-opacity hover:opacity-90 shadow-xs cursor-pointer"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 >
 <Plus className="w-4 h-4" />
 <span>NEW SKILL</span>
 </button>
 </div>
 </div>

 {/* Filter & Search Bar */}
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className="relative flex-1 w-full">
 <Search className="w-4 h-4 text-theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search skills by name or category..."
 className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#0c0d10] border border-theme-border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>

 <div className="relative w-full sm:w-64 shrink-0">
 <select
 value={selectedCategory}
 onChange={(e) => setSelectedCategory(e.target.value)}
 className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-xl bg-theme-bg dark:bg-[#0c0d10] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors cursor-pointer"
 >
 {categoryFilterOptions.map(cat => (
 <option key={cat} value={cat} className="bg-theme-card dark:bg-[#0c0d10]">
 {cat}
 </option>
 ))}
 </select>
 <Filter className="w-3.5 h-3.5 text-theme-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
 </div>
 </div>

 {/* Table Container */}
 {loading ? (
 <TableLoadingSkeleton rows={6} cols={6} />
 ) : filteredSkills.length === 0 ? (
 <EmptyState
 title="No Skills Found"
 description="No skills match your current search or category filter."
 actionLabel="Add New Skill"
 onAction={openCreateModal}
 icon={<Code2 className="w-7 h-7" />}
 />
 ) : (
 <div className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] overflow-hidden shadow-xs">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-slate-100 text-[11px] font-cambria uppercase tracking-wider text-theme-text-muted">
 <th className="py-3.5 px-6 font-medium">Skill Name</th>
 <th className="py-3.5 px-4 font-medium">Category</th>
 <th className="py-3.5 px-6 font-medium">Proficiency</th>
 <th className="py-3.5 px-4 font-medium">Experience</th>
 <th className="py-3.5 px-4 font-medium">Order</th>
 <th className="py-3.5 px-4 font-medium">Status</th>
 <th className="py-3.5 px-6 text-right font-medium">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50 text-xs">
 {filteredSkills.map(skill => (
 <tr
 key={skill.id}
 className="hover:bg-slate-50/50 dark:hover:bg-[#121318]/60 transition-colors"
 >
 {/* Skill Name */}
 <td className="py-4 px-6">
 <span className="font-bold text-theme-text font-['Syne',sans-serif]">
 {skill.name}
 </span>
 </td>

 {/* Category */}
 <td className="py-4 px-4">
 <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-cambria bg-theme-bg dark:bg-[#14161f] text-theme-text-secondary border border-theme-border">
 {skill.category ||'General'}
 </span>
 </td>

 {/* Proficiency Bar */}
 <td className="py-4 px-6 min-w-[180px]">
 <div className="flex items-center gap-3">
 <div className="flex-1 h-1.5 bg-theme-bg dark:bg-[#16171d] rounded-full overflow-hidden">
 <div
 className="h-full rounded-full transition-all"
 style={{
 width:`${Math.min(100, Math.max(0, skill.knowledgePercentage || 0))}%`,
 backgroundColor:'rgb(43, 127, 255)'
 }}
 />
 </div>
 <span className="text-[11px] font-cambria text-theme-text-muted w-9 text-right">
 {skill.knowledgePercentage || 0}%
 </span>
 </div>
 </td>

 {/* Experience */}
 <td className="py-4 px-4 font-cambria text-theme-text-secondary">
 {skill.yearsOfExperience || 0}y
 </td>

 {/* Order */}
 <td className="py-4 px-4 font-cambria text-theme-text-muted">
 #{skill.displayOrder ?? 0}
 </td>

 {/* Status */}
 <td className="py-4 px-4">
 <span
 className={`text-[11px] font-cambria font-medium ${
 skill.active !== false
 ?'text-[rgb(43,127,255)]'
 :'text-zinc-500'
 }`}
 >
 {skill.active !== false ?'Active' :'Hidden'}
 </span>
 </td>

 {/* Actions */}
 <td className="py-4 px-6 text-right">
 <div className="flex items-center justify-end gap-2 text-theme-text-muted">
 <button
 onClick={() => openEditModal(skill)}
 className="p-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
 title="Edit Skill"
 >
 <Edit2 className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => {
 setDeletingId(skill.id);
 setDeleteModalOpen(true);
 }}
 className="p-1.5 hover:text-rose-400 transition-colors cursor-pointer"
 title="Delete Skill"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Single Skill Modal */}
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
 <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
 <div className="relative w-full max-w-lg bg-theme-card dark:bg-[#0c0d10] rounded-2xl border border-theme-border shadow-2xl p-6 sm:p-7 z-10">
 <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
 <h3 className="text-base font-bold font-['Syne',sans-serif] text-theme-text">
 {editingItem ?'Edit Skill' :'Register New Skill'}
 </h3>
 <button
 onClick={() => setIsModalOpen(false)}
 className="text-theme-text-muted hover:text-slate-600 dark:hover:text-white"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <form onSubmit={handleSave} className="space-y-4">
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Skill Name *
 </label>
 <input
 type="text"
 value={formData.name ??''}
 onChange={e => setFormData({ ...formData, name: e.target.value })}
 onBlur={handleNameBlur}
 placeholder="e.g. Java, Spring Boot, Kafka, PostgreSQL"
 className={`w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none transition-colors ${
 fieldErrors.name
 ?'border-rose-500 focus:border-rose-600'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.name && (
 <p className="mt-1 text-[11px] text-rose-500 font-cambria">{fieldErrors.name}</p>
 )}
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Category *
 </label>
 <input
 type="text"
 list="category-options"
 value={formData.category ??''}
 onChange={e => setFormData({ ...formData, category: e.target.value })}
 placeholder="Language"
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 <datalist id="category-options">
 {categories.map(cat => (
 <option key={cat.id} value={cat.name} />
 ))}
 </datalist>
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Display Order
 </label>
 <input
 type="number"
 min={0}
 value={formData.displayOrder ?? 0}
 onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Knowledge % (0 - 100)
 </label>
 <input
 type="number"
 min={0}
 max={100}
 value={formData.knowledgePercentage ?? 85}
 onChange={e => setFormData({ ...formData, knowledgePercentage: Number(e.target.value) })}
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Years of Experience
 </label>
 <input
 type="number"
 min={0}
 step="any"
 value={formData.yearsOfExperience ?? 3}
 onChange={e => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Overview / Specific Focus
 </label>
 <textarea
 rows={2}
 value={formData.overview ??''}
 onChange={e => setFormData({ ...formData, overview: e.target.value })}
 placeholder="Key frameworks, concurrency primitives, performance tuning..."
 className="w-full p-3 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[rgb(43,127,255)] resize-none transition-colors"
 />
 </div>

 <div className="pt-1">
 <label className="flex items-center gap-2.5 text-xs text-theme-text-secondary cursor-pointer">
 <input
 type="checkbox"
 checked={formData.active ?? true}
 onChange={e => setFormData({ ...formData, active: e.target.checked })}
 className="rounded border-theme-border-subtle w-4 h-4 cursor-pointer accent-[rgb(43,127,255)]"
 />
 <span>Active &amp; Visible in Portfolio</span>
 </label>
 </div>

 <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="px-4 py-2 rounded-xl text-xs text-theme-text-secondary hover:text-slate-900 dark:hover:text-white"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={submitting}
 className="px-4 py-2 rounded-xl text-white text-xs font-cambria font-bold transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 >
 {submitting ?'SAVING...' : editingItem ?'UPDATE SKILL' :'SAVE SKILL'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Bulk Edit Modal */}
 {isBulkMode && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
 <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setIsBulkMode(false)} />
 <div className="relative w-full max-w-7xl bg-theme-card dark:bg-[#0c0d10] rounded-2xl border border-theme-border shadow-2xl p-6 z-10 max-h-[90vh] flex flex-col">
 <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 shrink-0">
 <div>
 <h3 className="text-base font-bold font-['Syne',sans-serif] text-theme-text">
 Bulk Manage Skills
 </h3>
 <p className="text-xs text-theme-text-muted font-light mt-0.5">
 Add or edit multiple skills simultaneously.
 </p>
 </div>
 <div className="flex items-center gap-2.5">
 <button
 onClick={handleAddBulkRow}
 className="text-xs font-cambria px-3.5 py-1.5 rounded-xl border border-theme-border bg-theme-bg dark:bg-[#111216] text-theme-text-secondary hover:border-[rgb(43,127,255)] transition-colors cursor-pointer"
 >
 + Add Row
 </button>
 <button
 onClick={() => setIsBulkMode(false)}
 className="text-theme-text-muted hover:text-slate-600 dark:hover:text-white p-1.5"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 </div>

 <div className="overflow-x-auto overflow-y-auto flex-1 min-h-[360px]">
 <table className="w-full text-left border-collapse">
 <thead className="bg-theme-bg/50 dark:bg-[#111216] text-theme-text-muted text-[10px] font-cambria uppercase sticky top-0 z-10">
 <tr>
 <th className="p-2.5 font-medium w-48">Name *</th>
 <th className="p-2.5 font-medium w-40">Category *</th>
 <th className="p-2.5 font-medium">Overview &amp; Use Case</th>
 <th className="p-2.5 font-medium w-20 text-center">Exp (Yrs)</th>
 <th className="p-2.5 font-medium w-20 text-center">Know %</th>
 <th className="p-2.5 font-medium w-20 text-center">Order</th>
 <th className="p-2.5 font-medium w-16 text-center">Active</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
 {bulkSkills.map((skill, index) => (
 <tr key={skill.id || index} className="hover:bg-slate-50/40 dark:hover:bg-[#111216]/50">
 <td className="p-1.5 align-top">
 <input
 type="text"
 value={skill.name ??''}
 onChange={(e) => handleBulkChange(index,'name', e.target.value)}
 placeholder="Skill name"
 className="w-full bg-transparent border border-transparent focus:border-[rgb(43,127,255)] rounded px-2 py-1.5 text-xs text-theme-text outline-none"
 />
 </td>
 <td className="p-1.5 align-top">
 <input
 type="text"
 value={skill.category ??''}
 onChange={(e) => handleBulkChange(index,'category', e.target.value)}
 placeholder="Category"
 className="w-full bg-transparent border border-transparent focus:border-[rgb(43,127,255)] rounded px-2 py-1.5 text-xs text-theme-text outline-none"
 />
 </td>
 <td className="p-1.5 align-top">
 <textarea
 rows={1}
 value={skill.overview ??''}
 onChange={(e) => handleBulkChange(index,'overview', e.target.value)}
 placeholder="Production details..."
 className="w-full bg-transparent border border-transparent focus:border-[rgb(43,127,255)] rounded px-2 py-1.5 text-xs text-theme-text resize-y outline-none"
 />
 </td>
 <td className="p-1.5 align-top">
 <input
 type="number"
 step="any"
 value={skill.yearsOfExperience ?? 0}
 onChange={(e) => handleBulkChange(index,'yearsOfExperience', Number(e.target.value))}
 className="w-full bg-transparent border border-transparent focus:border-[rgb(43,127,255)] rounded px-2 py-1.5 text-xs text-theme-text text-center outline-none"
 />
 </td>
 <td className="p-1.5 align-top">
 <input
 type="number"
 value={skill.knowledgePercentage ?? 0}
 onChange={(e) => handleBulkChange(index,'knowledgePercentage', Number(e.target.value))}
 className="w-full bg-transparent border border-transparent focus:border-[rgb(43,127,255)] rounded px-2 py-1.5 text-xs text-theme-text text-center outline-none"
 />
 </td>
 <td className="p-1.5 align-top">
 <input
 type="number"
 value={skill.displayOrder ?? 0}
 onChange={(e) => handleBulkChange(index,'displayOrder', Number(e.target.value))}
 className="w-full bg-transparent border border-transparent focus:border-[rgb(43,127,255)] rounded px-2 py-1.5 text-xs text-theme-text text-center outline-none"
 />
 </td>
 <td className="p-1.5 align-top text-center pt-2.5">
 <input
 type="checkbox"
 checked={skill.active ?? true}
 onChange={(e) => handleBulkChange(index,'active', e.target.checked)}
 className="rounded border-theme-border-subtle w-4 h-4 cursor-pointer accent-[rgb(43,127,255)]"
 />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
 <button
 onClick={() => setIsBulkMode(false)}
 className="px-4 py-2 rounded-xl text-xs text-theme-text-secondary hover:text-slate-900 dark:hover:text-white"
 >
 Cancel
 </button>
 <button
 onClick={handleBulkSave}
 disabled={submitting}
 className="px-4 py-2 rounded-xl text-white text-xs font-cambria font-bold transition-opacity hover:opacity-90 shadow-xs cursor-pointer disabled:opacity-50"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 >
 {submitting ?'SAVING...' :'SAVE ALL CHANGES'}
 </button>
 </div>
 </div>
 </div>
 )}

 <DeleteConfirmModal
 isOpen={deleteModalOpen}
 title="Delete Skill"
 itemName={skills.find(s => s.id === deletingId)?.name}
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