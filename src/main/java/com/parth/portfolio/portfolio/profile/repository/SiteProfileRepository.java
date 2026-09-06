package com.parth.portfolio.portfolio.profile.repository;

import com.parth.portfolio.portfolio.profile.entity.SiteProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface SiteProfileRepository
        extends MongoRepository<SiteProfile, String> {

    Optional<SiteProfile> findFirstByActiveTrueOrderByIdAsc();

    Optional<SiteProfile> findFirstByOrderByIdAsc();

    boolean existsByActiveTrue();
}
