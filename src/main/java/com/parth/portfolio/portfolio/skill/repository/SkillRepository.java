package com.parth.portfolio.portfolio.skill.repository;

import com.parth.portfolio.portfolio.skill.entity.Skill;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SkillRepository
        extends MongoRepository<Skill, String> {

    List<Skill> findByActiveTrueOrderByCategoryAscOrderAsc();

    List<Skill> findByActiveTrueAndCategoryIgnoreCaseOrderByOrderAsc(
            String category
    );

    List<Skill> findAllByOrderByCategoryAscOrderAsc();

    List<Skill> findAllByOrderByOrderAsc();

    List<Skill> findByCategoryIgnoreCaseOrderByOrderAsc(
            String category
    );

    boolean existsByNameIgnoreCaseAndIdNot(String name, String id);
    boolean existsByNameIgnoreCase(String name);
}