package com.parth.portfolio.portfolio.project.service;

import com.parth.portfolio.portfolio.project.dto.ProjectResponse;
import com.parth.portfolio.portfolio.project.entity.Project;
import com.parth.portfolio.portfolio.project.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<ProjectResponse> getPublicProjects(
            String category,
            String technology) {

        /*
         * Normalize nullable query parameters once.
         * After this point categoryFilter and technologyFilter
         * are never null.
         */
        String categoryFilter =
                category == null ? "" : category.trim();

        String technologyFilter =
                technology == null ? "" : technology.trim();

        boolean hasCategory =
                !categoryFilter.isBlank();

        boolean hasTechnology =
                !technologyFilter.isBlank();

        List<Project> projects;

        if (hasCategory && hasTechnology) {

            projects =
                    projectRepository
                            .findByActiveTrueAndCategoryIgnoreCaseAndTechnologiesIgnoreCaseOrderByOrderAsc(
                                    categoryFilter,
                                    technologyFilter
                            );

        } else if (hasCategory) {

            projects =
                    projectRepository
                            .findByActiveTrueAndCategoryIgnoreCaseOrderByOrderAsc(
                                    categoryFilter
                            );

        } else if (hasTechnology) {

            projects =
                    projectRepository
                            .findByActiveTrueAndTechnologiesIgnoreCaseOrderByOrderAsc(
                                    technologyFilter
                            );

        } else {

            projects =
                    projectRepository
                            .findByActiveTrueOrderByOrderAsc();
        }

        return projects.stream()
                .map(this::toResponse)
                .toList();
    }

    public ProjectResponse getById(String id) {

        Project project =
                projectRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Project not found: " + id
                                )
                        );

        return toResponse(project);
    }

    private ProjectResponse toResponse(Project project) {

        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getCategory(),
                project.getTechnologies(),
                project.getGithubUrl(),
                project.getLiveUrl(),
                project.getImageUrl(),
                project.getRole(),
                project.getFeatures(),
                project.getOrder(),
                project.isFeatured()
        );
    }
}
