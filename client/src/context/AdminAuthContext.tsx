import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    AuthActionResult,
    AuthTokenResponse,
    AuthUser,
} from '../types/admin';

import { useLocation } from 'react-router-dom';

interface AdminAuthContextType {
    isAuthenticated: boolean;
    isValidating: boolean;
    user: AuthUser | null;
    adminUser: AuthUser | null;
    sessionExpiredNotice: string | null;

    clearSessionExpiredNotice: () => void;

    login: (
        username: string,
        password: string
    ) => Promise<AuthActionResult<AuthTokenResponse>>;

    logout: () => void;

    fetchWithAuth: (
        url: string,
        options?: RequestInit
    ) => Promise<Response>;

    changePassword: (
        currentPassword: string,
        newPassword: string
    ) => Promise<AuthActionResult>;

    requestPasswordReset: (
        username: string
    ) => Promise<AuthActionResult<{ resetToken?: string }>>;

    confirmPasswordReset: (
        username: string,
        token: string,
        newPassword: string
    ) => Promise<AuthActionResult>;
}

interface AdminMeResponse {
    username: string;
    role: string;
}

const AdminAuthContext =
    createContext<AdminAuthContextType | undefined>(undefined);

/*
 * --------------------------------------------------------------------------
 * Authentication storage
 * --------------------------------------------------------------------------
 *
 * SECURITY MODEL:
 *
 * Authentication credentials:
 * - access JWT and refresh JWT are NEVER stored in localStorage/sessionStorage
 * - both are delivered through Secure + HttpOnly cookies
 * - JavaScript cannot read either authentication credential
 *
 * Session metadata:
 * - minimal user metadata is cached in sessionStorage for UI startup state
 */
const USER_KEY = '__admin_sec_usr';

const LOGOUT_SYNC_KEY = '__admin_logout_sync';
const LOGOUT_PENDING_KEY = '__admin_logout_pending';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

const DEFAULT_SESSION_EXPIRED_MESSAGE =
    'Your session expired, please log in again';

const DEFAULT_INACTIVITY_MESSAGE =
    'Your session expired due to inactivity. Please log in again';

const readStoredUser = (): AuthUser | null => {
    try {
        const saved =
            sessionStorage.getItem(USER_KEY);

        if (!saved) {
            return null;
        }

        const parsed =
            JSON.parse(saved) as AuthUser;

        if (
            parsed &&
            typeof parsed === 'object' &&
            typeof parsed.username === 'string' &&
            typeof parsed.role === 'string' &&
            typeof parsed.expiresAt === 'number'
        ) {
            return parsed;
        }

        return null;
    } catch {
        return null;
    }
};

/*
 * Read a normal JavaScript-visible cookie.
 *
 * This is used ONLY for the CSRF token cookie.
 * The refresh token cookie is HttpOnly and therefore cannot be read here.
 */
const getCookieValue = (
    name: string
): string | null => {
    if (typeof document === 'undefined') {
        return null;
    }

    const prefix = `${name}=`;

    const match =
        document.cookie
            .split('; ')
            .find((cookie) =>
                cookie.startsWith(prefix)
            );

    if (!match) {
        return null;
    }

    try {
        return decodeURIComponent(
            match.slice(prefix.length)
        );
    } catch {
        return match.slice(prefix.length);
    }
};

const getCsrfToken = async (
    buildUrl: (url: string) => string
): Promise<string | null> => {
    /*
     * Spring Security SPA CSRF normally exposes the token as XSRF-TOKEN.
     */
    const existing =
        getCookieValue('XSRF-TOKEN');

    if (existing) {
        return existing;
    }

    try {
        const response =
            await fetch(
                buildUrl('/api/admin/auth/csrf'),
                {
                    method: 'GET',
                    credentials: 'include',
                    cache: 'no-store',
                }
            );

        if (!response.ok) {
            return null;
        }

        return getCookieValue('XSRF-TOKEN');
    } catch {
        return null;
    }
};

