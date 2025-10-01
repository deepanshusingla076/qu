package com.app.gateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class JwtGlobalFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    public JwtGlobalFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().toString();

        log.debug("Processing request: {} {}", request.getMethod(), path);

        // Always allow CORS preflight requests
        if ("OPTIONS".equalsIgnoreCase(String.valueOf(request.getMethod()))) {
            log.debug("Allowing CORS preflight without JWT validation for path: {}", path);
            return chain.filter(exchange);
        }

        // Skip JWT validation for auth endpoints and actuator endpoints
        if (path.contains("/api/auth/")
                || path.startsWith("/actuator/")
                || path.startsWith("/swagger-ui/")
                || path.startsWith("/v3/api-docs")) {
            log.debug("Skipping JWT validation for path: {}", path);
            return chain.filter(exchange);
        }

        log.debug("Applying JWT validation for path: {}", path);

        // Apply JWT validation for protected endpoints
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        String jwt = null;

        if (authHeader != null && StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        }

        // If no token or invalid token, return 401
        if (jwt == null || !jwtUtil.validateToken(jwt)) {
            ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return response.setComplete();
        }

        try {
            // Extract user information from JWT
            String username = jwtUtil.extractUsername(jwt);
            String role = jwtUtil.extractRole(jwt);
            String userId = jwtUtil.extractUserId(jwt);

            // Add user info to request headers for downstream services
            ServerHttpRequest modifiedRequest = request.mutate()
                .header("X-User-Id", userId)
                .header("X-User-Role", role)
                .header("X-Username", username)
                .build();

            log.debug("Authenticated user: {} with role: {} and ID: {}", username, role, userId);

            return chain.filter(exchange.mutate().request(modifiedRequest).build());

        } catch (Exception e) {
            log.error("Error processing JWT token: {}", e.getMessage());
            ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return response.setComplete();
        }
    }

    @Override
    public int getOrder() {
        return -1; // Execute before other filters
    }
}