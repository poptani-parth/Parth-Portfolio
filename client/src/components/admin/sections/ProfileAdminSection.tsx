import React, { useState, useEffect, useCallback, useMemo } from'react';
import { Save, RotateCcw, AlertCircle, Calculator, Sparkles } from'lucide-react';
import { useAdminAuth } from'../../../context/AdminAuthContext';
import { useToast } from'../../../context/ToastContext';
import { createAdminApi, AdminApiException } from'../../../api/adminApi';
import { ProfileDTO, ExperienceDTO } from'../../../types';
import { TableLoadingSkeleton } from'../LoadingSkeleton';

const SAFE_URL_REGEX = /^(https?:\/\/|mailto:|tel:|\/)/i;

const validateSafeUrl = (url?: string | null): boolean => {
 if (!url || !url.trim()) return true;
 const trimmed = url.trim();
 if (/^(javascript|vbscript|data):/i.test(trimmed)) {
 return false;
 }
 return SAFE_URL_REGEX.test(trimmed);
};

// Formats 0.x to Months and >= 1 to Years
export const formatExperienceBadge = (val: number | string | undefined | null): string => {
 const num = typeof val ==='string' ? parseFloat(val) : Number(val ?? 0);
 if (isNaN(num) || num <= 0) return'0 Months';

 if (num < 1) {
 const months = Math.round(num * 12);
 return`${months} ${months === 1 ?'Month' :'Months'}`;
 }

 const rounded = Number.isInteger(num) ? num : num.toFixed(1);
 return`${rounded}+ ${num === 1 ?'Year' :'Years'}`;
};

