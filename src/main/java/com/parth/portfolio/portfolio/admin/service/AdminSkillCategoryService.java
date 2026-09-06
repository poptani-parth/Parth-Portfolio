package com.parth.portfolio.portfolio.admin.service;

import com.parth.portfolio.portfolio.admin.dto.AdminSkillCategoryResponse;
import com.parth.portfolio.portfolio.admin.dto.SkillCategoryRequest;
import com.parth.portfolio.portfolio.skill.entity.SkillCategory;
import com.parth.portfolio.portfolio.skill.repository.SkillCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminSkillCategoryService {

    private final SkillCategoryRepository categoryRepository;

    public AdminSkillCategoryService(SkillCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<AdminSkillCategoryResponse> getAll() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminSkillCategoryResponse getById(String id) {
        return toResponse(findCategory(id));
    }

    public AdminSkillCategoryResponse create(SkillCategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.name().trim())) {
            throw new IllegalArgumentException("Skill category already exists: " + request.name());
        }
        SkillCategory category = new SkillCategory();
        mapRequestToEntity(request, category);
        return toResponse(categoryRepository.save(category));
    }

    public AdminSkillCategoryResponse update(String id, SkillCategoryRequest request) {
        SkillCategory category = findCategory(id);

        categoryRepository.findByNameIgnoreCase(request.name().trim())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Skill category already exists: " + request.name());
                });

        mapRequestToEntity(request, category);
        return toResponse(categoryRepository.save(category));
    }

    public void delete(String id) {
        if (!categoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Skill category not found: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private SkillCategory findCategory(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Skill category not found: " + id));
    }

    private void mapRequestToEntity(SkillCategoryRequest request, SkillCategory category) {
        category.setName(request.name().trim());
        category.setDescription(request.description());
        category.setDisplayOrder(request.displayOrder());
        category.setActive(request.active());
    }

    private AdminSkillCategoryResponse toResponse(SkillCategory category) {
        return new AdminSkillCategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getDisplayOrder(),
                category.isActive(),
                category.getCreatedAt(),
                category.getUpdatedAt());
    }
}
