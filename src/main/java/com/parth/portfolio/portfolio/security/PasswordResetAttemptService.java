package com.parth.portfolio.portfolio.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;

/**
 * Distributed rate limiter for password-reset requests, backed by Redis.
 *
 * Redis key:
 *     rate-limit:pwd-reset:<key>
 *
 * Example key:
 *     rate-limit:pwd-reset:ip:1.2.3.4
 *
 * Intentionally a separate bean from LoginAttemptService so that
 * password-reset and login can have independent limits and windows
 * without coupling their configurations.
 *
 * The counter is ALWAYS incremented on every request (hit or miss),
 * which prevents an attacker from using the counter itself as a
 * side-channel to enumerate valid usernames.
 */
@Service
public class PasswordResetAttemptService {

    private static final String KEY_PREFIX = "rate-limit:pwd-reset:";

    /**
     * Atomically increments the attempt counter and sets expiry
     * only when the key is first created (same Lua script as LoginAttemptService).
     */
    private static final DefaultRedisScript<Long> INCREMENT_SCRIPT =
            new DefaultRedisScript<>(
                    """
                    local current = redis.call('INCR', KEYS[1])
                    if current == 1 then
                        redis.call('EXPIRE', KEYS[1], ARGV[1])
                    end
                    return current
                    """,
                    Long.class
            );

    private final StringRedisTemplate redisTemplate;
    private final int maxAttempts;
    private final Duration window;

    public PasswordResetAttemptService(
            StringRedisTemplate redisTemplate,
            @Value("${app.security.password-reset.rate-limit.max-attempts:5}")
            int maxAttempts,
            @Value("${app.security.password-reset.rate-limit.window:PT1H}")
            Duration window) {

        if (maxAttempts < 1) {
            throw new IllegalArgumentException(
                    "Password-reset rate-limit max-attempts must be at least 1");
        }
        if (window.isZero() || window.isNegative()) {
            throw new IllegalArgumentException(
                    "Password-reset rate-limit window must be positive");
        }

        this.redisTemplate = redisTemplate;
        this.maxAttempts = maxAttempts;
        this.window = window;
    }

    /**
     * Checks whether the key is currently rate-limited.
     * Does NOT increment the counter.
     * Throws {@link LoginRateLimitException} if the limit is exceeded.
     */
    public void check(String key) {
        if (key == null || key.isBlank()) {
            return;
        }

        String redisKey = buildKey(key);

        try {
            String value = redisTemplate.opsForValue().get(redisKey);

            if (value == null) {
                return;
            }

            int count;
            try {
                count = Integer.parseInt(value);
            } catch (NumberFormatException ex) {
                redisTemplate.delete(redisKey);
                return;
            }

            if (count >= maxAttempts) {
                Long ttlSeconds = redisTemplate.getExpire(redisKey);

                long remaining = ttlSeconds != null && ttlSeconds > 0
                        ? ttlSeconds
                        : window.toSeconds();

                throw new LoginRateLimitException(
                        Instant.now().plusSeconds(remaining));
            }

        } catch (DataAccessException ex) {
            // Fail closed on Redis outage.
            throw new LoginRateLimitException(
                    Instant.now().plus(window));
        }
    }

    /**
     * Increments the attempt counter for the given key.
     *
     * Call this unconditionally (for both existing and non-existing
     * usernames) so the counter cannot be used to infer account existence.
     */
    public void increment(String key) {
        if (key == null || key.isBlank()) {
            return;
        }

        String redisKey = buildKey(key);

        try {
            redisTemplate.execute(
                    INCREMENT_SCRIPT,
                    Collections.singletonList(redisKey),
                    String.valueOf(window.toSeconds()));
        } catch (DataAccessException ex) {
            // Swallow: a missed increment is preferable to blocking the
            // response. The next check() will fail closed if Redis is down.
        }
    }

    private String buildKey(String key) {
        return KEY_PREFIX + key.trim();
    }
}