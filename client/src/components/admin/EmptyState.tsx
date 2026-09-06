import React from'react';
import { FolderOpen, Plus } from'lucide-react';

interface EmptyStateProps {
 title: string;
 description: string;
 actionLabel?: string;
 onAction?: () => void;
 icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
 title,
 description,
 actionLabel,
 onAction,
 icon
}) => {
 return (
 <div className="flex flex-col items-center justify-center text-center p-12 bg-theme-card dark:bg-[#121212] rounded-2xl border border-dashed border-theme-border-subtle">
 <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-4 shadow-xs">
 {icon || <FolderOpen className="w-7 h-7" />}
 </div>
 <h4 className="text-base font-bold font-['Syne',sans-serif] text-theme-text">
 {title}
 </h4>
 <p className="text-xs text-theme-text-muted max-w-sm mt-1 mb-6 leading-relaxed">
 {description}
 </p>
 {actionLabel && onAction && (
 <button
 onClick={onAction}
 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-sans font-bold hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors shadow-xs cursor-pointer"
 >
 <Plus className="w-4 h-4" />
 <span>{actionLabel}</span>
 </button>
 )}
 </div>
 );
};
