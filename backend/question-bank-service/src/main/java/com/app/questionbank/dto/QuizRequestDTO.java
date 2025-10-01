package com.app.questionbank.dto;

import com.app.questionbank.entity.Question;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizRequestDTO {
    
    private String category;
    private Question.Difficulty difficulty;
    private Integer numberOfQuestions;
    private Integer timeLimit; // in minutes
}