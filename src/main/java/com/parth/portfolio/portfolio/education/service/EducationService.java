package com.parth.portfolio.portfolio.education.service;

import com.parth.portfolio.portfolio.education.entity.Education;
import com.parth.portfolio.portfolio.education.dto.EducationResponse;
import com.parth.portfolio.portfolio.education.repository.EducationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EducationService {

    private final EducationRepository educationRepository;

    public EducationService(EducationRepository educationRepository) {
        this.educationRepository = educationRepository;
    }

    public List<EducationResponse> getPublicEducation() {

        return educationRepository
                .findByActiveTrueOrderByOrderAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public EducationResponse getById(String id) {

        Education education = educationRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Education not found: " + id
                        )
                );

        return toResponse(education);
    }

    private EducationResponse toResponse(Education education) {

        return new EducationResponse(
                education.getId(),
                education.getInstitution(),
                education.getDegree(),
                education.getField(),
                education.getStartDate(),
                education.getEndDate(),
                education.getGrade(),
                education.getDescription(),
                education.getOrder()
        );
    }
}