package com.parth.portfolio.portfolio.education.repository;

import com.parth.portfolio.portfolio.education.entity.Education;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EducationRepository
        extends MongoRepository<Education, String> {

    List<Education> findByActiveTrueOrderByOrderAsc();

    List<Education> findByActiveTrueOrderByStartDateDesc();

    List<Education> findAllByOrderByOrderAsc();

    List<Education> findAllByOrderByStartDateDesc();
}