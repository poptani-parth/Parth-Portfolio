import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useProfile } from '../../hooks/usePortfolioData';

export const Navbar: React.FC = () => {
  const { data: profile } = useProfile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Experience', href: '#experience' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-[#090909]/95 backdrop-blur-md shadow-xs border-b border-slate-200 dark:border-zinc-800/50'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo (Left) */}
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center gap-2 text-2xl font-bold font-['Syne',sans-serif] tracking-tight text-slate-900 dark:text-white hover:opacity-80 transition-opacity">
              {profile?.name || 'Portfolio'}
            </a>
          </div>

          {/* Desktop Nav Links (Center) */}
          <div className="hidden lg:flex flex-1 justify-center">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[14px] font-bold text-slate-900 dark:text-zinc-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors border-b-2 border-transparent hover:border-blue-500 pb-0.5"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact / Right side */}
          <div className="hidden lg:flex items-center justify-end gap-6 text-[10px] font-bold tracking-wider font-sens">
            <div className="text-right text-slate-600 dark:text-zinc-400">
              {profile?.email && <div><span className="text-slate-900 dark:text-white">EMAIL: </span><a href={`mailto:${profile.email}`} className="hover:text-blue-500 transition-colors">{profile.email.toUpperCase()}</a></div>}
            </div>
            <div className="h-6 w-px bg-slate-300 dark:bg-zinc-700"></div>
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-4">
            <ThemeToggle />
            <button
              type="button"
              className="text-slate-900 dark:text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-[#090909] border-b border-slate-200 dark:border-zinc-800 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-4 text-base font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800"
                >
                  {link.name}
                </a>
              ))}
              <div className="px-3 pt-4 pb-2 text-[11px] font-sans font-bold text-slate-600 dark:text-zinc-400">
                {profile?.email && <>EMAIL: <a href={`mailto:${profile.email}`} className="text-slate-900 dark:text-white">{profile.email}</a></>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
