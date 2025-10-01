package com.app.questionbank.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizGenerationRequest {
    
    @NotBlank(message = "Topic is required")
    private String topic;
    
    @NotBlank(message = "Difficulty is required")
    private String difficulty; // EASY, MEDIUM, HARD
    
    @Min(value = 1, message = "Question count must be at least 1")
    @NotNull(message = "Question count is required")
    private Integer questionCount;
    
    @NotBlank(message = "Question type is required")
    private String questionType; // MULTIPLE_CHOICE, TRUE_FALSE
    
    @Min(value = 1, message = "Time limit must be at least 1 minute")
    private Integer timeLimit; // in minutes
    
    @NotNull(message = "Created by is required")
    private Long createdBy; // Teacher/Admin user ID
    
    private String description;
    
    private String tags;
}