import React from'react';
import { ArrowUp, Heart } from'lucide-react';
import { Link } from'react-router-dom';
import { useProfile } from'../../hooks/usePortfolioData';

export const Footer: React.FC = () => {
 const { data: profile } = useProfile();

 const scrollToTop = () => {
 window.scrollTo({ top: 0, behavior:'smooth' });
 };

 return (
 <footer className="border-t border-theme-border dark:border-zinc-800/60 bg-theme-card py-10 text-theme-text-muted text-xs transition-colors duration-200">
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
 <div>
 <div className="text-sm font-bold text-theme-text">
 Parth Poptani
 </div>
 <div className="text-xs text-theme-text-muted font-sans mt-0.5 flex items-center gap-1.5">
 <span>Crafted with care &amp; precision</span>
 <span>•</span>
 <span>Java Backend &amp; Distributed Systems</span>
 </div>
 </div>

 <div className="flex items-center gap-5">
 <a
 href={profile?.githubUrl ||'https://github.com/parthpoptani'}
 target="_blank"
 rel="noreferrer"
 className="text-xs font-cambria uppercase tracking-wider text-theme-text-secondary hover:text-slate-950 dark:hover:text-white font-semibold transition-colors"
 >
 GitHub
 </a>
 <a
 href={profile?.linkedinUrl ||'https://linkedin.com/in/parthpoptani'}
 target="_blank"
 rel="noreferrer"
 className="text-xs font-cambria uppercase tracking-wider text-theme-text-secondary hover:text-slate-950 dark:hover:text-white font-semibold transition-colors"
 >
 LinkedIn
 </a>
 <Link
 to="/admin"
 className="text-xs font-cambria uppercase tracking-wider text-theme-text-secondary hover:text-slate-950 dark:hover:text-white font-semibold transition-colors"
 >
 Admin Portal
 </Link>
 <button
 onClick={scrollToTop}
 className="text-xs font-cambria uppercase tracking-wider text-theme-text-secondary hover:text-slate-950 dark:hover:text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
 >
 <span>Back to Top</span>
 <ArrowUp className="w-3 h-3" />
 </button>
 </div>
 </div>
 </div>
 </footer>
 );
};
