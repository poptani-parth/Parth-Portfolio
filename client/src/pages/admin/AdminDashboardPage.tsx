import React, { useState, useEffect } from'react';
import { useNavigate, Link } from'react-router-dom';
import {
 LayoutDashboard,
 User,
 Code2,
 Layers,
 Briefcase,
 GraduationCap,
 ImageIcon,
 Mail,
 ShieldAlert,
 ExternalLink,
 Moon,
 Sun,
 LogOut,
 Menu,
 X,
 Lock,
} from'lucide-react';
import { useAdminAuth } from'../../context/AdminAuthContext';
import { useToast } from'../../context/ToastContext';
import { useTheme } from'../../context/ThemeContext';

// Admin Sections
import { OverviewAdminSection } from'../../components/admin/sections/OverviewAdminSection';
import { ProfileAdminSection } from'../../components/admin/sections/ProfileAdminSection';
import { ProjectsAdminSection } from'../../components/admin/sections/ProjectsAdminSection';
import { EducationAdminSection } from'../../components/admin/sections/EducationAdminSection';
import { ExperienceAdminSection } from'../../components/admin/sections/ExperienceAdminSection';
import { SkillsAdminSection } from'../../components/admin/sections/SkillsAdminSection';
import { MediaAdminSection } from'../../components/admin/sections/MediaAdminSection';
import { ContactMessagesAdminSection } from'../../components/admin/sections/ContactMessagesAdminSection';
import { SettingsAdminSection } from'../../components/admin/sections/SettingsAdminSection';

export type AdminTab =
 |'overview'
 |'profile'
 |'skills'
 |'projects'
 |'experience'
 |'education'
 |'media'
 |'contact'
 |'settings';

