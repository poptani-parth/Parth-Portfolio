package com.parth.portfolio.portfolio.experience.service;

import com.parth.portfolio.portfolio.experience.entity.Experience;
import com.parth.portfolio.portfolio.experience.dto.ExperienceResponse;
import com.parth.portfolio.portfolio.experience.repository.ExperienceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExperienceService {

    private final ExperienceRepository experienceRepository;

    public ExperienceService(
            ExperienceRepository experienceRepository) {

        this.experienceRepository = experienceRepository;
    }

    public List<ExperienceResponse> getPublicExperience() {

        return experienceRepository
                .findByActiveTrueOrderByStartDateDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ExperienceResponse getById(String id) {

        Experience experience =
                experienceRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Experience not found: " + id
                                )
                        );

        return toResponse(experience);
    }

    private ExperienceResponse toResponse(
            Experience experience) {

        return new ExperienceResponse(
                experience.getId(),
                experience.getCompany(),
                experience.getPosition(),
                experience.getLocation(),
                experience.getEmploymentType(),
                experience.getDescription(),
                experience.getStartDate(),
                experience.getEndDate(),
                experience.isCurrent(),
                experience.getOrder()
        );
    }
}