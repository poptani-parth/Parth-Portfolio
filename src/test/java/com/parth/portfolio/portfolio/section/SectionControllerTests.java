package com.parth.portfolio.portfolio.section;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.parth.portfolio.portfolio.education.controller.EducationController;
import com.parth.portfolio.portfolio.education.dto.EducationResponse;
import com.parth.portfolio.portfolio.education.service.EducationService;
import com.parth.portfolio.portfolio.experience.controller.ExperienceController;
import com.parth.portfolio.portfolio.experience.dto.ExperienceResponse;
import com.parth.portfolio.portfolio.experience.service.ExperienceService;
import com.parth.portfolio.portfolio.skill.controller.SkillController;
import com.parth.portfolio.portfolio.skill.dto.SkillGroupResponse;
import com.parth.portfolio.portfolio.skill.service.SkillService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class SectionControllerTests {

    @Test
    void skillsEndpointReturnsOk() throws Exception {
        SkillService service = mock(SkillService.class);

        SkillGroupResponse response = mock(SkillGroupResponse.class);

        when(service.getPublicSkills())
                .thenReturn(List.of(response));

        MockMvc mvc = MockMvcBuilders
                .standaloneSetup(new SkillController(service))
                .build();

        mvc.perform(get("/api/skills"))
                .andExpect(status().isOk());
    }

    @Test
    void experienceEndpointReturnsOk() throws Exception {
        ExperienceService service = mock(ExperienceService.class);

        ExperienceResponse response = mock(ExperienceResponse.class);

        when(service.getPublicExperience())
                .thenReturn(List.of(response));

        MockMvc mvc = MockMvcBuilders
                .standaloneSetup(new ExperienceController(service))
                .build();

        mvc.perform(get("/api/experience"))
                .andExpect(status().isOk());
    }

    @Test
    void educationEndpointReturnsOk() throws Exception {
        EducationService service = mock(EducationService.class);

        EducationResponse response = mock(EducationResponse.class);

        when(service.getPublicEducation())
                .thenReturn(List.of(response));

        MockMvc mvc = MockMvcBuilders
                .standaloneSetup(new EducationController(service))
                .build();

        mvc.perform(get("/api/education"))
                .andExpect(status().isOk());
    }
}