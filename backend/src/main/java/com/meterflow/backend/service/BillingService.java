package com.meterflow.backend.service;

import com.meterflow.backend.entity.ApiMetadata;
import com.meterflow.backend.entity.User;
import com.meterflow.backend.repository.ApiKeyRepository;
import com.meterflow.backend.repository.ApiMetadataRepository;
import com.meterflow.backend.repository.UsageLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final ApiMetadataRepository apiMetadataRepository;
    private final UsageLogRepository usageLogRepository;
    private final ApiKeyRepository apiKeyRepository;

    // Free: 1000 requests. Pro: ₹0.5 / 100 requests.
    private static final int FREE_TIER_LIMIT = 1000;
    private static final double RATE_PER_100_REQUESTS = 0.5;

    public DashboardStats getDashboardStats(User user) {
        List<ApiMetadata> apis = apiMetadataRepository.findByUserId(user.getId());
        
        long totalRequests = 0;
        int activeApiKeys = 0;

        for (ApiMetadata api : apis) {
            totalRequests += usageLogRepository.countByApiId(api.getId());
            activeApiKeys += apiKeyRepository.findByApiId(api.getId()).stream()
                    .filter(k -> "ACTIVE".equals(k.getStatus()))
                    .count();
        }

        double amountDue = 0.0;
        if (totalRequests > FREE_TIER_LIMIT) {
            long billableRequests = totalRequests - FREE_TIER_LIMIT;
            amountDue = (double) billableRequests / 100.0 * RATE_PER_100_REQUESTS;
        }

        List<Long> apiIds = apis.stream().map(ApiMetadata::getId).toList();
        java.util.List<com.meterflow.backend.dto.DailyUsage> chartData = new java.util.ArrayList<>();
        
        if (!apiIds.isEmpty()) {
            java.time.LocalDateTime sevenDaysAgo = java.time.LocalDateTime.now().minusDays(7);
            chartData = usageLogRepository.findDailyUsageByApiIds(apiIds, sevenDaysAgo);
        }

        return new DashboardStats(
                totalRequests,
                activeApiKeys,
                amountDue,
                apis.size(),
                chartData
        );
    }
}