export const AdminAuthProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const [isValidating, setIsValidating] =
        useState(true);

    const location = useLocation();
    const isAdminRoute =
        location.pathname === '/admin'  ||
        location.pathname.startsWith('/admin/');
        
    const isAdminAuthPage =
        location.pathname === '/admin/login' ||
        location.pathname === '/admin/forgot-password' ||
        location.pathname === '/admin/reset-password';

    const requiresAdminAuth =
        isAdminRoute && !isAdminAuthPage;



    const [user, setUser] =
        useState<AuthUser | null>(
            readStoredUser
        );

    const [sessionExpiredNotice, setSessionExpiredNotice] =
        useState<string | null>(null);

    /*
     * Prevent several simultaneous 401 responses
     * from creating several refresh requests.
     */
    const refreshPromiseRef =
        useRef<Promise<boolean> | null>(null);

    const inactivityTimeoutRef =
        useRef<number | null>(null);

    /*
     * Monotonically increasing counter that is bumped on every
     * successful authentication (saveAuth). Every async operation
     * (performLogout, silentRefresh) captures the current value
     * before starting work and checks it again before mutating
     * state. If the value changed, a newer login has occurred
     * and the stale operation must be discarded.
     */
    const authGenerationRef =
        useRef<number>(0);

    /*
     * Set to true immediately after login() succeeds.
     * The startup validation useEffect checks this flag
     * and skips re-validation when a login just completed,
     * preventing the race where navigation from /admin/login
     * to /admin/dashboard re-triggers validation.
     */
    const loginCompletedRef =
        useRef<boolean>(false);

    const buildApiUrl =
        useCallback(
            (url: string): string => {
                const trimmed = url.trim();

                if (!trimmed) {
                    return '/api';
                }

                // Authentication API calls must remain same-origin.
                // Never allow an absolute or protocol-relative URL.
                if (
                    trimmed.startsWith('http://') ||
                    trimmed.startsWith('https://') ||
                    trimmed.startsWith('//')
                ) {
                    throw new Error(
                        'Authenticated API URLs must be same-origin paths'
                    );
                }

                const path = trimmed.startsWith('/')
                    ? trimmed
                    : `/${trimmed}`;

                if (
                    path === '/api' ||
                    path.startsWith('/api/')
                ) {
                    return path;
                }

                return `/api${path}`;
            },
            []
        );
    const clearInactivityTimer =
        useCallback(() => {
            if (
                inactivityTimeoutRef.current !== null
            ) {
                window.clearTimeout(
                    inactivityTimeoutRef.current
                );

                inactivityTimeoutRef.current = null;
            }
        }, []);

    const clearAuthSession =
        useCallback(
            (notice?: string | null) => {
                setUser(null);

                sessionStorage.removeItem(
                    USER_KEY
                );

                refreshPromiseRef.current = null;

                clearInactivityTimer();

                if (notice !== undefined) {
                    setSessionExpiredNotice(notice);
                }
            },
            [clearInactivityTimer]
        );

    const redirectToLogin =
        useCallback(() => {
            if (
                typeof window === 'undefined'
            ) {
                return;
            }

            if (
                !window.location.pathname.startsWith(
                    '/admin/login'
                )
            ) {
                window.location.assign(
                    '/admin/login'
                );
            }
        }, []);

    const emitLogoutSync =
        useCallback((reason?: string) => {
            if (
                typeof window === 'undefined'
            ) {
                return;
            }

            const payload = {
                action: 'logout',
                reason:
                    reason ||
                    DEFAULT_SESSION_EXPIRED_MESSAGE,
                timestamp: Date.now(),
            };

            /*
             * This is only a cross-tab signal.
             * It contains no authentication token.
             */
            localStorage.setItem(
                LOGOUT_SYNC_KEY,
                JSON.stringify(payload)
            );

            window.dispatchEvent(
                new CustomEvent(
                    'admin-auth-logout',
                    {
                        detail: payload,
                    }
                )
            );
        }, []);

    /*
     * Best-effort server logout.
     *
     * The browser automatically sends the HttpOnly refresh cookie.
     */
    const serverLogout =
        useCallback(async () => {
            try {
                const csrfToken =
                    await getCsrfToken(buildApiUrl);

                const headers =
                    new Headers();

                if (csrfToken) {
                    headers.set(
                        'X-XSRF-TOKEN',
                        csrfToken
                    );
                }

                await fetch(
                    buildApiUrl(
                        '/api/admin/auth/logout'
                    ),
                    {
                        method: 'POST',
                        credentials: 'include',
                        headers,
                        cache: 'no-store',
                    }
                );
            } catch {
                /*
                 * Local logout must still happen when
                 * the backend cannot be reached.
                 */
            }
        }, [buildApiUrl]);

    const performLogout =
        useCallback(
            async (reason?: string) => {
                const logoutReason =
                    reason ||
                    DEFAULT_SESSION_EXPIRED_MESSAGE;

                /*
                 * Capture the current auth generation. If a
                 * newer saveAuth() (login or refresh) completes
                 * while the server logout is in-flight, the
                 * generation will change and we must NOT wipe
                 * the freshly established session.
                 */
                const generation =
                    authGenerationRef.current;

                // Tell startup validation that the user explicitly logged out.
                sessionStorage.setItem(
                    LOGOUT_PENDING_KEY,
                    'true'
                );

                // Wait for the backend to revoke the refresh token
                // and clear the HttpOnly authentication cookies.
                await serverLogout();

                /*
                 * Guard: a newer login may have completed while
                 * we were awaiting serverLogout(). Do not clear
                 * the newer session.
                 */
                if (authGenerationRef.current !== generation) {
                    return;
                }

                // Clear frontend session metadata.
                clearAuthSession(logoutReason);

                // Notify other browser tabs.
                emitLogoutSync(logoutReason);

                // Finally redirect to the login page.
                redirectToLogin();
            },
            [
                serverLogout,
                clearAuthSession,
                emitLogoutSync,
                redirectToLogin,
            ]
        );

    const saveAuth =
        useCallback(
            (data: AuthTokenResponse) => {
                /*
                 * Bump the generation counter FIRST.
                 * Any in-flight performLogout / silentRefresh that
                 * captured an older generation will see the mismatch
                 * and bail out before mutating state.
                 */
                authGenerationRef.current += 1;

                /*
                 * A previous startup-validation or silentRefresh may
                 * have set LOGOUT_PENDING_KEY before this login
                 * succeeded.  Clear it so the next startup-validation
                 * cycle does not mistake a valid session for a logout.
                 */
                sessionStorage.removeItem(
                    LOGOUT_PENDING_KEY
                );

                /*
                 * Invalidate any in-flight refresh promise — it belongs
                 * to the old generation.
                 */
                refreshPromiseRef.current = null;

                const authUser: AuthUser = {
                    username:
                        data.username || 'admin',
                    role:
                        data.role || 'ADMIN',
                    expiresAt:
                        Date.now() +
                        (data.expiresIn || 900) * 1000,
                };

                /*
                 * Authentication credentials are delivered by the backend
                 * through Secure + HttpOnly cookies.
                 *
                 * The access JWT is intentionally NOT stored in JavaScript,
                 * localStorage, sessionStorage, or React state.
                 */
                setUser(authUser);

                sessionStorage.setItem(
                    USER_KEY,
                    JSON.stringify(authUser)
                );

                localStorage.removeItem(
                    LOGOUT_SYNC_KEY
                );
            },
            []
        );

    const clearSessionExpiredNotice =
        useCallback(() => {
            setSessionExpiredNotice(null);
        }, []);

    /*
     * ------------------------------------------------------------------------
     * Refresh
     * ------------------------------------------------------------------------
     */
    const silentRefresh =
        useCallback(
            async (): Promise<boolean> => {
                if (refreshPromiseRef.current) {
                    const existingRefresh =
                        await refreshPromiseRef.current;
                    return existingRefresh !== null;
                }

                /*
                 * Capture the current auth generation before
                 * starting async work. If a newer login succeeds
                 * while this refresh is in-flight, the generation
                 * will have changed and we must not overwrite the
                 * newer session state.
                 */
                const generation =
                    authGenerationRef.current;

                const promise =
                    (async () => {
                        try {
                            const csrfToken =
                                await getCsrfToken(
                                    buildApiUrl
                                );

                            const headers =
                                new Headers({
                                    'Content-Type':
                                        'application/json',
                                });

                            if (csrfToken) {
                                headers.set(
                                    'X-XSRF-TOKEN',
                                    csrfToken
                                );
                            }

                            /*
                             * No refresh token is placed in the request body.
                             * The browser sends the HttpOnly cookie automatically.
                             */
                            const response =
                                await fetch(
                                    buildApiUrl(
                                        '/api/admin/auth/refresh'
                                    ),
                                    {
                                        method: 'POST',
                                        credentials: 'include',
                                        headers,
                                        cache: 'no-store',
                                    }
                                );

                            if (!response.ok) {
                                return false;
                            }

                            /*
                             * A newer login may have completed while
                             * this refresh was in-flight. Do not
                             * overwrite the newer session.
                             */
                            if (authGenerationRef.current !== generation) {
                                return false;
                            }

                            const data =
                                (await response.json()) as AuthTokenResponse;

                            saveAuth(data);

                            return true;
                        } catch {
                            /*
                             * Return false — the CALLER decides whether
                             * to terminate the session. silentRefresh
                             * must never call performLogout directly,
                             * because an old failed refresh must not
                             * wipe a newer valid session.
                             */
                            return false;
                        }
                    })();

                refreshPromiseRef.current =
                    promise;

                try {
                    return await promise;
                } finally {
                    if (
                        refreshPromiseRef.current ===
                        promise
                    ) {
                        refreshPromiseRef.current =
                            null;
                    }
                }
            },
            [
                buildApiUrl,
                saveAuth,
            ]
        );

    /*
     * ------------------------------------------------------------------------
     * Login
     * ------------------------------------------------------------------------
     */
    const login =
        useCallback(
            async (
                username: string,
                password: string
            ): Promise<
                AuthActionResult<AuthTokenResponse>
            > => {
                try {
                    const csrfToken =
                        await getCsrfToken(
                            buildApiUrl
                        );

                    const headers =
                        new Headers({
                            'Content-Type':
                                'application/json',
                        });

                    if (csrfToken) {
                        headers.set(
                            'X-XSRF-TOKEN',
                            csrfToken
                        );
                    }

                    const response =
                        await fetch(
                            buildApiUrl(
                                '/api/admin/auth/login'
                            ),
                            {
                                method: 'POST',
                                credentials: 'include',
                                headers,
                                cache: 'no-store',
                                body: JSON.stringify({
                                    username,
                                    password,
                                }),
                            }
                        );

                    if (response.status === 200) {
                        const data =
                            (await response.json()) as AuthTokenResponse;

                        saveAuth(data);

                        loginCompletedRef.current = true;

                        setSessionExpiredNotice(
                            null
                        );

                        setIsValidating(false);

                        return {
                            success: true,
                            status: 200,
                            data,
                        };
                    }

                    if (response.status === 401) {
                        setIsValidating(false);

                        return {
                            success: false,
                            status: 401,
                            error:
                                'Incorrect username or password',
                        };
                    }

                    if (response.status === 429) {
                        const retryHeader =
                            response.headers.get(
                                'Retry-After'
                            );

                        const retryAfter =
                            retryHeader
                                ? Number.parseInt(
                                    retryHeader,
                                    10
                                )
                                : 30;

                        setIsValidating(false);

                        return {
                            success: false,
                            status: 429,
                            retryAfter:
                                Number.isFinite(
                                    retryAfter
                                ) && retryAfter > 0
                                    ? retryAfter
                                    : 30,
                            error:
                                'Too many login attempts. Please try again later.',
                        };
                    }

                    let errorMsg =
                        response.status >= 500
                            ? 'Something went wrong, please try again'
                            : 'Authentication failed';

                    let fieldErrors:
                        | Record<string, string>
                        | undefined;

                    try {
                        const json =
                            await response.json();

                        errorMsg =
                            json.message ||
                            json.error ||
                            errorMsg;

                        fieldErrors =
                            json.errors;
                    } catch {
                        // Ignore malformed error response.
                    }

                    setIsValidating(false);

                    return {
                        success: false,
                        status: response.status,
                        error: errorMsg,
                        fieldErrors,
                    };
                } catch {
                    setIsValidating(false);

                    return {
                        success: false,
                        status: 0,
                        error:
                            'Something went wrong, please try again',
                    };
                }
            },
            [
                buildApiUrl,
                saveAuth,
            ]
        );

    /*
     * ------------------------------------------------------------------------
     * Authenticated fetch
     * ------------------------------------------------------------------------
     */
    const fetchWithAuth =
        useCallback(
            async (
                url: string,
                options: RequestInit = {}
            ): Promise<Response> => {
                const targetUrl =
                    buildApiUrl(url);

                const method =
                    (
                        options.method ||
                        'GET'
                    ).toUpperCase();

                const headers =
                    new Headers(
                        options.headers || {}
                    );

                if (
                    method !== 'GET' &&
                    method !== 'HEAD' &&
                    method !== 'OPTIONS'
                ) {
                    const csrfToken =
                        await getCsrfToken(
                            buildApiUrl
                        );

                    if (csrfToken) {
                        headers.set(
                            'X-XSRF-TOKEN',
                            csrfToken
                        );
                    }
                }

                const response =
                    await fetch(
                        targetUrl,
                        {
                            ...options,
                            credentials: 'include',
                            headers,
                            cache:
                                options.cache ||
                                'no-store',
                        }
                    );

                if (response.status !== 401) {
                    return response;
                }

                /*
                 * Access credentials are HttpOnly cookies, so JavaScript cannot
                 * inspect them. A 401 is therefore the signal to perform a
                 * cookie-based refresh once and retry the original request.
                 */
                const refreshed =
                    await silentRefresh();

                if (!refreshed) {
                    return response;
                }

                const retryHeaders =
                    new Headers(
                        options.headers || {}
                    );

                if (
                    method !== 'GET' &&
                    method !== 'HEAD' &&
                    method !== 'OPTIONS'
                ) {
                    const csrfToken =
                        await getCsrfToken(
                            buildApiUrl
                        );

                    if (csrfToken) {
                        retryHeaders.set(
                            'X-XSRF-TOKEN',
                            csrfToken
                        );
                    }
                }

                const retryResponse =
                    await fetch(
                        targetUrl,
                        {
                            ...options,
                            credentials: 'include',
                            headers: retryHeaders,
                            cache:
                                options.cache ||
                                'no-store',
                        }
                    );

                if (retryResponse.status === 401) {
                    performLogout(
                        'Authentication definitively failed.'
                    );

                    throw new Error(
                        'Authentication definitively failed.'
                    );
                }

                return retryResponse;
            },
            [
                buildApiUrl,
                performLogout,
                silentRefresh,
            ]
        );

    /*
     * ------------------------------------------------------------------------
     * Inactivity timeout
     * ------------------------------------------------------------------------
     */
    const resetInactivityTimer =
        useCallback(() => {
            clearInactivityTimer();

            if (
                typeof window === 'undefined' ||
                !user
            ) {
                return;
            }

            inactivityTimeoutRef.current =
                window.setTimeout(
                    () => {
                        performLogout(
                            DEFAULT_INACTIVITY_MESSAGE
                        );
                    },
                    INACTIVITY_TIMEOUT_MS
                );
        },
            [
                user,
                clearInactivityTimer,
                performLogout,
            ]);

    useEffect(() => {
        if (!user) {
            clearInactivityTimer();
            return;
        }

        const events = [
            'mousedown',
            'mousemove',
            'keydown',
            'touchstart',
            'click',
            'scroll',
        ];

        const onActivity = () => {
            resetInactivityTimer();
        };

        events.forEach((event) =>
            window.addEventListener(
                event,
                onActivity,
                { passive: true }
            )
        );

        resetInactivityTimer();

        return () => {
            clearInactivityTimer();

            events.forEach((event) =>
                window.removeEventListener(
                    event,
                    onActivity
                )
            );
        };
    }, [
        user,
        clearInactivityTimer,
        resetInactivityTimer,
    ]);

    /*
     * ------------------------------------------------------------------------
     * Cross-tab logout synchronization
     * ------------------------------------------------------------------------
     */
    useEffect(() => {
        const onStorage =
            (event: StorageEvent) => {
                if (
                    event.key !==
                    LOGOUT_SYNC_KEY
                ) {
                    return;
                }

                if (!event.newValue) {
                    return;
                }

                try {
                    const payload =
                        JSON.parse(
                            event.newValue
                        ) as {
                            action?: string;
                            reason?: string;
                        };

                    if (
                        payload.action !==
                        'logout'
                    ) {
                        return;
                    }

                    clearAuthSession(
                        payload.reason ||
                        DEFAULT_SESSION_EXPIRED_MESSAGE
                    );

                    redirectToLogin();
                } catch {
                    // Ignore malformed synchronization data.
                }
            };

        const onCustomLogout =
            (event: Event) => {
                const customEvent =
                    event as CustomEvent<{
                        reason?: string;
                    }>;

                clearAuthSession(
                    customEvent.detail?.reason ||
                    DEFAULT_SESSION_EXPIRED_MESSAGE
                );

                redirectToLogin();
            };

        window.addEventListener(
            'storage',
            onStorage
        );

        window.addEventListener(
            'admin-auth-logout',
            onCustomLogout
        );

        return () => {
            window.removeEventListener(
                'storage',
                onStorage
            );

            window.removeEventListener(
                'admin-auth-logout',
                onCustomLogout
            );
        };
    }, [
        clearAuthSession,
        redirectToLogin,
    ]);

    /*
     * ------------------------------------------------------------------------
     * Startup validation
     * ------------------------------------------------------------------------
     *
     * Authentication state is determined by the server-issued HttpOnly
     * cookies. JavaScript does not inspect or persist an access JWT.
     */
    useEffect(() => {
        let cancelled = false;

        const validateSession = async () => {
            /*
             * If a login just completed successfully in this render cycle,
             * do NOT re-validate the session. This prevents the navigation
             * from /admin/login to /admin/dashboard from consuming the
             * refresh token unnecessarily.
             */
            if (loginCompletedRef.current) {
                loginCompletedRef.current = false;
                if (!cancelled) {
                    setIsValidating(false);
                }
                return;
            }

            const generation = authGenerationRef.current;
            const storedUser = readStoredUser();

            /*
             * Public portfolio pages and public admin-auth pages
             * must not perform admin session validation.
             */
            if (!requiresAdminAuth) {
                /*
                 * Only clear the session if we don't already have one.
                 * This prevents wiping a valid session when navigating
                 * back to the login page temporarily before redirect.
                 */
                if (!storedUser) {
                    clearAuthSession(null);
                }

                if (!cancelled) {
                    setIsValidating(false);
                }

                return;
            }

            /*
             * Do not automatically refresh after an explicit logout.
             */
            const logoutPending =
                sessionStorage.getItem(
                    LOGOUT_PENDING_KEY
                ) === 'true';

            if (logoutPending) {
                sessionStorage.removeItem(
                    LOGOUT_PENDING_KEY
                );

                clearAuthSession(null);
                if (authGenerationRef.current === generation) {
                    clearAuthSession(null);
                }

                if (!cancelled) {
                    setIsValidating(false);
                }

                return;
            }

            try {
                const response =
                    await fetch(
                        buildApiUrl(
                            '/api/admin/auth/me'
                        ),
                        {
                            method: 'GET',
                            credentials: 'include',
                            cache: 'no-store',
                        }
                    );

                if (response.ok) {
                    const me =
                        (await response.json()) as AdminMeResponse;

                    if (authGenerationRef.current !== generation) return;

                    const validatedUser: AuthUser = {
                        username:
                            me.username ||
                            storedUser?.username ||
                            'admin',
                        role:
                            me.role ||
                            storedUser?.role ||
                            'ADMIN',
                        expiresAt:
                            storedUser?.expiresAt ||
                            0,
                    };

                    setUser(validatedUser);

                    sessionStorage.setItem(
                        USER_KEY,
                        JSON.stringify(validatedUser)
                    );

                    if (!cancelled) {
                        setIsValidating(false);
                    }

                    return;
                }

                if (response.status === 401) {
                    /*
                     * Only protected admin routes are allowed
                     * to attempt cookie-based refresh.
                     */
                    const refreshed =
                        await silentRefresh();

                    if (authGenerationRef.current !== generation) return;

                    if (refreshed && !cancelled) {
                        const meResponse =
                            await fetch(
                                buildApiUrl(
                                    '/api/admin/auth/me'
                                ),
                                {
                                    method: 'GET',
                                    credentials: 'include',
                                    cache: 'no-store',
                                }
                            );

                        if (meResponse.ok) {
                            if (authGenerationRef.current !== generation) return;

                            const me =
                                (await meResponse.json()) as AdminMeResponse;

                            const refreshedUser: AuthUser = {
                                username:
                                    me.username ||
                                    storedUser?.username ||
                                    'admin',
                                role:
                                    me.role ||
                                    storedUser?.role ||
                                    'ADMIN',
                                expiresAt:
                                    storedUser?.expiresAt ||
                                    0,
                            };

                            setUser(refreshedUser);

                            sessionStorage.setItem(
                                USER_KEY,
                                JSON.stringify(refreshedUser)
                            );

                            setIsValidating(false);

                            return;
                        }
                    }
                }

                clearAuthSession(
                    DEFAULT_SESSION_EXPIRED_MESSAGE
                );
                if (authGenerationRef.current === generation) {
                    clearAuthSession(
                        DEFAULT_SESSION_EXPIRED_MESSAGE
                    );
                }

                if (!cancelled) {
                    setIsValidating(false);
                }
            } catch {
                /*
                 * Network failure is not proof that the session is invalid.
                 */
                if (authGenerationRef.current !== generation) return;

                if (storedUser) {
                    setUser(storedUser);
                } else {
                    clearAuthSession(null);
                }

                if (!cancelled) {
                    setIsValidating(false);
                }
            }
        };

        void validateSession();

        return () => {
            cancelled = true;
        };
    }, [
        requiresAdminAuth,
        buildApiUrl,
        silentRefresh,
        clearAuthSession,
    ]);

    /*
     * ------------------------------------------------------------------------
     * Change password
     * ------------------------------------------------------------------------
     */
    const changePassword =
        useCallback(
            async (
                currentPassword: string,
                newPassword: string
            ): Promise<AuthActionResult> => {
                try {
                    const response =
                        await fetchWithAuth(
                            '/api/admin/auth/change-password',
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type':
                                        'application/json',
                                },
                                body: JSON.stringify({
                                    currentPassword,
                                    newPassword,
                                }),
                            }
                        );

                    if (response.status === 204) {
                        return {
                            success: true,
                            status: 204,
                        };
                    }

                    if (
                        response.status === 401
                    ) {
                        return {
                            success: false,
                            status: 401,
                            error:
                                'Current password is incorrect',
                            fieldErrors: {
                                currentPassword:
                                    'Current password is incorrect',
                            },
                        };
                    }

                    if (
                        response.status === 400
                    ) {
                        let fieldErrors:
                            Record<string, string> =
                            {};

                        let error =
                            'Validation failed for new password';

                        try {
                            const json =
                                await response.json();

                            if (json.errors) {
                                fieldErrors =
                                    json.errors;
                            }

                            error =
                                json.message ||
                                json.error ||
                                error;
                        } catch {
                            // Ignore malformed response.
                        }

                        return {
                            success: false,
                            status: 400,
                            error,
                            fieldErrors,
                        };
                    }

                    return {
                        success: false,
                        status: response.status,
                        error:
                            'Failed to update password. Please try again.',
                    };
                } catch {
                    return {
                        success: false,
                        status: 0,
                        error:
                            'Something went wrong, please try again',
                    };
                }
            },
            [fetchWithAuth]
        );

    /*
     * ------------------------------------------------------------------------
     * Password reset request
     * ------------------------------------------------------------------------
     */
    const requestPasswordReset =
        useCallback(
            async (
                username: string
            ): Promise<
                AuthActionResult<{
                    resetToken?: string;
                }>
            > => {
                try {
                    const csrfToken =
                        await getCsrfToken(
                            buildApiUrl
                        );

                    const headers =
                        new Headers({
                            'Content-Type':
                                'application/json',
                        });

                    if (csrfToken) {
                        headers.set(
                            'X-XSRF-TOKEN',
                            csrfToken
                        );
                    }

                    const response =
                        await fetch(
                            buildApiUrl(
                                '/api/admin/auth/password-reset'
                            ),
                            {
                                method: 'POST',
                                credentials: 'include',
                                headers,
                                cache: 'no-store',
                                body: JSON.stringify({
                                    username,
                                }),
                            }
                        );

                    if (
                        response.status === 200 ||
                        response.status === 204
                    ) {
                        let resetToken:
                            | string
                            | undefined;

                        if (
                            response.status === 200
                        ) {
                            try {
                                const json =
                                    await response.json();

                                resetToken =
                                    json.resetToken ||
                                    json.token;
                            } catch {
                                // No JSON body.
                            }
                        }

                        return {
                            success: true,
                            status:
                                response.status,
                            resetToken,
                            data: {
                                resetToken,
                            },
                        };
                    }

                    if (
                        response.status === 429
                    ) {
                        return {
                            success: false,
                            status: 429,
                            retryAfter: 60,
                            error:
                                'Too many requests — try again later.',
                        };
                    }

                    if (
                        response.status === 503
                    ) {
                        return {
                            success: false,
                            status: 503,
                            error:
                                'Email service is currently unavailable.',
                        };
                    }

                    return {
                        success: false,
                        status:
                            response.status,
                        error:
                            'Something went wrong, please try again',
                    };
                } catch {
                    return {
                        success: false,
                        status: 0,
                        error:
                            'Something went wrong, please try again',
                    };
                }
            },
            [buildApiUrl]
        );

    /*
     * ------------------------------------------------------------------------
     * Password reset confirmation
     * ------------------------------------------------------------------------
     */
    const confirmPasswordReset =
        useCallback(
            async (
                username: string,
                token: string,
                newPassword: string
            ): Promise<AuthActionResult> => {
                try {
                    const csrfToken =
                        await getCsrfToken(
                            buildApiUrl
                        );

                    const headers =
                        new Headers({
                            'Content-Type':
                                'application/json',
                        });

                    if (csrfToken) {
                        headers.set(
                            'X-XSRF-TOKEN',
                            csrfToken
                        );
                    }

                    const response =
                        await fetch(
                            buildApiUrl(
                                '/api/admin/auth/password-reset/confirm'
                            ),
                            {
                                method: 'POST',
                                credentials: 'include',
                                headers,
                                cache: 'no-store',
                                body: JSON.stringify({
                                    username,
                                    token,
                                    newPassword,
                                }),
                            }
                        );

                    if (
                        response.status === 200 ||
                        response.status === 204
                    ) {
                        return {
                            success: true,
                            status:
                                response.status,
                        };
                    }

                    if (
                        response.status === 400 ||
                        response.status === 401
                    ) {
                        return {
                            success: false,
                            status:
                                response.status,
                            error:
                                'This reset link is invalid or expired, please request a new one.',
                            fieldErrors: {
                                token:
                                    'Invalid or expired reset token',
                            },
                        };
                    }

                    return {
                        success: false,
                        status:
                            response.status,
                        error:
                            'Failed to reset password. Please try again.',
                    };
                } catch {
                    return {
                        success: false,
                        status: 0,
                        error:
                            'Something went wrong, please try again',
                    };
                }
            },
            [buildApiUrl]
        );

    const logout =
        useCallback(() => {
            void performLogout();
        }, [performLogout]);

    return (
        <AdminAuthContext.Provider
            value={{
                isAuthenticated:
                    !!user &&
                    !isValidating,

                isValidating,

                user,

                adminUser: user,

                sessionExpiredNotice,

                clearSessionExpiredNotice,

                login,

                logout,

                fetchWithAuth,

                changePassword,

                requestPasswordReset,

                confirmPasswordReset,

            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth =
    (): AdminAuthContextType => {
        const context =
            useContext(
                AdminAuthContext
            );

        if (!context) {
            throw new Error(
                'useAdminAuth must be used within an AdminAuthProvider'
            );
        }

        return context;
    };