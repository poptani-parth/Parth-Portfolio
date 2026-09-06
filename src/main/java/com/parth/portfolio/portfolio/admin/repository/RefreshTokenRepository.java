package com.parth.portfolio.portfolio.admin.repository;

import com.parth.portfolio.portfolio.admin.entity.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
    Optional<RefreshToken> findByTokenHashAndRevokedAtIsNull(String tokenHash);

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Query("{ '_id': ?0, 'revokedAt': null }")
    @Update("{ '$set': { 'revokedAt': ?1, 'rotatedAt': ?2 } }")
    long revokeIfActive(String id, Instant revokedAt, Instant rotatedAt);

    @Query("{ 'adminUserId': ?0, 'revokedAt': null }")
    @Update("{ '$set': { 'revokedAt': ?1 } }")
    long revokeAllActive(String adminUserId, Instant revokedAt);
}