export const ProfileAdminSection: React.FC = () => {
 const { fetchWithAuth, logout } = useAdminAuth();
 const { showSuccess, showError } = useToast();

 const api = useMemo(() => createAdminApi(fetchWithAuth), [fetchWithAuth]);

 const [profile, setProfile] = useState<any | null>(null);
 const [originalProfile, setOriginalProfile] = useState<any | null>(null);
 const [experiences, setExperiences] = useState<ExperienceDTO[]>([]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

 const fetchProfileAndExperiences = useCallback(async () => {
 setLoading(true);
 try {
 const [profileData, expData] = await Promise.allSettled([
 api.getProfile(),
 api.getExperience(),
 ]);

 if (profileData.status ==='fulfilled') {
 const p = profileData.value;
 // Default local fallback values if not present on backend DTO
 const enrichedProfile = {
 ...p,
 yearsOfExperience: p.yearsOfExperience ?? 0.6,
 showExperienceInProfile: p.showExperienceInProfile ?? true,
 };
 setProfile(enrichedProfile);
 setOriginalProfile(enrichedProfile);
 }

 if (expData.status ==='fulfilled') {
 setExperiences(Array.isArray(expData.value) ? expData.value : []);
 }
 } catch (err: any) {
 if (err?.status === 401 || err?.status === 403) {
 logout();
 showError('Session expired','Your session has expired. Please sign in again.');
 return;
 }
 showError('Failed to load profile data', err?.message ||'Unable to load profile');
 } finally {
 setLoading(false);
 }
 }, [api, logout, showError]);

 useEffect(() => {
 fetchProfileAndExperiences();
 }, [fetchProfileAndExperiences]);

 // Calculates total years/months across all registered company experiences
 const handleAutoCalculateExperience = () => {
 if (!experiences || experiences.length === 0) {
 showError('No Experience Found','Add experience items in the Experience tab first.');
 return;
 }

 let totalMonths = 0;
 const now = new Date();

 experiences.forEach((exp) => {
 // Parse startDate (handles"2023","2023-01","2023-01-01")
 const startParts = (exp.startDate ||'2023').split(/[-/]/);
 const startYear = parseInt(startParts[0], 10) || 2023;
 const startMonth = startParts[1] ? parseInt(startParts[1], 10) - 1 : 0;
 const startDate = new Date(startYear, startMonth, 1);

 let endDate = now;
 if (!exp.current && exp.endDate && exp.endDate.toLowerCase() !=='present') {
 const endParts = exp.endDate.split(/[-/]/);
 const endYear = parseInt(endParts[0], 10) || now.getFullYear();
 const endMonth = endParts[1] ? parseInt(endParts[1], 10) - 1 : 11;
 endDate = new Date(endYear, endMonth, 1);
 }

 const diffMonths =
 (endDate.getFullYear() - startDate.getFullYear()) * 12 +
 (endDate.getMonth() - startDate.getMonth()) +
 1;

 if (diffMonths > 0) {
 totalMonths += diffMonths;
 }
 });

 const calculatedYears = parseFloat((totalMonths / 12).toFixed(1));

 setProfile((prev: any) => ({
 ...prev,
 yearsOfExperience: calculatedYears,
 }));

 showSuccess(
'Experience Calculated',
`Calculated ${totalMonths} months (${formatExperienceBadge(calculatedYears)}) from work history.`
 );
 };

 const handleReset = () => {
 if (originalProfile) {
 setProfile({ ...originalProfile });
 setFieldErrors({});
 showSuccess('Form Reset','Reverted back to the saved profile values.');
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!profile) return;

 setFieldErrors({});
 const errors: Record<string, string> = {};

 if (!profile.name?.trim()) errors.name ='Full name is required';
 if (!profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
 errors.email ='Valid email is required';
 }

 if (!validateSafeUrl(profile.githubUrl)) errors.githubUrl ='Unsafe URL protocol detected';
 if (!validateSafeUrl(profile.linkedinUrl)) errors.linkedinUrl ='Unsafe URL protocol detected';
 if (!validateSafeUrl(profile.resumeUrl)) errors.resumeUrl ='Unsafe URL protocol detected';
 if (!validateSafeUrl(profile.profileImageUrl)) errors.profileImageUrl ='Unsafe image URL protocol detected';

 if (Object.keys(errors).length > 0) {
 setFieldErrors(errors);
 return;
 }

 setSaving(true);
 try {
 const sanitizedPayload = {
 ...profile,
 name: String(profile.name ??'').trim(),
 heroTitle: String(profile.heroTitle ??'').trim(),
 heroSubtitle: String(profile.heroSubtitle ??'').trim(),
 bio: String(profile.bio ??'').trim(),
 phone: String(profile.phone ??'').trim(),
 location: String(profile.location ??'').trim(),
 email: String(profile.email ??'').trim(),
 githubUrl: String(profile.githubUrl ??'').trim(),
 linkedinUrl: String(profile.linkedinUrl ??'').trim(),
 resumeUrl: String(profile.resumeUrl ??'').trim(),
 profileImageUrl: String(profile.profileImageUrl ??'').trim(),
 active: profile.active ?? true,
 yearsOfExperience: Number(profile.yearsOfExperience ?? 0),
 showExperienceInProfile: Boolean(profile.showExperienceInProfile),
 };

 const updated = await api.updateProfile(sanitizedPayload);
 const merged = {
 ...updated,
 yearsOfExperience: sanitizedPayload.yearsOfExperience,
 showExperienceInProfile: sanitizedPayload.showExperienceInProfile,
 };

 setProfile(merged);
 setOriginalProfile(merged);
 showSuccess('Profile updated successfully');
 } catch (err: any) {
 if (err?.status === 401 || err?.status === 403) {
 logout();
 showError('Session expired','Please sign in again.');
 return;
 }

 if (err instanceof AdminApiException && err.fieldErrors) {
 setFieldErrors(err.fieldErrors);
 } else {
 showError('Update failed', err?.message ||'Failed to update profile');
 }
 } finally {
 setSaving(false);
 }
 };

 if (loading) {
 return <TableLoadingSkeleton rows={6} cols={2} />;
 }

 if (!profile) {
 return (
 <div className="p-8 text-center bg-theme-card dark:bg-[#0c0d10] rounded-2xl border border-theme-border">
 <p className="text-sm text-theme-text-muted">Profile data unavailable.</p>
 <button
 type="button"
 onClick={fetchProfileAndExperiences}
 className="mt-4 px-4 py-2 rounded-xl text-white text-xs font-sans font-bold cursor-pointer"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 >
 Retry
 </button>
 </div>
 );
 }

 const formattedBadgePreview = formatExperienceBadge(profile.yearsOfExperience);

 return (
 <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
 {/* Top Bio Preview Card with Save & Reset Controls */}
 <div className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] p-6 sm:p-7 shadow-xs">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
 <div>
 <div className="text-[11px] font-mono uppercase tracking-widest text-theme-text-muted">
 Profile Overview &amp; Engineer Statement
 </div>
 <div className="text-[11px] text-theme-text-muted font-light mt-0.5">
 Live view of your public engineer statement and configuration actions.
 </div>
 </div>

 <div className="flex items-center gap-2.5 shrink-0">
 <button
 type="button"
 onClick={handleReset}
 disabled={saving}
 className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-theme-border bg-theme-card hover:bg-slate-50 dark:hover:bg-[#181920] text-theme-text-secondary text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-50"
 >
 <RotateCcw className="w-3.5 h-3.5" />
 <span>Reset</span>
 </button>

 <button
 type="submit"
 disabled={saving}
 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-mono font-bold transition-opacity hover:opacity-90 shadow-xs cursor-pointer disabled:opacity-50"
 style={{ backgroundColor:'rgb(43, 127, 255)' }}
 >
 {saving ? (
 <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
 ) : (
 <Save className="w-3.5 h-3.5" />
 )}
 <span>{saving ?'Saving...' :'Save Changes'}</span>
 </button>
 </div>
 </div>

 <div className="text-xs sm:text-sm text-theme-text-secondary leading-relaxed font-light">
 {profile.bio || (
 <span className="text-theme-text-muted italic">
 No biography specified yet. Complete the biography below.
 </span>
 )}
 </div>
 </div>

 {/* NEW: Experience Metric Configuration Card */}
 <div className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] p-6 shadow-xs space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <div className="flex items-center gap-2">
 <Sparkles className="w-4 h-4" style={{ color:'rgb(43, 127, 255)' }} />
 <span className="text-xs font-mono uppercase tracking-widest text-theme-text font-bold">
 Years of Experience Metric
 </span>
 </div>

 <button
 type="button"
 onClick={handleAutoCalculateExperience}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-bg dark:bg-[#111216] hover:border-[rgb(43,127,255)] text-theme-text-secondary text-[11px] font-mono transition-colors cursor-pointer"
 >
 <Calculator className="w-3.5 h-3.5 text-[rgb(43,127,255)]" />
 <span>Calculate from Experience History</span>
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Experience Value (Years as decimal, e.g. 0.6 for 7 mos, or 2 for 2 yrs)
 </label>
 <input
 type="number"
 step="any"
 min="0"
 value={profile.yearsOfExperience ??''}
 onChange={(e) =>
 setProfile({ ...profile, yearsOfExperience: e.target.value ==='' ?'' : parseFloat(e.target.value) })
 }
 placeholder="e.g. 0.6 or 2.5"
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>

 {/* Live Preview of the Badge Formatting */}
 <div className="p-3.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border flex items-center justify-between">
 <div>
 <div className="text-[11px] font-mono text-theme-text-muted uppercase">
 Rendered Public Badge
 </div>
 <div className="text-sm font-bold text-theme-text mt-0.5">
 {formattedBadgePreview}
 </div>
 </div>

 <div
 className="px-3 py-1 rounded-full text-xs font-mono font-bold"
 style={{
 backgroundColor:'rgba(43, 127, 255, 0.1)',
 color:'rgb(43, 127, 255)',
 }}
 >
 {Number(profile.yearsOfExperience) < 1 ?'Month Format' :'Year Format'}
 </div>
 </div>
 </div>

 {/* Toggle: Show Experience in Profile / Public Hero */}
 <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
 <div>
 <div className="text-xs font-bold text-theme-text">
 Show Experience on Public Portfolio Hero
 </div>
 <div className="text-[11px] text-theme-text-muted font-light mt-0.5">
 When toggled on, your experience badge ({formattedBadgePreview}) is rendered beside your projects metric.
 </div>
 </div>

 <button
 type="button"
 role="switch"
 aria-checked={profile.showExperienceInProfile ?? true}
 onClick={() =>
 setProfile({
 ...profile,
 showExperienceInProfile: !(profile.showExperienceInProfile ?? true),
 })
 }
 className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
 profile.showExperienceInProfile ?? true ?'bg-[rgb(43,127,255)]' :'bg-zinc-700'
 }`}
 >
 <span
 className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-theme-card shadow-sm ring-0 transition duration-200 ease-in-out ${
 profile.showExperienceInProfile ?? true ?'translate-x-5' :'translate-x-0'
 }`}
 />
 </button>
 </div>
 </div>

 {/* Core Identity & Headline */}
 <div className="space-y-4">
 <div className="text-[11px] font-mono uppercase tracking-widest text-theme-text-muted">
 Core Identity &amp; Headline
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Full Name *
 </label>
 <input
 type="text"
 value={profile.name ??''}
 onChange={(e) => setProfile({ ...profile, name: e.target.value })}
 className={`w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text focus:outline-none transition-colors ${
 fieldErrors.name
 ?'border-rose-500 focus:border-rose-600'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.name && (
 <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1">
 <AlertCircle className="w-3 h-3" />
 {fieldErrors.name}
 </p>
 )}
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Professional Title *
 </label>
 <input
 type="text"
 value={profile.heroTitle ??''}
 onChange={(e) => setProfile({ ...profile, heroTitle: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Hero Subtitle / Tagline
 </label>
 <input
 type="text"
 value={profile.heroSubtitle ??''}
 onChange={(e) => setProfile({ ...profile, heroSubtitle: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Location / Timezone
 </label>
 <input
 type="text"
 value={profile.location ??''}
 onChange={(e) => setProfile({ ...profile, location: e.target.value })}
 placeholder="e.g. Ahmadabad"
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>
 </div>
 </div>

 {/* Biography & Summary */}
 <div className="space-y-4">
 <div className="text-[11px] font-mono uppercase tracking-widest text-theme-text-muted">
 Biography &amp; Summary
 </div>

 <div>
 <textarea
 rows={5}
 value={profile.bio ??''}
 onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
 placeholder="Introduce your engineering focus, high-throughput systems, concurrency strengths, and backend architectures..."
 className="w-full p-4 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[rgb(43,127,255)] leading-relaxed resize-none transition-colors"
 />
 </div>
 </div>

 {/* Contact & Social Profiles */}
 <div className="space-y-4">
 <div className="text-[11px] font-mono uppercase tracking-widest text-theme-text-muted">
 Contact &amp; Social Profiles
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Email Address *
 </label>
 <input
 type="email"
 value={profile.email ??''}
 onChange={(e) => setProfile({ ...profile, email: e.target.value })}
 className={`w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text focus:outline-none transition-colors ${
 fieldErrors.email
 ?'border-rose-500 focus:border-rose-600'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.email && (
 <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1">
 <AlertCircle className="w-3 h-3" />
 {fieldErrors.email}
 </p>
 )}
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Phone Number (Optional)
 </label>
 <input
 type="text"
 value={profile.phone ??''}
 onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
 placeholder="+91 ..."
 className="w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border border-theme-border text-xs text-theme-text focus:outline-none focus:border-[rgb(43,127,255)] transition-colors"
 />
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 GitHub Profile URL
 </label>
 <input
 type="url"
 value={profile.githubUrl ??''}
 onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
 placeholder="https://github.com/..."
 className={`w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text focus:outline-none transition-colors ${
 fieldErrors.githubUrl
 ?'border-rose-500'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.githubUrl && (
 <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.githubUrl}</p>
 )}
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 LinkedIn Profile URL
 </label>
 <input
 type="url"
 value={profile.linkedinUrl ??''}
 onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
 placeholder="https://linkedin.com/in/..."
 className={`w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text focus:outline-none transition-colors ${
 fieldErrors.linkedinUrl
 ?'border-rose-500'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.linkedinUrl && (
 <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.linkedinUrl}</p>
 )}
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Resume Document URL
 </label>
 <input
 type="text"
 value={profile.resumeUrl ??''}
 onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
 placeholder="https://... or /resume.pdf"
 className={`w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text focus:outline-none transition-colors ${
 fieldErrors.resumeUrl
 ?'border-rose-500'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.resumeUrl && (
 <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.resumeUrl}</p>
 )}
 </div>

 <div>
 <label className="block text-xs text-theme-text-secondary font-medium mb-1.5">
 Profile Image URL
 </label>
 <input
 type="text"
 value={profile.profileImageUrl ??''}
 onChange={(e) => setProfile({ ...profile, profileImageUrl: e.target.value })}
 placeholder="https://..."
 className={`w-full px-4 py-2.5 rounded-xl bg-theme-bg dark:bg-[#111216] border text-xs text-theme-text focus:outline-none transition-colors ${
 fieldErrors.profileImageUrl
 ?'border-rose-500'
 :'border-theme-border focus:border-[rgb(43,127,255)]'
 }`}
 />
 {fieldErrors.profileImageUrl && (
 <p className="mt-1 text-[11px] text-rose-500">{fieldErrors.profileImageUrl}</p>
 )}
 </div>
 </div>
 </div>

 {/* Public Profile Status Switch */}
 <div className="rounded-2xl border border-theme-border bg-theme-card dark:bg-[#0c0d10] p-5 flex items-center justify-between shadow-xs">
 <div>
 <div className="text-xs font-bold text-theme-text">
 Public Profile Status
 </div>
 <div className="text-[11px] text-theme-text-muted font-light mt-0.5">
 When active, your profile information is publicly discoverable across portfolio endpoints.
 </div>
 </div>

 <button
 type="button"
 role="switch"
 aria-checked={profile.active ?? true}
 onClick={() => setProfile({ ...profile, active: !(profile.active ?? true) })}
 className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
 profile.active ?? true ?'bg-[rgb(43,127,255)]' :'bg-zinc-700'
 }`}
 >
 <span
 className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-theme-card shadow-sm ring-0 transition duration-200 ease-in-out ${
 profile.active ?? true ?'translate-x-5' :'translate-x-0'
 }`}
 />
 </button>
 </div>
 </form>
 );
};