import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GraduationCap, X, Save } from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { useToast } from '../../../context/ToastContext';
import { createAdminApi, AdminApiException } from '../../../api/adminApi';
import { EducationDTO } from '../../../types';
import { TableLoadingSkeleton } from '../LoadingSkeleton';
import { EmptyState } from '../EmptyState';
import { DeleteConfirmModal } from '../DeleteConfirmModal';

export const EducationAdminSection: React.FC = () => {
  const { fetchWithAuth } = useAdminAuth();
  const { showSuccess, showError } = useToast();
  const api = createAdminApi(fetchWithAuth);

  const [educationList, setEducationList] = useState<EducationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EducationDTO | null>(null);
  const [formData, setFormData] = useState<Partial<EducationDTO>>({
    degree: '',
    field: '',
    institution: '',
    startYear: '2020',
    endYear: '2024',
    gpa: '3.9 / 4.0',
    highlights: [],
    relevantCourses: [],
    displayOrder: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEducation = async () => {
    setLoading(true);
    try {
      const data = await api.getEducation();
      setEducationList(data);
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
      degree: 'Bachelor of Technology',
      field: 'Computer Science & Engineering',
      institution: '',
      startYear: '2020',
      endYear: '2024',
      gpa: '3.9 / 4.0',
      highlights: ['Distributed Systems Lab Assistant', 'Dean’s Honor List'],
      relevantCourses: ['Data Structures & Algorithms', 'Distributed Systems', 'Database Internals'],
      displayOrder: educationList.length + 1,
    });
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: EducationDTO) => {
    setEditingItem(item);
    setFormData({
      ...item,
      startYear: item.startYear || (item.period ? item.period.split('-')[0]?.trim() : '2020'),
      endYear: item.endYear || (item.period ? item.period.split('-')[1]?.trim() : 'Present'),
      displayOrder: item.displayOrder ?? 1,
    });
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!formData.degree?.trim()) errors.degree = 'Degree is required';
    if (!formData.institution?.trim()) errors.institution = 'Institution is required';
    if (!formData.startYear?.trim()) errors.startYear = 'Start year is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        const updated = await api.updateEducation(editingItem.id, formData);
        setEducationList((prev) => prev.map((e) => (e.id === editingItem.id ? updated : e)));
        showSuccess('Education record updated');
      } else {
        const created = await api.createEducation(formData);
        setEducationList((prev) => [...prev, created]);
        showSuccess('Education record created');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.status === 404) {
        showError('Not found — it may have been deleted');
        fetchEducation();
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
      await api.deleteEducation(deletingId);
      setEducationList((prev) => prev.filter((e) => e.id !== deletingId));
      showSuccess('Education record removed');
      setDeleteModalOpen(false);
    } catch (err: any) {
      if (err.status === 404) {
        showError('Not found — it may have been deleted');
        fetchEducation();
        setDeleteModalOpen(false);
      } else {
        showError('Failed to delete education record', err.message);
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
            Academic Background &amp; Education
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-light">
            Manage degrees, universities, GPA benchmarks, coursework, and honors.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-slate-900 text-xs font-sans font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Education</span>
        </button>
      </div>

      {loading ? (
        <TableLoadingSkeleton rows={3} cols={3} />
      ) : educationList.length === 0 ? (
        <EmptyState
          title="No Education Records"
          description="You have not added any academic credentials yet."
          actionLabel="Add Degree / Record"
          onAction={openCreateModal}
          icon={<GraduationCap className="w-7 h-7" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {educationList.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-xs hover:border-blue-400/60 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-[10px] font-sans uppercase px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold">
                      {item.startYear || (item.period ? item.period.split('-')[0]?.trim() : '2020')} — {item.endYear || (item.period ? item.period.split('-')[1]?.trim() : 'Present')}
                    </span>
                    <h3 className="text-base font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white mt-2">
                      {item.degree}
                    </h3>
                    <p className="text-xs font-sans text-slate-600 dark:text-zinc-400 mt-0.5">
                      {item.field ? `${item.field} • ` : ''}
                      <span className="font-bold text-slate-900 dark:text-zinc-200">{item.institution}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
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

                {item.gpa && (
                  <div className="text-xs font-sans text-slate-500 dark:text-zinc-400 mb-3">
                    GPA: <span className="font-bold text-slate-800 dark:text-zinc-200">{item.gpa}</span>
                  </div>
                )}

                {item.relevantCourses && item.relevantCourses.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                    {item.relevantCourses.map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-sans px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-[#141414] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-lg font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white">
                {editingItem ? 'Edit Education Record' : 'Add Academic Qualification'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                  Degree / Program *
                </label>
                <input
                  type="text"
                  value={formData.degree ?? ''}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="e.g. Bachelor of Technology"
                  className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border text-xs font-sans text-slate-900 dark:text-white focus:outline-none ${
                    fieldErrors.degree ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-zinc-800'
                  }`}
                />
                {fieldErrors.degree && (
                  <p className="mt-1 text-[11px] font-sans text-rose-500">{fieldErrors.degree}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                  Institution / University *
                </label>
                <input
                  type="text"
                  value={formData.institution ?? ''}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border text-xs font-sans text-slate-900 dark:text-white focus:outline-none ${
                    fieldErrors.institution ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-zinc-800'
                  }`}
                />
                {fieldErrors.institution && (
                  <p className="mt-1 text-[11px] font-sans text-rose-500">{fieldErrors.institution}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                    Start Year *
                  </label>
                  <input
                    type="text"
                    value={formData.startYear ?? ''}
                    onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
                  />
                  {fieldErrors.startYear && (
                    <p className="mt-1 text-[11px] font-sans text-rose-500">{fieldErrors.startYear}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                    End Year / Present
                  </label>
                  <input
                    type="text"
                    value={formData.endYear ?? ''}
                    onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                    placeholder="2024 or Present"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    value={formData.field ?? ''}
                    onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                    GPA / Score
                  </label>
                  <input
                    type="text"
                    value={formData.gpa ?? ''}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
                  />
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
                  <span>{editingItem ? 'Update Education' : 'Save Education'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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