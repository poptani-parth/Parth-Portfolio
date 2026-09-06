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
 * Distributed login-attempt rate limiter backed by Redis.
 *
 * Redis key:
 *     rate-limit:login:<key>
 *
 * Example key:
 *     rate-limit:login:admin
 *
 * The counter automatically expires after the configured window.
 */
@Service
public class LoginAttemptService {

    private static final String KEY_PREFIX =
            "rate-limit:login:";

    /**
     * Atomically increments the attempt counter and assigns
     * the expiration only when the key is first created.
     *
     * Redis operations are atomic, which is important when the
     * application runs across multiple JVM instances.
     */
    private static final DefaultRedisScript<Long> FAILED_ATTEMPT_SCRIPT =
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

    public LoginAttemptService(
            StringRedisTemplate redisTemplate,
            @Value("${app.security.login-rate-limit.max-attempts:5}")
            int maxAttempts,
            @Value("${app.security.login-rate-limit.window:PT15M}")
            Duration window
    ) {

        if (maxAttempts < 1) {
            throw new IllegalArgumentException(
                    "Login rate-limit max-attempts must be at least 1"
            );
        }

        if (window.isZero() || window.isNegative()) {
            throw new IllegalArgumentException(
                    "Login rate-limit window must be positive"
            );
        }

        if (window.toSeconds() < 1) {
            throw new IllegalArgumentException(
                    "Login rate-limit window must be at least 1 second"
            );
        }

        this.redisTemplate = redisTemplate;
        this.maxAttempts = maxAttempts;
        this.window = window;
    }

    /**
     * Checks whether the login key is currently blocked.
     *
     * This method does not increment the counter.
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

            int attemptCount;

            try {
                attemptCount = Integer.parseInt(value);
            } catch (NumberFormatException ex) {
                /*
                 * Do not allow malformed Redis state to break
                 * authentication completely.
                 *
                 * Resetting the malformed entry is safer than
                 * treating it as an unlimited number of attempts.
                 */
                redisTemplate.delete(redisKey);
                return;
            }

            if (attemptCount >= maxAttempts) {

                Long ttlSeconds =
                        redisTemplate.getExpire(
                                redisKey
                        );

                /*
                 * If the key has no usable TTL, use the configured
                 * window as a defensive fallback.
                 */
                long remainingSeconds =
                        ttlSeconds != null && ttlSeconds > 0
                                ? ttlSeconds
                                : window.toSeconds();

                Instant windowEnds =
                        Instant.now()
                                .plusSeconds(remainingSeconds);

                throw new LoginRateLimitException(
                        windowEnds
                );
            }

        } catch (DataAccessException ex) {

            /*
             * Fail closed.
             *
             * During a Redis outage, do not allow unrestricted
             * authentication attempts.
             */
            throw new LoginRateLimitException(
                    Instant.now().plus(window)
            );
        }
    }

    /**
     * Records one failed login attempt.
     */
    public void failed(String key) {

        if (key == null || key.isBlank()) {
            return;
        }

        String redisKey = buildKey(key);

        try {

            redisTemplate.execute(
                    FAILED_ATTEMPT_SCRIPT,
                    Collections.singletonList(redisKey),
                    String.valueOf(window.toSeconds())
            );

        } catch (DataAccessException ex) {

            /*
             * The failed attempt cannot be safely recorded.
             *
             * We intentionally do not throw here because the
             * authentication flow may already be handling the
             * original invalid-login condition.
             *
             * The next check will fail closed if Redis remains
             * unavailable.
             */
        }
    }

    /**
     * Clears the failed-attempt counter after successful login.
     */
    public void success(String key) {

        if (key == null || key.isBlank()) {
            return;
        }

        try {

            redisTemplate.delete(
                    buildKey(key)
            );

        } catch (DataAccessException ex) {

            /*
             * Do not fail a successful authentication merely because
             * cleanup failed. The Redis key will expire automatically.
             */
        }
    }

    private String buildKey(String key) {

        return KEY_PREFIX + key.trim();
    }
}