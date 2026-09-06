import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Code2, X, Save } from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { useToast } from '../../../context/ToastContext';
import { createAdminApi, AdminApiException } from '../../../api/adminApi';
import { SkillDTO, SkillCategoryDTO } from '../../../types';
import { TableLoadingSkeleton } from '../LoadingSkeleton';
import { EmptyState } from '../EmptyState';
import { DeleteConfirmModal } from '../DeleteConfirmModal';


export const SkillsAdminSection: React.FC = () => {
    const { fetchWithAuth } = useAdminAuth();
    const { showSuccess, showError } = useToast();
    const api = createAdminApi(fetchWithAuth);

    const [skills, setSkills] = useState<SkillDTO[]>([]);
    const [categories, setCategories] = useState<SkillCategoryDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SkillDTO | null>(null);

    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkSkills, setBulkSkills] = useState<Partial<SkillDTO>[]>([]);

    const [formData, setFormData] = useState<Partial<SkillDTO>>({
        name: '',
        category: '',
        displayOrder: 1,
        overview: '',
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
            setSkills(skillsData);
            setCategories(catsData);
        } catch (err: any) {
            showError('Failed to load skills', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBulkMode = () => {
        if (!isBulkMode) {
            setBulkSkills([...skills]); // Load existing DB skills into the table
        }
        setIsBulkMode(!isBulkMode);
    };
    const handleAddBulkRow = () => {
        setBulkSkills([
            ...bulkSkills,
            { name: '', category: '', overview: '', yearsOfExperience: 0, knowledgePercentage: 0, displayOrder: 0, active: true }
        ]);
    };
    const handleBulkChange = (index: number, field: string, value: any) => {
        const updated = [...bulkSkills];
        updated[index] = { ...updated[index], [field]: value };
        setBulkSkills(updated);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            category: categories[0]?.name || '',
            displayOrder: skills.length + 1,
            overview: '',
            knowledgePercentage: 85,
            yearsOfExperience: 2.0,
            active: true
        });
        setFieldErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (item: SkillDTO) => {
        setEditingItem(item);
        // CRITICAL FIX: Force null values from the database to become actual values
        setFormData({
            ...item,
            overview: item.overview || '',
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
            name: '',
            category: categories[0]?.name || '',
            overview: '',
            yearsOfExperience: 0,
            knowledgePercentage: 0,
            displayOrder: 0,
            active: true
        };

        // Explicitly type as Partial<SkillDTO>[] to allow objects without an 'id'
        let initialData: Partial<SkillDTO>[] = [...skills];

        // Force the table to have a minimum of 5 rows
        const rowsToAdd = 5 - initialData.length;
        for (let i = 0; i < rowsToAdd; i++) {
            initialData.push({ ...emptyRow });
        }

        setBulkSkills(initialData);
        setIsBulkMode(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const errors: Record<string, string> = {};
        if (!formData.name?.trim()) errors.name = 'Skill name is required';
        if (!formData.category) errors.category = 'Category selection is required';

        // FRONTEND DUPLICATE CHECK: Compare against existing skills array
        const isDuplicate = skills.some(s =>
            s.name.trim().toLowerCase() === formData.name?.trim().toLowerCase() &&
            s.id !== editingItem?.id // Ignore itself if editing
        );

        if (isDuplicate) {
            errors.name = 'A skill with this name already exists!';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return; // Stop the save process
        }

        setSubmitting(true);
        setSubmitting(true);
        try {
            // Force strict types before sending payload
            const payload = {
                name: formData.name,
                category: formData.category,
                displayOrder: Number(formData.displayOrder || 0),
                overview: formData.overview || '',
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
            // Filter out empty rows
            const validSkills = bulkSkills.filter(s => s.name && s.name.trim() !== '');

            // FRONTEND DUPLICATE CHECK: Extract all names and check for duplicates
            const names = validSkills.map(s => String(s.name).trim().toLowerCase());
            const uniqueNames = new Set(names);

            if (names.length !== uniqueNames.size) {
                showError('Duplicate Found', 'You have entered the same skill multiple times in the table.');
                setSubmitting(false);
                return; // Stop the save process immediately
            }

            // Separate into New vs Existing
            const newSkills = validSkills
                .filter(s => !s.id)
                .map(skill => ({
                    name: String(skill.name).trim(),
                    category: String(skill.category).trim(),
                    overview: String(skill.overview || '').trim(),
                    yearsOfExperience: Number(skill.yearsOfExperience || 0),
                    knowledgePercentage: Number(skill.knowledgePercentage || 0),
                    displayOrder: Number(skill.displayOrder || 0),
                    active: skill.active ?? true
                }));

            const existingSkills = validSkills.filter(s => s.id);

            // Save new skills via bulk endpoint
            if (newSkills.length > 0) {
                await api.createBulkSkills(newSkills);
            }

            // Update existing skills individually
            for (const skill of existingSkills) {
                const payload = {
                    name: String(skill.name).trim(),
                    category: String(skill.category).trim(),
                    overview: String(skill.overview || '').trim(),
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
                showError('Bulk save failed', err.message || 'An unexpected error occurred');
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

    const getCategoryName = (category?: string) => {
        return categories.find(c => c.name === category)?.name || category || 'General';
    };

    const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const typedName = e.target.value.trim().toLowerCase();
        if (!typedName) return;

        // Check if the typed name exists in the database array (ignoring the current item if editing)
        const isDuplicate = skills.some(s =>
            s.name.trim().toLowerCase() === typedName &&
            s.id !== editingItem?.id
        );

        if (isDuplicate) {
            setFieldErrors(prev => ({ ...prev, name: 'A skill with this name already exists!' }));
        } else {
            // Clear the error if the user fixes it
            setFieldErrors(prev => {
                const updated = { ...prev };
                delete updated.name;
                return updated;
            });
        }
    };
    const handleBulkNameBlur = (index: number, value: string) => {
        const typedName = value.trim().toLowerCase();
        if (!typedName) return;

        const currentSkillId = bulkSkills[index].id;

        // 1. Check if it exists in the database
        const inDb = skills.some(s => s.name.trim().toLowerCase() === typedName && s.id !== currentSkillId);
        
        // 2. Check if it exists in another row of the bulk table
        const inBulk = bulkSkills.some((s, i) => i !== index && String(s.name || '').trim().toLowerCase() === typedName);

        if (inDb || inBulk) {
            setFieldErrors(prev => ({ ...prev, [`bulk_name_${index}`]: 'Duplicate name!' }));
        } else {
            setFieldErrors(prev => {
                const updated = { ...prev };
                delete updated[`bulk_name_${index}`];
                return updated;
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* 1. HEADER SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div>
                    <h2 className="text-xl font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white">
                        Backend Technical Skills &amp; Stack
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-light">
                        Manage your Java, Spring, database, distributed streaming, and DevOps proficiencies.
                    </p>
                </div>

                {/* ADDED: Button group for both Add Skill and Bulk Manage */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={openBulkModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-xs font-sans font-bold transition-all cursor-pointer"
                    >
                        Bulk Manage
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-slate-900 text-xs font-sans font-bold transition-all shadow-xs cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Skill</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <TableLoadingSkeleton rows={5} cols={4} />
            ) : skills.length === 0 ? (
                <EmptyState
                    title="No Skills Registered"
                    description="No skills have been mapped to categories yet."
                    actionLabel="Add Skill"
                    onAction={openCreateModal}
                    icon={<Code2 className="w-7 h-7" />}
                />
            ) : (
                // STANDARD GRID VIEW (Always rendered if skills exist)
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skills.map(skill => (
                        <div
                            key={skill.id}
                            className={`bg-white dark:bg-[#121212] rounded-2xl border ${!skill.active ? 'border-rose-200/50 dark:border-rose-900/30 opacity-70' : 'border-slate-200 dark:border-zinc-800'} p-5 shadow-xs flex flex-col justify-between hover:border-blue-400/60 transition-colors`}
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div>
                                        <span className="text-[10px] font-sans uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold">
                                            {getCategoryName(skill.category)}
                                        </span>
                                        <h3 className="text-sm font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white mt-1.5">
                                            {skill.name}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditModal(skill)}
                                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 cursor-pointer"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDeletingId(skill.id);
                                                setDeleteModalOpen(true);
                                            }}
                                            className="p-1 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5 mt-3">
                                    <div className="flex items-center justify-between text-[11px] font-sans">
                                        <span className="text-slate-500 dark:text-zinc-400">Knowledge:</span>
                                        <span className="font-bold text-slate-900 dark:text-zinc-200">{skill.knowledgePercentage || 0}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${skill.knowledgePercentage || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] font-sans text-slate-500 dark:text-zinc-400">
                                <span>Exp: {skill.yearsOfExperience || 0} yrs</span>
                                <span className={`font-bold ${skill.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                    {skill.active ? 'Active' : 'Hidden'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* BULK EDIT MODAL POPUP */}
            {isBulkMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsBulkMode(false)} />
                    <div className="relative w-full max-w-7xl bg-white dark:bg-[#141414] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 z-10 max-h-[90vh] flex flex-col">

                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
                            <div>
                                <h3 className="text-lg font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white">
                                    Bulk Manage Skills
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans mt-1">Add or edit multiple skills simultaneously.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handleAddBulkRow} className="text-xs font-sans bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 px-4 py-2 rounded-lg transition-colors cursor-pointer font-bold">
                                    + Add Row
                                </button>
                                <button onClick={() => setIsBulkMode(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 p-2 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto scrollbar-thin flex-1 min-h-[400px]">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-400 text-[10px] font-sans uppercase sticky top-0 z-10">
                                    <tr>
                                        <th className="p-2 font-bold w-48">Name *</th>
                                        <th className="p-2 font-bold w-40">Category *</th>
                                        <th className="p-2 font-bold">Overview & Use Case</th>
                                        <th className="p-2 font-bold w-20 text-center">Exp (Yrs)</th>
                                        <th className="p-2 font-bold w-20 text-center">Know %</th>
                                        <th className="p-2 font-bold w-20 text-center">Order</th>
                                        <th className="p-2 font-bold w-16 text-center">Active</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                                    {bulkSkills.map((skill, index) => (
                                        <tr key={skill.id || index} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                                            <td className="p-1.5 align-top">
                                                <input 
                                                    type="text" 
                                                    value={skill.name ?? ''} 
                                                    onChange={(e) => handleBulkChange(index, 'name', e.target.value)} 
                                                    onBlur={(e) => handleBulkNameBlur(index, e.target.value)}
                                                    placeholder="Skill name" 
                                                    className={`w-full bg-transparent border ${fieldErrors[`bulk_name_${index}`] ? 'border-rose-500' : 'border-transparent group-hover:border-slate-200 dark:group-hover:border-zinc-700'} focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 rounded px-2 py-1.5 text-xs font-sans dark:text-white transition-all outline-none`} 
                                                />
                                                {fieldErrors[`bulk_name_${index}`] && (
                                                    <p className="mt-1 px-2 text-[10px] font-bold text-rose-500">
                                                        {fieldErrors[`bulk_name_${index}`]}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-1.5 align-top">
                                                <select value={skill.category ?? ''} onChange={(e) => handleBulkChange(index, 'category', e.target.value)} className="w-full bg-transparent border border-transparent group-hover:border-slate-200 dark:group-hover:border-zinc-700 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 rounded px-2 py-1.5 text-xs font-sans dark:text-white transition-all outline-none">
                                                    <option value="" disabled>Select...</option>
                                                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-1.5 align-top">
                                                <textarea rows={1} value={skill.overview ?? ''} onChange={(e) => handleBulkChange(index, 'overview', e.target.value)} placeholder="Production details..." className="w-full bg-transparent border border-transparent group-hover:border-slate-200 dark:group-hover:border-zinc-700 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 rounded px-2 py-1.5 text-xs font-sans dark:text-white resize-y transition-all outline-none" />
                                            </td>
                                            <td className="p-1.5 align-top">
                                                <input type="number" step="any" value={skill.yearsOfExperience ?? 0} onChange={(e) => handleBulkChange(index, 'yearsOfExperience', Number(e.target.value))} className="w-full bg-transparent border border-transparent group-hover:border-slate-200 dark:group-hover:border-zinc-700 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 rounded px-2 py-1.5 text-xs font-sans dark:text-white text-center transition-all outline-none" />
                                            </td>
                                            <td className="p-1.5 align-top">
                                                <input type="number" value={skill.knowledgePercentage ?? 0} onChange={(e) => handleBulkChange(index, 'knowledgePercentage', Number(e.target.value))} className="w-full bg-transparent border border-transparent group-hover:border-slate-200 dark:group-hover:border-zinc-700 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 rounded px-2 py-1.5 text-xs font-sans dark:text-white text-center transition-all outline-none" />
                                            </td>
                                            <td className="p-1.5 align-top">
                                                <input type="number" value={skill.displayOrder ?? 0} onChange={(e) => handleBulkChange(index, 'displayOrder', Number(e.target.value))} className="w-full bg-transparent border border-transparent group-hover:border-slate-200 dark:group-hover:border-zinc-700 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 rounded px-2 py-1.5 text-xs font-sans dark:text-white text-center transition-all outline-none" />
                                            </td>
                                            <td className="p-1.5 align-top text-center pt-3">
                                                <input type="checkbox" checked={skill.active ?? true} onChange={(e) => handleBulkChange(index, 'active', e.target.checked)} className="rounded border-slate-300 dark:border-zinc-700 text-blue-600 bg-transparent w-4 h-4 cursor-pointer" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800 shrink-0">
                            <button onClick={() => setIsBulkMode(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-sans font-semibold transition-colors hover:bg-slate-200 dark:hover:bg-zinc-700">
                                Cancel
                            </button>
                            <button onClick={handleBulkSave} disabled={submitting} className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-zinc-200 rounded-xl text-xs font-sans font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer">
                                {submitting ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>Save All Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[#141414] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto scrollbar-thin">
                        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-zinc-800">
                            <h3 className="text-lg font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white">
                                {editingItem ? 'Edit Skill' : 'Add Technical Skill'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                                        Skill Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name ?? ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        onBlur={handleNameBlur}  // <--- ADD THIS LINE HERE
                                        className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border ${fieldErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-zinc-800'} text-xs font-sans text-slate-900 dark:text-white focus:outline-none`}
                                    />
                                    {fieldErrors.name && (
                                        <p className="mt-1 text-[11px] font-mono text-rose-500">{fieldErrors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category ?? ''}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                                    Overview &amp; Use Case
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.overview ?? ''}
                                    onChange={e => setFormData({ ...formData, overview: e.target.value })}
                                    placeholder="Production implementation details..."
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={80}
                                        step="any"
                                        value={formData.yearsOfExperience ?? 0}
                                        onChange={e => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
                                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                                        Display Order *
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={formData.displayOrder ?? 0}
                                        onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pb-2">
                                <div className="flex items-center justify-between text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                                    <span>Knowledge Level: {formData.knowledgePercentage || 0}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={formData.knowledgePercentage ?? 85}
                                    onChange={e => setFormData({ ...formData, knowledgePercentage: Number(e.target.value) })}
                                    className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-2 text-xs font-sans cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.active ?? true}
                                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                    />
                                    <span className="text-slate-800 dark:text-zinc-200 font-bold">Active (Visible to public)</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-sans font-semibold"
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
                                    <span>{editingItem ? 'Update Skill' : 'Save Skill'}</span>
                                </button>
                            </div>
                        </form>
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