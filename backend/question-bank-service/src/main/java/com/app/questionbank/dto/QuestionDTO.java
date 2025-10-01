package com.app.questionbank.dto;

import com.app.questionbank.entity.Question;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {
    
    private Long id;
    
    @NotBlank(message = "Question text is required")
    private String questionText;
    
    @NotNull(message = "Question type is required")
    private Question.QuestionType type;
    
    @NotNull(message = "Difficulty is required")
    private Question.Difficulty difficulty;
    
    private String category;
    
    @NotBlank(message = "Correct answer is required")
    private String correctAnswer;
    
    private List<String> options;
    
    private String explanation;
    
    @Min(value = 10, message = "Time limit must be at least 10 seconds")
    private Integer timeLimit;
}