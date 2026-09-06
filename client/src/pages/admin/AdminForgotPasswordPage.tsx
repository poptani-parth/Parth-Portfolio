import React, { useState, useEffect } from'react';
import { useNavigate, Link } from'react-router-dom';
import { useForm } from'react-hook-form';
import {
 KeyRound,
 User,
 Clock,
 AlertCircle,
 CheckCircle2,
 ArrowRight,
 ArrowLeft,
 Mail,
 Sun,
 Moon,
 ShieldCheck
} from'lucide-react';
import { useAdminAuth } from'../../context/AdminAuthContext';
import { useToast } from'../../context/ToastContext';
import { useTheme } from'../../context/ThemeContext';

interface ForgotPasswordInputs {
 username: string;
}

export const AdminForgotPasswordPage: React.FC = () => {
 const navigate = useNavigate();
 const { requestPasswordReset } = useAdminAuth();
 const { showSuccess } = useToast();
 const { isDark, toggleTheme } = useTheme();

 const [isSuccess, setIsSuccess] = useState(false);
 const [submittedUsername, setSubmittedUsername] = useState('');
 const [serverError, setServerError] = useState<string | null>(null);
 const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

 const {
 register,
 handleSubmit,
 formState: { errors, isSubmitting }
 } = useForm<ForgotPasswordInputs>({
 defaultValues: {
 username:'admin'
 },
 mode:'onTouched'
 });

 useEffect(() => {
 if (retryCountdown === null || retryCountdown <= 0) return;
 const interval = setInterval(() => {
 setRetryCountdown(prev => {
 if (prev === null || prev <= 1) {
 clearInterval(interval);
 setServerError(null);
 return null;
 }
 return prev - 1;
 });
 }, 1000);
 return () => clearInterval(interval);
 }, [retryCountdown]);

 const onSubmit = async (data: ForgotPasswordInputs) => {
 if (retryCountdown && retryCountdown > 0) return;
 setServerError(null);

 const result = await requestPasswordReset(data.username.trim());

 if (result.success) {
 setSubmittedUsername(data.username.trim());
 setIsSuccess(true);
 showSuccess('Reset request submitted','Check the configured administrator email for reset instructions');
 } else {
 if (result.status === 429) {
 const seconds = result.retryAfter || 60;
 setRetryCountdown(seconds);
 setServerError(`Too many reset attempts. Try again in ${seconds}s.`);
 } else {
 setServerError(result.error ||'Failed to process password reset request.');
 }
 }
 };

 return (
 <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 font-['Outfit','Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-200">
 {/* Background Subtle Atmosphere */}
 <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-50/80 via-indigo-50/30 to-transparent dark:from-blue-950/20 dark:via-zinc-900/10 dark:to-transparent pointer-events-none" />
 <div className="absolute -top-32 right-1/4 w-80 h-80 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

 {/* Top Header */}
 <header className="w-full max-w-5xl flex items-center justify-between py-2 relative z-10">
 <Link
 to="/admin/login"
 className="group inline-flex items-center gap-2 text-xs font-medium text-theme-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors"
 >
 <div className="w-7 h-7 rounded-lg bg-theme-card border border-theme-border flex items-center justify-center text-theme-text-muted group-hover:text-slate-900 dark:group-hover:text-white transition-colors shadow-xs">
 <ArrowLeft className="w-3.5 h-3.5" />
 </div>
 <span>Back to Sign In</span>
 </Link>

 <button
 type="button"
 onClick={toggleTheme}
 className="p-2 rounded-xl bg-theme-card border border-theme-border text-theme-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors shadow-xs cursor-pointer"
 title="Toggle theme"
 aria-label="Toggle dark/light mode"
 >
 {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
 </button>
 </header>

 {/* Center Form */}
 <main className="w-full max-w-md my-auto py-8 relative z-10">
 <div className="text-center mb-8">
 <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 shadow-xs mb-4">
 <KeyRound className="w-5 h-5" />
 </div>
 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-theme-text font-['Outfit',sans-serif]">
 Reset Password
 </h1>
 <p className="text-sm text-theme-text-muted mt-1.5 leading-relaxed">
 Enter your admin username to receive a security verification token.
 </p>
 </div>

 <div className="bg-theme-card border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/50 backdrop-blur-sm transition-colors">
 {serverError && (
 <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
 <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
 <span>{serverError}</span>
 </div>
 )}

 {isSuccess ? (
 <div className="space-y-5 text-center">
 <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs text-left flex items-start gap-3">
 <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
 <div>
 <p className="font-semibold">Reset instructions sent</p>
 <p className="text-theme-text-secondary mt-0.5 text-[11px] leading-relaxed">
 If the account exists, reset instructions were sent to the configured administrator email.
 </p>
 </div>
 </div>

 <button
 type="button"
 onClick={() =>
 navigate(`/admin/reset-password?username=${encodeURIComponent(submittedUsername)}`)
 }
 className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-slate-900/10 dark:shadow-black/20 cursor-pointer"
 >
 <span>Continue to Step 2: Set Password</span>
 <ArrowRight className="w-4 h-4" />
 </button>
 </div>
 ) : (
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
 <div>
 <label
 htmlFor="admin-username-reset"
 className="block text-xs font-semibold text-theme-text-secondary mb-1.5"
 >
 Admin Username
 </label>
 <div className="relative">
 <input
 id="admin-username-reset"
 type="text"
 autoComplete="username"
 disabled={isSubmitting || (retryCountdown !== null && retryCountdown > 0)}
 placeholder="admin"
 {...register('username', {
 required:'Please enter your username'
 })}
 className={`w-full px-4 py-3 pl-10.5 rounded-xl text-sm bg-theme-bg/80 /80 text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-500 border transition-all duration-150 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 ${
 errors.username
 ?'border-rose-300 dark:border-rose-800 focus:ring-2 focus:ring-rose-500/20'
 :'border-theme-border focus:border-slate-400 dark:focus:border-zinc-600 focus:ring-2 focus:ring-slate-400/10'
 }`}
 />
 <User className="w-4 h-4 text-theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
 </div>
 {errors.username && (
 <p className="mt-1 text-xs text-rose-500">{errors.username.message}</p>
 )}
 </div>

 <button
 type="submit"
 disabled={isSubmitting || (retryCountdown !== null && retryCountdown > 0)}
 className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-slate-900/10 dark:shadow-black/20 cursor-pointer disabled:opacity-50"
 >
 {isSubmitting ? (
 <>
 <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
 <span>Sending request...</span>
 </>
 ) : (
 <>
 <span>Generate Reset Instructions</span>
 <ArrowRight className="w-4 h-4" />
 </>
 )}
 </button>
 </form>
 )}

 <div className="mt-6 pt-4 border-t border-slate-100 text-center">
 <Link
 to="/admin/login"
 className="text-xs text-theme-text-muted hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 <span>Back to Login</span>
 </Link>
 </div>
 </div>
 </main>

 <footer className="w-full max-w-5xl py-3 text-center text-xs text-theme-text-muted relative z-10">
 Parth Poptani &bull; Secure Authentication Module
 </footer>
 </div>
 );
};
