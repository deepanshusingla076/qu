package com.app.analytics.service;

import com.app.analytics.dto.AnalyticsResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
public class AnalyticsService {

    public AnalyticsResponse getDashboardAnalytics(String userId, String role) {
        log.info("Getting dashboard analytics for user: {} with role: {}", userId, role);
        
        AnalyticsResponse response = new AnalyticsResponse();
        response.setGeneratedAt(LocalDateTime.now());
        
        if ("TEACHER".equals(role)) {
            response = getTeacherDashboardAnalytics(userId);
        } else if ("STUDENT".equals(role)) {
            response = getStudentDashboardAnalytics(userId);
        } else {
            response = getGeneralAnalytics();
        }
        
        return response;
    }

    private AnalyticsResponse getTeacherDashboardAnalytics(String userId) {
        AnalyticsResponse response = new AnalyticsResponse();
        
        // Mock data for teacher analytics
        Map<String, Object> data = new HashMap<>();
        data.put("totalQuizzes", 25);
        data.put("totalStudents", 150);
        data.put("totalAttempts", 485);
        data.put("averageScore", 78.5);
        data.put("activeQuizzes", 12);
        data.put("completedQuizzes", 13);
        
        // Recent activity
        List<Map<String, Object>> recentActivity = Arrays.asList(
            Map.of("type", "quiz_completed", "message", "5 students completed 'Java Basics Quiz'", "timestamp", LocalDateTime.now().minusHours(2)),
            Map.of("type", "quiz_created", "message", "New quiz 'Spring Boot Fundamentals' created", "timestamp", LocalDateTime.now().minusHours(5)),
            Map.of("type", "high_score", "message", "Student achieved 95% in 'Database Design Quiz'", "timestamp", LocalDateTime.now().minusHours(8))
        );
        data.put("recentActivity", recentActivity);
        
        // Performance trends
        Map<String, Object> trends = new HashMap<>();
        trends.put("scoreImprovement", 12.3);
        trends.put("completionRate", 89.2);
        trends.put("averageTimeSpent", 23.5);
        data.put("trends", trends);
        
        response.setData(data);
        response.setGeneratedAt(LocalDateTime.now());
        
        return response;
    }

    private AnalyticsResponse getStudentDashboardAnalytics(String userId) {
        AnalyticsResponse response = new AnalyticsResponse();
        
        // Mock data for student analytics
        Map<String, Object> data = new HashMap<>();
        data.put("quizzesCompleted", 18);
        data.put("averageScore", 82.3);
        data.put("totalTimeSpent", 145); // in minutes
        data.put("bestScore", 96);
        data.put("currentStreak", 5);
        data.put("rank", 12);
        data.put("totalParticipants", 150);
        
        // Subject performance
        List<Map<String, Object>> subjectPerformance = Arrays.asList(
            Map.of("subject", "Mathematics", "score", 85.2, "quizzes", 8),
            Map.of("subject", "Science", "score", 79.8, "quizzes", 6),
            Map.of("subject", "Programming", "score", 88.5, "quizzes", 4)
        );
        data.put("subjectPerformance", subjectPerformance);
        
        // Recent scores
        List<Map<String, Object>> recentScores = Arrays.asList(
            Map.of("quiz", "Java Advanced Concepts", "score", 92, "date", LocalDateTime.now().minusDays(1)),
            Map.of("quiz", "Database Optimization", "score", 78, "date", LocalDateTime.now().minusDays(3)),
            Map.of("quiz", "Web Development Basics", "score", 85, "date", LocalDateTime.now().minusDays(5))
        );
        data.put("recentScores", recentScores);
        
        response.setData(data);
        response.setGeneratedAt(LocalDateTime.now());
        
        return response;
    }

    private AnalyticsResponse getGeneralAnalytics() {
        AnalyticsResponse response = new AnalyticsResponse();
        
        Map<String, Object> data = new HashMap<>();
        data.put("totalUsers", 350);
        data.put("totalQuizzes", 125);
        data.put("totalAttempts", 2890);
        data.put("averageScore", 76.8);
        
        response.setData(data);
        response.setGeneratedAt(LocalDateTime.now());
        
        return response;
    }

    public Map<String, Object> getQuizAnalytics(String quizId) {
        log.info("Getting analytics for quiz: {}", quizId);
        
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("quizId", quizId);
        analytics.put("totalAttempts", 45);
        analytics.put("averageScore", 82.3);
        analytics.put("highestScore", 98);
        analytics.put("lowestScore", 45);
        analytics.put("completionRate", 87.5);
        analytics.put("averageTimeSpent", 18.5);
        
        // Score distribution
        Map<String, Integer> scoreDistribution = new HashMap<>();
        scoreDistribution.put("0-20", 2);
        scoreDistribution.put("21-40", 3);
        scoreDistribution.put("41-60", 8);
        scoreDistribution.put("61-80", 15);
        scoreDistribution.put("81-100", 17);
        analytics.put("scoreDistribution", scoreDistribution);
        
        return analytics;
    }

    public Map<String, Object> getUserAnalytics(String userId) {
        log.info("Getting analytics for user: {}", userId);
        
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("userId", userId);
        analytics.put("quizzesCompleted", 23);
        analytics.put("averageScore", 84.2);
        analytics.put("totalTimeSpent", 195);
        analytics.put("bestSubject", "Programming");
        analytics.put("improvementRate", 15.3);
        
        return analytics;
    }

    public Map<String, Object> getPerformanceAnalytics(String timeRange, String category) {
        log.info("Getting performance analytics for timeRange: {} and category: {}", timeRange, category);
        
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("timeRange", timeRange);
        analytics.put("category", category);
        analytics.put("totalQuizzes", 85);
        analytics.put("averageScore", 79.2);
        analytics.put("participationRate", 92.1);
        
        // Performance over time
        List<Map<String, Object>> performanceOverTime = Arrays.asList(
            Map.of("period", "Week 1", "averageScore", 76.2, "attempts", 120),
            Map.of("period", "Week 2", "averageScore", 78.5, "attempts", 135),
            Map.of("period", "Week 3", "averageScore", 81.3, "attempts", 148),
            Map.of("period", "Week 4", "averageScore", 79.8, "attempts", 142)
        );
        analytics.put("performanceOverTime", performanceOverTime);
        
        return analytics;
    }
}