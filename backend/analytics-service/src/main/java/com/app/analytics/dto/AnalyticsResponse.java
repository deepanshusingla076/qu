package com.app.analytics.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class AnalyticsResponse {
    private Map<String, Object> data;
    private LocalDateTime generatedAt;
    private String status = "success";
}