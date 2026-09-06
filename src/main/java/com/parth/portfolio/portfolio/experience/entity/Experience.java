package com.parth.portfolio.portfolio.experience.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "experience")
public class Experience {

    @Id
    private String id;

    private String company;

    private String position;

    private String location;

    private String employmentType;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    @Builder.Default
    private boolean current = false;

    private Integer order;

    @Builder.Default
    private boolean active = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}