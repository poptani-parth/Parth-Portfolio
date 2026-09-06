package com.parth.portfolio.portfolio.admin.service;

import com.parth.portfolio.common.exception.TokenReuseDetectedException;
import com.parth.portfolio.portfolio.admin.dto.ChangePasswordRequest;
import com.parth.portfolio.portfolio.admin.dto.LoginRequest;
import com.parth.portfolio.portfolio.admin.dto.PasswordResetConfirmRequest;
import com.parth.portfolio.portfolio.admin.dto.TokenResponse;
import com.parth.portfolio.portfolio.admin.entity.AdminUser;
import com.parth.portfolio.portfolio.admin.entity.RefreshToken;
import com.parth.portfolio.portfolio.admin.repository.AdminUserRepository;
import com.parth.portfolio.portfolio.admin.repository.RefreshTokenRepository;
import com.parth.portfolio.portfolio.security.JwtService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.concurrent.Executor;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class AdminAuthService {

    private static final Logger log =
            LoggerFactory.getLogger(AdminAuthService.class);

    private final AdminUserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JavaMailSender mailSender;
    private final Executor mailTaskExecutor;

    private final String resetMailTo;
    private final String frontendOrigin;

    public AdminAuthService(
            AdminUserRepository users,
            RefreshTokenRepository refreshTokens,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            JavaMailSender mailSender,
            @Qualifier("mailTaskExecutor") Executor mailTaskExecutor,
            @Value("${app.security.password-reset.mail-to}")
            String resetMailTo,
            @Value("${app.security.cors.allowed-origin}")
            String frontendOrigin) {

        this.users = users;
        this.refreshTokens = refreshTokens;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mailSender = mailSender;
        this.mailTaskExecutor = mailTaskExecutor;
        this.resetMailTo = resetMailTo;
        this.frontendOrigin = frontendOrigin;
    }

    /**
     * Internal result used by the controller.
     *
     * The raw refresh token is returned only in memory so the controller
     * can place it into an HttpOnly cookie.
     *
     * It is NOT included in TokenResponse.
     */
    public record IssuedTokens(
            String accessToken,
            String refreshToken,
            TokenResponse response) {
    }

    /**
     * Authenticate admin and issue a new access/refresh token pair.
     */
    public IssuedTokens login(LoginRequest request) {

        AdminUser user = users.findByUsername(request.username())
                .filter(u -> u != null && u.isActive())
                .orElseThrow(() -> {
                    log.warn(
                            "Login failed: user '{}' not found or inactive",
                            request.username());

                    return new BadCredentialsException(
                            "Invalid username or password");
                });

        if (!passwordEncoder.matches(
                request.password(),
                user.getPassword())) {

            log.warn(
                    "Login failed: incorrect password for user '{}'",
                    request.username());

            throw new BadCredentialsException(
                    "Invalid username or password");
        }

        log.info(
                "Admin login successful for user '{}'",
                user.getUsername());

        return issueTokens(user);
    }

    /**
     * Rotate a refresh token.
     *
     * Security properties:
     * - JWT signature is verified by JwtService.
     * - Only refresh tokens are accepted.
     * - Refresh token must exist in MongoDB.
     * - Refresh token must not be expired.
     * - Refresh token must not already be revoked.
     * - User must still be active.
     * - Old refresh token is atomically consumed.
     * - Concurrent refreshes inside the short grace window are retried by the client; reuse outside the window revokes the token family.
     */
    public IssuedTokens refresh(String encodedToken) {

        if (encodedToken == null || encodedToken.isBlank()) {
            throw new BadCredentialsException(
                    "Invalid refresh token");
        }

        Claims claims;

        try {
            claims = jwtService.parse(encodedToken);
        } catch (JwtException | IllegalArgumentException ex) {

            log.warn("Refresh failed: invalid JWT token");

            throw new BadCredentialsException(
                    "Invalid refresh token");
        }

        if (!jwtService.isRefreshToken(claims)) {

            log.warn(
                    "Refresh failed: supplied token is not a refresh token");

            throw new BadCredentialsException(
                    "Invalid refresh token");
        }

        /*
         * Never store the raw refresh token in MongoDB.
         *
         * The same deterministic hash is calculated when the token
         * is later presented for refresh/logout.
         */
        String tokenHash = hash(encodedToken);

        RefreshToken stored = refreshTokens
                .findByTokenHash(tokenHash)
                .orElseThrow(() -> {

                    log.warn(
                            "Refresh failed: refresh token not found");

                    return new BadCredentialsException(
                            "Invalid refresh token");
                });

        /*
         * A previously revoked token being presented again is
         * considered refresh-token reuse.
         *
         * Revoke all active refresh tokens belonging to the user.
         */
        if (stored.getRevokedAt() != null) {

            log.warn(
                    "Refresh token reuse detected for admin user '{}'",
                    stored.getAdminUserId());

            revokeAll(stored.getAdminUserId());

            throw new TokenReuseDetectedException();
        }

        /*
         * Check the server-side expiration as well as JWT expiration.
         */
        if (stored.getExpiresAt() == null
                || !stored.getExpiresAt().isAfter(Instant.now())) {

            log.warn(
                    "Refresh failed: refresh token expired");

            throw new BadCredentialsException(
                    "Invalid refresh token");
        }

        /*
         * Make sure the admin account is still active.
         */
        AdminUser user = users
                .findById(stored.getAdminUserId())
                .filter(u -> u != null && u.isActive())
                .orElseThrow(() -> {

                    log.warn(
                            "Refresh failed: user not found or inactive");

                    return new BadCredentialsException(
                            "Invalid refresh token");
                });

        /*
         * IMPORTANT:
         *
         * Do NOT simply set revokedAt on the Java object and save it.
         *
         * Two browser requests can attempt to refresh the same token
         * simultaneously.
         *
         * revokeIfActive() must perform an atomic database operation:
         *
         *   WHERE id = ? AND revokedAt IS NULL
         *
         * Only one request should receive consumed == 1.
         */
        Instant revokedAt = Instant.now();

        long consumed = refreshTokens.revokeIfActive(
                stored.getId(),
                revokedAt,
                revokedAt);

        if (consumed != 1) {
            // Another request already consumed this one-time token. Treat the
            // replay as refresh-token reuse and revoke the remaining family.
            log.warn(
                    "Refresh token replay detected for admin user '{}'",
                    stored.getAdminUserId());
            revokeAll(stored.getAdminUserId());
            throw new TokenReuseDetectedException();
        }

        log.info(
                "Token refresh successful for user '{}'",
                user.getUsername());

        /*
         * The old refresh token is now permanently consumed.
         * A completely new access + refresh pair is issued.
         */
        return issueTokens(user);
    }

    /**
     * Change password for the currently authenticated admin.
     *
     * Changing the password invalidates all existing refresh tokens.
     */
    public void changePassword(
            String username,
            ChangePasswordRequest request) {

        AdminUser user = requiredActiveUser(username);

        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPassword())) {

            throw new BadCredentialsException(
                    "Current password is incorrect");
        }

        ensureStrongPassword(request.newPassword());

        user.setPassword(
                passwordEncoder.encode(request.newPassword()));

        /*
         * Invalidate any outstanding password-reset token.
         */
        user.setPasswordResetTokenHash(null);
        user.setPasswordResetExpiresAt(null);

        users.save(user);

        /*
         * Force every existing refresh session to authenticate again.
         */
        revokeAll(user.getId());

        log.info(
                "Password changed and refresh sessions revoked for user '{}'",
                user.getUsername());
    }

    /**
     * Request password reset.
     *
     * <h3>Timing side-channel mitigation</h3>
     * <p>Both the "user found" and "user not found" branches perform the same
     * CPU-bound operations (randomToken + SHA-256 hash) before returning,
     * so the two paths have near-identical response times from the CPU
     * perspective.</p>
     *
     * <p>The remaining asymmetry — MongoDB save + SMTP when the user exists —
     * is neutralised by submitting the mail delivery to a fire-and-forget
     * executor. The response returns immediately after {@code users.save()},
     * regardless of whether SMTP succeeds, so network I/O is completely
     * off the critical response path.</p>
     *
     * <h3>Account-existence privacy</h3>
     * <p>This method intentionally does not reveal whether a username
     * exists to the API caller (identical HTTP status in all cases).</p>
     */
    public String requestPasswordReset(String username) {

        /*
         * Always generate a dummy token and hash it, mirroring the CPU work
         * done in the "user exists" path. This keeps both branches at the
         * same wall-clock cost from the JVM's perspective.
         */
        String dummyToken = randomToken();
        hash(dummyToken);

        String[] resetToken = { null };

        users.findByUsername(username)
                .filter(user -> user != null && user.isActive())
                .ifPresent(user -> {

                    String token = randomToken();
                    resetToken[0] = token;

                    /*
                     * Store only the hash of the password-reset token.
                     */
                    user.setPasswordResetTokenHash(hash(token));

                    /*
                     * Reset token valid for 15 minutes.
                     */
                    user.setPasswordResetExpiresAt(
                            Instant.now().plusSeconds(900));

                    users.save(user);

                    /*
                     * Fire-and-forget: submit SMTP to the dedicated async
                     * executor so the caller returns immediately after save().
                     *
                     * CallerRunsPolicy in AsyncConfig ensures delivery even
                     * if the executor queue is saturated.
                     */
                    final String tokenCopy = token;
                    final String usernameCopy = user.getUsername();
                    mailTaskExecutor.execute(
                            () -> sendPasswordResetMail(usernameCopy, tokenCopy));
                });

        return resetToken[0];
    }

    /**
     * Sends the password-reset email.
     *
     * Runs on the {@code mailTaskExecutor} thread pool, NOT the request
     * thread. Errors are logged but never propagated to the caller — the
     * HTTP response has already been committed by the time this runs.
     */
    private void sendPasswordResetMail(String username, String token) {

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(resetMailTo);
            message.setSubject("Portfolio admin password reset");
            message.setText(
                    "A password reset was requested. "
                    + "It expires in 15 minutes.\n\n"
                    + frontendOrigin
                    + "/admin/reset-password?username="
                    + username
                    + "&token="
                    + token
                    + "\n\n"
                    + "If this was not you, ignore this email.");

            mailSender.send(message);

        } catch (MailException ex) {
            /*
             * Never expose SMTP credentials or internal mail-server
             * details through the API. The response is already on its
             * way to the client; log the failure for operational visibility.
             */
            log.error(
                    "Password reset email delivery failed for user '{}'",
                    username,
                    ex);
        }
    }

    /**
     * Confirm password reset using the one-time reset token.
     */
    public void confirmPasswordReset(
            PasswordResetConfirmRequest request) {

        AdminUser user =
                requiredActiveUser(request.username());

        String storedHash =
                user.getPasswordResetTokenHash();

        Instant expiresAt =
                user.getPasswordResetExpiresAt();

        if (storedHash == null
                || expiresAt == null
                || !expiresAt.isAfter(Instant.now())
                || !MessageDigest.isEqual(
                        storedHash.getBytes(StandardCharsets.UTF_8),
                        hash(request.token())
                                .getBytes(StandardCharsets.UTF_8))) {

            throw new BadCredentialsException(
                    "Invalid or expired reset token");
        }

        ensureStrongPassword(request.newPassword());

        user.setPassword(
                passwordEncoder.encode(request.newPassword()));

        /*
         * Reset token is one-time use.
         */
        user.setPasswordResetTokenHash(null);
        user.setPasswordResetExpiresAt(null);

        users.save(user);

        /*
         * Password reset invalidates every existing refresh session.
         */
        revokeAll(user.getId());

        log.info(
                "Password reset completed for user '{}'",
                user.getUsername());
    }

    /**
     * Issue a new access token + refresh token pair.
     *
     * IMPORTANT:
     * The raw refresh token is never persisted.
     * Only its SHA-256 hash is stored.
     */
    private IssuedTokens issueTokens(AdminUser user) {

        String accessToken =
                jwtService.createAccessToken(
                        user.getUsername(),
                        user.getId(),
                        user.getRole());

        String refreshToken =
                jwtService.createRefreshToken(
                        user.getUsername(),
                        user.getId(),
                        user.getRole());

        Instant now = Instant.now();

        /*
         * Store ONLY the refresh-token hash.
         */
        RefreshToken storedToken =
                RefreshToken.builder()
                        .adminUserId(user.getId())
                        .tokenHash(hash(refreshToken))
                        .createdAt(now)
                        .expiresAt(jwtService.refreshExpiry())
                        .build();

        refreshTokens.save(storedToken);

        /*
         * Both access and refresh tokens are stored in HttpOnly Secure cookies.
         * The access JWT is intentionally NOT returned in the JSON response body.
         * AdminAuthController places the credentials into Secure + HttpOnly cookies,
         * so the client receives only non-sensitive session metadata in TokenResponse.
         */
        TokenResponse response =
                new TokenResponse(
                        "Bearer",
                        jwtService.accessTtlSeconds(),
                        user.getUsername(),
                        user.getRole());

        return new IssuedTokens(
                accessToken,
                refreshToken,
                response);
    }

    /**
     * Find an active admin user.
     */
    private AdminUser requiredActiveUser(String username) {

        return users.findByUsername(username)
                .filter(user -> user != null && user.isActive())
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Invalid request"));
    }

    /**
     * Revoke every currently active refresh token belonging
     * to the specified admin user.
     */
    private void revokeAll(String userId) {
        if (userId == null || userId.isBlank()) {
            return;
        }
        refreshTokens.revokeAllActive(userId, Instant.now());
    }

    /**
     * Strong password policy.
     */
    private void ensureStrongPassword(String password) {

        if (password == null
                || !password.matches(
                        "(?=.*[a-z])"
                                + "(?=.*[A-Z])"
                                + "(?=.*\\d)"
                                + "(?=.*[^A-Za-z0-9])"
                                + ".{12,128}")) {

            throw new IllegalArgumentException(
                    "Password must be at least 12 characters "
                            + "and include upper, lower, number, and symbol");
        }
    }

    /**
     * Generate a cryptographically secure password-reset token.
     */
    private String randomToken() {

        byte[] bytes = new byte[32];

        SecureRandom secureRandom =
                new SecureRandom();

        secureRandom.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    /**
     * SHA-256 hash used for refresh/reset token storage.
     *
     * Refresh tokens have high entropy, so SHA-256 is appropriate
     * for server-side token lookup/storage.
     */
    private String hash(String value) {

        if (value == null) {
            throw new IllegalArgumentException(
                    "Token value cannot be null");
        }

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hashed =
                    digest.digest(
                            value.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of()
                    .formatHex(hashed);

        } catch (NoSuchAlgorithmException ex) {

            /*
             * SHA-256 is required by every standard Java runtime.
             */
            throw new IllegalStateException(
                    "SHA-256 algorithm is unavailable",
                    ex);
        }
    }

    /**
     * Logout by revoking the presented refresh token.
     *
     * The controller also clears the browser's HttpOnly cookie.
     */
    public void logout(String refreshToken) {

        if (refreshToken == null
                || refreshToken.isBlank()) {

            return;
        }

        String tokenHash = hash(refreshToken);

        refreshTokens
                .findByTokenHash(tokenHash)
                .ifPresent(token -> {

                    if (token.getRevokedAt() == null) {

                        token.setRevokedAt(
                                Instant.now());

                        refreshTokens.save(token);
                    }
                });
    }
}