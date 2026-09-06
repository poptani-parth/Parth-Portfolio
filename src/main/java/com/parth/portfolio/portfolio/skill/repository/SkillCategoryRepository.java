package com.parth.portfolio.portfolio.skill.repository;

import com.parth.portfolio.portfolio.skill.entity.SkillCategory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SkillCategoryRepository
        extends MongoRepository<SkillCategory, String> {

    Optional<SkillCategory> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<SkillCategory> findByActiveTrueOrderByDisplayOrderAsc();

    List<SkillCategory> findAllByOrderByDisplayOrderAsc();
}