package com.parth.portfolio.portfolio.admin.service;

import com.parth.portfolio.portfolio.admin.dto.AdminEducationResponse;
import com.parth.portfolio.portfolio.admin.dto.EducationRequest;
import com.parth.portfolio.portfolio.education.entity.Education;
import com.parth.portfolio.portfolio.education.repository.EducationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminEducationService {

    private final EducationRepository educationRepository;

    public AdminEducationService(
            EducationRepository educationRepository) {
        this.educationRepository = educationRepository;
    }

    public List<AdminEducationResponse> getAll() {

        return educationRepository
                .findAllByOrderByOrderAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminEducationResponse getById(String id) {

        return toResponse(
                educationRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Education not found: " + id
                                )
                        )
        );
    }

    public AdminEducationResponse create(EducationRequest request) {

        Education education = new Education();

        mapRequestToEntity(request, education);

        return toResponse(educationRepository.save(education));
    }

    public AdminEducationResponse update(
            String id,
            EducationRequest request) {

        Education education = educationRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Education not found: " + id
                        )
                );

        mapRequestToEntity(request, education);

        return toResponse(educationRepository.save(education));
    }

    public void delete(String id) {

        if (!educationRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Education not found: " + id
            );
        }

        educationRepository.deleteById(id);
    }

    private void mapRequestToEntity(
            EducationRequest request,
            Education education) {

        education.setInstitution(request.institution());
        education.setDegree(request.degree());
        education.setField(request.field());
        education.setStartDate(request.startDate());
        education.setEndDate(request.endDate());
        education.setGrade(request.grade());
        education.setDescription(request.description());
        education.setOrder(request.displayOrder());
        education.setActive(request.active());
    }

    /**
     * Maps the persistence entity to the admin response DTO.
     * The controller never handles the raw entity; all response shaping
     * happens here so entity field changes do not accidentally change the API.
     */
    private AdminEducationResponse toResponse(Education e) {
        return new AdminEducationResponse(
                e.getId(),
                e.getInstitution(),
                e.getDegree(),
                e.getField(),
                e.getStartDate(),
                e.getEndDate(),
                e.getGrade(),
                e.getDescription(),
                e.getOrder(),
                e.isActive(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}