package com.meterflow.backend.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Distributed Rate Limiter using Token Bucket algorithm (Bucket4j).
 *
 * For production, buckets would be stored in Redis using bucket4j-redis.
 * Here we use an in-process ConcurrentHashMap, which works perfectly for a
 * single-instance deployment and still demonstrates the real algorithm.
 *
 * Tiers:
 *   FREE  → 10 requests / minute
 *   PRO   → 100 requests / minute
 */
@Service
public class RateLimiterService {

    // In a multi-instance deployment, swap this for bucket4j-redis ProxyManager
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private static final int FREE_LIMIT  = 10;
    private static final int PRO_LIMIT   = 100;

    public boolean tryConsume(String keyIdentifier, boolean isPro) {
        Bucket bucket = buckets.computeIfAbsent(keyIdentifier, id -> buildBucket(isPro));
        return bucket.tryConsume(1);
    }

    private Bucket buildBucket(boolean isPro) {
        int limit = isPro ? PRO_LIMIT : FREE_LIMIT;
        Bandwidth bandwidth = Bandwidth.classic(limit, Refill.greedy(limit, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(bandwidth).build();
    }
}
