import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
    Lock,
    User,
    Eye,
    EyeOff,
    AlertCircle,
    Clock,
    ArrowRight,
    Shield,
    Sun,
    Moon,
    ArrowLeft,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

interface LoginFormInputs {
    username: string;
    password: string;
}

export const AdminLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, sessionExpiredNotice, clearSessionExpiredNotice } = useAdminAuth();
    const { showSuccess } = useToast();
    const { isDark, toggleTheme } = useTheme();

    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormInputs>({
        defaultValues: {
            username: '',
            password: '',
        },
        mode: 'onTouched',
    });

    // Redirect if session already active
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Dual-Keyed Rate limit lockout countdown (HTTP 429)
    useEffect(() => {
        if (retryCountdown === null || retryCountdown <= 0) return;
        const interval = setInterval(() => {
            setRetryCountdown((prev) => {
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

    const onSubmit = async (data: LoginFormInputs) => {
        if (retryCountdown && retryCountdown > 0) return;
        setServerError(null);
        clearSessionExpiredNotice();

        const result = await login(data.username.trim(), data.password);

        if (result.success) {
            showSuccess('Session Established', 'Successfully authenticated into admin workspace');
            navigate('/admin/dashboard', { replace: true });
            // Navigation is handled by the useEffect watching isAuthenticated
        } else {
            const status = result.status ?? 0;
            if (status === 401) {
                setServerError('Invalid credentials provided. Please verify and try again.');
            } else if (status === 429) {
                const seconds = result.retryAfter && result.retryAfter > 0 ? result.retryAfter : 30;
                setRetryCountdown(seconds);
                setServerError(`Too many attempts from this origin. Please wait ${seconds} seconds.`);
            } else if (status >= 500 || status === 0) {
                setServerError('Server is unreachable. Check your network connection.');
            } else {
                setServerError(result.error || 'Authentication rejected by security policy.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 font-['Outfit','Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-200">
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-50/80 via-indigo-50/30 to-transparent dark:from-blue-950/20 dark:via-zinc-900/10 dark:to-transparent pointer-events-none" />

            {/* Header */}
            <header className="w-full max-w-5xl flex items-center justify-between py-2 relative z-10">
                <Link
                    to="/"
                    className="group inline-flex items-center gap-2 text-xs font-medium text-theme-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <div className="w-7 h-7 rounded-lg bg-theme-card border border-theme-border flex items-center justify-center text-theme-text-muted group-hover:text-slate-900 dark:group-hover:text-white transition-colors shadow-xs">
                        <ArrowLeft className="w-3.5 h-3.5" />
                    </div>
                    <span>Back to Public Site</span>
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

            {/* Main Container */}
            <main className="w-full max-w-md my-auto py-8 relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-zinc-900 font-bold text-lg shadow-lg shadow-slate-900/10 dark:shadow-black/40 mb-4 tracking-tight">
                        PP
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-theme-text">
                        Admin Workspace
                    </h1>
                    <p className="text-sm text-theme-text-muted mt-1.5 leading-relaxed">
                        Manage portfolio assets, review inquiries, and update system state.
                    </p>
                </div>

                <div className="bg-theme-card border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/50 backdrop-blur-sm transition-colors">

                    {sessionExpiredNotice && (
                        <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span className="flex-1">{sessionExpiredNotice}</span>
                        </div>
                    )}

                    {serverError && (
                        <div
                            className={`mb-5 p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 transition-all ${retryCountdown && retryCountdown > 0
                                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300'
                                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                                }`}
                        >
                            {retryCountdown && retryCountdown > 0 ? (
                                <Clock className="w-4 h-4 text-amber-500 shrink-0 animate-spin" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                            <div className="flex-1 font-medium">{serverError}</div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        <div>
                            <label
                                htmlFor="admin-username"
                                className="block text-xs font-semibold text-theme-text-secondary mb-1.5"
                            >
                                Username
                            </label>
                            <div className="relative">
                                <input
                                    id="admin-username"
                                    type="text"
                                    autoComplete="username"
                                    disabled={isSubmitting || (retryCountdown !== null && retryCountdown > 0)}
                                    placeholder="admin"
                                    {...register('username', {
                                        required: 'Username is required',
                                        minLength: {
                                            value: 2,
                                            message: 'Username must be at least 2 characters',
                                        },
                                    })}
                                    className={`w-full px-4 py-3 pl-10.5 rounded-xl text-sm bg-theme-bg/80 /80 text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-500 border transition-all duration-150 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 ${errors.username
                                            ? 'border-rose-300 dark:border-rose-800 focus:ring-2 focus:ring-rose-500/20'
                                            : 'border-theme-border focus:border-slate-400 dark:focus:border-zinc-600 focus:ring-2 focus:ring-slate-400/10'
                                        }`}
                                />
                                <User className="w-4 h-4 text-theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                            </div>
                            {errors.username && (
                                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                                    <span>{errors.username.message}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="admin-password"
                                    className="block text-xs font-semibold text-theme-text-secondary"
                                >
                                    Password
                                </label>
                                <Link
                                    to="/admin/forgot-password"
                                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="admin-password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    disabled={isSubmitting || (retryCountdown !== null && retryCountdown > 0)}
                                    placeholder="••••••••••••"
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters',
                                        },
                                    })}
                                    className={`w-full px-4 py-3 pl-10.5 pr-11 rounded-xl text-sm bg-theme-bg/80 /80 text-theme-text placeholder:text-slate-400 dark:placeholder:text-zinc-500 border transition-all duration-150 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 ${errors.password
                                            ? 'border-rose-300 dark:border-rose-800 focus:ring-2 focus:ring-rose-500/20'
                                            : 'border-theme-border focus:border-slate-400 dark:focus:border-zinc-600 focus:ring-2 focus:ring-slate-400/10'
                                        }`}
                                />
                                <Lock className="w-4 h-4 text-theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-theme-text-muted hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                                    <span>{errors.password.message}</span>
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || (retryCountdown !== null && retryCountdown > 0)}
                            className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-slate-900/10 dark:shadow-black/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    <span>Verifying credentials...</span>
                                </>
                            ) : retryCountdown && retryCountdown > 0 ? (
                                <span>Rate limited ({retryCountdown}s)</span>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-6 flex items-center justify-center gap-2 text-xs text-theme-text-muted">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Strict SameSite Cookie Session &bull; Double-Submit CSRF Guard</span>
                </div>
            </main>

            <footer className="w-full max-w-5xl py-3 text-center text-xs text-theme-text-muted relative z-10">
                Parth Poptani &bull; Full-Stack Backend Portfolio Management Portal
            </footer>
        </div>
    );
};