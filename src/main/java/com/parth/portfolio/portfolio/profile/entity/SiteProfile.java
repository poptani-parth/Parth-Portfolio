package com.parth.portfolio.portfolio.profile.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "site_profile")
public class SiteProfile {

    @Id
    private String id;

    private String name;

    private String heroTitle;

    private String heroSubtitle;

    private String bio;

    private String email;

    private String phone;

    private String location;

    private String resumeUrl;

    private String githubUrl;

    private String linkedinUrl;

    private String profileImageUrl;

    private Double yearsOfExperience;

    private Boolean showExperienceInProfile;

    @Builder.Default
    private boolean active = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}