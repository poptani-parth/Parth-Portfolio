package com.parth.portfolio.portfolio.experience.repository;

import com.parth.portfolio.portfolio.experience.entity.Experience;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ExperienceRepository
        extends MongoRepository<Experience, String> {

    List<Experience> findByActiveTrueOrderByStartDateDesc();

    List<Experience> findByActiveTrueOrderByOrderAsc();

    List<Experience> findAllByOrderByStartDateDesc();

    List<Experience> findAllByOrderByOrderAsc();
}

