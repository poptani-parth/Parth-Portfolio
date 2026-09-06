package com.parth.portfolio.portfolio.skill.dto;

import java.util.List;

public record SkillGroupResponse(String category, List<SkillResponse> skills) {
}