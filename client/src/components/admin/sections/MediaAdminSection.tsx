import React, { useState, useEffect, useRef, useMemo } from'react';
import {
 UploadCloud,
 Image as ImageIcon,
 Copy,
 Trash2,
 Check,
 Plus,
 ExternalLink,
 X,
 Calendar,
 AlertCircle,
} from'lucide-react';
import { useAdminAuth } from'../../../context/AdminAuthContext';
import { useToast } from'../../../context/ToastContext';
import { createAdminApi } from'../../../api/adminApi';
import { MediaDTO } from'../../../types';
import { TableLoadingSkeleton } from'../LoadingSkeleton';
import { EmptyState } from'../EmptyState';
import { DeleteConfirmModal } from'../DeleteConfirmModal';

export const MediaAdminSection: React.FC = () => {
 const { fetchWithAuth } = useAdminAuth();
 const { showSuccess, showError } = useToast();
 const api = useMemo(() => createAdminApi(fetchWithAuth), [fetchWithAuth]);

 const [mediaList, setMediaList] = useState<MediaDTO[]>([]);
 const [loading, setLoading] = useState(true);

 // Fallback image error tracker by ID
 const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

 // Modals
 const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
 const [previewMediaItem, setPreviewMediaItem] = useState<MediaDTO | null>(null);

 // Upload Form State
 const [file, setFile] = useState<File | null>(null);
 const [previewUrl, setPreviewUrl] = useState<string>('');
 const [fileName, setFileName] = useState('');
 const [directUrl, setDirectUrl] = useState('');
 const [usage, setUsage] = useState<'profile' |'project' |'general'>('profile');
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
 setMediaList(Array.isArray(data) ? data : []);
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
 setFileName(selectedFile.name.replace(/\.[^/.]+$/,''));
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
 showError('Validation Error','Please provide a title or name for this media asset');
 return;
 }

 setUploading(true);
 try {
 if (file) {
 const created = await api.uploadMedia({
 file,
 usage,
 altText: altText || fileName,
 });
 setMediaList((prev) => [created, ...prev]);
 showSuccess('Media asset uploaded successfully');
 } else if (directUrl.trim()) {
 const pseudoMedia: MediaDTO = {
 id:`media-${Date.now()}`,
 name: fileName.trim(),
 url: directUrl.trim(),
 usage,
 uploadedAt: new Date().toISOString().split('T')[0],
 };
 setMediaList((prev) => [pseudoMedia, ...prev]);
 showSuccess('Media URL registered successfully');
 } else {
 showError('Validation Error','Please upload a file or enter a public media URL');
 setUploading(false);
 return;
 }

 setFile(null);
 setPreviewUrl('');
 setFileName('');
 setDirectUrl('');
 setAltText('');
 setIsUploadModalOpen(false);
 } catch (err: any) {
 showError('Upload failed', err.message);
 } finally {
 setUploading(false);
 }
 };

 const copyToClipboard = (url: string, id: string, e?: React.MouseEvent) => {
 if (e) e.stopPropagation();
 navigator.clipboard.writeText(url);
 setCopiedId(id);
 showSuccess('Asset URL copied to clipboard');
 setTimeout(() => setCopiedId(null), 2000);
 };

 const handleDeleteConfirm = async () => {
 if (!deletingId) return;
 setIsDeleting(true);
 try {
 await api.deleteMedia(deletingId);
 setMediaList((prev) => prev.filter((m) => m.id !== deletingId));
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
 <div className="space-y-6 max-w-7xl">
 {/* Header Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2.5">
 <ImageIcon className="w-5 h-5" style={{ color:'rgb(43, 127, 255)' }} />
 <h2 className="text-xl font-bold font-['Syne',sans-serif] text-theme-text">
 Media &amp; Asset Gallery
 </h2>
 </div>
 <p className="text-xs text-theme-text-muted mt-1 font-light">
 Static media files, project diagrams, and certificates (GET /api/media).
 </p>
 </div>

 <button
 onClick={() => setIsUploadModalOpen(true)}
 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-cambria font-bold transition-opacity hover:opacity-90 shadow-xs cursor-pointer shrink-0"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 >
 <Plus className="w-4 h-4" />
 <span>NEW MEDIA</span>
 </button>
 </div>

 {/* Media Grid Canvas */}
 {loading ? (
 <TableLoadingSkeleton rows={3} cols={3} />
 ) : mediaList.length === 0 ? (
 <EmptyState
 title="No Media Assets Found"
 description="Upload architecture diagrams or system screenshots to use throughout your portfolio."
 actionLabel="Upload Media"
 onAction={() => setIsUploadModalOpen(true)}
 icon={<ImageIcon className="w-7 h-7" />}
 />
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {mediaList.map((item) => {
 const hasError = imageErrors[item.id];

 return (
 <div
 key={item.id}
 className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between group"
 >
 {/* Media Thumbnail Container with 4:3 Aspect Ratio and Top Framing */}
 <div className="relative aspect-[4/3] w-full bg-theme-bg dark:bg-[#111216] overflow-hidden flex items-center justify-center">
 {!hasError ? (
 <img
 src={item.url}
 alt={item.name}
 onError={() => setImageErrors((prev) => ({ ...prev, [item.id]: true }))}
 referrerPolicy="no-referrer"
 className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
 />
 ) : (
 <div className="flex flex-col items-center justify-center gap-2 text-theme-text-muted p-4">
 <ImageIcon className="w-8 h-8 opacity-50" />
 <span className="text-[11px] font-cambria">Image unavailable</span>
 </div>
 )}

 {/* Floating Action Overlay on Hover */}
 <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 z-10">
 {/* 1. Open Media Full Preview */}
 <button
 onClick={() => setPreviewMediaItem(item)}
 className="p-2.5 rounded-xl bg-[#0c0d10]/90 hover:bg-[#14151b] text-white border border-zinc-700/80 hover:border-[rgb(43,127,255)] transition-all cursor-pointer shadow-lg"
 title="Open / View Media"
 >
 <ExternalLink className="w-4 h-4" />
 </button>

 {/* 2. Copy Link Button */}
 <button
 onClick={(e) => copyToClipboard(item.url, item.id, e)}
 className="p-2.5 rounded-xl bg-[#0c0d10]/90 hover:bg-[#14151b] text-white border border-zinc-700/80 hover:border-[rgb(43,127,255)] transition-all cursor-pointer shadow-lg"
 title="Copy Media URL"
 >
 {copiedId === item.id ? (
 <Check className="w-4 h-4" style={{ color:'rgb(43, 127, 255)' }} />
 ) : (
 <Copy className="w-4 h-4" />
 )}
 </button>
 </div>
 </div>

 {/* Card Meta Description Area */}
 <div className="p-5 flex-1 flex flex-col justify-between">
 <div>
 <div className="flex items-center justify-between gap-2 mb-1.5">
 <h3 className="text-sm font-bold font-['Syne',sans-serif] text-theme-text truncate">
 {item.name}
 </h3>
 <span
 className="px-2 py-0.5 rounded text-[10px] font-cambria uppercase font-bold shrink-0"
 style={{
 backgroundColor:'rgba(43, 127, 255, 0.1)',
 color:'rgb(43, 127, 255)',
 }}
 >
 {item.usage ||'asset'}
 </span>
 </div>

 <p className="text-xs text-theme-text-muted font-light truncate">
 {item.altText || item.name}
 </p>
 </div>

 {/* Bottom Card Footer: Date, Copy Link & Delete Action */}
 <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
 <span className="flex items-center gap-1.5 text-[11px] font-cambria text-theme-text-muted">
 <Calendar className="w-3.5 h-3.5" />
 <span>{item.uploadedAt ||'Recently'}</span>
 </span>

 <div className="flex items-center gap-3">
 <button
 onClick={(e) => copyToClipboard(item.url, item.id, e)}
 className="text-[11px] font-cambria font-medium hover:underline flex items-center gap-1 cursor-pointer"
 style={{ color:'rgb(43, 127, 255)' }}
 >
 {copiedId === item.id ?'Copied!' :'Copy Link'}
 </button>

 <button
 onClick={() => {
 setDeletingId(item.id);
 setDeleteModalOpen(true);
 }}
 className="p-1 rounded-lg text-theme-text-muted hover:text-rose-400 transition-colors cursor-pointer"
 title="Delete Asset"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* 1. POPUP WINDOW: FULL MEDIA VIEWER / LIGHTBOX */}
 {previewMediaItem && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
 <div
 className="fixed inset-0 bg-black/80 backdrop-blur-xs"
 onClick={() => setPreviewMediaItem(null)}
 />

 <div className="relative w-full max-w-3xl bg-theme-card dark:bg-[#0c0d10] rounded-2xl border border-theme-border shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden">
 {/* Inspector Header */}
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
 <div className="flex items-center gap-2">
 <span
 className="px-2 py-0.5 rounded text-[10px] font-cambria font-bold uppercase tracking-wider"
 style={{
 backgroundColor:'rgba(43, 127, 255, 0.1)',
 color:'rgb(43, 127, 255)',
 }}
 >
 {previewMediaItem.usage}
 </span>
 <span className="text-sm font-bold font-['Syne',sans-serif] text-theme-text truncate max-w-xs">
 {previewMediaItem.name}
 </span>
 </div>
 <button
 onClick={() => setPreviewMediaItem(null)}
 className="text-theme-text-muted hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Scrollable Viewport Box */}
 <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-theme-bg/50 dark:bg-[#08090b] scrollbar-thin">
 <img
 src={previewMediaItem.url}
 alt={previewMediaItem.name}
 className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md border border-theme-border"
 />
 </div>

 {/* Inspector Footer */}
 <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-theme-card dark:bg-[#0c0d10] shrink-0">
 <span className="text-xs font-cambria text-theme-text-muted truncate max-w-md">
 {previewMediaItem.url}
 </span>

 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={(e) => copyToClipboard(previewMediaItem.url, previewMediaItem.id, e)}
 className="px-4 py-2 rounded-xl text-xs font-cambria font-medium border border-theme-border hover:bg-slate-100 dark:hover:bg-[#16171d] text-theme-text-secondary transition-colors cursor-pointer"
 >
 {copiedId === previewMediaItem.id ?'Copied!' :'Copy URL'}
 </button>

 <a
 href={previewMediaItem.url}
 target="_blank"
 rel="noopener noreferrer"
 className="px-4 py-2 rounded-xl text-white text-xs font-cambria font-bold transition-opacity hover:opacity-90 shadow-xs flex items-center gap-1.5"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 >
 <span>Open in Tab</span>
 <ExternalLink className="w-3.5 h-3.5" />
 </a>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* 2. POPUP WINDOW: ADD / REGISTER NEW MEDIA */}
 {isUploadModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
 <div
 className="fixed inset-0 bg-black/75 backdrop-blur-xs"
 onClick={() => setIsUploadModalOpen(false)}
 />

 <div className="relative w-full max-w-2xl bg-theme-card dark:bg-[#0c0d10] rounded-2xl border border-theme-border shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden">
 {/* Modal Fixed Header */}
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
 <h3 className="text-base font-bold font-['Syne',sans-serif] text-theme-text">
 Upload &amp; Register Media Asset
 </h3>
 <button
 onClick={() => setIsUploadModalOpen(false)}
 className="text-theme-text-muted hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Scrollable Form Body Box */}
 <form onSubmit={handleUploadSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
 <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
 {/* Drag & Drop Zone */}
 <div
 onDragOver={(e) => {
 e.preventDefault();
 setIsDragOver(true);
 }}
 onDragLeave={() => setIsDragOver(false)}
 onDrop={handleDrop}
 onClick={() => fileInputRef.current?.click()}
 className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
 isDragOver
 ?'border-[rgb(43,127,255)] bg-[rgba(43,127,255,0.05)]'
 :'border-theme-border-subtle hover:border-slate-400 dark:hover:border-zinc-700 bg-theme-bg/50 dark:bg-[#111216]'
 }`}
 >
 <input
 type="file"
 ref={fileInputRef}
 onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
 accept="image/*,.pdf"
 className="hidden"
 />
 <div
 className="w-10 h-10 rounded-xl border flex items-center justify-center mx-auto mb-2.5"
 style={{
 backgroundColor:'rgba(43, 127, 255, 0.1)',
 borderColor:'rgba(43, 127, 255, 0.25)',
 color:'rgb(43, 127, 255)',
 }}
 >
 <UploadCloud className="w-5 h-5" />
 </div>
 <p className="text-xs font-semibold text-theme-text">
 {file ? file.name :'Click to select file or drag & drop here'}
 </p>
 <p className="text-[11px] text-theme-text-muted mt-1">
 Supports PNG, JPG, WebP, SVG, and diagrams
 </p>
 </div>

 {/* Direct Media URL Fallback */}
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Or Enter Public Image / Asset URL
 </label>
 <input
 type="url"
 value={directUrl}
 onChange={(e) => setDirectUrl(e.target.value)}
 placeholder="https://images.unsplash.com/..."
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>

 {/* Asset Name & Classification */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Asset Title *
 </label>
 <input
 type="text"
 value={fileName}
 onChange={(e) => setFileName(e.target.value)}
 placeholder="e.g. Profile Avatar"
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Usage Classification *
 </label>
 <select
 value={usage}
 onChange={(e) => setUsage(e.target.value as any)}
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors cursor-pointer"
 >
 <option value="profile">Profile Avatar / Banner</option>
 <option value="project">Project Diagram / Cover</option>
 <option value="general">General Asset / Certificate</option>
 </select>
 </div>
 </div>

 {/* Description / Alt Text */}
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Alt Text / Description
 </label>
 <input
 type="text"
 value={altText}
 onChange={(e) => setAltText(e.target.value)}
 placeholder="Brief description of the asset..."
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>
 </div>

 {/* Modal Fixed Footer Bar */}
 <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-theme-card dark:bg-[#0c0d10] shrink-0">
 <button
 type="button"
 onClick={() => setIsUploadModalOpen(false)}
 className="px-4 py-2 rounded-xl text-xs text-theme-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={uploading || (!file && !directUrl.trim()) || !fileName.trim()}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-cambria font-bold transition-opacity hover:opacity-90 shadow-xs cursor-pointer disabled:opacity-50"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 >
 {uploading ? (
 <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
 ) : (
 <UploadCloud className="w-3.5 h-3.5" />
 )}
 <span>{uploading ?'REGISTERING...' :'SAVE MEDIA ASSET'}</span>
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 <DeleteConfirmModal
 isOpen={deleteModalOpen}
 title="Delete Media Asset"
 itemName={mediaList.find((m) => m.id === deletingId)?.name}
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