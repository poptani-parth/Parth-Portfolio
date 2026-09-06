package com.parth.portfolio.portfolio.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PasswordResetRequest(@NotBlank @Size(max = 100) @Pattern(regexp = "^[A-Za-z0-9._-]+$") String username) { }
