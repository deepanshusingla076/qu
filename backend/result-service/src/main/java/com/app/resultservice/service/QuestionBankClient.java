package com.app.resultservice.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "question-bank-service", path = "/api")
public interface QuestionBankClient {
    
    @GetMapping("/quizzes/{quizId}")
    QuizDto getQuiz(@PathVariable("quizId") Long quizId);
    
    @GetMapping("/quizzes/{quizId}/questions")
    List<QuestionDto> getQuizQuestions(@PathVariable("quizId") Long quizId);
    
    // DTOs for the external service responses
    record QuizDto(
        Long id,
        String title,
        String description,
        String category,
        String difficulty,
        Integer timeLimit,
        Integer totalQuestions,
        Boolean isActive
    ) {}
    
    record QuestionDto(
        Long id,
        String questionText,
        String type,
        String difficulty,
        String correctAnswer,
        List<String> options,
        String explanation,
        Integer timeLimit,
        Integer marks
    ) {}
}