package com.parth.portfolio.portfolio.admin.service;

import com.parth.portfolio.portfolio.admin.dto.AdminSkillResponse;
import com.parth.portfolio.portfolio.admin.dto.ReorderItemRequest;
import com.parth.portfolio.portfolio.admin.dto.SkillRequest;
import com.parth.portfolio.portfolio.skill.entity.Skill;
import com.parth.portfolio.portfolio.skill.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminSkillService {
    private final SkillRepository skillRepository;

    public AdminSkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    public List<AdminSkillResponse> getAll() {
        return skillRepository.findAllByOrderByCategoryAscOrderAsc().stream().map(this::toResponse).toList();
    }

    public AdminSkillResponse getById(String id) {
        return toResponse(findSkill(id));
    }

    // 1. SINGLE CREATE: Prevent duplicates and auto-assign order
    public AdminSkillResponse create(SkillRequest request) {
        if (skillRepository.existsByNameIgnoreCase(request.name().trim())) {
            throw new IllegalArgumentException("A skill with this name already exists.");
        }

        Skill skill = new Skill();
        mapRequestToEntity(request, skill);

        // Auto-assign order if it's 0 or missing
        if (skill.getOrder() == null || skill.getOrder() == 0) {
            skill.setOrder((int) skillRepository.count() + 1);
        }

        return toResponse(skillRepository.save(skill));
    }

    // 2. SINGLE UPDATE: Prevent renaming to an existing skill
    public AdminSkillResponse update(String id, SkillRequest request) {
        if (skillRepository.existsByNameIgnoreCaseAndIdNot(request.name().trim(), id)) {
            throw new IllegalArgumentException("A skill with this name already exists.");
        }

        Skill skill = findSkill(id);
        mapRequestToEntity(request, skill);
        return toResponse(skillRepository.save(skill));
    }

    public void delete(String id) {
        if (!skillRepository.existsById(id)) {
            throw new IllegalArgumentException("Skill not found: " + id);
        }
        skillRepository.deleteById(id);
    }

    private Skill findSkill(String id) {
        return skillRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Skill not found: " + id));
    }

    // 3. BULK CREATE: Check for duplicates before saving
    @Transactional
    public List<AdminSkillResponse> createBulk(List<SkillRequest> requests) {
        List<Skill> skillsToSave = new ArrayList<>();

        for (SkillRequest request : requests) {
            String cleanName = request.name().trim();
            
            // Check database for duplicate
            if (skillRepository.existsByNameIgnoreCase(cleanName)) {
                throw new IllegalArgumentException("Duplicate detected: " + cleanName + " already exists.");
            }
            
            // Check current incoming list for duplicates
            boolean alreadyInList = skillsToSave.stream()
                    .anyMatch(s -> s.getName().equalsIgnoreCase(cleanName));
            if (alreadyInList) {
                throw new IllegalArgumentException("Duplicate detected in bulk list: " + cleanName);
            }

            Skill skill = new Skill();
            mapRequestToEntity(request, skill);
            
            // Auto-assign order
            if (skill.getOrder() == null || skill.getOrder() == 0) {
                skill.setOrder((int) skillRepository.count() + skillsToSave.size() + 1);
            }
            
            skillsToSave.add(skill);
        }

        return skillRepository.saveAll(skillsToSave).stream()
                .map(this::toResponse)
                .toList();
    }

    // 4. REORDER METHOD: For Drag-and-Drop
    @Transactional
    public void reorder(List<ReorderItemRequest> items) {
        for (ReorderItemRequest item : items) {
            Skill skill = skillRepository.findById(item.id())
                    .orElseThrow(() -> new IllegalArgumentException("Skill not found: " + item.id()));
            skill.setOrder(item.order());
            skillRepository.save(skill);
        }
    }

    private void mapRequestToEntity(SkillRequest request, Skill skill) {
        String cleanName = request.name().trim();
        skill.setName(cleanName);
        skill.setNameNormalized(normalizeName(cleanName));
        skill.setCategory(request.category().trim());
        skill.setOrder(request.displayOrder());
        skill.setOverview(request.overview());
        skill.setYearsOfExperience(request.yearsOfExperience());
        skill.setKnowledgePercentage(request.knowledgePercentage());
        skill.setActive(request.active());
    }

    private String normalizeName(String name) {
        return name.trim().replaceAll("\\s+", " ").toLowerCase(java.util.Locale.ROOT);
    }

    private AdminSkillResponse toResponse(Skill skill) {
        return new AdminSkillResponse(
                skill.getId(),
                skill.getName(),
                skill.getCategory(),
                skill.getOrder(),
                skill.getOverview(),
                skill.getYearsOfExperience(),
                skill.getKnowledgePercentage(),
                skill.isActive(),
                skill.getCreatedAt(),
                skill.getUpdatedAt());
    }
}