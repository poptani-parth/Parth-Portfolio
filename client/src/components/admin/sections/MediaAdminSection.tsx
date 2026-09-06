import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Copy,
  Trash2,
  Check,
  FileCode,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { useToast } from '../../../context/ToastContext';
import { createAdminApi } from '../../../api/adminApi';
import { MediaDTO } from '../../../types';
import { TableLoadingSkeleton } from '../LoadingSkeleton';
import { EmptyState } from '../EmptyState';
import { DeleteConfirmModal } from '../DeleteConfirmModal';

export const MediaAdminSection: React.FC = () => {
  const { fetchWithAuth } = useAdminAuth();
  const { showSuccess, showError } = useToast();
  const api = createAdminApi(fetchWithAuth);

  const [mediaList, setMediaList] = useState<MediaDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Form state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [usage, setUsage] = useState<'profile' | 'project' | 'general'>('project');
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await api.getMedia();
      setMediaList(data);
    } catch (err: any) {
      showError('Failed to load media items', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setFileName(selectedFile.name.replace(/\.[^/.]+$/, ''));
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      showError('Validation Error', 'Please provide a name for this media asset');
      return;
    }

    setUploading(true);
    try {
      if (!file) {
        showError('Validation Error', 'Please select a file to upload');
        return;
      }
      const created = await api.uploadMedia({
        file,
        usage,
        altText
      });
      setMediaList(prev => [created, ...prev]);
      showSuccess('Media asset uploaded and registered');

      // Reset form
      setFile(null);
      setPreviewUrl('');
      setFileName('');
      setAltText('');
    } catch (err: any) {
      showError('Upload failed', err.message);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showSuccess('Asset URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      // 204 Delete
      await api.deleteMedia(deletingId);
      setMediaList(prev => prev.filter(m => m.id !== deletingId));
      showSuccess('Media asset permanently deleted');
      setDeleteModalOpen(false);
    } catch (err: any) {
      if (err.status === 404) {
        showError('Not found — it may have been deleted');
        fetchMedia();
        setDeleteModalOpen(false);
      } else {
        showError('Failed to delete media', err.message);
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
            Media &amp; Static Assets Vault
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-light">
            Upload system architecture diagrams, profile photos, and project cover images with drag-and-drop support.
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs">
        <h3 className="text-sm font-bold font-sans uppercase tracking-wider text-slate-900 dark:text-white mb-4">
          Upload / Register Asset
        </h3>

        <form onSubmit={handleUploadSubmit} className="space-y-5">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-300 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept="image/*,.pdf"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800 flex items-center justify-center text-blue-500 dark:text-blue-400 mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-sans font-bold text-slate-800 dark:text-zinc-200">
              {file ? file.name : 'Click to select file or drag & drop here'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              Supports PNG, JPG, WebP, SVG, and PDF diagrams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                Asset Name *
              </label>
              <input
                type="text"
                value={fileName ?? ''}
                onChange={e => setFileName(e.target.value)}
                placeholder="e.g. distributed-flow-diagram"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase text-slate-700 dark:text-zinc-300 mb-1">
                Usage Classification *
              </label>
              <select
                value={usage ?? 'project'}
                onChange={e => setUsage(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="project">Project Diagram / Architecture</option>
                <option value="profile">Profile Avatar / Banner</option>
                <option value="general">General Asset / Certificate</option>
              </select>
            </div>

          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={uploading || !file || !fileName.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-slate-900 text-xs font-sans font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              <span>{uploading ? 'Registering...' : 'Upload & Save Asset'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Media Vault Grid */}
      {loading ? (
        <TableLoadingSkeleton rows={4} cols={3} />
      ) : mediaList.length === 0 ? (
        <EmptyState
          title="No Media Assets Found"
          description="Upload architecture diagrams or system screenshots to use throughout your portfolio."
          icon={<ImageIcon className="w-7 h-7" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaList.map(item => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs flex flex-col justify-between group"
            >
              <div className="relative h-44 bg-slate-100 dark:bg-zinc-900 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-sans uppercase font-bold">
                  {item.usage}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold font-sans text-slate-900 dark:text-white truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] font-sans text-slate-400 dark:text-zinc-500 mt-0.5">
                    {item.size || '1.2 MB'} • {item.uploadedAt || 'Recently'}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-zinc-800/80">
                  <button
                    onClick={() => copyToClipboard(item.url, item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-sans hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
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
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Media Asset"
        itemName={mediaList.find(m => m.id === deletingId)?.name}
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
