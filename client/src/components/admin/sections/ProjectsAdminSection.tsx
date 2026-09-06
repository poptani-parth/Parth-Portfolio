import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Save,
  AlertCircle,
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { useToast } from '../../../context/ToastContext';
import { createAdminApi, AdminApiException } from '../../../api/adminApi';
import { ProjectDTO } from '../../../types';
import { TableLoadingSkeleton } from '../LoadingSkeleton';
import { EmptyState } from '../EmptyState';
import { DeleteConfirmModal } from '../DeleteConfirmModal';

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
  const api = createAdminApi(fetchWithAuth);

  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectDTO | null>(null);
  const [formData, setFormData] = useState<Partial<ProjectDTO>>({
    title: '',
    description: '',
    category: 'Full Stack',
    technologies: [],
    imageUrl: '',
    githubUrl: '',
    liveDemoUrl: '',
    displayOrder: 1,
    featured: false,
    active: true,
  });
  const [techInput, setTechInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
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
      title: '',
      description: '',
      category: 'Full Stack',
      technologies: ['Java 17', 'Spring Boot', 'Redis', 'MongoDB'],
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
      githubUrl: 'https://github.com/poptani-parth',
      liveDemoUrl: '',
      displayOrder: projects.length + 1,
      featured: true,
      active: true,
    });
    setTechInput('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (project: ProjectDTO) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      category: project.category || 'Full Stack',
      technologies: Array.isArray(project.technologies) ? [...project.technologies] : [],
      imageUrl: project.imageUrl || '',
      githubUrl: project.githubUrl || '',
      liveDemoUrl: (project as any).liveDemoUrl || (project as any).liveUrl || '',
      displayOrder: project.displayOrder ?? 1,
      featured: project.featured ?? false,
      active: project.active ?? true,
    });
    setTechInput('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!formData.title?.trim()) errors.title = 'Title is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    if (!formData.category?.trim()) errors.category = 'Category is required';
    if (!formData.technologies || formData.technologies.length === 0) {
      errors.technologies = 'At least one technology tag is required';
    }

    // Backend Test 9.3 XSS Scheme Rejection
    if (!validateSafeUrl(formData.githubUrl)) {
      errors.githubUrl = 'Unsafe URL protocol detected (javascript:, vbscript:, and data: are forbidden)';
    }
    if (!validateSafeUrl(formData.liveDemoUrl)) {
      errors.liveDemoUrl = 'Unsafe URL protocol detected';
    }
    if (!validateSafeUrl(formData.imageUrl)) {
      errors.imageUrl = 'Unsafe image URL protocol detected';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);

    // Whitelist only legitimate properties to prevent Mass-Assignment 400 rejection
    const sanitizedPayload: any = {
      title: formData.title!.trim(),
      description: formData.description!.trim(),
      category: formData.category!.trim(),
      technologies: formData.technologies,
      githubUrl: formData.githubUrl?.trim() || '',
      liveUrl: formData.liveDemoUrl?.trim() || '',
      imageUrl: formData.imageUrl?.trim() || '',
      displayOrder: Number(formData.displayOrder || 1),
      featured: Boolean(formData.featured),
      active: Boolean(formData.active),
    };

    try {
      if (editingProject) {
        const updated = await api.updateProject(editingProject.id, sanitizedPayload);
        setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? updated : p)));
        showSuccess('Project updated successfully');
      } else {
        const created = await api.createProject(sanitizedPayload);
        setProjects((prev) => [created, ...prev]);
        showSuccess('Project created successfully');
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

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.technologies.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white">
            Projects &amp; Architecture Specs
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-light">
            Manage projects using the fields validated by the Spring Boot portfolio API.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-slate-900 text-xs font-sans font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      <div className="flex items-center gap-3 bg-white dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-zinc-800 px-4 py-2.5 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter projects by title, category, or tech stack..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs font-sans text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-600"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <TableLoadingSkeleton rows={5} cols={4} />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="No Projects Found"
          description="There are currently no backend projects matching your filter criteria."
          actionLabel="Create Project"
          onAction={openCreateModal}
        />
      ) : (
        <div className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-sans uppercase text-slate-500 dark:text-zinc-400">
                  <th className="py-3.5 px-6 font-bold">Project / Category</th>
                  <th className="py-3.5 px-4 font-bold">Tech Stack</th>
                  <th className="py-3.5 px-4 font-bold">Order</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs font-sans">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white font-['Syne',sans-serif] text-sm">
                        {project.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        {project.category}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {project.technologies.slice(0, 3).map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] text-slate-700 dark:text-zinc-300"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 dark:text-zinc-400">
                      {project.displayOrder ?? 1}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          project.featured
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {project.featured ? 'Featured' : 'Standard'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(project)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                          title="Edit Project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(project.id);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Project"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#141414] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-lg font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white">
                {editingProject ? 'Edit Project Specifications' : 'Create New Project Record'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title ?? ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border text-xs font-sans text-slate-900 dark:text-white focus:outline-none ${
                      fieldErrors.title ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-zinc-800'
                    }`}
                  />
                  {fieldErrors.title && (
                    <p className="mt-1 text-[11px] font-sans text-rose-500">{fieldErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category ?? ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Full Stack, Backend, Security"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                  Full Description *
                </label>
                <textarea
                  rows={3}
                  value={formData.description ?? ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border text-xs font-sans text-slate-900 dark:text-white focus:outline-none ${
                    fieldErrors.description ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-zinc-800'
                  }`}
                />
                {fieldErrors.description && (
                  <p className="mt-1 text-[11px] font-sans text-rose-500">{fieldErrors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                  Technologies (Press Enter or comma to add) *
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 min-h-[42px]">
                  {formData.technologies?.map((tech, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-xs font-sans text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            technologies: formData.technologies?.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ',') && techInput.trim()) {
                        e.preventDefault();
                        const val = techInput.trim().replace(/,$/, '');
                        if (val && !formData.technologies?.includes(val)) {
                          setFormData({
                            ...formData,
                            technologies: [...(formData.technologies || []), val],
                          });
                        }
                        setTechInput('');
                      }
                    }}
                    placeholder="Add tech..."
                    className="flex-1 min-w-[100px] bg-transparent text-xs font-sans text-slate-900 dark:text-white focus:outline-none px-1"
                  />
                </div>
                {fieldErrors.technologies && (
                  <p className="mt-1 text-[11px] font-sans text-rose-500">{fieldErrors.technologies}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl ?? ''}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border text-xs font-sans text-slate-900 dark:text-white focus:outline-none ${
                      fieldErrors.githubUrl ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-zinc-800'
                    }`}
                  />
                  {fieldErrors.githubUrl && (
                    <p className="mt-1 text-[11px] font-sans text-rose-500">{fieldErrors.githubUrl}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                    Live Demo / Public URL
                  </label>
                  <input
                    type="url"
                    value={formData.liveDemoUrl ?? ''}
                    onChange={(e) => setFormData({ ...formData, liveDemoUrl: e.target.value })}
                    placeholder="https://..."
                    className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border text-xs font-sans text-slate-900 dark:text-white focus:outline-none ${
                      fieldErrors.liveDemoUrl ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-zinc-800'
                    }`}
                  />
                  {fieldErrors.liveDemoUrl && (
                    <p className="mt-1 text-[11px] font-sans text-rose-500">{fieldErrors.liveDemoUrl}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl ?? ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className={`w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border text-xs font-sans text-slate-900 dark:text-white focus:outline-none ${
                      fieldErrors.imageUrl ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-zinc-800'
                    }`}
                  />
                  {fieldErrors.imageUrl && (
                    <p className="mt-1 text-[11px] font-sans text-rose-500">{fieldErrors.imageUrl}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.displayOrder ?? 1}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-sans cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured || false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-slate-800 dark:text-zinc-200 font-bold">Featured Project</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-sans cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active ?? true}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-slate-800 dark:text-zinc-200 font-bold">Active (Publicly Visible)</span>
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
                  <span>{editingProject ? 'Update Project' : 'Create Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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