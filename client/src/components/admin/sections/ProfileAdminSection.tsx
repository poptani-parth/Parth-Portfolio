import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  createAdminApi,
  AdminApiException,
} from '../../../api/adminApi';
import { ProfileDTO } from '../../../types';
import { TableLoadingSkeleton } from '../LoadingSkeleton';

const SAFE_URL_REGEX = /^(https?:\/\/|mailto:|tel:|\/)/i;

const validateSafeUrl = (url?: string | null): boolean => {
  if (!url || !url.trim()) return true;
  const trimmed = url.trim();
  if (/^(javascript|vbscript|data):/i.test(trimmed)) {
    return false;
  }
  return SAFE_URL_REGEX.test(trimmed);
};

const normalizeProfileDraft = (draft: ProfileDTO): ProfileDTO => ({
  ...draft,
  name: String(draft.name ?? '').trim(),
  heroTitle: String(draft.heroTitle ?? '').trim(),
  heroSubtitle: String(draft.heroSubtitle ?? '').trim(),
  bio: String(draft.bio ?? '').trim(),
  phone: String(draft.phone ?? '').trim(),
  location: String(draft.location ?? '').trim(),
  email: String(draft.email ?? '').trim(),
  githubUrl: String(draft.githubUrl ?? '').trim(),
  linkedinUrl: String(draft.linkedinUrl ?? '').trim(),
  resumeUrl: String(draft.resumeUrl ?? '').trim(),
  profileImageUrl: String(draft.profileImageUrl ?? '').trim(),
  active: draft.active ?? true,
});

export const ProfileAdminSection: React.FC = () => {
  const { fetchWithAuth, logout } = useAdminAuth();
  const { showSuccess, showError } = useToast();

  const api = useMemo(() => createAdminApi(fetchWithAuth), [fetchWithAuth]);

  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        logout();
        showError(
          'Session expired',
          'Your session has expired. Please sign in again.'
        );
        return;
      }

      if (err?.status === 404) {
        showError('Profile record not found — it may have been deleted');
      } else {
        showError(
          'Failed to load profile',
          err?.message || 'Unable to load profile'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [api, logout, showError]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    setFieldErrors({});

    const errors: Record<string, string> = {};

    if (!profile.name?.trim()) {
      errors.name = 'Full name is required';
    }

    if (!profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      errors.email = 'Valid email is required';
    }

    if (!validateSafeUrl(profile.githubUrl)) {
      errors.githubUrl = 'Unsafe URL protocol detected';
    }
    if (!validateSafeUrl(profile.linkedinUrl)) {
      errors.linkedinUrl = 'Unsafe URL protocol detected';
    }
    if (!validateSafeUrl(profile.resumeUrl)) {
      errors.resumeUrl = 'Unsafe URL protocol detected';
    }
    if (!validateSafeUrl(profile.profileImageUrl)) {
      errors.profileImageUrl = 'Unsafe image URL protocol detected';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);

    try {
      const sanitizedProfile = normalizeProfileDraft(profile);
      const updated = await api.updateProfile(sanitizedProfile);
      setProfile(updated);
      showSuccess('Profile updated successfully');
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        logout();
        showError(
          'Session expired',
          'Your session has expired. Please sign in again.'
        );
        return;
      }

      if (err instanceof AdminApiException && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        showError('Update failed', err?.message || 'Failed to update profile');
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
      <div className="p-8 text-center bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800">
        <p className="text-sm text-slate-500">Profile data unavailable.</p>
        <button
          type="button"
          onClick={fetchProfile}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-sans font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white">
            Developer Profile &amp; Core Bio
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-light">
            Manage your public credentials, system architect summary, availability status, and social handles.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-sans font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
          PUT /api/admin/profile
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={profile.name ?? ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border text-xs font-sans text-slate-900 dark:text-white focus:outline-none transition-colors ${
                fieldErrors.name
                  ? 'border-rose-500 focus:border-rose-600 bg-rose-50/20'
                  : 'border-slate-200 dark:border-zinc-800 focus:border-blue-500'
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-[11px] font-sans text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
              Professional Title *
            </label>
            <input
              type="text"
              value={profile.heroTitle ?? ''}
              onChange={(e) => setProfile({ ...profile, heroTitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={profile.email ?? ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border text-xs font-sans text-slate-900 dark:text-white focus:outline-none transition-colors ${
                fieldErrors.email
                  ? 'border-rose-500 focus:border-rose-600 bg-rose-50/20'
                  : 'border-slate-200 dark:border-zinc-800 focus:border-blue-500'
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-[11px] font-sans text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
              Location / Timezone
            </label>
            <input
              type="text"
              value={profile.location ?? ''}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* GitHub URL */}
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
              GitHub Profile URL
            </label>
            <input
              type="url"
              value={profile.githubUrl ?? ''}
              onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border text-xs font-sans text-slate-900 dark:text-white focus:outline-none ${
                fieldErrors.githubUrl ? 'border-rose-500' : 'border-slate-200 dark:border-zinc-800 focus:border-blue-500'
              }`}
            />
            {fieldErrors.githubUrl && (
              <p className="mt-1 text-[11px] font-sans text-rose-500">{fieldErrors.githubUrl}</p>
            )}
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              value={profile.linkedinUrl ?? ''}
              onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border text-xs font-sans text-slate-900 dark:text-white focus:outline-none ${
                fieldErrors.linkedinUrl ? 'border-rose-500' : 'border-slate-200 dark:border-zinc-800 focus:border-blue-500'
              }`}
            />
            {fieldErrors.linkedinUrl && (
              <p className="mt-1 text-[11px] font-sans text-rose-500">{fieldErrors.linkedinUrl}</p>
            )}
          </div>
        </div>

        {/* Hero Subtitle */}
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
            Hero Subtitle
          </label>
          <input
            type="text"
            value={profile.heroSubtitle ?? ''}
            onChange={(e) => setProfile({ ...profile, heroSubtitle: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Full Bio */}
        <div>
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
            Full Engineering Biography
          </label>
          <textarea
            rows={4}
            value={profile.bio ?? ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-sans text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>

        {/* Resume */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80">
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
              Resume / CV URL
            </label>
            <input
              type="text"
              value={profile.resumeUrl ?? ''}
              onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border text-xs font-sans text-slate-900 dark:text-white focus:outline-none ${
                fieldErrors.resumeUrl ? 'border-rose-500' : 'border-slate-200 dark:border-zinc-800 focus:border-blue-500'
              }`}
            />
            {fieldErrors.resumeUrl && (
              <p className="mt-1 text-[11px] font-sans text-rose-500">{fieldErrors.resumeUrl}</p>
            )}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-end pt-6 border-t border-slate-100 dark:border-zinc-800/80">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-slate-900 text-xs font-sans font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};