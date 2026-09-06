package com.parth.portfolio.portfolio.skill.service;

import com.parth.portfolio.portfolio.skill.dto.SkillGroupResponse;
import com.parth.portfolio.portfolio.skill.dto.SkillResponse;
import com.parth.portfolio.portfolio.skill.entity.Skill;
import com.parth.portfolio.portfolio.skill.repository.SkillCategoryRepository;
import com.parth.portfolio.portfolio.skill.repository.SkillRepository;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SkillService {
    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository, SkillCategoryRepository categories) {
        this.skillRepository = skillRepository;
    }

    public List<SkillGroupResponse> getPublicSkills() {
        List<Skill> skills = skillRepository.findByActiveTrueOrderByCategoryAscOrderAsc();
        return groupSkills(skills);
    }

    public List<SkillGroupResponse> getPublicSkillsByCategory(String category) {
        List<Skill> skills = skillRepository
                .findByActiveTrueAndCategoryIgnoreCaseOrderByOrderAsc(category.trim());
        if (skills.isEmpty()) {
            return List.of();
        }
        return List.of(
                new SkillGroupResponse(skills.get(0).getCategory(), skills.stream().map(this::toResponse).toList()));
    }

    public SkillResponse getById(String id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Skill not found: " + id));
        return toResponse(skill);
    }

    private List<SkillGroupResponse> groupSkills(List<Skill> skills) {
        Map<String, List<SkillResponse>> grouped = new LinkedHashMap<>();
        for (Skill skill : skills) {
            grouped.computeIfAbsent(skill.getCategory(), key -> new ArrayList<>()).add(toResponse(skill));
        }
        return grouped.entrySet().stream().map(entry -> new SkillGroupResponse(entry.getKey(), entry.getValue()))
                .toList();
    }

    private SkillResponse toResponse(Skill skill) {
        return new SkillResponse(
                skill.getId(),
                skill.getName(),
                skill.getOrder(),
                skill.getCategory(),
                skill.getOverview(),
                skill.getYearsOfExperience(),
                skill.getKnowledgePercentage(),
                calculateProficiencyLevel(skill.getKnowledgePercentage())
        );
    }
    private String calculateProficiencyLevel(Integer percentage) {
        if (percentage == null) return "Not Specified";
        if (percentage >= 90) return "Expert";
        if (percentage >= 75) return "Advanced";
        if (percentage >= 50) return "Intermediate";
        return "Beginner";
    }
}