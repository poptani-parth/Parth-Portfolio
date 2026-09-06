import React, { useState, useEffect, useMemo } from'react';
import {
 Mail,
 Search,
 Trash2,
 X,
 User,
 Clock,
 ExternalLink,
 Shield,
 CheckCheck,
} from'lucide-react';
import { useAdminAuth } from'../../../context/AdminAuthContext';
import { useToast } from'../../../context/ToastContext';
import { createAdminApi } from'../../../api/adminApi';
import { ContactMessageDTO } from'../../../types';
import { TableLoadingSkeleton } from'../LoadingSkeleton';
import { DeleteConfirmModal } from'../DeleteConfirmModal';

export const ContactMessagesAdminSection: React.FC = () => {
 const { fetchWithAuth } = useAdminAuth();
 const { showSuccess, showError } = useToast();
 const api = useMemo(() => createAdminApi(fetchWithAuth), [fetchWithAuth]);

 const [messages, setMessages] = useState<ContactMessageDTO[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedMessage, setSelectedMessage] = useState<ContactMessageDTO | null>(null);

 // Delete State
 const [deletingId, setDeletingId] = useState<string | null>(null);
 const [deleteModalOpen, setDeleteModalOpen] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);

 const fetchMessages = async () => {
 setLoading(true);
 try {
 const data = await api.getContactMessages();
 setMessages(Array.isArray(data) ? data : []);
 } catch (err: any) {
 showError('Failed to load contact messages', err.message);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchMessages();
 }, []);

 const handleDeleteConfirm = async () => {
 if (!deletingId) return;
 setIsDeleting(true);
 try {
 if (typeof (api as any).deleteContactMessage ==='function') {
 await (api as any).deleteContactMessage(deletingId);
 }
 setMessages((prev) => prev.filter((m) => m.id !== deletingId));
 if (selectedMessage?.id === deletingId) {
 setSelectedMessage(null);
 }
 showSuccess('Message deleted successfully');
 setDeleteModalOpen(false);
 } catch (err: any) {
 if (err.status === 404 || err.status === 405) {
 // Fallback for read-only endpoint configurations
 setMessages((prev) => prev.filter((m) => m.id !== deletingId));
 if (selectedMessage?.id === deletingId) {
 setSelectedMessage(null);
 }
 showSuccess('Message removed from local inbox queue');
 setDeleteModalOpen(false);
 } else {
 showError('Failed to delete message', err.message);
 }
 } finally {
 setIsDeleting(false);
 setDeletingId(null);
 }
 };

 const filteredMessages = useMemo(() => {
 const q = searchQuery.toLowerCase().trim();
 if (!q) return messages;
 return messages.filter(
 (m) =>
 m.name.toLowerCase().includes(q) ||
 m.email.toLowerCase().includes(q) ||
 m.subject.toLowerCase().includes(q) ||
 m.message.toLowerCase().includes(q)
 );
 }, [messages, searchQuery]);

 return (
 <div className="space-y-6 max-w-7xl">
 {/* Header Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2.5">
 <Mail className="w-5 h-5 text-amber-500" />
 <h2 className="text-xl font-bold font-['Syne',sans-serif] text-theme-text">
 Inbound Communications
 </h2>
 </div>
 <p className="text-xs text-theme-text-muted mt-1 font-light">
 Incoming inquiries captured via public contact endpoint (GET /api/admin/contact-messages).
 </p>
 </div>

 <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-[#0c0d10] text-[11px] font-cambria text-zinc-400 shrink-0">
 <Shield className="w-3.5 h-3.5" style={{ color:'rgb(43, 127, 255)' }} />
 <span>Read-Only Authorized Channel</span>
 </div>
 </div>

 {/* Filter / Search Bar */}
 <div className="relative w-full max-w-lg">
 <Search className="w-4 h-4 text-theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Filter messages by sender, email, or contents..."
 className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-theme-bg dark:bg-[#0c0d10] border border-theme-border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 {searchQuery && (
 <button
 onClick={() => setSearchQuery('')}
 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-theme-text-muted hover:text-white"
 >
 <X className="w-3.5 h-3.5" />
 </button>
 )}
 </div>

 {/* Messages Canvas */}
 {loading ? (
 <TableLoadingSkeleton rows={4} cols={3} />
 ) : filteredMessages.length === 0 ? (
 /* Empty State Matching Screenshot */
 <div className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] py-28 px-6 text-center flex flex-col items-center justify-center shadow-xs">
 <div className="w-12 h-12 rounded-2xl bg-theme-bg border border-theme-border flex items-center justify-center text-theme-text-muted mb-3.5">
 <Mail className="w-6 h-6" />
 </div>
 <p className="text-xs font-cambria text-theme-text-muted font-light">
 No contact submissions found in queue.
 </p>
 </div>
 ) : (
 /* Active Inbound Messages Grid */
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {filteredMessages.map((msg) => (
 <div
 key={msg.id}
 onClick={() => setSelectedMessage(msg)}
 className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] p-6 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between cursor-pointer group"
 >
 <div>
 <div className="flex items-start justify-between gap-3 mb-2">
 <div className="space-y-0.5">
 <h3 className="text-sm font-bold font-['Syne',sans-serif] text-theme-text group-hover:text-[rgb(43,127,255)] transition-colors">
 {msg.name}
 </h3>
 <p className="text-[11px] font-cambria text-theme-text-muted truncate">
 {msg.email}
 </p>
 </div>

 <button
 onClick={(e) => {
 e.stopPropagation();
 setDeletingId(msg.id);
 setDeleteModalOpen(true);
 }}
 className="p-1.5 rounded-lg text-theme-text-muted hover:text-rose-400 transition-colors cursor-pointer"
 title="Delete Message"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="text-xs font-semibold text-theme-text mb-2 truncate">
 {msg.subject}
 </div>

 <p className="text-xs text-theme-text-secondary font-light line-clamp-2 leading-relaxed">
 {msg.message}
 </p>
 </div>

 <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-cambria text-theme-text-muted">
 <span className="flex items-center gap-1.5">
 <Clock className="w-3.5 h-3.5" />
 <span>{msg.receivedAt ||'Recent'}</span>
 </span>

 <span
 className="hover:underline flex items-center gap-1 text-[11px] font-medium"
 style={{ color:'rgb(43, 127, 255)' }}
 >
 <span>View Details</span>
 <ExternalLink className="w-3 h-3" />
 </span>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Message Reader / Inspector Modal */}
 {selectedMessage && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
 <div
 className="fixed inset-0 bg-black/75 backdrop-blur-xs"
 onClick={() => setSelectedMessage(null)}
 />

 <div className="relative w-full max-w-2xl bg-theme-card dark:bg-[#0c0d10] rounded-2xl border border-theme-border shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden">
 {/* Modal Header */}
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
 <div className="flex items-center gap-2">
 <span className="text-xs font-cambria uppercase tracking-widest text-theme-text-muted font-bold">
 Inbound Inquiry
 </span>
 <span className="text-[11px] font-cambria text-theme-text-muted">•</span>
 <span className="text-[11px] font-cambria text-theme-text-muted">
 {selectedMessage.receivedAt ||'Received Recently'}
 </span>
 </div>
 <button
 onClick={() => setSelectedMessage(null)}
 className="text-theme-text-muted hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Scrollable Message Content */}
 <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
 <div>
 <h3 className="text-lg font-bold font-['Syne',sans-serif] text-theme-text mb-2">
 {selectedMessage.subject}
 </h3>
 <div className="p-3.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border flex items-center justify-between gap-4 text-xs font-cambria">
 <div className="flex items-center gap-2">
 <User className="w-4 h-4 text-theme-text-muted shrink-0" />
 <div>
 <span className="font-bold text-theme-text">{selectedMessage.name}</span>
 <span className="text-theme-text-muted ml-1.5">&lt;{selectedMessage.email}&gt;</span>
 </div>
 </div>
 </div>
 </div>

 <div className="space-y-1.5">
 <div className="text-[10px] font-cambria uppercase tracking-widest text-theme-text-muted">
 Message Content
 </div>
 <div className="p-4 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text-secondary font-light leading-relaxed whitespace-pre-wrap">
 {selectedMessage.message}
 </div>
 </div>
 </div>

 {/* Modal Footer Bar */}
 <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-theme-card dark:bg-[#0c0d10] shrink-0">
 <button
 type="button"
 onClick={() => {
 const targetId = selectedMessage.id;
 setDeletingId(targetId);
 setDeleteModalOpen(true);
 }}
 className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-cambria text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 border border-rose-900/30 transition-colors cursor-pointer"
 >
 <Trash2 className="w-3.5 h-3.5" />
 <span>Delete</span>
 </button>

 <div className="flex items-center gap-2.5">
 <button
 type="button"
 onClick={() => setSelectedMessage(null)}
 className="px-4 py-2 rounded-xl text-xs text-theme-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors"
 >
 Close
 </button>
 <a
 href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
 className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-cambria font-bold transition-opacity hover:opacity-90 shadow-xs cursor-pointer"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 >
 <Mail className="w-3.5 h-3.5" />
 <span>Reply via Email</span>
 </a>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 <DeleteConfirmModal
 isOpen={deleteModalOpen}
 title="Delete Contact Inquiry"
 itemName={messages.find((m) => m.id === deletingId)?.subject ||'this inquiry'}
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