export const AdminDashboardPage: React.FC = () => {
 const navigate = useNavigate();
 const { isAuthenticated, isValidating, adminUser, logout } = useAdminAuth();
 const { showSuccess } = useToast();
 const { isDark, toggleTheme } = useTheme();

 const [activeTab, setActiveTab] = useState<AdminTab>('overview');
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

 useEffect(() => {
 if (!isValidating && !isAuthenticated) {
 navigate('/admin/login', { replace: true });
 }
 }, [isAuthenticated, isValidating, navigate]);

 const handleLogout = () => {
 logout();
 showSuccess('Signed out','Admin session ended safely');
 navigate('/admin/login', { replace: true });
 };

 const navItems = [
 { id:'overview', label:'Overview', icon: LayoutDashboard },
 { id:'profile', label:'Profile', icon: User },
 { id:'skills', label:'Skills', icon: Code2 },
 { id:'projects', label:'Projects', icon: Layers },
 { id:'experience', label:'Experience', icon: Briefcase, count:'R0' },
 { id:'education', label:'Education', icon: GraduationCap, count:'R0' },
 { id:'media', label:'Media', icon: ImageIcon },
 { id:'contact', label:'Messages', icon: Mail },
 { id:'settings', label:'Security & State', icon: ShieldAlert },
 ];

 if (isValidating) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-theme-bg text-theme-text">
 <div className="flex flex-col items-center gap-3">
 <div
 className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
 style={{ borderColor:'rgb(43, 127, 255)', borderTopColor:'transparent' }}
 />
 <p className="text-xs text-theme-text-muted font-mono uppercase tracking-widest">
 Verifying Session...
 </p>
 </div>
 </div>
 );
 }

 if (!isAuthenticated) return null;

 return (
 <div className="h-screen w-screen overflow-hidden bg-theme-bg text-theme-text flex flex-col md:flex-row font-sans selection:bg-[rgba(43,127,255,0.2)] selection:text-[rgb(43,127,255)]">
 {/* Mobile Top Header */}
 <div className="md:hidden shrink-0 flex items-center justify-between p-4 border-b border-theme-border bg-theme-card dark:bg-[#0c0d10] z-40">
 <div className="flex items-center gap-2">
 <div
 className="w-8 h-8 rounded-lg border flex items-center justify-center"
 style={{
 backgroundColor:'rgba(43, 127, 255, 0.1)',
 borderColor:'rgba(43, 127, 255, 0.25)',
 color:'rgb(43, 127, 255)',
 }}
 >
 <Lock className="w-4 h-4" />
 </div>
 <span className="text-xs font-bold tracking-wider uppercase font-mono text-theme-text">
 Admin Console
 </span>
 </div>
 <button
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 className="p-2 rounded-lg text-theme-text-muted hover:text-slate-900 dark:hover:text-white"
 >
 {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
 </button>
 </div>

 {/* Left Sidebar */}
 <aside
 className={`fixed md:static inset-y-0 left-0 z-50 w-64 h-full shrink-0 bg-theme-card dark:bg-[#0c0d10] border-r border-theme-border flex flex-col justify-between p-5 transition-transform duration-200 ${
 mobileMenuOpen ?'translate-x-0' :'-translate-x-full md:translate-x-0'
 }`}
 >
 <div className="flex flex-col min-h-0 flex-1 space-y-6">
 {/* Brand Header */}
 <div className="shrink-0 flex items-center gap-3 px-1 py-1">
 <div
 className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
 style={{
 backgroundColor:'rgba(43, 127, 255, 0.1)',
 borderColor:'rgba(43, 127, 255, 0.25)',
 color:'rgb(43, 127, 255)',
 }}
 >
 <Lock className="w-4 h-4" />
 </div>
 <div>
 <div className="text-xs font-bold tracking-widest uppercase font-mono text-theme-text">
 Admin Console
 </div>
 <div
 className="text-[10px] font-mono flex items-center gap-1.5"
 style={{ color:'rgb(43, 127, 255)' }}
 >
 <span
 className="w-1.5 h-1.5 rounded-full animate-pulse"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 />
 <span>SECURED</span>
 </div>
 </div>
 </div>

 {/* Navigation Items */}
 <div className="space-y-1 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
 <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-theme-text-muted select-none">
 Navigation
 </div>
 {navItems.map((item) => {
 const Icon = item.icon;
 const isActive = activeTab === item.id;
 return (
 <button
 key={item.id}
 onClick={() => {
 setActiveTab(item.id as AdminTab);
 setMobileMenuOpen(false);
 }}
 className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium border duration-150 cursor-pointer select-none text-left ${
 isActive
 ?'border-[rgba(43,127,255,0.35)] bg-[rgba(43,127,255,0.12)] text-[rgb(43,127,255)] font-semibold shadow-xs'
 :'border-transparent text-theme-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50'
 }`}
 >
 <div className="flex items-center gap-3">
 <Icon
 className={`w-4 h-4 shrink-0 ${
 isActive ?'text-[rgb(43,127,255)]' :'text-theme-text-muted'
 }`}
 />
 <span>{item.label}</span>
 </div>

 {item.count && (
 <span
 className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
 isActive
 ?'bg-[rgba(43,127,255,0.15)] text-[rgb(43,127,255)] border-[rgba(43,127,255,0.3)]'
 :'bg-theme-bg dark:bg-zinc-800/80 text-theme-text-secondary border-theme-border dark:border-zinc-700/60'
 }`}
 >
 {item.count}
 </span>
 )}
 </button>
 );
 })}
 </div>
 </div>

 {/* User Card & Logout Button */}
 <div className="shrink-0 pt-4 border-t border-theme-border space-y-3">
 <div className="p-3 rounded-xl bg-theme-bg border border-theme-border">
 <div className="text-xs font-bold text-theme-text font-mono truncate">
 {adminUser?.username ||'admin'}
 </div>
 <div className="text-[10px] text-theme-text-muted font-mono">HttpOnly Protected</div>
 </div>

 <button
 onClick={handleLogout}
 className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 cursor-pointer"
 >
 <LogOut className="w-3.5 h-3.5" />
 <span>Sign Out</span>
 </button>
 </div>
 </aside>

 {/* Main Viewport Container */}
 <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
 {/* Top Header Bar */}
 <header className="h-16 shrink-0 px-6 sm:px-10 border-b border-theme-border bg-theme-card/95 dark:bg-[#07080a]/95 backdrop-blur-md flex items-center justify-between z-30">
 <h2 className="text-sm sm:text-base font-bold font-['Syne',sans-serif] capitalize text-theme-text">
 {activeTab ==='settings' ?'Security & State' : activeTab}
 </h2>

 <div className="flex items-center gap-4 text-xs font-medium">
 <Link
 to="/"
 target="_blank"
 className="flex items-center gap-1.5 text-theme-text-secondary hover:text-slate-900 dark:hover:text-white"
 >
 <span>Live Site</span>
 <ExternalLink className="w-3.5 h-3.5" />
 </Link>

 <button
 onClick={toggleTheme}
 className="p-2 text-theme-text-secondary hover:text-slate-900 dark:hover:text-white cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800"
 title="Toggle Theme"
 >
 {isDark ? (
 <Sun className="w-4 h-4 text-amber-400" />
 ) : (
 <Moon className="w-4 h-4 text-theme-text-secondary" />
 )}
 </button>
 </div>
 </header>

 {/* Dynamic Section Content Canvas */}
 <main className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-7xl w-full mx-auto">
 {activeTab ==='overview' && (
 <OverviewAdminSection onNavigate={(tab) => setActiveTab(tab)} />
 )}
 {activeTab ==='profile' && <ProfileAdminSection />}
 {activeTab ==='skills' && <SkillsAdminSection />}
 {activeTab ==='projects' && <ProjectsAdminSection />}
 {activeTab ==='experience' && <ExperienceAdminSection />}
 {activeTab ==='education' && <EducationAdminSection />}
 {activeTab ==='media' && <MediaAdminSection />}
 {activeTab ==='contact' && <ContactMessagesAdminSection />}
 {activeTab ==='settings' && <SettingsAdminSection />}
 </main>
 </div>
 </div>
 );
};