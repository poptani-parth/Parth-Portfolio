package com.parth.portfolio.portfolio.media.repository;

import com.parth.portfolio.portfolio.media.entity.Media;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MediaRepository
        extends MongoRepository<Media, String> {

    List<Media> findByActiveTrueOrderByCreatedAtDesc();

    List<Media> findByActiveTrueAndUsageOrderByCreatedAtDesc(
            String usage
    );

    List<Media> findAllByOrderByCreatedAtDesc();
}
