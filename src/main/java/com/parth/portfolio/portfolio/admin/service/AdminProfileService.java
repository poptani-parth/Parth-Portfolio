package com.parth.portfolio.portfolio.admin.service;

import com.parth.portfolio.portfolio.admin.dto.AdminProfileResponse;
import com.parth.portfolio.portfolio.admin.dto.ProfileRequest;
import com.parth.portfolio.portfolio.profile.entity.SiteProfile;
import com.parth.portfolio.portfolio.profile.repository.SiteProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminProfileService {
    private final SiteProfileRepository profileRepository;

    public AdminProfileService(SiteProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public AdminProfileResponse getProfile() {
        return toResponse(profileRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalArgumentException("Profile not found")));
    }

    public AdminProfileResponse create(ProfileRequest request) {
        if (profileRepository.count() > 0) {
            throw new IllegalStateException("Site profile already exists. Use update instead.");
        }
        SiteProfile profile = new SiteProfile();
        mapRequestToEntity(request, profile);
        return toResponse(profileRepository.save(profile));
    }

    public AdminProfileResponse update(ProfileRequest request) {
        SiteProfile profile = profileRepository.findFirstByOrderByIdAsc().orElseGet(SiteProfile::new);
        mapRequestToEntity(request, profile);
        return toResponse(profileRepository.save(profile));
    }

    private void mapRequestToEntity(ProfileRequest request, SiteProfile profile) {
        profile.setName(request.name());
        profile.setHeroTitle(request.heroTitle());
        profile.setHeroSubtitle(request.heroSubtitle());
        profile.setBio(request.bio());
        profile.setEmail(request.email());
        profile.setPhone(request.phone());
        profile.setLocation(request.location());
        profile.setResumeUrl(request.resumeUrl());
        profile.setGithubUrl(request.githubUrl());
        profile.setLinkedinUrl(request.linkedinUrl());
        profile.setProfileImageUrl(request.profileImageUrl());
        profile.setActive(request.active());
    }

    private AdminProfileResponse toResponse(SiteProfile profile) {
        return new AdminProfileResponse(
                profile.getId(),
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
                profile.getProfileImageUrl(),
                profile.isActive(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}