import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Layers, GraduationCap, Briefcase, Code2, FolderTree,
  ImageIcon, Mail, Settings, LogOut, Moon, Sun, ExternalLink,
  Menu, X, Server, ChevronRight
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

// Admin Sections
import { ProfileAdminSection } from '../../components/admin/sections/ProfileAdminSection';
import { ProjectsAdminSection } from '../../components/admin/sections/ProjectsAdminSection';
import { EducationAdminSection } from '../../components/admin/sections/EducationAdminSection';
import { ExperienceAdminSection } from '../../components/admin/sections/ExperienceAdminSection';
import { SkillsAdminSection } from '../../components/admin/sections/SkillsAdminSection';
import { SkillCategoriesAdminSection } from '../../components/admin/sections/SkillCategoriesAdminSection';
import { MediaAdminSection } from '../../components/admin/sections/MediaAdminSection';
import { ContactMessagesAdminSection } from '../../components/admin/sections/ContactMessagesAdminSection';
import { SettingsAdminSection } from '../../components/admin/sections/SettingsAdminSection';

type AdminTab = 'projects' | 'profile' | 'experience' | 'education' | 'skills' | 'categories' | 'media' | 'contact' | 'settings';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  // FIXED: Merged duplicate useAdminAuth destructurings
  const { isAuthenticated, isValidating, adminUser, logout } = useAdminAuth(); 
  const { showSuccess } = useToast();
  const { isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Only redirect if validation is finished and the user is NOT authenticated
    if (!isValidating && !isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, isValidating, navigate]);

  const handleLogout = () => {
    logout();
    showSuccess('Signed out', 'Admin session ended safely');
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { id: 'projects', label: 'Projects & Work', icon: Layers },
    { id: 'profile', label: 'Profile & Bio', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills & Tech', icon: Code2 },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'contact', label: 'Inquiries & Messages', icon: Mail },
    { id: 'settings', label: 'Settings & API', icon: Settings },
  ];

  // FIXED: Display a loading skeleton/spinner while the startup probe runs
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#09090b]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#121215]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shadow-xs">
              PP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  Parth Poptani
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                  Workspace
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Backend Portfolio Admin
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Signed in as {adminUser?.username || 'admin'}</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-xs"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            to="/"
            target="_blank"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Public Site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors cursor-pointer border border-rose-200/60 dark:border-rose-900/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 space-y-3 sticky top-24 self-start">
          <div className="p-2.5 bg-white dark:bg-[#121215] rounded-3xl border border-slate-200/90 dark:border-zinc-800/90 shadow-sm space-y-1">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Content &amp; Portfolio
            </div>
            {navItems.slice(0, 7).map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                </button>
              );
            })}

            <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 border-t border-slate-100 dark:border-zinc-800/60">
              Inquiries &amp; Settings
            </div>
            {navItems.slice(7).map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#121215] p-6 shadow-2xl z-10 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Admin Navigation</h3>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-1">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as AdminTab);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Section Content */}
        <main className="flex-1 min-w-0 pb-16">
          {activeTab === 'profile' && <ProfileAdminSection />}
          {activeTab === 'projects' && <ProjectsAdminSection />}
          {activeTab === 'education' && <EducationAdminSection />}
          {activeTab === 'experience' && <ExperienceAdminSection />}
          {activeTab === 'skills' && <SkillsAdminSection />}
          {activeTab === 'categories' && <SkillCategoriesAdminSection />}
          {activeTab === 'media' && <MediaAdminSection />}
          {activeTab === 'contact' && <ContactMessagesAdminSection />}
          {activeTab === 'settings' && <SettingsAdminSection />}
        </main>
      </div>
    </div>
  );
};