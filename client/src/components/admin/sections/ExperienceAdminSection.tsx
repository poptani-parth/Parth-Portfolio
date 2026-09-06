import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Briefcase, X, Save, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { useToast } from '../../../context/ToastContext';
import { createAdminApi, AdminApiException } from '../../../api/adminApi';
import { ExperienceDTO } from '../../../types';
import { TableLoadingSkeleton } from '../LoadingSkeleton';
import { EmptyState } from '../EmptyState';
import { DeleteConfirmModal } from '../DeleteConfirmModal';

export const ExperienceAdminSection: React.FC = () => {
  const { fetchWithAuth } = useAdminAuth();
  const { showSuccess, showError } = useToast();
  const api = createAdminApi(fetchWithAuth);

  const [experiences, setExperiences] = useState<ExperienceDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExperienceDTO | null>(null);
  const [formData, setFormData] = useState<Partial<ExperienceDTO>>({
    role: '',
    company: '',
    location: '',
    employmentType: 'Full-time',
    startDate: '2023-01-01',
    endDate: '',
    current: true,
    description: [],
    technologies: []
  });
  const [descInput, setDescInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExperience = async () => {
    setLoading(true);
    try {
      const data = await api.getExperience();
      setExperiences(data);
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
      role: 'Senior Backend Engineer',
      company: '',
      location: 'Remote',
      employmentType: 'Full-time',
      startDate: '2023-01-01',
      endDate: '',
      current: true,
      description: ['Architected low-latency microservices with Spring Boot 3 and Kafka'],
      technologies: ['Java 21', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Docker']
    });
    setDescInput('');
    setTechInput('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: ExperienceDTO) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDescInput('');
    setTechInput('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!formData.role?.trim()) errors.role = 'Role / Title is required';
    if (!formData.company?.trim()) errors.company = 'Company is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        // 200 update in place
        const updated = await api.updateExperience(editingItem.id, formData);
        setExperiences(prev => prev.map(e => (e.id === editingItem.id ? updated : e)));
        showSuccess('Experience record updated');
      } else {
        // 201 create and add
        const created = await api.createExperience(formData);
        setExperiences(prev => [...prev, created]);
        showSuccess('Experience record added');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.status === 404) {
        showError('Not found — it may have been deleted');
        fetchExperience();
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
      // 204 delete
      await api.deleteExperience(deletingId);
      setExperiences(prev => prev.filter(e => e.id !== deletingId));
      showSuccess('Experience record removed');
      setDeleteModalOpen(false);
    } catch (err: any) {
      if (err.status === 404) {
        showError('Not found — it may have been deleted');
        fetchExperience();
        setDeleteModalOpen(false);
      } else {
        showError('Failed to delete experience', err.message);
      }
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white">
            Professional Experience &amp; Engineering Roles
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-light">
            Record company tenures, distributed architecture achievements, and core stack usage.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-slate-900 text-xs font-sans font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Experience</span>
        </button>
      </div>

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
          {experiences.map(item => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs hover:border-blue-400/60 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-sans uppercase px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold">
                      {item.startDate} — {item.current ? 'Present' : item.endDate || 'Present'}
                    </span>
                    {item.current && (
                      <span className="text-[10px] font-sans uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
                        Current Role
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white">
                    {item.role}
                  </h3>
                  <div className="text-xs font-sans text-slate-600 dark:text-zinc-400 mt-0.5">
                    <span className="font-bold text-slate-900 dark:text-zinc-200">{item.company}</span>
                    {item.location ? ` • ${item.location}` : ''}
                    {item.employmentType ? ` (${item.employmentType})` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingId(item.id);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {item.description && item.description.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-zinc-400 font-light list-disc list-inside">
                  {(Array.isArray(item.description) ? item.description : item.description.split('\n')).map((bullet, bIdx) => (
                    <li key={bIdx} className="leading-relaxed">{bullet}</li>
                  ))}
                </ul>
              )}

              {item.technologies && item.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80">
                  {item.technologies.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-sans px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#141414] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-lg font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white">
                {editingItem ? 'Edit Work Experience' : 'Add Professional Experience'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                    Role / Title *
                  </label>
                  <input
                    type="text"
                    value={formData.role ?? ''}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Lead Distributed Systems Engineer"
                    className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border text-xs font-sans text-slate-900 dark:text-white focus:outline-none ${
                      fieldErrors.role ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-zinc-800'
                    }`}
                  />
                  {fieldErrors.role && (
                    <p className="mt-1 text-[11px] font-sans text-rose-500">{fieldErrors.role}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    value={formData.company ?? ''}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border text-xs font-sans text-slate-900 dark:text-white focus:outline-none ${
                      fieldErrors.company ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-zinc-800'
                    }`}
                  />
                  {fieldErrors.company && (
                    <p className="mt-1 text-[11px] font-sans text-rose-500">{fieldErrors.company}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="text"
                    value={formData.startDate ?? ''}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    placeholder="2023-01-01"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="text"
                    disabled={formData.current}
                    value={formData.current ? 'Present' : (formData.endDate ?? '')}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    placeholder="2024-06-01"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs font-sans cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.current || false}
                      onChange={e => setFormData({ ...formData, current: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-slate-800 dark:text-zinc-200 font-bold">Current Role</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                  Key Responsibilities / Impact (Add &amp; press Enter)
                </label>
                <div className="space-y-2 mb-2">
                  {Array.isArray(formData.description) && formData.description.map((bullet, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-300">
                      <span>{bullet}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            description: Array.isArray(formData.description)
                              ? formData.description.filter((_, i) => i !== idx)
                              : formData.description
                          })
                        }
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={descInput}
                    onChange={e => setDescInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && descInput.trim()) {
                        e.preventDefault();
                        setFormData({
                          ...formData,
                          description: [...(formData.description || []), descInput.trim()]
                        });
                        setDescInput('');
                      }
                    }}
                    placeholder="e.g. Scaled event pipeline to 25k TPS with Kafka partitioning..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (descInput.trim()) {
                        setFormData({
                          ...formData,
                          description: [...(formData.description || []), descInput.trim()]
                        });
                        setDescInput('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 text-xs font-sans font-bold"
                  >
                    Add
                  </button>
                </div>
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
                  <span>{editingItem ? 'Update Experience' : 'Save Experience'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Experience"
        itemName={experiences.find(e => e.id === deletingId)?.role}
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
