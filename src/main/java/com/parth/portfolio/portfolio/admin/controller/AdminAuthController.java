package com.parth.portfolio.portfolio.admin.controller;

import com.parth.portfolio.portfolio.admin.dto.*;
import com.parth.portfolio.portfolio.admin.service.AdminAuthService;
import com.parth.portfolio.portfolio.security.LoginAttemptService;
import com.parth.portfolio.portfolio.security.LoginRateLimitException;
import com.parth.portfolio.portfolio.security.PasswordResetAttemptService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import java.time.Duration;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.Cookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private static final Logger log =
            LoggerFactory.getLogger(AdminAuthController.class);

    /**
     * Profiles in which exposing the password-reset token in the HTTP
     * response is allowed (dev-loop convenience). ANY profile not in this
     * set is treated as production-equivalent and the token is never exposed,
     * regardless of the property value.
     */
    private static final Set<String> DEV_ONLY_PROFILES =
            Set.of("local", "dev", "test");

    private final String accessCookieName;
    private final String refreshCookieName;

    private final AdminAuthService authService;
    private final LoginAttemptService loginAttempts;
    private final PasswordResetAttemptService passwordResetAttempts;
    private final boolean exposeResetToken;
    private final boolean secureCookies;
    private final String cookieSameSite;

    private final Environment environment;

    public AdminAuthController(
            AdminAuthService authService,
            LoginAttemptService loginAttempts,
            PasswordResetAttemptService passwordResetAttempts,
            @Value("${app.security.password-reset.expose-token:false}") boolean exposeResetToken,
            @Value("${app.security.auth.cookies.secure:false}") boolean secureCookies,
            @Value("${app.security.auth.cookies.same-site:Strict}") String cookieSameSite,
            @Value("${app.security.auth.cookies.access-name:admin-access}") String accessCookieName,
            @Value("${app.security.auth.cookies.refresh-name:admin-refresh}") String refreshCookieName,
            Environment environment) {
        this.authService = authService;
        this.loginAttempts = loginAttempts;
        this.passwordResetAttempts = passwordResetAttempts;
        this.exposeResetToken = exposeResetToken;
        this.secureCookies = secureCookies;
        this.cookieSameSite = normalizeSameSite(cookieSameSite);
        this.accessCookieName = accessCookieName;
        this.refreshCookieName = refreshCookieName;
        this.environment = environment;

        validatePasswordResetTokenExposure();
        validateCookieSecurity();
    }

    private void validatePasswordResetTokenExposure() {
        if (!exposeResetToken) {
            return; // fast path – nothing to validate
        }

        boolean isDevOnlyProfile = java.util.Arrays
                .stream(environment.getActiveProfiles())
                .anyMatch(DEV_ONLY_PROFILES::contains);

        if (!isDevOnlyProfile) {
            // No active profile matched the dev-only allow-list.
            // This covers prod, staging, and any unrecognised profile.
            throw new IllegalStateException(
                    "PASSWORD_RESET_EXPOSE_TOKEN=true is not permitted outside of local/dev/test profiles. "
                    + "Active profiles: " + java.util.Arrays.toString(environment.getActiveProfiles()));
        }

        log.warn("[SECURITY] Password-reset token is exposed in HTTP responses. "
                + "This is a dev-only convenience. NEVER enable in production.");
    }

    private void validateCookieSecurity() {
        boolean isDevOnlyProfile = java.util.Arrays
                .stream(environment.getActiveProfiles())
                .anyMatch(DEV_ONLY_PROFILES::contains);

        if (!isDevOnlyProfile && !secureCookies) {
            throw new IllegalStateException(
                    "CRITICAL SECURITY MISCONFIGURATION: Authentication cookies MUST have secure=true "
                    + "outside of local/dev/test profiles (AUTH_COOKIE_SECURE=true). "
                    + "Active profiles: " + java.util.Arrays.toString(environment.getActiveProfiles()));
        }
    }

	/**
     * ----------------------------------------------------------------------
     * CSRF TOKEN
     * ----------------------------------------------------------------------
     *
     * The CsrfToken parameter forces Spring Security to generate/resolve
     * the SPA CSRF token and write the XSRF-TOKEN cookie.
     */
    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf(CsrfToken token) {
        return ResponseEntity.noContent().build();
    }

    /**
     * ----------------------------------------------------------------------
     * LOGIN
     * ----------------------------------------------------------------------
     */
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse response) {
        String ip = clientIp(servletRequest);
        String usernameIpKey = "user-ip:" + request.username() + ":" + ip;
        String ipKey = "ip:" + ip;

        loginAttempts.check(usernameIpKey);
        loginAttempts.check(ipKey);

        try {
            AdminAuthService.IssuedTokens result = authService.login(request);

            loginAttempts.success(usernameIpKey);

            // Set authentication cookies.
            setAccessCookie(
                    response,
                    result.accessToken());

            setRefreshCookie(
                    response,
                    result.refreshToken());

            response.setHeader(
                    HttpHeaders.CACHE_CONTROL,
                    "no-store");

            return ResponseEntity
                    .ok(result.response());

        } catch (BadCredentialsException ex) {
            loginAttempts.failed(usernameIpKey);
            loginAttempts.failed(ipKey);
            throw ex;
        }
    }

    /**
     * ----------------------------------------------------------------------
     * CURRENT ADMIN SESSION
     * ----------------------------------------------------------------------
     */
    @GetMapping("/me")
    public ResponseEntity<AdminMeResponse> me(
            Authentication authentication) {

        String username = authentication.getName();

        String role = authentication
                .getAuthorities()
                .stream()
                .findFirst()
                .map(authority -> authority
                        .getAuthority()
                        .replaceFirst(
                                "^ROLE_",
                                ""))
                .orElse("ADMIN");

        return ResponseEntity.ok(
                new AdminMeResponse(
                        username,
                        role));
    }

    /**
     * ----------------------------------------------------------------------
     * REFRESH TOKEN
     * ----------------------------------------------------------------------
     *
     * The refresh token is read from the HttpOnly cookie.
     *
     * IMPORTANT:
     * AdminAuthService is still being migrated to the new IssuedTokens
     * architecture. Therefore this controller currently calls the existing
     * refresh() method.
     *
     * We will update this method after AdminAuthService.java is changed.
     */
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        String refreshToken = getCookieValue(request, refreshCookieName);

        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        AdminAuthService.IssuedTokens result = authService.refresh(refreshToken);

        setAccessCookie(
                response,
                result.accessToken());

        setRefreshCookie(
                response,
                result.refreshToken());

        response.setHeader(
                HttpHeaders.CACHE_CONTROL,
                "no-store");

        return ResponseEntity.ok(result.response());
    }

    /**
     * ----------------------------------------------------------------------
     * PASSWORD RESET REQUEST
     * ----------------------------------------------------------------------
     *
     * Rate limiting strategy:
     *   - Dual-keyed per client IP and per username.
     *   - The counters are ALWAYS incremented — for both valid and invalid
     *     usernames — so an attacker cannot use the rate-limit counter as
     *     a binary oracle to enumerate accounts, while protecting administrator
     *     inboxes and SMTP resources from spam.
     *   - check() short-circuits at 429 before any DB work is done.
     */
    @PostMapping("/password-reset")
    public ResponseEntity<?> passwordReset(
            @Valid @RequestBody PasswordResetRequest request,
            HttpServletRequest servletRequest) {

        String ipKey = "ip:" + clientIp(servletRequest);
        String usernameKey = "user:" + (request.username() != null ? request.username().trim().toLowerCase() : "unknown");

        // Guard: throw 429 if either IP or username limit is exceeded.
        passwordResetAttempts.check(ipKey);
        passwordResetAttempts.check(usernameKey);

        // Always count — valid username or not — to prevent enumeration
        // via counter state while defending against spam.
        passwordResetAttempts.increment(ipKey);
        passwordResetAttempts.increment(usernameKey);

        String token = authService.requestPasswordReset(request.username());

        if (exposeResetToken && token != null) {
            return ResponseEntity.ok(new PasswordResetTokenResponse(token));
        }

        return ResponseEntity.noContent().build();
    }

    /**
     * ----------------------------------------------------------------------
     * PASSWORD RESET CONFIRM
     * ----------------------------------------------------------------------
     */
    @PostMapping("/password-reset/confirm")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void confirmPasswordReset(
            @Valid @RequestBody PasswordResetConfirmRequest request) {

        authService.confirmPasswordReset(
                request);
    }

    /**
     * ----------------------------------------------------------------------
     * CHANGE PASSWORD
     * ----------------------------------------------------------------------
     */
    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        authService.changePassword(
                authentication.getName(),
                request);
    }

    /**
     * ----------------------------------------------------------------------
     * LOGOUT
     * ----------------------------------------------------------------------
     *
     * This endpoint is ready for the service-side revocation method.
     *
     * AdminAuthService.logout() will be added in the next step.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        String refreshToken = getCookieValue(request, refreshCookieName);

        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(refreshToken);
        }

        clearAccessCookie(response);
        clearRefreshCookie(response);

        response.setHeader(
                HttpHeaders.CACHE_CONTROL,
                "no-store");

        return ResponseEntity.noContent().build();
    }

    /**
     * ----------------------------------------------------------------------
     * GET COOKIE
     * ----------------------------------------------------------------------
     */
    private String getCookieValue(
            HttpServletRequest request,
            String cookieName) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }

    /**
     * ----------------------------------------------------------------------
     * ACCESS COOKIE
     * ----------------------------------------------------------------------
     */
    private void setAccessCookie(
            HttpServletResponse response,
            String accessToken) {
        ResponseCookie cookie = ResponseCookie
                .from(accessCookieName, accessToken)
                .httpOnly(true)
                .secure(secureCookies)
                .sameSite(cookieSameSite)
                .path("/api/admin")
                .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString());
    }

    private void clearAccessCookie(
            HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie
                .from(accessCookieName, "")
                .httpOnly(true)
                .secure(secureCookies)
                .sameSite(cookieSameSite)
                .path("/api/admin")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString());
    }

    /**
     * ----------------------------------------------------------------------
     * REFRESH COOKIE
     * ----------------------------------------------------------------------
     */
    private void setRefreshCookie(
            HttpServletResponse response,
            String refreshToken) {
        ResponseCookie cookie = ResponseCookie
                .from(refreshCookieName, refreshToken)
                .httpOnly(true)
                .secure(secureCookies)
                .sameSite(cookieSameSite)
                .path("/api/admin/auth")
                .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString());
    }

    private void clearRefreshCookie(
            HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie
                .from(refreshCookieName, "")
                .httpOnly(true)
                .secure(secureCookies)
                .sameSite(cookieSameSite)
                .path("/api/admin/auth")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString());
    }

    private String normalizeSameSite(String value) {
        if (value == null || value.isBlank()) {
            return "Strict";
        }
        String normalized = value.trim();
        if (!normalized.equalsIgnoreCase("Strict")
                && !normalized.equalsIgnoreCase("Lax")
                && !normalized.equalsIgnoreCase("None")) {
            throw new IllegalStateException(
                    "app.security.auth.cookies.same-site must be Strict, Lax, or None");
        }
        return normalized;
    }

    /**
     * ----------------------------------------------------------------------
     * RATE LIMIT RESPONSE
     * ----------------------------------------------------------------------
     */
    @ExceptionHandler(LoginRateLimitException.class)
    ResponseEntity<Void> rateLimited(
            LoginRateLimitException ex) {

        long seconds = Math.max(
                1,
                ex.getRetryAt()
                        .getEpochSecond()
                        - java.time.Instant.now()
                                .getEpochSecond());

        return ResponseEntity
                .status(
                        HttpStatus.TOO_MANY_REQUESTS)
                .header(
                        "Retry-After",
                        Long.toString(seconds))
                .build();
    }

    /**
     * ----------------------------------------------------------------------
     * ADMIN ME RESPONSE
     * ----------------------------------------------------------------------
     */
    public record AdminMeResponse(
            String username,
            String role) {
    }

    /**
     * ----------------------------------------------------------------------
     * PASSWORD RESET TOKEN RESPONSE
     * ----------------------------------------------------------------------
     */
    private record PasswordResetTokenResponse(
            String token) {
    }

    /**
     * ----------------------------------------------------------------------
     * CLIENT IP
     * ----------------------------------------------------------------------
     */
    private String clientIp(HttpServletRequest request) {
        /*
         * Spring's forwarded-header strategy normalizes the remote address
         * when the application is deployed behind a trusted reverse proxy.
         * Keep rate limiting consistent with the audit filter.
         */
        return request.getRemoteAddr();
    }
}