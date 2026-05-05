package com.meterflow.backend.service;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStats {
    private long totalRequests;
    private int activeApiKeys;
    private double amountDue;
    private int totalApis;
    private java.util.List<com.meterflow.backend.dto.DailyUsage> chartData;
}
