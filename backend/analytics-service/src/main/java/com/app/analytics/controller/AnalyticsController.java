package com.app.analytics.controller;

import com.app.analytics.service.AnalyticsService;
import com.app.analytics.dto.AnalyticsResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, maxAge = 3600, allowCredentials = "true")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsResponse> getDashboardAnalytics(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role) {
        AnalyticsResponse analytics = analyticsService.getDashboardAnalytics(userId, role);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<Map<String, Object>> getQuizAnalytics(@PathVariable String quizId) {
        Map<String, Object> analytics = analyticsService.getQuizAnalytics(quizId);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserAnalytics(@PathVariable String userId) {
        Map<String, Object> analytics = analyticsService.getUserAnalytics(userId);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceAnalytics(
            @RequestParam(required = false) String timeRange,
            @RequestParam(required = false) String category) {
        Map<String, Object> analytics = analyticsService.getPerformanceAnalytics(timeRange, category);
        return ResponseEntity.ok(analytics);
    }
}