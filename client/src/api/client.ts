import axios, { AxiosError, InternalAxiosRequestConfig } from'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ||'http://localhost:8080';

export const apiClient = axios.create({
 baseURL: BASE_URL,
 withCredentials: true,
 headers: {
 Accept:'application/json',
'Content-Type':'application/json',
 },
});

/**
 * Extracts a cookie value accessible to JavaScript (e.g., XSRF-TOKEN).
 * Note: HttpOnly cookies (admin-access, admin-refresh) cannot and should not be read here.
 */
export const getCookieValue = (name: string): string | null => {
 if (typeof document ==='undefined') return null;
 const prefix =`${name}=`;
 const match = document.cookie
 .split(';')
 .find((cookie) => cookie.startsWith(prefix));

 if (!match) return null;

 try {
 return decodeURIComponent(match.slice(prefix.length));
 } catch {
 return match.slice(prefix.length);
 }
};

/**
 * Fetches the CSRF token from the backend if not already present in cookies.
 */
export const fetchCsrfToken = async (): Promise<string | null> => {
 const existing = getCookieValue('XSRF-TOKEN');
 if (existing) return existing;

 try {
 const response = await apiClient.get<{ token?: string }>('/api/admin/auth/csrf', {
 headers: {'Cache-Control':'no-store' },
 });
 return getCookieValue('XSRF-TOKEN') || response.data?.token || null;
 } catch {
 return null;
 }
};

let isRefreshing = false;
let failedQueue: Array<{
 resolve: (value?: unknown) => void;
 reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
 failedQueue.forEach((prom) => {
 if (error) {
 prom.reject(error);
 } else {
 prom.resolve();
 }
 });
 failedQueue = [];
};

// Request Interceptor: Attach X-XSRF-TOKEN header on state-modifying requests
apiClient.interceptors.request.use(
 async (config: InternalAxiosRequestConfig) => {
 const mutatingMethods = ['post','put','delete','patch'];
 const method = config.method?.toLowerCase();

 if (method && mutatingMethods.includes(method)) {
 let token = getCookieValue('XSRF-TOKEN');
 if (!token && config.url !=='/api/admin/auth/csrf') {
 token = await fetchCsrfToken();
 }
 if (token) {
 config.headers.set('X-XSRF-TOKEN', token);
 }
 }
 return config;
 },
 (error) => Promise.reject(error)
);

// Response Interceptor: Silent Token Family Refresh & Rate Limit Handling
apiClient.interceptors.response.use(
 (response) => response,
 async (error: AxiosError) => {
 const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

 // Ignore public auth routes from silent refresh loops
 const isAuthRoute =
 originalRequest?.url?.includes('/api/admin/auth/login') ||
 originalRequest?.url?.includes('/api/admin/auth/refresh') ||
 originalRequest?.url?.includes('/api/admin/auth/csrf');

 if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
 if (isRefreshing) {
 return new Promise((resolve, reject) => {
 failedQueue.push({ resolve, reject });
 })
 .then(() => apiClient(originalRequest))
 .catch((err) => Promise.reject(err));
 }

 originalRequest._retry = true;
 isRefreshing = true;

 try {
 const csrf = await fetchCsrfToken();
 const headers: Record<string, string> = {};
 if (csrf) headers['X-XSRF-TOKEN'] = csrf;

 // Perform token rotation via HttpOnly admin-refresh cookie
 await apiClient.post('/api/admin/auth/refresh', {}, { headers });
 processQueue(null);
 return apiClient(originalRequest);
 } catch (refreshErr) {
 processQueue(refreshErr as AxiosError);
 window.dispatchEvent(
 new CustomEvent('admin-auth-logout', {
 detail: { reason:'Your session expired, please log in again' },
 })
 );
 return Promise.reject(refreshErr);
 } finally {
 isRefreshing = false;
 }
 }

 return Promise.reject(error);
 }
);