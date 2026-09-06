import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
  useIsFetching,
} from '@tanstack/react-query';

import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import {
  AdminAuthProvider,
  useAdminAuth,
} from './context/AdminAuthContext';

import { ToastContainer } from './components/admin/ToastContainer';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { TopProgressBar } from './components/ui/TopProgressBar';

const HomePage = lazy(() =>
  import('./pages/HomePage').then((module) => ({
    default: module.HomePage,
  }))
);

const ProjectsCatalogPage = lazy(() =>
  import('./pages/ProjectsCatalogPage').then((module) => ({
    default: module.ProjectsCatalogPage,
  }))
);

const ProjectDetailPage = lazy(() =>
  import('./pages/ProjectDetailPage').then((module) => ({
    default: module.ProjectDetailPage,
  }))
);

const AdminLoginPage = lazy(() =>
  import('./pages/admin/AdminLoginPage').then((module) => ({
    default: module.AdminLoginPage,
  }))
);

const AdminForgotPasswordPage = lazy(() =>
  import('./pages/admin/AdminForgotPasswordPage').then((module) => ({
    default: module.AdminForgotPasswordPage,
  }))
);

const AdminResetPasswordPage = lazy(() =>
  import('./pages/admin/AdminResetPasswordPage').then((module) => ({
    default: module.AdminResetPasswordPage,
  }))
);

const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.substring(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function ProtectedAdminRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, isValidating } = useAdminAuth();

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#09090b]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
            Verifying Session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function AdminProtectedFallback() {
  const { isAuthenticated, isValidating } = useAdminAuth();

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#09090b]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
            Verifying Session...
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

function AdminIndexRedirect() {
  const { isAuthenticated, isValidating } = useAdminAuth();

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#09090b]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
            Verifying Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Navigate
      to={isAuthenticated ? '/admin/dashboard' : '/admin/login'}
      replace
    />
  );
}

function PageSuspenseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#090909]">
      <div className="w-7 h-7 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppContent() {
  const isFetching = useIsFetching();
  const [navigating, setNavigating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setNavigating(true);
    const timer = window.setTimeout(() => {
      setNavigating(false);
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.pathname]);

  const isLoading = isFetching > 0 || navigating;
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#f4f4f5] dark:bg-[#090909] text-[#0f172a] dark:text-[#f4f4f5] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200">
      <TopProgressBar isLoading={isLoading} />
      <ScrollToTop />
      <ToastContainer />

      {!isAdminRoute && <Navbar />}

      <div className="flex-1">
        <Suspense fallback={<PageSuspenseFallback />}>
          <Routes>
            {/* Public Portfolio Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsCatalogPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminIndexRedirect />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
            <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardPage />
                </ProtectedAdminRoute>
              }
            />

            <Route path="/admin/*" element={<AdminProtectedFallback />} />

            {/* Global fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <AdminAuthProvider>
              <AppContent />
            </AdminAuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}