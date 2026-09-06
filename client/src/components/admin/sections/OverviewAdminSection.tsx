import React, { useState, useEffect } from'react';
import {
 ExternalLink,
 Code2,
 Layers,
 Mail,
 GraduationCap,
 ArrowRight,
 ShieldCheck,
 Plus,
 Inbox,
} from'lucide-react';
import { useAdminAuth } from'../../../context/AdminAuthContext';
import { createAdminApi } from'../../../api/adminApi';
import { ContactMessageDTO } from'../../../types';

interface OverviewAdminSectionProps {
 onNavigate: (tab: any) => void;
}

export const OverviewAdminSection: React.FC<OverviewAdminSectionProps> = ({ onNavigate }) => {
 const { adminUser, fetchWithAuth } = useAdminAuth();
 const api = createAdminApi(fetchWithAuth);

 const [skillsCount, setSkillsCount] = useState<number>(0);
 const [projectsCount, setProjectsCount] = useState<number>(0);
 const [messages, setMessages] = useState<ContactMessageDTO[]>([]);
 const [milestonesCount, setMilestonesCount] = useState<number>(0);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 let mounted = true;
 const loadOverviewData = async () => {
 try {
 const [skillsRes, projectsRes, expRes, eduRes, msgsRes] = await Promise.allSettled([
 api.getSkills(),
 api.getProjects(),
 api.getExperience(),
 api.getEducation(),
 api.getContactMessages(),
 ]);

 if (!mounted) return;

 if (skillsRes.status ==='fulfilled') setSkillsCount(skillsRes.value?.length || 0);
 if (projectsRes.status ==='fulfilled') setProjectsCount(projectsRes.value?.length || 0);

 const expCount = expRes.status ==='fulfilled' ? expRes.value?.length || 0 : 0;
 const eduCount = eduRes.status ==='fulfilled' ? eduRes.value?.length || 0 : 0;
 setMilestonesCount(expCount + eduCount);

 if (msgsRes.status ==='fulfilled') {
 setMessages(Array.isArray(msgsRes.value) ? msgsRes.value : []);
 }
 } catch {
 // Fallback for fresh/offline instances
 } finally {
 if (mounted) setLoading(false);
 }
 };

 loadOverviewData();
 return () => {
 mounted = false;
 };
 }, []);

 return (
 <div className="space-y-6">
 {/* Hero Banner Card */}
 <div className="relative overflow-hidden rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] p-6 sm:p-8 shadow-xs">
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
 <div className="space-y-3">
 <div
 className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border"
 style={{
 backgroundColor:'rgba(43, 127, 255, 0.1)',
 color:'rgb(43, 127, 255)',
 borderColor:'rgba(43, 127, 255, 0.25)',
 }}
 >
 <span
 className="w-2 h-2 rounded-full animate-pulse"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 />
 <span>Authenticated Session</span>
 <span className="text-theme-text-muted">•</span>
 <span className="text-theme-text-secondary">
 User: {adminUser?.username ||'admin'}
 </span>
 </div>

 <h1 className="text-2xl sm:text-3xl font-bold font-['Syne',sans-serif] text-theme-text tracking-tight">
 Parth Portfolio Administration
 </h1>

 <p className="text-xs sm:text-sm text-theme-text-secondary max-w-2xl font-light leading-relaxed">
 Central management console for developer identity, production architectures, technical competencies, and incoming communication channels.
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-3 shrink-0">
 <button
 onClick={() => onNavigate('profile')}
 className="px-4 py-2.5 rounded-xl text-white text-xs font-bold font-sans uppercase tracking-wider flex items-center gap-2 transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 >
 <span>Edit Profile</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>

 <a
 href="/"
 target="_blank"
 rel="noreferrer"
 className="px-4 py-2.5 rounded-xl border border-theme-border hover:bg-slate-100 dark:hover:bg-[#16161a] text-theme-text-secondary text-xs font-bold font-sans uppercase tracking-wider flex items-center gap-2 transition-colors shadow-xs"
 >
 <span>Live Portfolio</span>
 <ExternalLink className="w-3.5 h-3.5" />
 </a>
 </div>
 </div>
 </div>

 {/* 4-Card Metrics Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {/* Total Skills */}
 <div className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] p-5 flex flex-col justify-between shadow-xs">
 <div>
 <div className="flex items-center justify-between mb-4">
 <span className="text-xs text-theme-text-muted font-medium">Total Skills</span>
 <div
 className="w-8 h-8 rounded-lg flex items-center justify-center"
 style={{
 backgroundColor:'rgba(43, 127, 255, 0.1)',
 color:'rgb(43, 127, 255)',
 }}
 >
 <Code2 className="w-4 h-4" />
 </div>
 </div>
 <div className="text-3xl font-bold font-['Syne',sans-serif] text-theme-text mb-1">
 {loading ?'-' : skillsCount}
 </div>
 <p className="text-[11px] text-theme-text-muted font-light">
 Cataloged technical capabilities
 </p>
 </div>
 <button
 onClick={() => onNavigate('skills')}
 className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-theme-text-secondary hover:text-[rgb(43,127,255)] transition-colors cursor-pointer"
 >
 <span>Manage</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>

 {/* Projects & Systems */}
 <div className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] p-5 flex flex-col justify-between shadow-xs">
 <div>
 <div className="flex items-center justify-between mb-4">
 <span className="text-xs text-theme-text-muted font-medium">Projects &amp; Systems</span>
 <div
 className="w-8 h-8 rounded-lg flex items-center justify-center"
 style={{
 backgroundColor:'rgba(43, 127, 255, 0.1)',
 color:'rgb(43, 127, 255)',
 }}
 >
 <Layers className="w-4 h-4" />
 </div>
 </div>
 <div className="text-3xl font-bold font-['Syne',sans-serif] text-theme-text mb-1">
 {loading ?'-' : projectsCount}
 </div>
 <p className="text-[11px] text-theme-text-muted font-light">
 Featured architecture case studies
 </p>
 </div>
 <button
 onClick={() => onNavigate('projects')}
 className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-theme-text-secondary hover:text-[rgb(43,127,255)] transition-colors cursor-pointer"
 >
 <span>Manage</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>

 {/* Inbound Messages */}
 <div className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] p-5 flex flex-col justify-between shadow-xs">
 <div>
 <div className="flex items-center justify-between mb-4">
 <span className="text-xs text-theme-text-muted font-medium">Inbound Messages</span>
 <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
 <Mail className="w-4 h-4" />
 </div>
 </div>
 <div className="text-3xl font-bold font-['Syne',sans-serif] text-theme-text mb-1">
 {loading ?'-' : messages.length}
 </div>
 <p className="text-[11px] text-theme-text-muted font-light">
 Submissions via contact form
 </p>
 </div>
 <button
 onClick={() => onNavigate('contact')}
 className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-theme-text-secondary hover:text-amber-500 transition-colors cursor-pointer"
 >
 <span>Manage</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>

 {/* Career Milestones */}
 <div className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] p-5 flex flex-col justify-between shadow-xs">
 <div>
 <div className="flex items-center justify-between mb-4">
 <span className="text-xs text-theme-text-muted font-medium">Career Milestones</span>
 <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
 <GraduationCap className="w-4 h-4" />
 </div>
 </div>
 <div className="text-3xl font-bold font-['Syne',sans-serif] text-theme-text mb-1">
 {loading ?'-' : milestonesCount}
 </div>
 <p className="text-[11px] text-theme-text-muted font-light">
 Experience roles &amp; academic records
 </p>
 </div>
 <button
 onClick={() => onNavigate('experience')}
 className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-theme-text-secondary hover:text-purple-500 transition-colors cursor-pointer"
 >
 <span>Manage</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>

 {/* Bottom Split Layout: Inbound Messages & Security Posture */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
 {/* Left Column: Recent Messages */}
 <div className="lg:col-span-8 rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] p-6 shadow-xs">
 <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800/60">
 <div>
 <h2 className="text-base font-bold font-['Syne',sans-serif] text-theme-text">
 Recent Inbound Messages
 </h2>
 <p className="text-xs text-theme-text-muted font-light mt-0.5">
 Messages dispatched via the public contact endpoint
 </p>
 </div>
 <button
 onClick={() => onNavigate('contact')}
 className="text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
 style={{ color:'rgb(43, 127, 255)' }}
 >
 <span>View All</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>

 {messages.length === 0 ? (
 <div className="text-center py-16 flex flex-col items-center justify-center">
 <div className="w-12 h-12 rounded-2xl bg-theme-bg dark:bg-[#141418] border border-theme-border flex items-center justify-center text-theme-text-muted mb-3">
 <Inbox className="w-6 h-6" />
 </div>
 <p className="text-xs font-light text-theme-text-muted">
 No contact messages received yet.
 </p>
 </div>
 ) : (
 <div className="space-y-3">
 {messages.slice(0, 3).map((msg) => (
 <div
 key={msg.id}
 className="p-4 rounded-xl border border-slate-200/80 bg-theme-bg/50 dark:bg-[#111216] flex items-center justify-between"
 >
 <div className="space-y-1 max-w-md truncate">
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-theme-text">{msg.name}</span>
 <span className="text-[11px] text-theme-text-muted">({msg.email})</span>
 </div>
 <p className="text-xs text-theme-text-secondary truncate">{msg.subject}</p>
 </div>
 <button
 onClick={() => onNavigate('contact')}
 className="p-2 text-theme-text-muted hover:text-slate-900 dark:hover:text-white"
 >
 <ArrowRight className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Right Column: Security Posture & Shortcuts */}
 <div className="lg:col-span-4 space-y-6">
 {/* Security Posture Card */}
 <div className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] p-6 shadow-xs">
 <div className="flex items-center gap-2 mb-4">
 <ShieldCheck className="w-4 h-4" style={{ color:'rgb(43, 127, 255)' }} />
 <h3 className="text-sm font-bold font-['Syne',sans-serif] text-theme-text">
 Security Posture
 </h3>
 </div>

 <div className="space-y-3 text-xs text-theme-text-secondary leading-relaxed font-light">
 <div className="flex items-start gap-2">
 <span
 className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 />
 <div>
 <strong className="text-theme-text font-semibold">HttpOnly Cookies:</strong> Session tokens are stored exclusively in HttpOnly cookies and cannot be accessed by client JavaScript.
 </div>
 </div>

 <div className="flex items-start gap-2">
 <span
 className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 />
 <div>
 <strong className="text-theme-text font-semibold">CSRF Protection:</strong> In-memory tokens attached via X-XSRF-TOKEN on state mutations.
 </div>
 </div>

 <div className="flex items-start gap-2">
 <span
 className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 />
 <div>
 <strong className="text-theme-text font-semibold">Single-Flight Refresh:</strong> Automated 401 recovery avoids duplicate requests and loop hazards.
 </div>
 </div>
 </div>

 <button
 onClick={() => onNavigate('settings')}
 className="mt-5 pt-3 w-full border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-theme-text-secondary hover:text-[rgb(43,127,255)] transition-colors cursor-pointer"
 >
 <span>View Security Diagnostics</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>

 {/* Quick Shortcuts */}
 <div className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] p-6 shadow-xs">
 <h3 className="text-sm font-bold font-['Syne',sans-serif] text-theme-text mb-4">
 Quick Shortcuts
 </h3>

 <div className="space-y-2">
 <button
 onClick={() => onNavigate('skills')}
 className="w-full p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 dark:hover:bg-[#16161a] flex items-center justify-between text-xs font-semibold text-theme-text transition-all cursor-pointer"
 >
 <div className="flex items-center gap-2.5">
 <Plus className="w-3.5 h-3.5" style={{ color:'rgb(43, 127, 255)' }} />
 <span>Register New Skill</span>
 </div>
 <ArrowRight className="w-3.5 h-3.5 text-theme-text-muted" />
 </button>

 <button
 onClick={() => onNavigate('projects')}
 className="w-full p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 dark:hover:bg-[#16161a] flex items-center justify-between text-xs font-semibold text-theme-text transition-all cursor-pointer"
 >
 <div className="flex items-center gap-2.5">
 <Plus className="w-3.5 h-3.5" style={{ color:'rgb(43, 127, 255)' }} />
 <span>Publish Architecture Case</span>
 </div>
 <ArrowRight className="w-3.5 h-3.5 text-theme-text-muted" />
 </button>

 <button
 onClick={() => onNavigate('profile')}
 className="w-full p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 dark:hover:bg-[#16161a] flex items-center justify-between text-xs font-semibold text-theme-text transition-all cursor-pointer"
 >
 <div className="flex items-center gap-2.5">
 <Code2 className="w-3.5 h-3.5" style={{ color:'rgb(43, 127, 255)' }} />
 <span>Update Developer Bio</span>
 </div>
 <ArrowRight className="w-3.5 h-3.5 text-theme-text-muted" />
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};