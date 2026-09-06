import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Shield
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { PasswordStrengthMeter } from '../../components/admin/PasswordStrengthMeter';

interface ResetPasswordInputs {
  username: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export const AdminResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirmPasswordReset } = useAdminAuth();
  const { showSuccess } = useToast();
  const { isDark, toggleTheme } = useTheme();

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordInputs>({
    defaultValues: {
      username: searchParams.get('username') || '',
      token: searchParams.get('token') || '',
      newPassword: '',
      confirmPassword: ''
    },
    mode: 'onTouched'
  });

  const watchedNewPassword = watch('newPassword');

  useEffect(() => {
    const queryToken = searchParams.get('token');
    const queryUsername = searchParams.get('username');
    if (queryUsername) {
      setValue('username', queryUsername);
    }
    if (queryToken) {
      setValue('token', queryToken);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: ResetPasswordInputs) => {
    setServerError(null);

    if (data.newPassword !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      });
      return;
    }

    const result = await confirmPasswordReset(data.username.trim(), data.token.trim(), data.newPassword);

    if (result.success) {
      showSuccess('Password updated', 'You can now sign in with your new password');
      navigate('/admin/login', { replace: true });
    } else {
      if (result.status === 400 || result.status === 401) {
        setServerError('This reset token is invalid or has expired. Please request a new one.');
        setError('token', {
          type: 'server',
          message: 'Invalid or expired reset token'
        });
      } else {
        setServerError(result.error || 'Failed to reset password. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 font-['Outfit','Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-200">
      {/* Atmosphere Gradients */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-50/80 via-indigo-50/30 to-transparent dark:from-blue-950/20 dark:via-zinc-900/10 dark:to-transparent pointer-events-none" />
      <div className="absolute -top-32 right-1/4 w-80 h-80 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 relative z-10">
        <Link
          to="/admin/login"
          className="group inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors shadow-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          <span>Back to Sign In</span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-xs cursor-pointer"
          title="Toggle theme"
          aria-label="Toggle dark/light mode"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-md my-auto py-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 shadow-xs mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit',sans-serif]">
            Set New Password
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
            Enter your verification token and define your new login credentials.
          </p>
        </div>

        <div className="bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/50 backdrop-blur-sm transition-colors">
          {serverError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reset-username" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Admin Username
              </label>
              <input
                id="reset-username"
                type="text"
                autoComplete="username"
                placeholder="admin"
                disabled={isSubmitting}
                {...register('username', { required: 'Admin username is required' })}
                className={`w-full px-4 py-3 rounded-xl text-sm bg-slate-50/80 dark:bg-zinc-900/80 text-slate-900 dark:text-white border ${errors.username ? 'border-rose-300' : 'border-slate-200 dark:border-zinc-800'}`}
              />
              {errors.username && <p className="mt-1 text-xs text-rose-500">{errors.username.message}</p>}
            </div>

            {/* Token */}
            <div>
              <label
                htmlFor="reset-token"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5"
              >
                Verification Token
              </label>
              <div className="relative">
                <input
                  id="reset-token"
                  type="text"
                  placeholder="Paste your reset token here"
                  disabled={isSubmitting}
                  {...register('token', {
                    required: 'Verification token is required'
                  })}
                  className={`w-full px-4 py-3 pl-10.5 rounded-xl text-sm bg-slate-50/80 dark:bg-zinc-900/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 border transition-all duration-150 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 ${
                    errors.token
                      ? 'border-rose-300 dark:border-rose-800 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-zinc-800 focus:border-slate-400 dark:focus:border-zinc-600 focus:ring-2 focus:ring-slate-400/10'
                  }`}
                />
                <KeyRound className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {errors.token && (
                <p className="mt-1 text-xs text-rose-500">{errors.token.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="reset-new-password"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="reset-new-password"
                  type={showNew ? 'text' : 'password'}
                  placeholder="At least 12 characters with upper, lower, number and symbol"
                  disabled={isSubmitting}
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 12,
                      message: 'Password must be at least 12 characters'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,128}$/,
                      message: 'Use upper, lower, number, and symbol characters'
                    }
                  })}
                  className={`w-full px-4 py-3 pl-10.5 pr-11 rounded-xl text-sm bg-slate-50/80 dark:bg-zinc-900/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 border transition-all duration-150 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 ${
                    errors.newPassword
                      ? 'border-rose-300 dark:border-rose-800 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-zinc-800 focus:border-slate-400 dark:focus:border-zinc-600 focus:ring-2 focus:ring-slate-400/10'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-xs text-rose-500">{errors.newPassword.message}</p>
              )}
              {watchedNewPassword && watchedNewPassword.length > 0 && (
                <div className="mt-2">
                  <PasswordStrengthMeter password={watchedNewPassword} />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="reset-confirm-password"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="reset-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  disabled={isSubmitting}
                  {...register('confirmPassword', {
                    required: 'Please confirm your new password'
                  })}
                  className={`w-full px-4 py-3 pl-10.5 pr-11 rounded-xl text-sm bg-slate-50/80 dark:bg-zinc-900/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 border transition-all duration-150 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 ${
                    errors.confirmPassword
                      ? 'border-rose-300 dark:border-rose-800 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-zinc-800 focus:border-slate-400 dark:focus:border-zinc-600 focus:ring-2 focus:ring-slate-400/10'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-slate-900/10 dark:shadow-black/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-600" />
                  <span>Save Password &amp; Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 text-center">
            <Link
              to="/admin/login"
              className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-5xl py-3 text-center text-xs text-slate-400 dark:text-zinc-600 relative z-10">
        Parth Poptani &bull; Secure Authentication Module
      </footer>
    </div>
  );
};
