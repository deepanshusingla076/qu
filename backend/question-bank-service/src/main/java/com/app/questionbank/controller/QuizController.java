package com.app.questionbank.controller;

import com.app.questionbank.dto.ManualQuizCreateDTO;
import com.app.questionbank.dto.QuestionCreateDTO;
import com.app.questionbank.dto.QuizDTO;
import com.app.questionbank.dto.QuizGenerationRequest;
import com.app.questionbank.entity.Question;
import com.app.questionbank.entity.Quiz;
import com.app.questionbank.repository.QuizRepository;
import com.app.questionbank.service.QuestionService;
import com.app.questionbank.service.QuizService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
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
    public ResponseEntity<?> getAllQuizzes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            log.info("Fetching all quizzes with pagination: page={}, size={}", page, size);
            Pageable pageable = PageRequest.of(page, size);
            Page<Quiz> quizzes = quizService.getAllQuizzes(pageable);
            return ResponseEntity.ok(quizzes);
        } catch (Exception e) {
            log.error("Error fetching all quizzes: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch quizzes: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuizById(@PathVariable Long id) {
        try {
            log.info("API request: Fetching quiz with ID: {}", id);
            Quiz quiz = quizService.getQuizById(id);
            log.info("Successfully fetched quiz: {}", quiz.getTitle());
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            log.error("API error fetching quiz with ID {}: {}", id, e.getMessage(), e);
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Quiz not found with ID: " + id, "quizId", id));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Database error: " + e.getMessage(), "quizId", id));
        }
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
    public ResponseEntity<?> updateQuiz(@PathVariable Long id, @Valid @RequestBody Quiz quiz) {
        try {
            log.info("Updating quiz with ID: {}", id);
            Quiz updatedQuiz = quizService.updateQuiz(id, quiz);
            return ResponseEntity.ok(updatedQuiz);
        } catch (Exception e) {
            log.error("Error updating quiz with ID {}: {}", id, e.getMessage(), e);
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Quiz not found with ID: " + id));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update quiz: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long id) {
        try {
            log.info("Deleting quiz with ID: {}", id);
            quizService.deleteQuiz(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting quiz with ID {}: {}", id, e.getMessage(), e);
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Quiz not found with ID: " + id));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete quiz: " + e.getMessage()));
        }
    }

    // AI Quiz Generation endpoint
    @PostMapping("/generate")
    public ResponseEntity<?> generateAiQuiz(@Valid @RequestBody QuizGenerationRequest generationRequest) {
        try {
            log.info("Generating AI quiz for topic: {}", generationRequest.getTopic());
            
            // For now, create a manual quiz with the provided parameters
            // In the future, this will integrate with AI service
            ManualQuizCreateDTO quizDTO = new ManualQuizCreateDTO();
            quizDTO.setTitle("AI Generated Quiz: " + generationRequest.getTopic());
            quizDTO.setDescription(generationRequest.getDescription() != null ? 
                generationRequest.getDescription() : 
                "AI generated quiz on " + generationRequest.getTopic());
            quizDTO.setTimeLimit(generationRequest.getTimeLimit() != null ? 
                generationRequest.getTimeLimit() : 30);
            quizDTO.setCategory(generationRequest.getTopic());
            
            // Convert string difficulty to enum
            Quiz.Difficulty difficulty;
            try {
                difficulty = Quiz.Difficulty.valueOf(generationRequest.getDifficulty().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid difficulty level: " + generationRequest.getDifficulty() + 
                            ". Valid values are: EASY, MEDIUM, HARD"));
            }
            
            quizDTO.setDifficulty(difficulty);
            quizDTO.setIsActive(true);
            quizDTO.setCreatedBy(generationRequest.getCreatedBy());
            
            // Generate sample questions based on the request
            List<QuestionCreateDTO> questions = generateSampleQuestions(
                generationRequest.getTopic(),
                generationRequest.getQuestionCount(),
                generationRequest.getQuestionType(),
                difficulty
            );
            quizDTO.setQuestions(questions);
            
            Quiz createdQuiz = quizService.createManualQuiz(quizDTO);
            log.info("AI quiz generated successfully with ID: {}", createdQuiz.getId());
            
            return new ResponseEntity<>(createdQuiz, HttpStatus.CREATED);
            
        } catch (Exception e) {
            log.error("Error generating AI quiz: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to generate AI quiz: " + e.getMessage()));
        }
    }
    
    private List<QuestionCreateDTO> generateSampleQuestions(String topic, Integer questionCount, 
                                                          String questionType, Quiz.Difficulty difficulty) {
        List<QuestionCreateDTO> questions = new ArrayList<>();
        
        for (int i = 1; i <= questionCount; i++) {
            QuestionCreateDTO question = new QuestionCreateDTO();
            
            if ("MULTIPLE_CHOICE".equals(questionType)) {
                question.setQuestionText("Sample multiple choice question " + i + " about " + topic + "?");
                question.setType(Question.QuestionType.MULTIPLE_CHOICE);
                question.setOptions(List.of(
                    "Option A for " + topic,
                    "Option B for " + topic,
                    "Option C for " + topic,
                    "Option D for " + topic
                ));
                question.setCorrectAnswer("Option A for " + topic);
            } else if ("TRUE_FALSE".equals(questionType)) {
                question.setQuestionText("Sample true/false question " + i + " about " + topic + "?");
                question.setType(Question.QuestionType.TRUE_FALSE);
                question.setOptions(List.of("True", "False"));
                question.setCorrectAnswer("True");
            } else {
                // Default to multiple choice
                question.setQuestionText("Sample question " + i + " about " + topic + "?");
                question.setType(Question.QuestionType.MULTIPLE_CHOICE);
                question.setOptions(List.of(
                    "Option A for " + topic,
                    "Option B for " + topic,
                    "Option C for " + topic,
                    "Option D for " + topic
                ));
                question.setCorrectAnswer("Option A for " + topic);
            }
            
            question.setExplanation("This is a sample explanation for question " + i);
            question.setMarks(difficulty == Quiz.Difficulty.EASY ? 1 : 
                            difficulty == Quiz.Difficulty.MEDIUM ? 2 : 3);
            question.setDifficulty(Question.Difficulty.valueOf(difficulty.name()));
            question.setCategory(topic);
            
            questions.add(question);
        }
        
        return questions;
    }
}