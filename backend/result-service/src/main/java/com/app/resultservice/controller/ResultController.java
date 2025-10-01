package com.app.resultservice.controller;

import com.app.resultservice.dto.QuizAttemptRequest;
import com.app.resultservice.dto.QuizResultResponse;
import com.app.resultservice.entity.QuizResult;
import com.app.resultservice.service.QuizResultService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
@Validated
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class ResultController {

    private final QuizResultService quizResultService;

    // Submit quiz attempt and get results
    @PostMapping("/submit")
    public ResponseEntity<QuizResultResponse> submitQuizAttempt(@Valid @RequestBody QuizAttemptRequest request,
                                                              @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        try {
            log.info("Processing quiz submission for user: {} and quiz: {}", userId, request.getQuizId());
            request.setUserId(userId); // Set user ID from JWT token
            
            QuizResultResponse result = quizResultService.submitQuizAttempt(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
            
        } catch (Exception e) {
            log.error("Error processing quiz submission: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get quiz result by ID
    @GetMapping("/{resultId}")
    public ResponseEntity<QuizResultResponse> getResultById(@PathVariable Long resultId) {
        try {
            QuizResultResponse result = quizResultService.getQuizResult(resultId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("Result not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // Get results by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<QuizResult>> getResultsByUserId(@PathVariable Long userId, Pageable pageable) {
        Page<QuizResult> results = quizResultService.getUserQuizResults(userId, pageable);
        return ResponseEntity.ok(results);
    }

    // Get results by quiz ID
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<Page<QuizResult>> getResultsByQuizId(@PathVariable Long quizId, Pageable pageable) {
        Page<QuizResult> results = quizResultService.getQuizResults(quizId, pageable);
        return ResponseEntity.ok(results);
    }

    // Get quiz statistics
    @GetMapping("/quiz/{quizId}/stats")
    public ResponseEntity<Map<String, Object>> getQuizStatistics(@PathVariable Long quizId) {
        Map<String, Object> stats = quizResultService.getQuizStatistics(quizId);
        return ResponseEntity.ok(stats);
    }

    // Get user statistics
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<Map<String, Object>> getUserStatistics(@PathVariable Long userId) {
        Map<String, Object> stats = quizResultService.getUserStatistics(userId);
        return ResponseEntity.ok(stats);
    }
}