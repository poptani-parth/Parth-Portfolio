import React from 'react';

export const TableLoadingSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 4, cols = 4 }) => {
  return (
    <div className="w-full bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 overflow-hidden animate-pulse">
      <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded-md w-1/4 mb-6"></div>
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-zinc-800/60 last:border-0">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-4 bg-slate-200 dark:bg-zinc-800 rounded-md"
                style={{ width: `${100 / cols}%` }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardLoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 animate-pulse space-y-4"
        >
          <div className="h-40 bg-slate-200 dark:bg-zinc-800 rounded-xl w-full"></div>
          <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded w-2/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-full"></div>
            <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-4/5"></div>
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-16"></div>
            <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
