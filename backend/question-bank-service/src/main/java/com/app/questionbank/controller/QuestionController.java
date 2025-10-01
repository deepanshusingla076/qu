package com.app.questionbank.controller;

import com.app.questionbank.dto.QuestionDTO;
import com.app.questionbank.dto.QuizRequestDTO;
import com.app.questionbank.dto.QuizResponseDTO;
import com.app.questionbank.entity.Question;
import com.app.questionbank.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QuestionController {
    
    private final QuestionService questionService;
    
    @PostMapping
    public ResponseEntity<QuestionDTO> createQuestion(@Valid @RequestBody QuestionDTO questionDTO) {
        QuestionDTO createdQuestion = questionService.createQuestion(questionDTO);
        return new ResponseEntity<>(createdQuestion, HttpStatus.CREATED);
    }
    
    @GetMapping
    public ResponseEntity<List<QuestionDTO>> getAllQuestions() {
        List<QuestionDTO> questions = questionService.getAllQuestions();
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<QuestionDTO> getQuestionById(@PathVariable Long id) {
        QuestionDTO question = questionService.getQuestionById(id);
        return ResponseEntity.ok(question);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<QuestionDTO>> getQuestionsByCategory(@PathVariable String category) {
        List<QuestionDTO> questions = questionService.getQuestionsByCategory(category);
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<QuestionDTO>> getQuestionsByDifficulty(@PathVariable Question.Difficulty difficulty) {
        List<QuestionDTO> questions = questionService.getQuestionsByDifficulty(difficulty);
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = questionService.getAllCategories();
        return ResponseEntity.ok(categories);
    }
    
    @PostMapping("/generate-quiz")
    public ResponseEntity<QuizResponseDTO> generateQuiz(@Valid @RequestBody QuizRequestDTO request) {
        QuizResponseDTO quiz = questionService.generateQuiz(request);
        return ResponseEntity.ok(quiz);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<QuestionDTO> updateQuestion(@PathVariable Long id, @Valid @RequestBody QuestionDTO questionDTO) {
        QuestionDTO updatedQuestion = questionService.updateQuestion(id, questionDTO);
        return ResponseEntity.ok(updatedQuestion);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}