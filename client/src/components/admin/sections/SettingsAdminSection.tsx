// import React, { useState, useEffect } from 'react';
// import { Plus, Edit2, Trash2, Code2, X, Save } from 'lucide-react';
// import { useAdminAuth } from '../../../context/AdminAuthContext';
// import { useToast } from '../../../context/ToastContext';
// import { createAdminApi, AdminApiException } from '../../../api/adminApi';
// import { SkillDTO, SkillCategoryDTO } from '../../../types';
// import { TableLoadingSkeleton } from '../LoadingSkeleton';
// import { EmptyState } from '../EmptyState';
// import { DeleteConfirmModal } from '../DeleteConfirmModal';

// export const SettingsAdminSection: React.FC = () => {
//   const { fetchWithAuth } = useAdminAuth();
//   const { showSuccess, showError } = useToast();
//   const api = createAdminApi(fetchWithAuth);

//   const [skills, setSkills] = useState<SkillDTO[]>([]);
//   const [categories, setCategories] = useState<SkillCategoryDTO[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingItem, setEditingItem] = useState<SkillDTO | null>(null);
  
//   // State matches the backend DTO keys perfectly
//   const [formData, setFormData] = useState<Partial<SkillDTO>>({
//     name: '',
//     category: '',
//     displayOrder: 1,
//     overview: '',
//     knowledgePercentage: 85,
//     yearsOfExperience: 2.0,
//     active: true
//   });
  
//   const [submitting, setSubmitting] = useState(false);
//   const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

//   const [deletingId, setDeletingId] = useState<string | null>(null);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [skillsData, catsData] = await Promise.all([
//         api.getSkills(),
//         api.getSkillCategories()
//       ]);
//       setSkills(skillsData);
//       setCategories(catsData);
//     } catch (err: any) {
//       showError('Failed to load skills', err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const openCreateModal = () => {
//     setEditingItem(null);
//     setFormData({
//       name: '',
//       category: categories[0]?.name || '',
//       displayOrder: skills.length + 1,
//       overview: '',
//       knowledgePercentage: 85,
//       yearsOfExperience: 2.0,
//       active: true
//     });
//     setFieldErrors({});
//     setIsModalOpen(true);
//   };

//   const openEditModal = (item: SkillDTO) => {
//     setEditingItem(item);
//     setFormData({ ...item });
//     setFieldErrors({});
//     setIsModalOpen(true);
//   };

//   const handleSave = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setFieldErrors({});

//     const errors: Record<string, string> = {};
//     if (!formData.name?.trim()) errors.name = 'Skill name is required';
//     if (!formData.category) errors.category = 'Category selection is required';
//     if (formData.displayOrder === undefined || formData.displayOrder === null) {
//         errors.displayOrder = 'Display order is required';
//     }

//     if (Object.keys(errors).length > 0) {
//       setFieldErrors(errors);
//       return;
//     }

