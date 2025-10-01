package com.app.questionbank.dto;

import com.app.questionbank.entity.Question;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionCreateDTO {
    
    @NotBlank(message = "Question text is required")
    private String questionText;
    
    @NotNull(message = "Question type is required")
    private Question.QuestionType type;
    
    private List<String> options;
    
    @NotBlank(message = "Correct answer is required")
    private String correctAnswer;
    
    private String explanation;
    
    @NotNull(message = "Marks are required")
    @Positive(message = "Marks must be positive")
    private Integer marks;
    
    private Question.Difficulty difficulty;
    
    private String category;
}