package com.parth.portfolio.portfolio.profile.service;

import com.parth.portfolio.portfolio.profile.dto.ProfileResponse;
import com.parth.portfolio.portfolio.profile.entity.SiteProfile;
import com.parth.portfolio.portfolio.profile.repository.SiteProfileRepository;
import com.parth.portfolio.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {
    private final SiteProfileRepository profileRepository;

    public ProfileService(SiteProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public ProfileResponse getPublicProfile() {
        SiteProfile profile = profileRepository.findFirstByActiveTrueOrderByIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException("Active site profile not found"));
        return toResponse(profile);
    }

    private ProfileResponse toResponse(SiteProfile profile) {
        return new ProfileResponse(
            profile.getName(),
             profile.getHeroTitle(), 
             profile.getHeroSubtitle(),
            profile.getBio(),
            profile.getEmail(),
            profile.getPhone(),
            profile.getLocation(),
            profile.getResumeUrl(),
            profile.getGithubUrl(),
            profile.getLinkedinUrl(),
            profile.getProfileImageUrl()
        );
    }
}
