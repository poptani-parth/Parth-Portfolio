package com.parth.portfolio.portfolio.admin.service;

import com.parth.portfolio.portfolio.admin.dto.AdminProjectResponse;
import com.parth.portfolio.portfolio.admin.dto.ProjectRequest;
import com.parth.portfolio.portfolio.project.entity.Project;
import com.parth.portfolio.portfolio.project.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminProjectService {

    private final ProjectRepository projectRepository;

    public AdminProjectService(
            ProjectRepository projectRepository) {

        this.projectRepository = projectRepository;
    }

    public List<AdminProjectResponse> getAll() {

        return projectRepository
                .findAllByOrderByOrderAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminProjectResponse getById(
            String id) {

        return toResponse(
                findProject(id)
        );
    }

    public AdminProjectResponse create(
            ProjectRequest request) {

        Project project = new Project();

        mapRequestToEntity(
                request,
                project
        );

        return toResponse(
                projectRepository.save(project)
        );
    }

    public AdminProjectResponse update(
            String id,
            ProjectRequest request) {

        Project project =
                findProject(id);

        mapRequestToEntity(
                request,
                project
        );

        return toResponse(
                projectRepository.save(project)
        );
    }

    public void delete(String id) {

        if (!projectRepository.existsById(id)) {

            throw new IllegalArgumentException(
                    "Project not found: " + id
            );
        }

        projectRepository.deleteById(id);
    }

    private Project findProject(
            String id) {

        return projectRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Project not found: " + id
                        )
                );
    }

    private void mapRequestToEntity(
            ProjectRequest request,
            Project project) {

        project.setTitle(
                request.title()
        );

        project.setDescription(
                request.description()
        );

        project.setCategory(
                request.category()
        );

        project.setTechnologies(
                request.technologies()
        );

        project.setGithubUrl(
                request.githubUrl()
        );

        project.setLiveUrl(
                request.liveUrl()
        );

        project.setImageUrl(
                request.imageUrl()
        );

        project.setRole(
                request.role()
        );

        project.setFeatures(
                request.features()
        );

        project.setOrder(
                request.displayOrder()
        );

        project.setFeatured(
                request.featured()
        );

        project.setActive(
                request.active()
        );
    }

    private AdminProjectResponse toResponse(
            Project project) {

        return new AdminProjectResponse(
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
                project.isFeatured(),
                project.isActive(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}