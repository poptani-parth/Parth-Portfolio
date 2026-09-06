package com.parth.portfolio.portfolio.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
// import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class JwtService {

    private static final String ACCESS_TOKEN_TYPE = "access";
    private static final String REFRESH_TOKEN_TYPE = "refresh";

    private final SecretKey signingKey;
    private final Duration accessTtl;
    private final Duration refreshTtl;
    private final String issuer;
    private final String audience;

    public JwtService(
            @Value("${app.security.jwt.secret}") String base64Secret,
            @Value("${app.security.jwt.access-ttl:PT15M}") Duration accessTtl,
            @Value("${app.security.jwt.refresh-ttl:P30D}") Duration refreshTtl,
            @Value("${app.security.jwt.issuer}") String issuer,
            @Value("${app.security.jwt.audience}") String audience
    ) {

        if (base64Secret == null || base64Secret.isBlank()) {
            throw new IllegalStateException(
                    "JWT secret must be configured"
            );
        }

        final byte[] key;

        try {
            key = Decoders.BASE64.decode(base64Secret);
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException(
                    "JWT secret must be valid Base64",
                    ex
            );
        }

        /*
         * HS256 requires at least 256 bits / 32 bytes.
         */
        if (key.length < 32) {
            throw new IllegalStateException(
                    "JWT secret must be Base64 encoded and at least 256 bits"
            );
        }

        if (accessTtl == null
                || accessTtl.isZero()
                || accessTtl.isNegative()) {

            throw new IllegalStateException(
                    "JWT access TTL must be positive"
            );
        }

        if (refreshTtl == null
                || refreshTtl.isZero()
                || refreshTtl.isNegative()) {

            throw new IllegalStateException(
                    "JWT refresh TTL must be positive"
            );
        }

        if (issuer == null || issuer.isBlank()) {
            throw new IllegalStateException(
                    "JWT issuer must be configured"
            );
        }

        if (audience == null || audience.isBlank()) {
            throw new IllegalStateException(
                    "JWT audience must be configured"
            );
        }

        this.signingKey = Keys.hmacShaKeyFor(key);
        this.accessTtl = accessTtl;
        this.refreshTtl = refreshTtl;
        this.issuer = issuer.trim();
        this.audience = audience.trim();
    }

    public String createAccessToken(
            String username,
            String userId,
            String role
    ) {
        return createToken(
                username,
                userId,
                role,
                ACCESS_TOKEN_TYPE,
                accessTtl
        );
    }

    public String createRefreshToken(
            String username,
            String userId,
            String role
    ) {
        return createToken(
                username,
                userId,
                role,
                REFRESH_TOKEN_TYPE,
                refreshTtl
        );
    }

    /**
     * Parse and cryptographically validate a signed JWT.
     *
     * Validation includes:
     * - signature
     * - issuer
     * - audience
     * - expiration / issued-at timestamps
     * - required claims
     */
    public Claims parse(String token) {

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException(
                    "JWT must not be blank"
            );
        }

        Jws<Claims> signedClaims = Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(issuer)
                .requireAudience(audience)
                .build()
                .parseSignedClaims(token);

        Claims claims = signedClaims.getPayload();

        if (claims.getSubject() == null
                || claims.getSubject().isBlank()
                || claims.getId() == null
                || claims.getId().isBlank()
                || claims.getIssuedAt() == null
                || claims.getExpiration() == null) {

            throw new IllegalArgumentException(
                    "JWT missing required claims"
            );
        }

        return claims;
    }

    public boolean isAccessToken(Claims claims) {
        return claims != null
                && ACCESS_TOKEN_TYPE.equals(
                claims.get("typ", String.class)
        );
    }

    public boolean isRefreshToken(Claims claims) {
        return claims != null
                && REFRESH_TOKEN_TYPE.equals(
                claims.get("typ", String.class)
        );
    }

    public Instant refreshExpiry() {
        return Instant.now().plus(refreshTtl);
    }

    public long accessTtlSeconds() {
        return accessTtl.toSeconds();
    }

    private String createToken(
            String username,
            String userId,
            String role,
            String type,
            Duration ttl
    ) {

        requireValue(username, "username");
        requireValue(userId, "userId");
        requireValue(role, "role");

        if (!ACCESS_TOKEN_TYPE.equals(type)
                && !REFRESH_TOKEN_TYPE.equals(type)) {

            throw new IllegalArgumentException(
                    "Unsupported JWT token type"
            );
        }

        if (ttl == null
                || ttl.isZero()
                || ttl.isNegative()) {

            throw new IllegalArgumentException(
                    "JWT TTL must be positive"
            );
        }

        Instant now = Instant.now();

        return Jwts.builder()
                .issuer(issuer)
                .audience()
                .add(audience)
                .and()
                .subject(username)
                .id(UUID.randomUUID().toString())
                .claim("uid", userId)
                .claim("roles", List.of(role))
                .claim("typ", type)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(
                        signingKey,
                        Jwts.SIG.HS256
                )
                .compact();
    }

    private void requireValue(
            String value,
            String fieldName
    ) {

        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    fieldName + " must not be blank"
            );
        }
    }
}