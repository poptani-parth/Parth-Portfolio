import React from'react';
import { motion, AnimatePresence } from'motion/react';
import { AlertTriangle, Trash2, X } from'lucide-react';

interface DeleteConfirmModalProps {
 isOpen: boolean;
 title: string;
 itemName?: string;
 message?: string;
 isDeleting?: boolean;
 onConfirm: () => void;
 onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
 isOpen,
 title,
 itemName,
 message,
 isDeleting,
 onConfirm,
 onCancel
}) => {
 if (!isOpen) return null;

 return (
 <AnimatePresence>
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onCancel}
 className="fixed inset-0 bg-black/60 backdrop-blur-xs"
 />

 {/* Modal Dialog */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 15 }}
 className="relative w-full max-w-md bg-theme-card dark:bg-[#141414] rounded-2xl border border-theme-border shadow-2xl p-6 overflow-hidden z-10"
 >
 <div className="flex items-start gap-4">
 <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0">
 <AlertTriangle className="w-6 h-6" />
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="text-base font-bold font-['Syne',sans-serif] text-theme-text">
 {title}
 </h3>
 <p className="mt-1 text-xs text-theme-text-secondary leading-relaxed">
 {message || (
 <>
 Are you sure you want to permanently delete{''}
 <strong className="text-theme-text">{itemName ||'this record'}</strong>? This operation cannot be undone.
 </>
 )}
 </p>
 </div>
 <button
 onClick={onCancel}
 className="p-1 text-theme-text-muted hover:text-slate-700 dark:hover:text-zinc-300 rounded-lg"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
 <button
 type="button"
 disabled={isDeleting}
 onClick={onCancel}
 className="px-4 py-2 text-xs font-sens font-semibold rounded-xl bg-theme-bg dark:bg-zinc-800 text-theme-text-secondary hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
 >
 Cancel
 </button>
 <button
 type="button"
 disabled={isDeleting}
 onClick={onConfirm}
 className="inline-flex items-center gap-2 px-4 py-2 text-xs font-sans font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
 >
 {isDeleting ? (
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : (
 <Trash2 className="w-4 h-4" />
 )}
 <span>{isDeleting ?'Deleting...' :'Delete Permanently'}</span>
 </button>
 </div>
 </motion.div>
 </div>
 </AnimatePresence>
 );
};