//     setSubmitting(true);
//     try {
//       if (editingItem) {
//         const updated = await api.updateSkill(editingItem.id, formData);
//         setSkills(prev => prev.map(s => (s.id === editingItem.id ? updated : s)));
//         showSuccess('Skill updated successfully');
//       } else {
//         const created = await api.createSkill(formData);
//         setSkills(prev => [...prev, created]);
//         showSuccess('Skill created successfully');
//       }
//       setIsModalOpen(false);
//     } catch (err: any) {
//       if (err.status === 404) {
//         showError('Not found — it may have been deleted');
//         fetchData();
//         setIsModalOpen(false);
//       } else if (err instanceof AdminApiException && err.fieldErrors) {
//         setFieldErrors(err.fieldErrors);
//       } else {
//         showError('Operation failed', err.message);
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDeleteConfirm = async () => {
//     if (!deletingId) return;
//     setIsDeleting(true);
//     try {
//       await api.deleteSkill(deletingId);
//       setSkills(prev => prev.filter(s => s.id !== deletingId));
//       showSuccess('Skill deleted successfully');
//       setDeleteModalOpen(false);
//     } catch (err: any) {
//       showError('Failed to delete skill', err.message);
//     } finally {
//       setIsDeleting(false);
//       setDeletingId(null);
//     }
//   };

//   const getCategoryName = (category?: string) => {
//     return categories.find(c => c.name === category)?.name || category || 'General';
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
//         <div>
//           <h2 className="text-xl font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white">
//             Backend Technical Skills &amp; Stack
//           </h2>
//           <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-light">
//             Manage your Java, Spring, database, distributed streaming, and DevOps proficiencies.
//           </p>
//         </div>

//         <button
//           onClick={openCreateModal}
//           className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-slate-900 text-xs font-sans font-bold transition-all shadow-xs cursor-pointer"
//         >
//           <Plus className="w-4 h-4" />
//           <span>Add Skill</span>
//         </button>
//       </div>

//       {loading ? (
//         <TableLoadingSkeleton rows={5} cols={4} />
//       ) : skills.length === 0 ? (
//         <EmptyState
//           title="No Skills Registered"
//           description="No skills have been mapped to categories yet."
//           actionLabel="Add Skill"
//           onAction={openCreateModal}
//           icon={<Code2 className="w-7 h-7" />}
//         />
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {skills.map(skill => (
//             <div
//               key={skill.id}
//               className={`bg-white dark:bg-[#121212] rounded-2xl border ${!skill.active ? 'border-rose-200/50 dark:border-rose-900/30 opacity-70' : 'border-slate-200 dark:border-zinc-800'} p-5 shadow-xs flex flex-col justify-between hover:border-blue-400/60 transition-colors`}
//             >
//               <div>
//                 <div className="flex items-start justify-between gap-3 mb-2">
//                   <div>
//                     <span className="text-[10px] font-sans uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold">
//                       {getCategoryName(skill.category)}
//                     </span>
//                     <h3 className="text-sm font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white mt-1.5">
//                       {skill.name}
//                     </h3>
//                   </div>

//                   <div className="flex items-center gap-1">
//                     <button
//                       onClick={() => openEditModal(skill)}
//                       className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 cursor-pointer"
//                     >
//                       <Edit2 className="w-3 h-3" />
//                     </button>
//                     <button
//                       onClick={() => {
//                         setDeletingId(skill.id);
//                         setDeleteModalOpen(true);
//                       }}
//                       className="p-1 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"
//                     >
//                       <Trash2 className="w-3 h-3" />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="space-y-1.5 mt-3">
//                   <div className="flex items-center justify-between text-[11px] font-sans">
//                     <span className="text-slate-500 dark:text-zinc-400">Knowledge:</span>
//                     <span className="font-bold text-slate-900 dark:text-zinc-200">{skill.knowledgePercentage || 0}%</span>
//                   </div>
//                   <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
//                     <div
//                       className="h-full bg-blue-500 rounded-full"
//                       style={{ width: `${skill.knowledgePercentage || 0}%` }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] font-sans text-slate-500 dark:text-zinc-400">
//                 <span>Exp: {skill.yearsOfExperience || 0} yrs</span>
//                 <span className={`font-bold ${skill.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
//                   {skill.active ? 'Active' : 'Hidden'}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
//           <div className="relative w-full max-w-lg bg-white dark:bg-[#141414] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto scrollbar-thin">
//             <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-zinc-800">
//               <h3 className="text-lg font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white">
//                 {editingItem ? 'Edit Skill' : 'Add Technical Skill'}
//               </h3>
//               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleSave} className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
//                     Skill Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.name ?? ''}
//                     onChange={e => setFormData({ ...formData, name: e.target.value })}
//                     className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
//                     Category *
//                   </label>
//                   <select
//                     value={formData.category ?? ''}
//                     onChange={e => setFormData({ ...formData, category: e.target.value })}
//                     className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
//                   >
//                     <option value="" disabled>Select a category</option>
//                     {categories.map(cat => (
//                       <option key={cat.id} value={cat.name}>
//                         {cat.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
//                   Overview &amp; Use Case
//                 </label>
//                 <textarea
//                   rows={3}
//                   value={formData.overview ?? ''}
//                   onChange={e => setFormData({ ...formData, overview: e.target.value })}
//                   placeholder="Deep understanding of Data Structures..."
//                   className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
//                     Years of Experience
//                   </label>
//                   <input
//                     type="number"
//                     min={0}
//                     step={0.5}
//                     value={formData.yearsOfExperience ?? 0}
//                     onChange={e => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
//                     className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
//                     Display Order *
//                   </label>
//                   <input
//                     type="number"
//                     min={0}
//                     value={formData.displayOrder ?? 0}
//                     onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
//                     className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
//                   />
//                 </div>
//               </div>

//               <div className="pb-2">
//                 <div className="flex items-center justify-between text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
//                   <span>Knowledge Level: {formData.knowledgePercentage || 0}%</span>
//                 </div>
//                 <input
//                   type="range"
//                   min={0}
//                   max={100}
//                   step={5}
//                   value={formData.knowledgePercentage ?? 85}
//                   onChange={e => setFormData({ ...formData, knowledgePercentage: Number(e.target.value) })}
//                   className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
//                 />
//               </div>

//               <div className="pt-2">
//                 <label className="flex items-center gap-2 text-xs font-sans cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={formData.active ?? true}
//                     onChange={e => setFormData({ ...formData, active: e.target.checked })}
//                     className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
//                   />
//                   <span className="text-slate-800 dark:text-zinc-200 font-bold">Active (Visible to public)</span>
//                 </label>
//               </div>

//               <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(false)}
//                   className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-sans font-semibold"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-slate-900 text-xs font-sans font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
//                 >
//                   {submitting ? (
//                     <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
//                   ) : (
//                     <Save className="w-4 h-4" />
//                   )}
//                   <span>{editingItem ? 'Update Skill' : 'Save Skill'}</span>
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       <DeleteConfirmModal
//         isOpen={deleteModalOpen}
//         title="Delete Skill"
//         itemName={skills.find(s => s.id === deletingId)?.name}
//         isDeleting={isDeleting}
//         onConfirm={handleDeleteConfirm}
//         onCancel={() => {
//           setDeleteModalOpen(false);
//           setDeletingId(null);
//         }}
//       />
//     </div>
//   );
// };
import React from 'react';
import { Settings, Database, Server } from 'lucide-react';

export const SettingsAdminSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <h2 className="text-xl font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Settings &amp; API Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-light">
          Manage your backend connection, security keys, and database details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Database Status</h3>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-zinc-400">
            <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <span className="font-sans text-xs">Connection:</span>
              <span className="text-emerald-500 font-bold">Online</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <span className="font-sans text-xs">Type:</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">MongoDB</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-500">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Backend Server</h3>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-zinc-400">
            <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <span className="font-sans text-xs">Environment:</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">Development</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <span className="font-sans text-xs">URL:</span>
              <span className="font-sans text-[10px] bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">http://localhost:8080</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};