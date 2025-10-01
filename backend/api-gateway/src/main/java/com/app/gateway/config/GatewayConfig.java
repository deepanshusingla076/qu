package com.app.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // User Service - Authentication routes (no JWT filter needed) - try direct connection first as fallback
                .route("user-service-auth-direct", r -> r.path("/api/auth/**")
                        .uri("http://localhost:8081"))
                        
                // User Service - Authentication routes via load balancer (backup)
                .route("user-service-auth", r -> r.path("/api/auth-lb/**")
                        .uri("lb://user-service"))

                // User Service - Protected routes
                .route("user-service-protected", r -> r.path("/api/users/**")
                        .uri("lb://user-service"))

                // Question Bank Service - Quiz routes
                .route("question-bank-service-quizzes", r -> r.path("/api/quizzes/**")
                        .uri("lb://question-bank-service"))

                // Question Bank Service - Question routes  
                .route("question-bank-service-questions", r -> r.path("/api/questions/**")
                        .uri("lb://question-bank-service"))

                // Result Service routes
                .route("result-service", r -> r.path("/api/results/**")
                        .uri("lb://result-service"))

                // Analytics Service - Analytics routes
                .route("analytics-service-analytics", r -> r.path("/api/analytics/**")
                        .uri("lb://analytics-service"))

                // Analytics Service - Reports routes
                .route("analytics-service-reports", r -> r.path("/api/reports/**")
                        .uri("lb://analytics-service"))

                // Health check routes for all services
                .route("user-service-health", r -> r.path("/actuator/health/user-service")
                        .uri("lb://user-service"))
                
                .route("question-bank-service-health", r -> r.path("/actuator/health/question-bank-service")
                        .uri("lb://question-bank-service"))
                
                .route("result-service-health", r -> r.path("/actuator/health/result-service")
                        .uri("lb://result-service"))
                
                .route("analytics-service-health", r -> r.path("/actuator/health/analytics-service")
                        .uri("lb://analytics-service"))

                .build();
    }
}