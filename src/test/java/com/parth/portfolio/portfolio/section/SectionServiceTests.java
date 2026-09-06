package com.parth.portfolio.portfolio.section;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.parth.portfolio.portfolio.education.entity.Education;
import com.parth.portfolio.portfolio.education.repository.EducationRepository;
import com.parth.portfolio.portfolio.education.service.EducationService;
import com.parth.portfolio.portfolio.experience.entity.Experience;
import com.parth.portfolio.portfolio.experience.repository.ExperienceRepository;
import com.parth.portfolio.portfolio.experience.service.ExperienceService;
import com.parth.portfolio.portfolio.skill.dto.SkillGroupResponse;
import com.parth.portfolio.portfolio.skill.entity.Skill;
import com.parth.portfolio.portfolio.skill.repository.SkillCategoryRepository;
import com.parth.portfolio.portfolio.skill.repository.SkillRepository;
import com.parth.portfolio.portfolio.skill.service.SkillService;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class SectionServiceTests {

    @Test
    void skillsAreGroupedByCategory() {

        SkillRepository skills =
                Mockito.mock(SkillRepository.class);

        SkillCategoryRepository categories =
                Mockito.mock(SkillCategoryRepository.class);

        when(
                skills.findByActiveTrueOrderByCategoryAscOrderAsc()
        ).thenReturn(
                List.of(
                        Skill.builder()
                                .id("skill-1")
                                .name("Java")
                                .category("Backend")
                                .order(1)
                                .active(true)
                                .build()
                )
        );

        SkillService service =
                new SkillService(
                        skills,
                        categories
                );

        List<SkillGroupResponse> result =
                service.getPublicSkills();

        assertEquals(
                1,
                result.size()
        );

        assertEquals(
                "Backend",
                result.get(0).category()
        );

        assertEquals(
                1,
                result.get(0).skills().size()
        );

        assertEquals(
                "Java",
                result.get(0).skills().get(0).name()
        );
    }

    @Test
    void experienceIsMappedAndOrderedByRepository() {

        ExperienceRepository repository =
                Mockito.mock(ExperienceRepository.class);

        when(
                repository.findByActiveTrueOrderByStartDateDesc()
        ).thenReturn(
                List.of(
                        Experience.builder()
                                .id("experience-1")
                                .company("Acme")
                                .position("Developer")
                                .startDate(
                                        LocalDate.of(
                                                2025,
                                                1,
                                                1
                                        )
                                )
                                .active(true)
                                .build()
                )
        );

        ExperienceService service =
                new ExperienceService(
                        repository
                );

        var result =
                service.getPublicExperience();

        assertEquals(
                1,
                result.size()
        );

        assertEquals(
                "Acme",
                result.get(0).company()
        );

        assertEquals(
                "Developer",
                result.get(0).position()
        );
    }

    @Test
    void educationIsMappedAndOrderedByRepository() {

        EducationRepository repository =
                Mockito.mock(EducationRepository.class);

        when(
                repository.findByActiveTrueOrderByOrderAsc()
        ).thenReturn(
                List.of(
                        Education.builder()
                                .id("education-1")
                                .institution("University")
                                .degree("BSc")
                                .startDate(
                                      "2020-01-01"
                                )
                                .active(true)
                                .build()
                )
        );

        EducationService service =
                new EducationService(
                        repository
                );

        var result =
                service.getPublicEducation();

        assertEquals(
                1,
                result.size()
        );

        assertEquals(
                "University",
                result.get(0).institution()
        );

        assertEquals(
                "BSc",
                result.get(0).degree()
        );
    }
}