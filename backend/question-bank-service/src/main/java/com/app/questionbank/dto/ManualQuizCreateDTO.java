package com.app.questionbank.dto;

import com.app.questionbank.entity.Quiz;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManualQuizCreateDTO {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Time limit is required")
    @Positive(message = "Time limit must be positive")
    private Integer timeLimit;
    
    private String category;
    
    @NotNull(message = "Difficulty is required")
    private Quiz.Difficulty difficulty;
    
    @NotNull(message = "Active status is required")
    private Boolean isActive;
    
    @NotNull(message = "Creator ID is required")
    private Long createdBy;
    
    @Valid
    private List<QuestionCreateDTO> questions;
}