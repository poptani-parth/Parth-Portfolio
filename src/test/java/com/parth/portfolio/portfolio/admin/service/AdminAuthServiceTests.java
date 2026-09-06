package com.parth.portfolio.portfolio.admin.service;

import com.parth.portfolio.common.exception.TokenReuseDetectedException;
import com.parth.portfolio.portfolio.admin.entity.AdminUser;
import com.parth.portfolio.portfolio.admin.entity.RefreshToken;
import com.parth.portfolio.portfolio.admin.repository.AdminUserRepository;
import com.parth.portfolio.portfolio.admin.repository.RefreshTokenRepository;
import com.parth.portfolio.portfolio.security.JwtService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;
import java.util.concurrent.Executor;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAuthServiceTests {

    @Mock
    private AdminUserRepository users;

    @Mock
    private RefreshTokenRepository refreshTokens;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private Executor mailTaskExecutor;

    private AdminAuthService authService;

    private final String rawRefreshToken = "test-raw-refresh-token-123456789";
    private String tokenHash;

    @BeforeEach
    void setUp() throws Exception {
        authService = new AdminAuthService(
                users,
                refreshTokens,
                passwordEncoder,
                jwtService,
                mailSender,
                mailTaskExecutor,
                "admin@example.com",
                "http://localhost:5173"
        );

        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        tokenHash = HexFormat.of().formatHex(digest.digest(rawRefreshToken.getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    @DisplayName("Valid refresh token should atomically consume old token and return new tokens")
    void refresh_success() {
        Claims claims = mock(Claims.class);
        when(jwtService.parse(rawRefreshToken)).thenReturn(claims);
        when(jwtService.isRefreshToken(claims)).thenReturn(true);

        AdminUser user = AdminUser.builder()
                .id("user-1")
                .username("admin")
                .role("ADMIN")
                .active(true)
                .build();

        RefreshToken stored = RefreshToken.builder()
                .id("token-1")
                .adminUserId("user-1")
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plusSeconds(3600))
                .revokedAt(null)
                .build();

        when(refreshTokens.findByTokenHash(tokenHash)).thenReturn(Optional.of(stored));
        when(users.findById("user-1")).thenReturn(Optional.of(user));
        when(refreshTokens.revokeIfActive(eq("token-1"), any(Instant.class), any(Instant.class))).thenReturn(1L);

        when(jwtService.createAccessToken("admin", "user-1", "ADMIN")).thenReturn("new-access-token");
        when(jwtService.createRefreshToken("admin", "user-1", "ADMIN")).thenReturn("new-refresh-token");
        when(jwtService.refreshExpiry()).thenReturn(Instant.now().plusSeconds(7200));
        when(jwtService.accessTtlSeconds()).thenReturn(900L);

        AdminAuthService.IssuedTokens result = authService.refresh(rawRefreshToken);

        assertNotNull(result);
        assertEquals("new-access-token", result.accessToken());
        assertEquals("new-refresh-token", result.refreshToken());
        assertEquals("admin", result.response().username());
        verify(refreshTokens).revokeIfActive(eq("token-1"), any(Instant.class), any(Instant.class));
        verify(refreshTokens).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Reusing an already revoked refresh token must revoke the family and throw TokenReuseDetectedException")
    void refresh_revokedTokenReuse_revokesFamilyAndThrows() {
        Claims claims = mock(Claims.class);
        when(jwtService.parse(rawRefreshToken)).thenReturn(claims);
        when(jwtService.isRefreshToken(claims)).thenReturn(true);

        RefreshToken stored = RefreshToken.builder()
                .id("token-1")
                .adminUserId("user-1")
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plusSeconds(3600))
                .revokedAt(Instant.now().minusSeconds(10)) // Already revoked
                .build();

        when(refreshTokens.findByTokenHash(tokenHash)).thenReturn(Optional.of(stored));

        assertThrows(TokenReuseDetectedException.class, () -> authService.refresh(rawRefreshToken));
        verify(refreshTokens).revokeAllActive(eq("user-1"), any(Instant.class));
    }

    @Test
    @DisplayName("Concurrent refresh race condition (revokeIfActive != 1) must revoke family and throw TokenReuseDetectedException")
    void refresh_concurrentRace_revokesFamilyAndThrows() {
        Claims claims = mock(Claims.class);
        when(jwtService.parse(rawRefreshToken)).thenReturn(claims);
        when(jwtService.isRefreshToken(claims)).thenReturn(true);

        AdminUser user = AdminUser.builder()
                .id("user-1")
                .username("admin")
                .role("ADMIN")
                .active(true)
                .build();

        RefreshToken stored = RefreshToken.builder()
                .id("token-1")
                .adminUserId("user-1")
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plusSeconds(3600))
                .revokedAt(null)
                .build();

        when(refreshTokens.findByTokenHash(tokenHash)).thenReturn(Optional.of(stored));
        when(users.findById("user-1")).thenReturn(Optional.of(user));

        // Simulate atomic race condition where another concurrent request revoked it first
        when(refreshTokens.revokeIfActive(eq("token-1"), any(Instant.class), any(Instant.class))).thenReturn(0L);

        assertThrows(TokenReuseDetectedException.class, () -> authService.refresh(rawRefreshToken));
        verify(refreshTokens).revokeAllActive(eq("user-1"), any(Instant.class));
    }

    @Test
    @DisplayName("Expired refresh token must throw BadCredentialsException")
    void refresh_expiredToken_throwsBadCredentials() {
        Claims claims = mock(Claims.class);
        when(jwtService.parse(rawRefreshToken)).thenReturn(claims);
        when(jwtService.isRefreshToken(claims)).thenReturn(true);

        RefreshToken stored = RefreshToken.builder()
                .id("token-1")
                .adminUserId("user-1")
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().minusSeconds(60)) // Expired
                .revokedAt(null)
                .build();

        when(refreshTokens.findByTokenHash(tokenHash)).thenReturn(Optional.of(stored));

        assertThrows(BadCredentialsException.class, () -> authService.refresh(rawRefreshToken));
        verify(refreshTokens, never()).revokeIfActive(anyString(), any(), any());
    }
}