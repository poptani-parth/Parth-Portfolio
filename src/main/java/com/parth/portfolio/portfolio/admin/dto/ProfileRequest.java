package com.parth.portfolio.portfolio.admin.dto;

import com.parth.portfolio.common.validation.ValidUrl;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfileRequest(
    @NotBlank(message = "Name is required") 
    @Size(max = 120) 
    String name,
    @NotBlank(message = "Hero title is required") 
    @Size(max = 200) 
    String heroTitle,

    @Size(max = 300)
     String heroSubtitle, 
     
    @Size(max = 5000)
    String bio,

    @Email(message = "Please provide a valid email address") 
    @Size(max = 150)
    String email,

    @Size(max = 30) 
    String phone, 
    
    @Size(max = 150) 
    String location, 
    
    @ValidUrl(allowHttp = true)
    @Size(max = 500)
    String resumeUrl,

    @ValidUrl(allowHttp = true)
    @Size(max = 500) 
    String githubUrl, 
    
    @ValidUrl(allowHttp = true)
    @Size(max = 500) 
    String linkedinUrl, 
    
    @ValidUrl
    @Size(max = 500) 
    String profileImageUrl,

    boolean active
) {
}