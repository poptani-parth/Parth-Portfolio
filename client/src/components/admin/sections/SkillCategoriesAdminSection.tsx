import React, { useState, useEffect } from'react';
import { Plus, Edit2, Trash2, FolderTree, X, Save, AlertCircle } from'lucide-react';
import { useAdminAuth } from'../../../context/AdminAuthContext';
import { useToast } from'../../../context/ToastContext';
import { createAdminApi, AdminApiException } from'../../../api/adminApi';
import { SkillCategoryDTO } from'../../../types';
import { TableLoadingSkeleton } from'../LoadingSkeleton';
import { EmptyState } from'../EmptyState';
import { DeleteConfirmModal } from'../DeleteConfirmModal';

export const SkillCategoriesAdminSection: React.FC = () => {
 const { fetchWithAuth } = useAdminAuth();
 const { showSuccess, showError } = useToast();
 const api = createAdminApi(fetchWithAuth);

 const [categories, setCategories] = useState<SkillCategoryDTO[]>([]);
 const [loading, setLoading] = useState(true);

 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingItem, setEditingItem] = useState<SkillCategoryDTO | null>(null);
 const [formData, setFormData] = useState<Partial<SkillCategoryDTO>>({
 name:'',
 description:'',
 displayOrder: 1
 });
 const [submitting, setSubmitting] = useState(false);
 const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

 const [deletingId, setDeletingId] = useState<string | null>(null);
 const [deleteModalOpen, setDeleteModalOpen] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);

 const fetchCategories = async () => {
 setLoading(true);
 try {
 const data = await api.getSkillCategories();
 setCategories(data);
 } catch (err: any) {
 showError('Failed to load categories', err.message);
 } finally {
 setLoading(false);
 }
 };

 const fetchData = async () => {
 setLoading(true);
 try {
 const data = await api.getSkillCategories();
 setCategories(data); // Assumes your state is named'categories'
 } catch (err: any) {
 showError('Failed to load categories', err.message);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchCategories();
 fetchData();
 }, []);

 const openCreateModal = () => {
 setEditingItem(null);
 setFormData({
 name:'',
 description:'',
 displayOrder: categories.length + 1
 });
 setFieldErrors({});
 setIsModalOpen(true);
 };

 const openEditModal = (cat: SkillCategoryDTO) => {
 setEditingItem(cat);
 setFormData({ ...cat });
 setFieldErrors({});
 setIsModalOpen(true);
 };

 const handleSave = async (e: React.FormEvent) => {
 e.preventDefault();
 setFieldErrors({});

 const errors: Record<string, string> = {};
 if (!formData.name?.trim()) errors.name ='Category name is required';

 if (Object.keys(errors).length > 0) {
 setFieldErrors(errors);
 return;
 }

 setSubmitting(true);
 try {
 if (editingItem) {
 // 200 update
 const updated = await api.updateSkillCategory(editingItem.id, formData);
 setCategories(prev => prev.map(c => (c.id === editingItem.id ? updated : c)));
 showSuccess('Category updated');
 } else {
 // 201 create
 const created = await api.createSkillCategory(formData);
 setCategories(prev => [...prev, created]);
 showSuccess('Category created');
 }
 setIsModalOpen(false);
 } catch (err: any) {
 if (err.status === 404) {
 showError('Not found — it may have been deleted');
 fetchData();
 setIsModalOpen(false);
 } else if (err.fieldErrors) {
 // Handles standard Spring Boot @Valid field errors
 setFieldErrors(err.fieldErrors);
 } else if (err.message && (err.message.toLowerCase().includes('exist') || err.message.toLowerCase().includes('duplicate'))) {
 // Catches our custom IllegalArgumentException and maps it to the Name field
 setFieldErrors({ name: err.message });
 } else {
 showError('Operation failed', err.message ||'An unexpected error occurred');
 }
 } finally {
 setSubmitting(false);
 }
 };

 const handleDeleteConfirm = async () => {
 if (!deletingId) return;
 setIsDeleting(true);
 try {
 // 204 delete
 await api.deleteSkillCategory(deletingId);
 setCategories(prev => prev.filter(c => c.id !== deletingId));
 showSuccess('Category deleted');
 setDeleteModalOpen(false);
 } catch (err: any) {
 if (err.status === 404) {
 showError('Not found — it may have been deleted');
 fetchCategories();
 setDeleteModalOpen(false);
 } else {
 showError('Failed to delete category', err.message);
 }
 } finally {
 setIsDeleting(false);
 setDeletingId(null);
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-theme-card dark:bg-[#121212] rounded-2xl border border-theme-border shadow-xs">
 <div>
 <h2 className="text-xl font-bold font-['Syne',sans-serif] text-theme-text">
 Skill Categories &amp; Taxonomy
 </h2>
 <p className="text-xs text-theme-text-muted mt-1 font-light">
 Group skills into logical domains like Java &amp; Core Backend, Event Streaming, Cloud &amp; DBs.
 </p>
 </div>

 <button
 onClick={openCreateModal}
 className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-slate-900 text-xs font-sans font-bold transition-all shadow-xs cursor-pointer"
 >
 <Plus className="w-4 h-4" />
 <span>Add Category</span>
 </button>
 </div>

 {loading ? (
 <TableLoadingSkeleton rows={4} cols={3} />
 ) : categories.length === 0 ? (
 <EmptyState
 title="No Categories Defined"
 description="Create categories to organize your engineering skills."
 actionLabel="Add Category"
 onAction={openCreateModal}
 icon={<FolderTree className="w-7 h-7" />}
 />
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {categories.map(cat => (
 <div
 key={cat.id}
 className="bg-theme-card dark:bg-[#121212] rounded-2xl border border-theme-border p-6 flex flex-col justify-between shadow-xs hover:border-blue-400/60 transition-colors"
 >
 <div>
 <div className="flex items-start justify-between gap-4 mb-2">
 <h3 className="text-base font-bold font-['Syne',sans-serif] text-theme-text">
 {cat.name}
 </h3>
 <div className="flex items-center gap-1.5">
 <button
 onClick={() => openEditModal(cat)}
 className="p-1.5 rounded-lg bg-theme-bg hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-theme-text-secondary transition-colors cursor-pointer"
 >
 <Edit2 className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => {
 setDeletingId(cat.id);
 setDeleteModalOpen(true);
 }}
 className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>

 <p className="text-xs text-theme-text-secondary font-light leading-relaxed">
 {cat.description ||'No description provided.'}
 </p>
 </div>

 <div className="text-[11px] font-sans text-theme-text-muted pt-3 mt-3 border-t border-slate-100">
 Order priority: <span className="font-bold text-theme-text-secondary">{cat.displayOrder}</span>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Modal */}
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
 <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
 <div className="relative w-full max-w-md bg-theme-card dark:bg-[#141414] rounded-2xl border border-theme-border shadow-2xl p-6 sm:p-8 z-10">
 <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
 <h3 className="text-lg font-bold font-['Syne',sans-serif] text-theme-text">
 {editingItem ?'Edit Skill Category' :'Create Skill Category'}
 </h3>
 <button onClick={() => setIsModalOpen(false)} className="text-theme-text-muted hover:text-slate-600 dark:hover:text-white">
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleSave} className="space-y-4">
 <div>
 <label className="block text-xs font-sans font-bold uppercase text-theme-text-secondary mb-1">
 Category Name *
 </label>
 <input
 type="text"
 value={formData.name ||''}
 onChange={e => setFormData({ ...formData, name: e.target.value })}
 placeholder="e.g. Distributed Streaming & Messaging"
 className={`w-full px-3.5 py-2 rounded-xl bg-theme-bg border text-xs font-sans text-theme-text focus:outline-none ${fieldErrors.name ?'border-rose-500 bg-rose-50/20' :'border-theme-border'
 }`}
 />
 {fieldErrors.name && (
 <p className="mt-1 text-[11px] font-sans text-rose-500">{fieldErrors.name}</p>
 )}
 </div>

 <div>
 <label className="block text-xs font-sans font-bold uppercase text-theme-text-secondary mb-1">
 Description
 </label>
 <textarea
 rows={3}
 value={formData.description ||''}
 onChange={e => setFormData({ ...formData, description: e.target.value })}
 className="w-full px-3.5 py-2 rounded-xl bg-theme-bg border border-theme-border text-xs font-sans text-theme-text focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-xs font-sans font-bold uppercase text-theme-text-secondary mb-1">
 Display Order
 </label>
 <input
 type="number"
 min={1}
 value={formData.displayOrder ?? 1}
 onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
 className="w-full px-3.5 py-2 rounded-xl bg-theme-bg border border-theme-border text-xs font-sans text-theme-text focus:outline-none"
 />
 </div>

 <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="px-4 py-2 rounded-xl bg-theme-bg dark:bg-zinc-800 text-theme-text-secondary text-xs font-sans font-semibold"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={submitting}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-slate-900 text-xs font-sans font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
 >
 {submitting ? (
 <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
 ) : (
 <Save className="w-4 h-4" />
 )}
 <span>{editingItem ?'Update Category' :'Save Category'}</span>
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 <DeleteConfirmModal
 isOpen={deleteModalOpen}
 title="Delete Skill Category"
 itemName={categories.find(c => c.id === deletingId)?.name}
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
