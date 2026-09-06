package com.parth.portfolio.portfolio.admin.service;

import com.parth.portfolio.portfolio.admin.dto.AdminExperienceResponse;
import com.parth.portfolio.portfolio.admin.dto.ExperienceRequest;
import com.parth.portfolio.portfolio.experience.entity.Experience;
import com.parth.portfolio.portfolio.experience.repository.ExperienceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminExperienceService {

    private final ExperienceRepository experienceRepository;

    public AdminExperienceService(
            ExperienceRepository experienceRepository) {

        this.experienceRepository = experienceRepository;
    }

    public List<AdminExperienceResponse> getAll() {

        return experienceRepository
                .findAllByOrderByStartDateDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminExperienceResponse getById(String id) {

        return toResponse(
                experienceRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Experience not found: " + id
                                )
                        )
        );
    }

    public AdminExperienceResponse create(
            ExperienceRequest request) {

        Experience experience = new Experience();

        mapRequestToEntity(request, experience);

        return toResponse(experienceRepository.save(experience));
    }

    public AdminExperienceResponse update(
            String id,
            ExperienceRequest request) {

        Experience experience = experienceRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Experience not found: " + id
                        )
                );

        mapRequestToEntity(request, experience);

        return toResponse(experienceRepository.save(experience));
    }

    public void delete(String id) {

        if (!experienceRepository.existsById(id)) {

            throw new IllegalArgumentException(
                    "Experience not found: " + id
            );
        }

        experienceRepository.deleteById(id);
    }

    private void mapRequestToEntity(
            ExperienceRequest request,
            Experience experience) {

        experience.setCompany(request.company());
        experience.setPosition(request.position());
        experience.setLocation(request.location());
        experience.setEmploymentType(request.employmentType());
        experience.setDescription(request.description());
        experience.setStartDate(request.startDate());
        experience.setEndDate(request.endDate());
        experience.setCurrent(request.current());
        experience.setOrder(request.displayOrder());
        experience.setActive(request.active());
    }

    /**
     * Maps the persistence entity to the admin response DTO.
     * The controller never handles the raw entity; all response shaping
     * happens here so entity field changes do not accidentally change the API.
     */
    private AdminExperienceResponse toResponse(Experience e) {
        return new AdminExperienceResponse(
                e.getId(),
                e.getCompany(),
                e.getPosition(),
                e.getLocation(),
                e.getEmploymentType(),
                e.getDescription(),
                e.getStartDate(),
                e.getEndDate(),
                e.isCurrent(),
                e.getOrder(),
                e.isActive(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}