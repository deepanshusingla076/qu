package com.app.questionbank.controller;

import com.app.questionbank.dto.ManualQuizCreateDTO;
import com.app.questionbank.dto.QuizDTO;
import com.app.questionbank.entity.Question;
import com.app.questionbank.entity.Quiz;
import com.app.questionbank.repository.QuizRepository;
import com.app.questionbank.service.QuestionService;
import com.app.questionbank.service.QuizService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Slf4j
public class QuizController {

    private final QuizService quizService;
    private final QuestionService questionService;
    private final QuizRepository quizRepository;

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@Valid @RequestBody ManualQuizCreateDTO quizDTO) {
        log.info("Creating new quiz: {}", quizDTO.getTitle());
        Quiz createdQuiz = quizService.createManualQuiz(quizDTO);
        return new ResponseEntity<>(createdQuiz, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<Quiz>> getAllQuizzes(Pageable pageable) {
        log.info("Fetching all quizzes with pagination");
        Page<Quiz> quizzes = quizService.getAllQuizzes(pageable);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long id) {
        log.info("Fetching quiz with ID: {}", id);
        Quiz quiz = quizService.getQuizById(id);
        return ResponseEntity.ok(quiz);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getQuizzesByUser(@PathVariable Long userId) {
        try {
            log.info("Fetching quizzes created by user ID: {}", userId);
            
            // Simple query without loading questions first
            List<Quiz> quizzes = quizRepository.findByCreatedBy(userId);
            
            // Convert to simple DTOs to avoid circular reference issues
            List<QuizDTO> quizDTOs = new ArrayList<>();
            for (Quiz quiz : quizzes) {
                QuizDTO dto = new QuizDTO();
                dto.setId(quiz.getId());
                dto.setTitle(quiz.getTitle());
                dto.setDescription(quiz.getDescription());
                dto.setTimeLimit(quiz.getTimeLimit());
                dto.setTotalQuestions(quiz.getTotalQuestions());
                dto.setCategory(quiz.getCategory());
                dto.setDifficulty(quiz.getDifficulty());
                dto.setIsActive(quiz.getIsActive());
                dto.setActive(quiz.getIsActive());
                dto.setCreatedBy(quiz.getCreatedBy());
                dto.setCreatedAt(quiz.getCreatedAt());
                dto.setUpdatedAt(quiz.getUpdatedAt());
                quizDTOs.add(dto);
            }
            
            return ResponseEntity.ok(quizDTOs);
        } catch (Exception e) {
            log.error("Error fetching quizzes for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch quizzes: " + e.getMessage()));
        }
    }

    @GetMapping("/topic/{topic}")
    public ResponseEntity<List<Quiz>> getQuizzesByTopic(@PathVariable String topic) {
        log.info("Fetching quizzes by topic: {}", topic);
        List<Quiz> quizzes = quizService.getQuizzesByTopic(topic);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<Quiz>> getQuizzesByDifficulty(@PathVariable String difficulty) {
        log.info("Fetching quizzes by difficulty: {}", difficulty);
        List<Quiz> quizzes = quizService.getQuizzesByDifficulty(difficulty);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Quiz>> searchQuizzes(@RequestParam String keyword) {
        log.info("Searching quizzes with keyword: {}", keyword);
        List<Quiz> quizzes = quizService.searchQuizzes(keyword);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<Question>> getQuizQuestions(@PathVariable Long id) {
        log.info("Fetching questions for quiz ID: {}", id);
        List<Question> questions = questionService.getQuestionsByQuizId(id);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getQuizStatistics(@PathVariable Long id) {
        log.info("Fetching statistics for quiz ID: {}", id);
        Map<String, Object> stats = quizService.getQuizStatistics(id);
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Long id, @Valid @RequestBody Quiz quiz) {
        log.info("Updating quiz with ID: {}", id);
        Quiz updatedQuiz = quizService.updateQuiz(id, quiz);
        return ResponseEntity.ok(updatedQuiz);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        log.info("Deleting quiz with ID: {}", id);
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    // AI Quiz Generation endpoint
    @PostMapping("/generate")
    public ResponseEntity<Quiz> generateAiQuiz(@Valid @RequestBody ManualQuizCreateDTO quizDTO) {
        log.info("Generating AI quiz: {}", quizDTO.getTitle());
        // This will be implemented when AI service is ready
        Quiz createdQuiz = quizService.createManualQuiz(quizDTO);
        return new ResponseEntity<>(createdQuiz, HttpStatus.CREATED);
    }
}