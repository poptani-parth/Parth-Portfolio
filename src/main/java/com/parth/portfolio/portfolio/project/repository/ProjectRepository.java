package com.parth.portfolio.portfolio.project.repository;

import com.parth.portfolio.portfolio.project.entity.Project;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProjectRepository
        extends MongoRepository<Project, String> {

    List<Project> findByActiveTrueOrderByOrderAsc();

    List<Project> findByActiveTrueAndCategoryIgnoreCaseOrderByOrderAsc(
            String category
    );

    List<Project> findByActiveTrueAndTechnologiesIgnoreCaseOrderByOrderAsc(
            String technology
    );

    List<Project>
    findByActiveTrueAndCategoryIgnoreCaseAndTechnologiesIgnoreCaseOrderByOrderAsc(
            String category,
            String technology
    );

    List<Project> findAllByOrderByOrderAsc();
}