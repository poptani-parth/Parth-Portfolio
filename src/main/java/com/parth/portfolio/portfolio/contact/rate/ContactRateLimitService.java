package com.parth.portfolio.portfolio.contact.rate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;

@Service
public class ContactRateLimitService {

    private static final Logger log =
            LoggerFactory.getLogger(ContactRateLimitService.class);

    private static final String KEY_PREFIX =
            "rate-limit:contact:";

    /*
     * Redis Lua script:
     *
     * 1. Atomically increments the request counter.
     * 2. Sets TTL only when the key is created.
     *
     * This prevents race conditions when multiple application
     * instances receive requests at the same time.
     */
    private static final DefaultRedisScript<Long> RATE_LIMIT_SCRIPT =
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
    private final int maxRequests;
    private final Duration window;

    public ContactRateLimitService(
            StringRedisTemplate redisTemplate,

            @Value("${contact.rate-limit.max-requests:5}")
            int maxRequests,

            @Value("${contact.rate-limit.window-minutes:10}")
            long windowMinutes
    ) {

        if (maxRequests <= 0) {
            throw new IllegalArgumentException(
                    "contact.rate-limit.max-requests must be greater than 0"
            );
        }

        if (windowMinutes <= 0) {
            throw new IllegalArgumentException(
                    "contact.rate-limit.window-minutes must be greater than 0"
            );
        }

        this.redisTemplate = redisTemplate;
        this.maxRequests = maxRequests;
        this.window = Duration.ofMinutes(windowMinutes);
    }

    /**
     * Returns true when the client is allowed to submit a request.
     *
     * Fixed-window rate limiter backed by Redis.
     *
     * Example Redis key:
     *
     * rate-limit:contact:192.168.1.10
     */
    public boolean isAllowed(String clientIp) {

        if (clientIp == null || clientIp.isBlank()) {
            log.warn("Contact rate limiter received an empty client IP.");
            return false;
        }

        String normalizedIp = clientIp.trim();

        String key = KEY_PREFIX + normalizedIp;

        try {

            Long requestCount = redisTemplate.execute(
                    RATE_LIMIT_SCRIPT,
                    Collections.singletonList(key),
                    String.valueOf(window.getSeconds())
            );

            if (requestCount == null) {
                log.error(
                        "Redis rate limiter returned a null result for key [{}].",
                        key
                );
                return false;
            }

            return requestCount <= maxRequests;

        } catch (DataAccessException ex) {

            /*
             * Fail closed:
             *
             * If Redis is unavailable, do not allow unlimited contact
             * requests. Otherwise an outage could become a rate-limit
             * bypass.
             */
            log.error(
                    "Redis rate limiter unavailable. Rejecting contact request.",
                    ex
            );

            return false;
        }
    }
}